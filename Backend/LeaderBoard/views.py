from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404

from esport.response import api_response
from .models import GroupLeaderboardEntry
from .serializers import GroupLeaderboardEntrySerializer
from tournament.models import Tournament, TournamentParticipant

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi


# Creating a view to create a leaderboard entry in the database
class CreateLeaderboardEntryView(generics.CreateAPIView):
	serializer_class = GroupLeaderboardEntrySerializer
	authentication_classes = [JWTAuthentication]
	permission_classes = [IsAuthenticated]

	@swagger_auto_schema(
		operation_description="Create a group leaderboard entry (Organizer only)",
		request_body=GroupLeaderboardEntrySerializer,
		responses={
			201: openapi.Response(description="Entry created successfully"),
			400: openapi.Response(description="Bad Request"),
			403: openapi.Response(description="Forbidden"),
			500: openapi.Response(description="Internal Server Error"),
		},
		tags=["Leaderboard"],
	)
	def post(self, request):
		try:
			serializer = self.serializer_class(data=request.data, context={"request": request})
			if serializer.is_valid():
				entry = serializer.save()
				return api_response(
					is_success=True,
					status_code=status.HTTP_201_CREATED,
					result={
						"message": "Leaderboard entry created successfully.",
						"entry": GroupLeaderboardEntrySerializer(entry, context={"request": request}).data,
					},
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


# Creating a view to list all the leaderboard entry for a tournament and filter it by bracket and group name
class ListLeaderboardEntriesView(generics.ListAPIView):
	serializer_class = GroupLeaderboardEntrySerializer
	authentication_classes = [JWTAuthentication]
	permission_classes = [IsAuthenticated]

	@swagger_auto_schema(
		operation_description="Get leaderboard entries by tournament, optional bracket and group",
		manual_parameters=[
			openapi.Parameter("bracket_id", openapi.IN_QUERY, type=openapi.TYPE_INTEGER),
			openapi.Parameter("group_name", openapi.IN_QUERY, type=openapi.TYPE_STRING),
		],
		responses={
			200: openapi.Response(
				description="Leaderboard entries retrieved successfully",
				schema=GroupLeaderboardEntrySerializer(many=True),
			),
			404: openapi.Response(description="Tournament not found"),
			500: openapi.Response(description="Internal Server Error"),
		},
		tags=["Leaderboard"],
	)
	def get(self, request, tournament_id):
		try:
			tournament = Tournament.objects.filter(id=tournament_id).first()
			if not tournament:
				return api_response(
					is_success=False,
					error_message="Tournament not found.",
					status_code=status.HTTP_404_NOT_FOUND,
				)

			is_organizer = tournament.organizer_id == request.user.id
			is_superadmin = bool(getattr(request.user, "is_superuser", False))
			is_participant = TournamentParticipant.objects.filter(
				tournament_id=tournament_id,
				player_id=request.user.id,
			).exists()

			if not (is_organizer or is_superadmin or is_participant):
				return api_response(
					is_success=False,
					error_message="Join this tournament to view leaderboard.",
					status_code=status.HTTP_403_FORBIDDEN,
				)

			entries = GroupLeaderboardEntry.objects.filter(tournament_id=tournament_id)
			bracket_id = request.query_params.get("bracket_id")
			group_name = request.query_params.get("group_name")

			if bracket_id:
				entries = entries.filter(bracket_id=bracket_id)
			if group_name:
				entries = entries.filter(group_name=group_name)

			entries = entries.order_by("rank", "-total_points")
			serializer = self.serializer_class(entries, many=True, context={"request": request})
			return api_response(
				is_success=True,
				status_code=status.HTTP_200_OK,
				result={
					"count": entries.count(),
					"entries": serializer.data,
				},
			)
		except Exception as e:
			return api_response(
				is_success=False,
				error_message=str(e),
				status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			)


# Creating a view to update a leaderboard entry in the database and only the organizer of the tournament can update it
class UpdateLeaderboardEntryView(generics.UpdateAPIView):
	serializer_class = GroupLeaderboardEntrySerializer
	authentication_classes = [JWTAuthentication]
	permission_classes = [IsAuthenticated]

	@swagger_auto_schema(
		operation_description="Update leaderboard entry (Organizer only)",
		request_body=GroupLeaderboardEntrySerializer,
		responses={
			200: openapi.Response(description="Entry updated successfully"),
			400: openapi.Response(description="Bad Request"),
			403: openapi.Response(description="Forbidden"),
			404: openapi.Response(description="Entry not found"),
			500: openapi.Response(description="Internal Server Error"),
		},
		tags=["Leaderboard"],
	)
	def put(self, request, entry_id):
		try:
			entry = get_object_or_404(GroupLeaderboardEntry, pk=entry_id)
			if entry.tournament.organizer != request.user:
				return api_response(
					is_success=False,
					error_message="You do not have permission to update this entry.",
					status_code=status.HTTP_403_FORBIDDEN,
				)

			serializer = self.serializer_class(entry, data=request.data, partial=True, context={"request": request})
			if serializer.is_valid():
				updated_entry = serializer.save()
				return api_response(
					is_success=True,
					status_code=status.HTTP_200_OK,
					result={
						"message": "Leaderboard entry updated successfully.",
						"entry": GroupLeaderboardEntrySerializer(updated_entry, context={"request": request}).data,
					},
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


# Creating a view to delete a leaderboard entry in the database and only the organizer of the tournament can delete it
class DeleteLeaderboardEntryView(generics.DestroyAPIView):
	authentication_classes = [JWTAuthentication]
	permission_classes = [IsAuthenticated]

	@swagger_auto_schema(
		operation_description="Delete leaderboard entry (Organizer only)",
		responses={
			200: openapi.Response(description="Entry deleted successfully"),
			403: openapi.Response(description="Forbidden"),
			404: openapi.Response(description="Entry not found"),
			500: openapi.Response(description="Internal Server Error"),
		},
		tags=["Leaderboard"],
	)
	def delete(self, request, entry_id):
		try:
			entry = get_object_or_404(GroupLeaderboardEntry, pk=entry_id)
			if entry.tournament.organizer != request.user:
				return api_response(
					is_success=False,
					error_message="You do not have permission to delete this entry.",
					status_code=status.HTTP_403_FORBIDDEN,
				)
			entry.delete()
			return api_response(
				is_success=True,
				status_code=status.HTTP_200_OK,
				result={"message": "Leaderboard entry deleted successfully"},
			)
		except Exception as e:
			return api_response(
				is_success=False,
				error_message=str(e),
				status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			)
