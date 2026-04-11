import logging
from datetime import datetime, timedelta

from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

logger = logging.getLogger(__name__)

from esport.response import api_response
from tournament.models import Tournament
from tournament.models import TournamentParticipant

from .models import BlockedMessage, ChatMessage, ModerationWord, ReportedMessage, ToxicUserWhitelist
from .serializers import ChatMessageSerializer
from .services import broadcast_chat_message
from .toxicity import get_toxic_filter
from .models import ReportedMessage


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


def _can_access_tournament_private_content(user, tournament) -> bool:
	if not user or not getattr(user, "is_authenticated", False):
		return False
	if getattr(user, "is_superuser", False):
		return True
	if tournament and tournament.organizer_id == user.id:
		return True
	return TournamentParticipant.objects.filter(
		tournament=tournament,
		player_id=user.id,
	).exists()


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

		if not _can_access_tournament_private_content(request.user, tournament):
			return api_response(
				is_success=False,
				error_message="Join this tournament to access chat.",
				status_code=status.HTTP_403_FORBIDDEN,
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

		if not _can_access_tournament_private_content(request.user, tournament):
			return api_response(
				is_success=False,
				error_message="Join this tournament to access chat.",
				status_code=status.HTTP_403_FORBIDDEN,
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


class ChatMessageDetailView(APIView):
	permission_classes = [IsAuthenticated]

	def delete(self, request, message_id):
		message = ChatMessage.objects.filter(id=message_id).select_related("sender").first()
		if not message:
			return Response({"success": False, "error": "Message not found."}, status=status.HTTP_404_NOT_FOUND)

		if message.sender_id != request.user.id and not request.user.is_staff:
			return Response({"success": False, "error": "Not allowed to delete this message."}, status=status.HTTP_403_FORBIDDEN)

		message.delete()
		return Response({"success": True}, status=status.HTTP_200_OK)


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

		if not _can_access_tournament_private_content(request.user, tournament):
			return api_response(
				is_success=False,
				error_message="Join this tournament to view announcements.",
				status_code=status.HTTP_403_FORBIDDEN,
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


class ReportChatMessageView(APIView):
	permission_classes = [IsAuthenticated]

	def post(self, request, message_id):
		reason = (request.data.get("reason") or "").strip()
		message_obj = ChatMessage.objects.filter(id=message_id).first()
		if not message_obj:
			return Response(
				{"success": False, "error": "Message not found."},
				status=status.HTTP_404_NOT_FOUND,
			)

		report = ReportedMessage.objects.create(
			message=message_obj,
			reported_by=request.user if request.user.is_authenticated else None,
			reason=reason,
		)

		return Response(
			{"success": True, "report_id": report.id, "status": report.status},
			status=status.HTTP_201_CREATED,
		)


class AdminReportedMessagesView(APIView):
	permission_classes = [IsAuthenticated, IsAdminUser]

	def get(self, request):
		reports = (
			ReportedMessage.objects.select_related("message", "message__sender", "reported_by")
			.order_by("-created_at")
		)
		results = []
		for r in reports:
			msg = r.message
			sender = msg.sender
			reporter = r.reported_by
			results.append(
				{
					"id": r.id,
					"status": r.status,
					"reason": r.reason or "",
					"created_at": r.created_at,
					"message_id": msg.id,
					"message": msg.message,
					"tournament_id": msg.tournament_id,
					"sender": {
						"id": sender.id if sender else None,
						"email": getattr(sender, "email", None),
						"name": getattr(sender, "name", None),
					},
					"reported_by": {
						"id": reporter.id if reporter else None,
						"email": getattr(reporter, "email", None),
						"name": getattr(reporter, "name", None),
					},
				}
			)

		return Response({"success": True, "results": results}, status=status.HTTP_200_OK)


class AdminBlockUserFromReportView(APIView):
	permission_classes = [IsAuthenticated, IsAdminUser]

	def post(self, request, report_id):
		report = ReportedMessage.objects.select_related("message__sender").filter(id=report_id).first()
		if not report:
			return Response({"success": False, "error": "Report not found."}, status=status.HTTP_404_NOT_FOUND)
		sender = report.message.sender if report.message else None
		if not sender:
			return Response({"success": False, "error": "Sender not found."}, status=status.HTTP_404_NOT_FOUND)

		duration_key = str(request.data.get("duration", "7d")).lower()
		custom_until_str = request.data.get("until")
		durations = {
			"1d": 1,
			"1_day": 1,
			"3d": 3,
			"7d": 7,
			"1w": 7,
			"30d": 30,
		}
		blocked_until = None
		if custom_until_str:
			try:
				dt = datetime.fromisoformat(custom_until_str)
				blocked_until = timezone.make_aware(dt) if timezone.is_naive(dt) else dt
			except Exception:
				return Response({"success": False, "error": "Invalid date format for 'until'. Use ISO datetime."}, status=status.HTTP_400_BAD_REQUEST)
		else:
			days = durations.get(duration_key)
			if days is None:
				# allow numeric days like "2" or "2.5"
				try:
					days = float(duration_key)
				except Exception:
					return Response({"success": False, "error": "Invalid duration."}, status=status.HTTP_400_BAD_REQUEST)
			blocked_until = timezone.now() + timedelta(days=days)

		block_reason = (request.data.get("reason") or "Blocked by admin for toxic language.").strip()

		sender.blocked_until = blocked_until
		sender.blocked_reason = block_reason
		sender.is_blocked = True
		sender.is_active = True  # keep account usable after block expires
		sender.save(update_fields=["blocked_until", "blocked_reason", "is_blocked", "is_active"])

		# Force-logout the user by blacklisting all their outstanding refresh tokens
		try:
			from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
			tokens = OutstandingToken.objects.filter(user=sender)
			for t in tokens:
				BlacklistedToken.objects.get_or_create(token=t)
		except Exception as e:
			logger.error(f"Failed to blacklist tokens for blocked user {sender.id}: {str(e)}")

		report.status = ReportedMessage.Status.RESOLVED
		report.save(update_fields=["status"])

		return Response(
			{
				"success": True,
				"blocked_user_id": sender.id,
				"blocked_until": blocked_until.isoformat(),
				"report_status": report.status,
			},
			status=status.HTTP_200_OK,
		)


class AdminCancelReportView(APIView):
	permission_classes = [IsAuthenticated, IsAdminUser]

	def post(self, request, report_id):
		report = ReportedMessage.objects.filter(id=report_id).first()
		if not report:
			return Response({"success": False, "error": "Report not found."}, status=status.HTTP_404_NOT_FOUND)
		report.delete()
		return Response({"success": True, "message": "Report cancelled."}, status=status.HTTP_200_OK)
