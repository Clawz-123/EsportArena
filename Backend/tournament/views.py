from decimal import Decimal

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication

from django.db import transaction
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model

from esport.response import api_response
from Wallet.models import Wallet, WalletTransaction
from Notification.models import Notification
from Notification.services import send_notification_to_user
from .models import Tournament, TournamentTeam, TournamentParticipant
from .serializers import (
    TournamentCreateSerializer,
    TournamentUpdateSerializer,
    TournamentDetailSerializer,
    JoinTournamentSerializer,
    TournamentTeamSerializer,
    TournamentParticipantSerializer,
)

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi


User = get_user_model()


def _notify_tournament_user(user, title, message, metadata=None):
    if not user:
        return

    send_notification_to_user(
        recipient=user,
        title=title,
        message=message,
        notification_type=Notification.NotificationTypes.TOURNAMENT,
        metadata=metadata or {},
    )


def _notify_tournament_participants(tournament, title, message, metadata=None, exclude_user_ids=None):
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

        _notify_tournament_user(
            participant.player,
            title=title,
            message=message,
            metadata=metadata,
        )


# View for Creating Tournament
class CreateTournamentView(generics.CreateAPIView):
    serializer_class = TournamentCreateSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def perform_create(self, serializer):
        tournament = serializer.save()
        prize_total = (tournament.prize_first or 0) + (tournament.prize_second or 0) + (tournament.prize_third or 0)

        if not tournament.is_draft and prize_total > 0:
            organizer_wallet, _ = Wallet.objects.get_or_create(user=tournament.organizer)
            required_amount = Decimal(prize_total)

            if organizer_wallet.balance < required_amount:
                raise ValidationError("Insufficient wallet balance to lock prize pool.")

            organizer_wallet.balance = organizer_wallet.balance - required_amount
            organizer_wallet.save(update_fields=["balance", "updated_at"])

            WalletTransaction.objects.create(
                wallet=organizer_wallet,
                transaction_type=WalletTransaction.TransactionType.PRIZE_LOCK,
                direction=WalletTransaction.Direction.DEBIT,
                amount=required_amount,
                status=WalletTransaction.Status.COMPLETED,
                method=WalletTransaction.Method.INTERNAL,
                reference=str(tournament.id),
                note=f"Prize pool locked for tournament {tournament.name}",
            )

        _notify_tournament_user(
            tournament.organizer,
            title="Tournament Created",
            message=f"Your tournament '{tournament.name}' has been created successfully.",
            metadata={
                "tournament_id": tournament.id,
                "status": "draft" if tournament.is_draft else "published",
            },
        )

        return tournament

    @swagger_auto_schema(
        operation_description="Create a new tournament (Organizers only)",
        request_body=TournamentCreateSerializer,
        responses={
            201: openapi.Response(description="Tournament created successfully"),
            400: openapi.Response(description="Bad Request"),
            403: openapi.Response(description="Forbidden - Only organizers can create tournaments"),
            500: openapi.Response(description="Internal Server Error"),
        },
        tags=["Tournament"],
    )

    def post(self, request):
        try:
            serializer = self.serializer_class(
                data=request.data, context={"request": request}
            )
            if serializer.is_valid():
                tournament = self.perform_create(serializer)
                result_serializer = TournamentDetailSerializer(tournament, context={"request": request})
                return api_response(
                    is_success=True,
                    status_code=status.HTTP_201_CREATED,
                    result={
                        "message": "Tournament created successfully.",
                        "tournament": result_serializer.data,
                    },
                )
            return api_response(
                is_success=False,
                error_message=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        except ValidationError as e:
            return api_response(
                is_success=False,
                error_message=e.message_dict if hasattr(e, "message_dict") else str(e),
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# View for Getting All Tournaments by Organizer
class GetOrganizerTournamentsView(generics.ListAPIView):
    serializer_class = TournamentDetailSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Tournament.objects.filter(organizer=self.request.user)

    @swagger_auto_schema(
        operation_description="Get all tournaments created by the authenticated organizer",
        responses={
            200: openapi.Response(
                description="Tournaments retrieved successfully",
                schema=TournamentDetailSerializer(many=True),
            ),
            500: openapi.Response(description="Internal Server Error"),
        },
        tags=["Tournament"],
    )

    def get(self, request, *args, **kwargs):
        try:
            tournaments = self.get_queryset()
            serializer = self.serializer_class(tournaments, many=True, context={"request": request})
            return api_response(
                is_success=True,
                status_code=status.HTTP_200_OK,
                result={"count": tournaments.count(), "tournaments": serializer.data},
            )
        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# View for Getting Tournament by ID
class GetTournamentDetailView(generics.RetrieveAPIView):
    serializer_class = TournamentDetailSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    lookup_field = "id"
    lookup_url_kwarg = "tournament_id"

    def get_queryset(self):
        return Tournament.objects.all()

    @swagger_auto_schema(
        operation_description="Get details of a specific tournament",
        responses={
            200: openapi.Response(
                description="Tournament retrieved successfully",
                schema=TournamentDetailSerializer(),
            ),
            404: openapi.Response(description="Tournament not found"),
            500: openapi.Response(description="Internal Server Error"),
        },
        tags=["Tournament"],
    )

    def get(self, request, tournament_id):
        try:
            tournament = self.get_queryset().get(id=tournament_id)
            serializer = self.serializer_class(tournament, context={"request": request})
            return api_response(
                is_success=True,
                status_code=status.HTTP_200_OK,
                result={"tournament": serializer.data},
            )
        except Tournament.DoesNotExist:
            return api_response(
                is_success=False,
                error_message="Tournament not found.",
                status_code=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# View for Updating Tournament
class UpdateTournamentView(generics.UpdateAPIView):
    serializer_class = TournamentUpdateSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    lookup_field = "id"
    lookup_url_kwarg = "tournament_id"

    def get_queryset(self):
        return Tournament.objects.filter(organizer=self.request.user)

    @swagger_auto_schema(
        operation_description="Update tournament details (only during registration phase)",
        request_body=TournamentUpdateSerializer,
        responses={
            200: openapi.Response(description="Tournament updated successfully"),
            400: openapi.Response(description="Bad Request or Tournament cannot be updated"),
            403: openapi.Response(description="Forbidden - Not the tournament organizer"),
            404: openapi.Response(description="Tournament not found"),
            500: openapi.Response(description="Internal Server Error"),
        },
        tags=["Tournament"],
    )

    def put(self, request, tournament_id):
        try:
            tournament = self.get_queryset().get(id=tournament_id)
        except Tournament.DoesNotExist:
            return api_response(
                is_success=False,
                error_message="Tournament not found or you are not the organizer.",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        try:
            serializer = self.serializer_class(
                tournament, data=request.data, partial=False, context={"request": request}
            )
            if serializer.is_valid():
                updated_tournament = serializer.save()

                _notify_tournament_user(
                    updated_tournament.organizer,
                    title="Tournament Updated",
                    message=f"Your tournament '{updated_tournament.name}' has been updated.",
                    metadata={"tournament_id": updated_tournament.id},
                )
                _notify_tournament_participants(
                    updated_tournament,
                    title="Tournament Updated",
                    message=f"Tournament '{updated_tournament.name}' has new updates. Please review latest details.",
                    metadata={"tournament_id": updated_tournament.id},
                    exclude_user_ids=[updated_tournament.organizer_id],
                )

                result_serializer = TournamentDetailSerializer(updated_tournament, context={"request": request})
                return api_response(
                    is_success=True,
                    status_code=status.HTTP_200_OK,
                    result={
                        "message": "Tournament updated successfully.",
                        "tournament": result_serializer.data,
                    },
                )
            return api_response(
                is_success=False,
                error_message=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        except ValidationError as e:
            return api_response(
                is_success=False,
                error_message=e.message_dict if hasattr(e, "message_dict") else str(e),
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def patch(self, request, tournament_id):
        try:
            tournament = self.get_queryset().get(id=tournament_id)
        except Tournament.DoesNotExist:
            return api_response(
                is_success=False,
                error_message="Tournament not found or you are not the organizer.",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        try:
            serializer = self.serializer_class(
                tournament, data=request.data, partial=True, context={"request": request}
            )
            if serializer.is_valid():
                updated_tournament = serializer.save()

                _notify_tournament_user(
                    updated_tournament.organizer,
                    title="Tournament Updated",
                    message=f"Your tournament '{updated_tournament.name}' has been updated.",
                    metadata={"tournament_id": updated_tournament.id},
                )
                _notify_tournament_participants(
                    updated_tournament,
                    title="Tournament Updated",
                    message=f"Tournament '{updated_tournament.name}' has new updates. Please review latest details.",
                    metadata={"tournament_id": updated_tournament.id},
                    exclude_user_ids=[updated_tournament.organizer_id],
                )

                result_serializer = TournamentDetailSerializer(updated_tournament, context={"request": request})
                return api_response(
                    is_success=True,
                    status_code=status.HTTP_200_OK,
                    result={
                        "message": "Tournament updated successfully.",
                        "tournament": result_serializer.data,
                    },
                )
            return api_response(
                is_success=False,
                error_message=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        except ValidationError as e:
            return api_response(
                is_success=False,
                error_message=e.message_dict if hasattr(e, "message_dict") else str(e),
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# View for Deleting Tournament
class DeleteTournamentView(generics.DestroyAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    lookup_field = "id"
    lookup_url_kwarg = "tournament_id"

    def get_queryset(self):
        return Tournament.objects.filter(organizer=self.request.user)

    @swagger_auto_schema(
        operation_description="Delete a tournament (Organizer only)",
        responses={
            204: openapi.Response(description="Tournament deleted successfully"),
            403: openapi.Response(description="Forbidden - Not the tournament organizer"),
            404: openapi.Response(description="Tournament not found"),
            500: openapi.Response(description="Internal Server Error"),
        },
        tags=["Tournament"],
    )

    def delete(self, request, tournament_id):
        try:
            tournament = self.get_queryset().get(id=tournament_id)

            participant_users = list(
                User.objects.filter(
                    id__in=TournamentParticipant.objects.filter(
                        tournament=tournament
                    ).values_list("player_id", flat=True)
                )
            )
            tournament_name = tournament.name
            deleted_tournament_id = tournament.id

            tournament.delete()

            for participant_user in participant_users:
                _notify_tournament_user(
                    participant_user,
                    title="Tournament Cancelled",
                    message=f"Tournament '{tournament_name}' has been cancelled by organizer.",
                    metadata={"tournament_id": deleted_tournament_id},
                )

            return api_response(
                is_success=True,
                status_code=status.HTTP_204_NO_CONTENT,
                result={"message": "Tournament deleted successfully."},
            )
        except Tournament.DoesNotExist:
            return api_response(
                is_success=False,
                error_message="Tournament not found or you are not the organizer.",
                status_code=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# View for Getting All Public Tournaments (for players to browse)
class GetAllPublicTournamentsView(generics.ListAPIView):
    serializer_class = TournamentDetailSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        # Exclude draft tournaments from public view
        return Tournament.objects.filter(is_draft=False)

    @swagger_auto_schema(
        operation_description="Get all public tournaments created by all organizers (for players)",
        responses={
            200: openapi.Response(
                description="Tournaments retrieved successfully",
                schema=TournamentDetailSerializer(many=True),
            ),
            500: openapi.Response(description="Internal Server Error"),
        },
        tags=["Tournament"],
    )

    def get(self, request, *args, **kwargs):
        try:
            tournaments = self.get_queryset()
            serializer = self.serializer_class(tournaments, many=True, context={'request': request})
            return api_response(
                is_success=True,
                status_code=status.HTTP_200_OK,
                result={"count": tournaments.count(), "tournaments": serializer.data},
            )
        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# View for Joining Tournament (for players to join a tournament and create a team if it's a team-based tournament)
class JoinTournamentView(generics.CreateAPIView):
    serializer_class = JoinTournamentSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def perform_join(self, validated_data, user):
        tournament = validated_data["tournament"]
        team_name = validated_data.get("team_name")
        team_logo = validated_data.get("team_logo")
        team_members = validated_data.get("team_members", [])
        in_game_names = validated_data["in_game_names"]

        is_team_based = tournament.match_format in [Tournament.MatchFormats.DUO, Tournament.MatchFormats.SQUAD]

        entry_fee = Decimal(tournament.entry_fee or 0)
        if entry_fee > 0:
            player_wallet, _ = Wallet.objects.get_or_create(user=user)
            organizer_wallet, _ = Wallet.objects.get_or_create(user=tournament.organizer)

            if player_wallet.balance < entry_fee:
                raise ValidationError("Insufficient wallet balance to join this tournament.")

            player_wallet.balance = player_wallet.balance - entry_fee
            player_wallet.save(update_fields=["balance", "updated_at"])

            organizer_wallet.balance = organizer_wallet.balance + entry_fee
            organizer_wallet.save(update_fields=["balance", "updated_at"])

            WalletTransaction.objects.create(
                wallet=player_wallet,
                transaction_type=WalletTransaction.TransactionType.ENTRY_FEE,
                direction=WalletTransaction.Direction.DEBIT,
                amount=entry_fee,
                status=WalletTransaction.Status.COMPLETED,
                method=WalletTransaction.Method.INTERNAL,
                reference=str(tournament.id),
                note=f"Entry fee for tournament {tournament.name}",
            )

            WalletTransaction.objects.create(
                wallet=organizer_wallet,
                transaction_type=WalletTransaction.TransactionType.ENTRY_FEE,
                direction=WalletTransaction.Direction.CREDIT,
                amount=entry_fee,
                status=WalletTransaction.Status.COMPLETED,
                method=WalletTransaction.Method.INTERNAL,
                reference=str(tournament.id),
                note=f"Entry fee received for tournament {tournament.name}",
            )

        # For checking the validity of team members and team name only if it's a team-based tournament
        if TournamentParticipant.objects.filter(tournament=tournament, player=user).exists():
            raise ValidationError("You are already registered in this tournament.")

        # For checking team name uniqueness and team members validity only if it's a team-based tournament
        if team_members:
            existing_participants = TournamentParticipant.objects.filter(
                tournament=tournament,
                player_id__in=team_members
            ).values_list('player__email', flat=True)
            if existing_participants:
                raise ValidationError(f"Some team members are already registered: {', '.join(existing_participants)}")

        if is_team_based:
            # Create team and add captain and members
            team = TournamentTeam(
                tournament=tournament,
                team_name=team_name,
                team_logo=team_logo,
                captain=user,
            )
            team.full_clean()
            team.save()

            # Add captain
            captain_participant = TournamentParticipant(
                tournament=tournament,
                player=user,
                team=team,
                in_game_name=in_game_names[str(user.id)],
                is_captain=True,
            )
            captain_participant.full_clean()
            captain_participant.save()

            # Add team members
            for member_id in team_members:
                member_participant = TournamentParticipant(
                    tournament=tournament,
                    player_id=member_id,
                    team=team,
                    in_game_name=in_game_names[str(member_id)],
                    is_captain=False,
                )
                member_participant.full_clean()
                member_participant.save()

            _notify_tournament_user(
                user,
                title="Tournament Joined",
                message=f"You joined '{tournament.name}' with team '{team.team_name}'.",
                metadata={
                    "tournament_id": tournament.id,
                    "team_id": team.id,
                },
            )
            _notify_tournament_user(
                tournament.organizer,
                title="New Team Registered",
                message=f"Team '{team.team_name}' joined your tournament '{tournament.name}'.",
                metadata={
                    "tournament_id": tournament.id,
                    "team_id": team.id,
                    "captain_id": user.id,
                },
            )

            for member_id in team_members:
                member_user = User.objects.filter(id=member_id).first()
                _notify_tournament_user(
                    member_user,
                    title="Added To Tournament Team",
                    message=f"You were added to team '{team.team_name}' in tournament '{tournament.name}'.",
                    metadata={
                        "tournament_id": tournament.id,
                        "team_id": team.id,
                    },
                )

            return team

        else:
            # Solo tournament - no team needed
            participant = TournamentParticipant(
                tournament=tournament,
                player=user,
                in_game_name=in_game_names[str(user.id)],
                is_captain=False,
            )
            participant.full_clean()
            participant.save()

            _notify_tournament_user(
                user,
                title="Tournament Joined",
                message=f"You joined tournament '{tournament.name}'.",
                metadata={"tournament_id": tournament.id},
            )
            _notify_tournament_user(
                tournament.organizer,
                title="New Player Registered",
                message=f"A player joined your tournament '{tournament.name}'.",
                metadata={"tournament_id": tournament.id, "player_id": user.id},
            )

            return participant

    @swagger_auto_schema(
        operation_description="Join a tournament (Players only)",
        request_body=JoinTournamentSerializer,
        responses={
            201: openapi.Response(description="Successfully joined tournament"),
            400: openapi.Response(description="Bad Request"),
            403: openapi.Response(description="Forbidden - Only verified players can join"),
            500: openapi.Response(description="Internal Server Error"),
        },
        tags=["Tournament"],
    )

    def post(self, request):
        try:
            # Validate user is a player
            if getattr(request.user, "is_organizer", False) or getattr(request.user, "is_superuser", False):
                return api_response(
                    is_success=False,
                    error_message="Organizers and superusers cannot participate in tournaments.",
                    status_code=status.HTTP_403_FORBIDDEN,
                )

            serializer = self.serializer_class(
                data=request.data,
                context={"request": request}
            )

            if serializer.is_valid():
                result = self.perform_join(serializer.validated_data, request.user)

                if isinstance(result, TournamentTeam):
                    result_serializer = TournamentTeamSerializer(result, context={'request': request})
                    message = f"Successfully joined tournament '{result.tournament.name}' with team '{result.team_name}'."
                else:
                    result_serializer = TournamentParticipantSerializer(result, context={'request': request})
                    message = f"Successfully joined tournament '{result.tournament.name}'."

                return api_response(
                    is_success=True,
                    status_code=status.HTTP_201_CREATED,
                    result={
                        "message": message,
                        "data": result_serializer.data,
                    },
                )

            return api_response(
                is_success=False,
                error_message=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        except ValidationError as e:
            return api_response(
                is_success=False,
                error_message=e.message_dict if hasattr(e, "message_dict") else str(e),
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# View for Getting Tournament Participants
class GetTournamentParticipantsView(generics.ListAPIView):
    serializer_class = TournamentParticipantSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        tournament_id = self.kwargs.get("tournament_id")
        return TournamentParticipant.objects.filter(tournament_id=tournament_id)

    @swagger_auto_schema(
        operation_description="Get all participants for a specific tournament",
        responses={
            200: openapi.Response(
                description="Participants retrieved successfully",
                schema=TournamentParticipantSerializer(many=True),
            ),
            500: openapi.Response(description="Internal Server Error"),
        },
        tags=["Tournament"],
    )

    def get(self, request, tournament_id):
        try:
            participants = self.get_queryset()
            serializer = self.serializer_class(participants, many=True, context={'request': request})
            return api_response(
                is_success=True,
                status_code=status.HTTP_200_OK,
                result={
                    "count": participants.count(),
                    "participants": serializer.data
                },
            )
        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# View for Getting Tournament Teams
class GetTournamentTeamsView(generics.ListAPIView):
    serializer_class = TournamentTeamSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        tournament_id = self.kwargs.get("tournament_id")
        return TournamentTeam.objects.filter(tournament_id=tournament_id)

    @swagger_auto_schema(
        operation_description="Get all teams for a specific tournament",
        responses={
            200: openapi.Response(
                description="Teams retrieved successfully",
                schema=TournamentTeamSerializer(many=True),
            ),
            500: openapi.Response(description="Internal Server Error"),
        },
        tags=["Tournament"],
    )

    def get(self, request, tournament_id):
        try:
            teams = self.get_queryset()
            serializer = self.serializer_class(teams, many=True, context={'request': request})
            return api_response(
                is_success=True,
                status_code=status.HTTP_200_OK,
                result={
                    "count": teams.count(),
                    "teams": serializer.data
                },
            )
        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# View for Getting User's Joined Tournaments
class GetMyJoinedTournamentsView(generics.ListAPIView):
    serializer_class = TournamentDetailSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Get all tournaments where the user is a participant
        user = self.request.user
        tournament_ids = TournamentParticipant.objects.filter(
            player=user
        ).values_list('tournament_id', flat=True)
        
        return Tournament.objects.filter(id__in=tournament_ids)

    @swagger_auto_schema(
        operation_description="Get all tournaments joined by the authenticated user",
        responses={
            200: openapi.Response(
                description="Joined tournaments retrieved successfully",
                schema=TournamentDetailSerializer(many=True),
            ),
            500: openapi.Response(description="Internal Server Error"),
        },
        tags=["Tournament"],
    )

    def get(self, request, *args, **kwargs):
        try:
            tournaments = self.get_queryset()
            serializer = self.serializer_class(tournaments, many=True, context={'request': request})
            return api_response(
                is_success=True,
                status_code=status.HTTP_200_OK,
                result={
                    "count": tournaments.count(),
                    "tournaments": serializer.data
                },
            )
        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
