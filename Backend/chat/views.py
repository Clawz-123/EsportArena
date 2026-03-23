from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from esport.response import api_response
from tournament.models import Tournament

from .models import ChatMessage
from .serializers import ChatMessageSerializer
from .services import broadcast_chat_message


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

		created = ChatMessage.objects.create(
			tournament=tournament,
			sender=request.user,
			message_type=ChatMessage.MessageTypes.GENERAL,
			message=text,
		)
		broadcast_chat_message(created)

		serializer = ChatMessageSerializer(created, context={"request": request})
		return api_response(
			is_success=True,
			status_code=status.HTTP_201_CREATED,
			result=serializer.data,
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

		created = ChatMessage.objects.create(
			tournament=tournament,
			sender=request.user,
			message_type=ChatMessage.MessageTypes.ANNOUNCEMENT,
			message=text,
		)
		broadcast_chat_message(created)

		serializer = ChatMessageSerializer(created, context={"request": request})
		return api_response(
			is_success=True,
			status_code=status.HTTP_201_CREATED,
			result=serializer.data,
		)
