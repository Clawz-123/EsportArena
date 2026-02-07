from rest_framework import status, generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404

from esport.response import api_response
from .models import GroupLeaderboardEntry
from .serializers import GroupLeaderboardEntrySerializer

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi


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
			serializer = self.serializer_class(data=request.data)
			if serializer.is_valid():
				entry = serializer.save()
				return api_response(
					is_success=True,
					status_code=status.HTTP_201_CREATED,
					result={
						"message": "Leaderboard entry created successfully.",
						"entry": GroupLeaderboardEntrySerializer(entry).data,
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


class ListLeaderboardEntriesView(generics.ListAPIView):
	serializer_class = GroupLeaderboardEntrySerializer
	permission_classes = [AllowAny]

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
			entries = GroupLeaderboardEntry.objects.filter(tournament_id=tournament_id)
			bracket_id = request.query_params.get("bracket_id")
			group_name = request.query_params.get("group_name")

			if bracket_id:
				entries = entries.filter(bracket_id=bracket_id)
			if group_name:
				entries = entries.filter(group_name=group_name)

			entries = entries.order_by("rank", "-total_points")
			serializer = self.serializer_class(entries, many=True)
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

			serializer = self.serializer_class(entry, data=request.data, partial=True)
			if serializer.is_valid():
				updated_entry = serializer.save()
				return api_response(
					is_success=True,
					status_code=status.HTTP_200_OK,
					result={
						"message": "Leaderboard entry updated successfully.",
						"entry": GroupLeaderboardEntrySerializer(updated_entry).data,
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
