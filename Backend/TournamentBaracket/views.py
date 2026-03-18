from django.shortcuts import render
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import TournamentBracket
from .serializers import TournamentBracketSerializer
from tournament.models import Tournament, TournamentTeam, TournamentParticipant
from LeaderBoard.models import GroupLeaderboardEntry
from Notification.models import Notification
from Notification.services import send_notification_to_user

# Create your views here.

class TournamentBracketView(generics.GenericAPIView):
    serializer_class = TournamentBracketSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self, tournament_id):
        return TournamentBracket.objects.filter(tournament_id=tournament_id).first()

    def get(self, request, tournament_id):
        bracket = self.get_object(tournament_id)
        if bracket:
            serializer = self.get_serializer(bracket)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({'detail': 'Bracket not found.'}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, tournament_id):
        tournament = Tournament.objects.filter(id=tournament_id).first()
        if not tournament:
            return Response({'detail': 'Tournament not found.'}, status=status.HTTP_404_NOT_FOUND)
        # If bracket already exists, update it
        bracket = self.get_object(tournament_id)
        data = request.data.copy()
        data['tournament'] = tournament_id
        if bracket:
            serializer = self.get_serializer(bracket, data=data, partial=True)
        else:
            serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            bracket = serializer.save()
            self._sync_group_leaderboard(bracket)

            self._notify_participants(
                bracket.tournament,
                title='Bracket Updated',
                message=f"Bracket for tournament '{bracket.tournament.name}' has been updated.",
                metadata={'tournament_id': bracket.tournament_id},
                exclude_user_ids=[request.user.id],
            )

            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def _notify_participants(self, tournament, title, message, metadata=None, exclude_user_ids=None):
        excluded = set(exclude_user_ids or [])
        sent_user_ids = set()

        participants = TournamentParticipant.objects.filter(
            tournament=tournament
        ).select_related('player')

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

    def _sync_group_leaderboard(self, bracket):
        bracket_data = bracket.bracket_data
        if not bracket_data:
            return

        groups = []
        if isinstance(bracket_data, list):
            groups = bracket_data
        elif isinstance(bracket_data, dict) and isinstance(bracket_data.get("groups"), list):
            groups = bracket_data.get("groups")

        for group in groups:
            group_name = None
            if isinstance(group, dict):
                group_name = group.get("name")
                teams = group.get("teams") or []
            else:
                teams = []

            if not group_name or not isinstance(teams, list):
                continue

            for index, team_data in enumerate(teams, start=1):
                team_id = team_data.get("id") if isinstance(team_data, dict) else None
                if not team_id:
                    continue

                team = TournamentTeam.objects.filter(id=team_id, tournament=bracket.tournament).first()
                if not team:
                    continue

                GroupLeaderboardEntry.objects.get_or_create(
                    tournament=bracket.tournament,
                    bracket=bracket,
                    group_name=group_name,
                    team=team,
                    defaults={
                        "rank": index,
                        "wwcd": team_data.get("wwcd", 0) if isinstance(team_data, dict) else 0,
                        "placement_points": team_data.get("placement_points", 0) if isinstance(team_data, dict) else 0,
                        "kill_points": team_data.get("kill_points", 0) if isinstance(team_data, dict) else 0,
                    },
                )
