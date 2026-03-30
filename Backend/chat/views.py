import logging

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

logger = logging.getLogger(__name__)

from esport.response import api_response
from tournament.models import Tournament

from .models import BlockedMessage, ChatMessage, ModerationWord, ToxicUserWhitelist
from .serializers import ChatMessageSerializer
from .services import broadcast_chat_message
from .toxicity import get_toxic_filter


def _is_user_whitelisted(user) -> bool:
	if not user or not getattr(user, "is_authenticated", False):
		return False
	return bool(user.is_superuser) or ToxicUserWhitelist.objects.filter(user=user).exists()


def _find_manual_block_word(cleaned_text: str):
	lowered = (cleaned_text or "").lower()
	for word in ModerationWord.objects.values_list("word", flat=True):
		if word and word.lower() in lowered:
			return word
	return None


def evaluate_toxicity(message: str, user, source: str, metadata=None, record_blocked: bool = True):
	metadata = metadata or {}
	try:
		filter_instance = get_toxic_filter()
		check_result = filter_instance.check_message(message)
	except FileNotFoundError:
		logger.warning("Toxicity model files are missing — allowing message through without filtering.")
		return {"blocked": False, "is_toxic": False, "confidence": 0.0, "cleaned_text": message}
	except Exception as exc:  # pragma: no cover - defensive guard
		logger.warning("Toxicity check failed (%s) — allowing message through without filtering.", exc)
		return {"blocked": False, "is_toxic": False, "confidence": 0.0, "cleaned_text": message}

	manual_word = _find_manual_block_word(check_result.get("cleaned_text", ""))
	if manual_word:
		check_result["is_toxic"] = True
		check_result["confidence"] = max(check_result.get("confidence", 0.0), 1.0)
		check_result["manual_word"] = manual_word

	if check_result.get("is_toxic") and not _is_user_whitelisted(user):
		if record_blocked:
			BlockedMessage.objects.create(
				user=user if getattr(user, "is_authenticated", False) else None,
				content=message,
				cleaned_content=check_result.get("cleaned_text", ""),
				confidence=check_result.get("confidence", 0.0),
				source=source,
				blocked_by=BlockedMessage.BlockReasons.MANUAL if manual_word else BlockedMessage.BlockReasons.MODEL,
				metadata=metadata,
			)
		return {
			"blocked": True,
			"error": "⚠️ Message contains inappropriate language. Please keep chat respectful.",
			"confidence": check_result.get("confidence", 0.0),
		}

	check_result["blocked"] = False
	return check_result


class TournamentChatMessageView(APIView):
	permission_classes = [IsAuthenticated]

	def get_tournament(self, tournament_id):
		return Tournament.objects.filter(id=tournament_id).first()

	def get(self, request, tournament_id):
		tournament = self.get_tournament(tournament_id)
		if not tournament:
			return api_response(
				is_success=False,
				error_message="Tournament not found.",
				status_code=status.HTTP_404_NOT_FOUND,
			)

		messages = ChatMessage.objects.filter(
			tournament=tournament,
			message_type=ChatMessage.MessageTypes.GENERAL,
		).select_related("sender")

		serializer = ChatMessageSerializer(messages, many=True, context={"request": request})
		return api_response(
			is_success=True,
			status_code=status.HTTP_200_OK,
			result=serializer.data,
		)

	def post(self, request, tournament_id):
		tournament = self.get_tournament(tournament_id)
		if not tournament:
			return api_response(
				is_success=False,
				error_message="Tournament not found.",
				status_code=status.HTTP_404_NOT_FOUND,
			)

		text = (request.data.get("message") or "").strip()
		if not text:
			return api_response(
				is_success=False,
				error_message="Message cannot be empty.",
				status_code=status.HTTP_400_BAD_REQUEST,
			)

		evaluation = evaluate_toxicity(
			text,
			request.user,
			BlockedMessage.Sources.CHAT,
			metadata={"tournament_id": tournament.id, "message_type": ChatMessage.MessageTypes.GENERAL},
		)
		if evaluation.get("unavailable"):
			return Response(
				{"success": False, "blocked": False, "error": evaluation["error"]},
				status=status.HTTP_500_INTERNAL_SERVER_ERROR,
			)
		if evaluation.get("blocked"):
			return Response(
				{
					"success": False,
					"blocked": True,
					"error": evaluation.get("error"),
					"confidence": evaluation.get("confidence", 0.0),
				},
				status=status.HTTP_400_BAD_REQUEST,
			)

		created = ChatMessage.objects.create(
			tournament=tournament,
			sender=request.user,
			message_type=ChatMessage.MessageTypes.GENERAL,
			message=text,
		)
		broadcast_chat_message(created)

		serializer = ChatMessageSerializer(created, context={"request": request})
		return Response(
			{"success": True, "blocked": False, "result": serializer.data},
			status=status.HTTP_201_CREATED,
		)


