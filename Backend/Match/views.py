from rest_framework.views import APIView
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404

from esport.response import api_response
from .models import Match
from tournament.models import Tournament
from .serializers import (
    MatchCreateSerializer,
    MatchDetailSerializer,
    MatchUpdateSerializer
)

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

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
            # Add request context to serializer for validation
            serializer = self.serializer_class(
                data=request.data, context={"request": request}
            )
            if serializer.is_valid():
                match = serializer.save()
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
            # Verify tournament exists
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
            
            # Check permission: Only tournament organizer can update
            if match.tournament.organizer != request.user:
                return api_response(
                    is_success=False,
                    error_message="You do not have permission to update this match.",
                    status_code=status.HTTP_403_FORBIDDEN
                )

            serializer = self.serializer_class(match, data=request.data, partial=True)
            if serializer.is_valid():
                updated_match = serializer.save()
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
            
            # Check permission
            if match.tournament.organizer != request.user:
                return api_response(
                    is_success=False,
                    error_message="You do not have permission to delete this match.",
                    status_code=status.HTTP_403_FORBIDDEN
                )
                
            match.delete()
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
