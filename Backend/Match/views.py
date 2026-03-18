from rest_framework.views import APIView
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404

from esport.response import api_response
from .models import Match
from tournament.models import Tournament, TournamentParticipant
from Notification.models import Notification
from Notification.services import send_notification_to_user
from .serializers import (
    MatchCreateSerializer,
    MatchDetailSerializer,
    MatchUpdateSerializer
)

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi


def _notify_match_participants(tournament, title, message, metadata=None, exclude_user_ids=None):
    excluded = set(exclude_user_ids or [])
    sent_user_ids = set()

    participants = TournamentParticipant.objects.filter(
        tournament=tournament
    ).select_related("player")

    for participant in participants:
        user_id = participant.player_id
        if user_id in excluded or user_id in sent_user_ids:
            continue

        sent_user_ids.add(user_id)
        send_notification_to_user(
            recipient=participant.player,
            title=title,
            message=message,
            notification_type=Notification.NotificationTypes.TOURNAMENT,
            metadata=metadata or {},
        )

# Creating a view to create a match in the database and only the organizer of the tournament can create a match
class CreateMatchView(generics.CreateAPIView):
    serializer_class = MatchCreateSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Create a new match (Organizer only)",
        request_body=MatchCreateSerializer,
        responses={
            201: openapi.Response(
                description="Match created successfully",
                schema=MatchDetailSerializer
            ),
            400: openapi.Response(description="Bad Request"),
            403: openapi.Response(description="Forbidden"),
            500: openapi.Response(description="Internal Server Error"),
        },
        tags=["Match"],
    )
    def post(self, request):
        try:
            serializer = self.serializer_class(
                data=request.data, context={"request": request}
            )
            if serializer.is_valid():
                match = serializer.save()

                _notify_match_participants(
                    match.tournament,
                    title="New Match Scheduled",
                    message=f"Match {match.match_number} ({match.group}) has been scheduled for tournament '{match.tournament.name}'.",
                    metadata={
                        "tournament_id": match.tournament_id,
                        "match_id": match.id,
                    },
                    exclude_user_ids=[request.user.id],
                )

                return api_response(
                    is_success=True,
                    status_code=status.HTTP_201_CREATED,
                    result={
                        "message": "Match created successfully.",
                        "match": MatchDetailSerializer(match).data
                    }
                )
            return api_response(
                is_success=False,
                error_message=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

# Creating a view to list all the matches for a specific tournament and only the organizer of the tournament can create a match
class ListMatchesByTournamentView(generics.ListAPIView):
    serializer_class = MatchDetailSerializer
    permission_classes = [AllowAny] 

    @swagger_auto_schema(
        operation_description="Get all matches for a specific tournament",
        responses={
            200: openapi.Response(
                description="Matches retrieved successfully",
                schema=MatchDetailSerializer(many=True)
            ),
            404: openapi.Response(description="Tournament not found"),
            500: openapi.Response(description="Internal Server Error"),
        },
        tags=["Match"],
    )
    def get(self, request, tournament_id):
        try:
            get_object_or_404(Tournament, pk=tournament_id)
            
            matches = Match.objects.filter(tournament_id=tournament_id).order_by('date_time')
            serializer = self.serializer_class(matches, many=True)
            return api_response(
                is_success=True,
                status_code=status.HTTP_200_OK,
                result=serializer.data
            )
        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

# Creating a view to get the details of a match by its id and any user can access this endpoint
class GetMatchDetailView(generics.RetrieveAPIView):
    serializer_class = MatchDetailSerializer
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_description="Get match details",
        responses={
            200: openapi.Response(
                description="Match details retrieved successfully",
                schema=MatchDetailSerializer
            ),
            404: openapi.Response(description="Match not found"),
            500: openapi.Response(description="Internal Server Error"),
        },
        tags=["Match"],
    )
    def get(self, request, match_id):
        try:
            match = get_object_or_404(Match, pk=match_id)
            serializer = self.serializer_class(match)
            return api_response(
                is_success=True,
                status_code=status.HTTP_200_OK,
                result=serializer.data
            )
        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

# Creating a view to update the details of a match and only the organizer of the tournament can update the match details
class UpdateMatchView(generics.UpdateAPIView):
    serializer_class = MatchUpdateSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Update match details (Organizer only)",
        request_body=MatchUpdateSerializer,
        responses={
            200: openapi.Response(
                description="Match updated successfully",
                schema=MatchDetailSerializer
            ),
            403: openapi.Response(description="Forbidden - Only organizer can update"),
            404: openapi.Response(description="Match not found"),
            500: openapi.Response(description="Internal Server Error"),
        },
        tags=["Match"],
    )
    def put(self, request, match_id):
        try:
            match = get_object_or_404(Match, pk=match_id)
            
            if match.tournament.organizer != request.user:
                return api_response(
                    is_success=False,
                    error_message="You do not have permission to update this match.",
                    status_code=status.HTTP_403_FORBIDDEN
                )

            serializer = self.serializer_class(match, data=request.data, partial=True)
            if serializer.is_valid():
                updated_match = serializer.save()

                _notify_match_participants(
                    updated_match.tournament,
                    title="Match Updated",
                    message=f"Match {updated_match.match_number} in tournament '{updated_match.tournament.name}' was updated (status: {updated_match.status}).",
                    metadata={
                        "tournament_id": updated_match.tournament_id,
                        "match_id": updated_match.id,
                        "status": updated_match.status,
                    },
                    exclude_user_ids=[request.user.id],
                )

                return api_response(
                    is_success=True,
                    status_code=status.HTTP_200_OK,
                    result={
                        "message": "Match updated successfully.",
                        "match": MatchDetailSerializer(updated_match).data
                    }
                )
            return api_response(
                is_success=False,
                error_message=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

# Creating a view to delete a match and only the organizer of the tournament can delete the match
class DeleteMatchView(generics.DestroyAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Delete a match (Organizer only)",
        responses={
            200: openapi.Response(description="Match deleted successfully"),
            403: openapi.Response(description="Forbidden"),
            404: openapi.Response(description="Match not found"),
            500: openapi.Response(description="Internal Server Error"),
        },
        tags=["Match"],
    )
    def delete(self, request, match_id):
        try:
            match = get_object_or_404(Match, pk=match_id)
            
            # Cchecking the permission of the user to delete the match only
            if match.tournament.organizer != request.user:
                return api_response(
                    is_success=False,
                    error_message="You do not have permission to delete this match.",
                    status_code=status.HTTP_403_FORBIDDEN
                )

            tournament = match.tournament
            match_number = match.match_number
            group_name = match.group
            deleted_match_id = match.id
                
            match.delete()

            _notify_match_participants(
                tournament,
                title="Match Cancelled",
                message=f"Match {match_number} ({group_name}) in tournament '{tournament.name}' has been cancelled.",
                metadata={
                    "tournament_id": tournament.id,
                    "match_id": deleted_match_id,
                },
                exclude_user_ids=[request.user.id],
            )

            return api_response(
                is_success=True,
                status_code=status.HTTP_200_OK,
                result={"message": "Match deleted successfully"}
            )
        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
