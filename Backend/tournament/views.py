from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

from django.db import transaction
from django.core.exceptions import ValidationError

from esport.response import api_response
from .models import Tournament
from .serializers import (
    TournamentCreateSerializer,
    TournamentUpdateSerializer,
    TournamentDetailSerializer,
)

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi


# View for Creating Tournament
class CreateTournamentView(generics.CreateAPIView):
    serializer_class = TournamentCreateSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def perform_create(self, serializer):
        tournament = serializer.save()
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
                result_serializer = TournamentDetailSerializer(tournament)
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
            serializer = self.serializer_class(tournaments, many=True)
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
            serializer = self.serializer_class(tournament)
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
                result_serializer = TournamentDetailSerializer(updated_tournament)
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
                result_serializer = TournamentDetailSerializer(updated_tournament)
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
            tournament.delete()
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