class TournamentAnnouncementView(APIView):
	permission_classes = [IsAuthenticated]

	def get_tournament(self, tournament_id):
		return Tournament.objects.filter(id=tournament_id).first()

	def get(self, request, tournament_id):
		tournament = self.get_tournament(tournament_id)
		if not tournament:
			return api_response(
				is_success=False,
				error_message="Tournament not found.",
				status_code=status.HTTP_404_NOT_FOUND,
			)

		announcements = ChatMessage.objects.filter(
			tournament=tournament,
			message_type=ChatMessage.MessageTypes.ANNOUNCEMENT,
		).select_related("sender")

		serializer = ChatMessageSerializer(announcements, many=True, context={"request": request})
		return api_response(
			is_success=True,
			status_code=status.HTTP_200_OK,
			result=serializer.data,
		)

	def post(self, request, tournament_id):
		tournament = self.get_tournament(tournament_id)
		if not tournament:
			return api_response(
				is_success=False,
				error_message="Tournament not found.",
				status_code=status.HTTP_404_NOT_FOUND,
			)

		if tournament.organizer_id != request.user.id:
			return api_response(
				is_success=False,
				error_message="Only the tournament organizer can post announcements.",
				status_code=status.HTTP_403_FORBIDDEN,
			)

		text = (request.data.get("message") or "").strip()
		if not text:
			return api_response(
				is_success=False,
				error_message="Announcement cannot be empty.",
				status_code=status.HTTP_400_BAD_REQUEST,
			)

		evaluation = evaluate_toxicity(
			text,
			request.user,
			BlockedMessage.Sources.ANNOUNCEMENT,
			metadata={"tournament_id": tournament.id, "message_type": ChatMessage.MessageTypes.ANNOUNCEMENT},
		)
		if evaluation.get("unavailable"):
			return Response(
				{"success": False, "blocked": False, "error": evaluation["error"]},
				status=status.HTTP_500_INTERNAL_SERVER_ERROR,
			)
		if evaluation.get("blocked"):
			return Response(
				{
					"success": False,
					"blocked": True,
					"error": evaluation.get("error"),
					"confidence": evaluation.get("confidence", 0.0),
				},
				status=status.HTTP_400_BAD_REQUEST,
			)

		created = ChatMessage.objects.create(
			tournament=tournament,
			sender=request.user,
			message_type=ChatMessage.MessageTypes.ANNOUNCEMENT,
			message=text,
		)
		broadcast_chat_message(created)

		serializer = ChatMessageSerializer(created, context={"request": request})
		return Response(
			{"success": True, "blocked": False, "result": serializer.data},
			status=status.HTTP_201_CREATED,
		)


class ChatMessageCheckView(APIView):
	permission_classes = [IsAuthenticated]

	def post(self, request):
		text = (request.data.get("message") or "").strip()
		if not text:
			return Response(
				{"success": False, "blocked": False, "error": "Message cannot be empty."},
				status=status.HTTP_400_BAD_REQUEST,
			)

		result = evaluate_toxicity(
			text,
			request.user,
			BlockedMessage.Sources.CHAT,
			metadata={"source": "realtime_check"},
			record_blocked=False,
		)
		if result.get("unavailable"):
			return Response(
				{"success": False, "blocked": False, "error": result["error"]},
				status=status.HTTP_500_INTERNAL_SERVER_ERROR,
			)

		blocked = result.get("blocked", False)
		return Response(
			{
				"success": not blocked,
				"blocked": blocked,
				"confidence": result.get("confidence", 0.0),
				"cleaned_text": result.get("cleaned_text", ""),
				"error": result.get("error") if blocked else None,
			},
			status=status.HTTP_200_OK,
		)
