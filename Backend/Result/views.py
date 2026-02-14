from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

from Match.models import Match
from esport.response import api_response

from .models import Result
from .serializers import ResultCreateSerializer, ResultDetailSerializer, ResultUpdateSerializer

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi


class CreateResultView(generics.CreateAPIView):
	serializer_class = ResultCreateSerializer
	authentication_classes = [JWTAuthentication]
	permission_classes = [IsAuthenticated]

	@swagger_auto_schema(
		operation_description="Submit a match result with proof",
		request_body=ResultCreateSerializer,
		responses={
			201: openapi.Response(description="Result submitted successfully"),
			400: openapi.Response(description="Bad Request"),
			403: openapi.Response(description="Forbidden"),
			500: openapi.Response(description="Internal Server Error"),
		},
		tags=["Result"],
	)
	def post(self, request):
		try:
			serializer = self.serializer_class(data=request.data, context={"request": request})
			if serializer.is_valid():
				result = serializer.save()
				return api_response(
					is_success=True,
					status_code=status.HTTP_201_CREATED,
					result={
						"message": "Result submitted successfully.",
						"result": ResultDetailSerializer(result).data,
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


class ListResultsByMatchView(generics.ListAPIView):
	serializer_class = ResultDetailSerializer
	authentication_classes = [JWTAuthentication]
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		match_id = self.kwargs.get("match_id")
		match = Match.objects.filter(id=match_id).select_related("tournament").first()

		if not match:
			return Result.objects.none()

		user = self.request.user
		if match.tournament.organizer_id == user.id:
			return Result.objects.filter(match_id=match_id)

		return Result.objects.filter(match_id=match_id, submitted_by=user)

	@swagger_auto_schema(
		operation_description="Get results for a match (Organizer sees all, player sees own)",
		responses={
			200: openapi.Response(description="Results retrieved successfully"),
			404: openapi.Response(description="Match not found"),
			500: openapi.Response(description="Internal Server Error"),
		},
		tags=["Result"],
	)
	def get(self, request, match_id):
		try:
			match = Match.objects.filter(id=match_id).select_related("tournament").first()
			if not match:
				return api_response(
					is_success=False,
					error_message="Match not found.",
					status_code=status.HTTP_404_NOT_FOUND,
				)

			results = self.get_queryset()
			serializer = self.serializer_class(results, many=True)
			return api_response(
				is_success=True,
				status_code=status.HTTP_200_OK,
				result={
					"count": results.count(),
					"results": serializer.data,
				},
			)
		except Exception as e:
			return api_response(
				is_success=False,
				error_message=str(e),
				status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			)


class UpdateResultStatusView(generics.UpdateAPIView):
	serializer_class = ResultUpdateSerializer
	authentication_classes = [JWTAuthentication]
	permission_classes = [IsAuthenticated]
	lookup_field = "id"
	lookup_url_kwarg = "result_id"

	def get_queryset(self):
		return Result.objects.select_related("tournament")

	@swagger_auto_schema(
		operation_description="Verify or reject a result (Organizer only)",
		request_body=ResultUpdateSerializer,
		responses={
			200: openapi.Response(description="Result updated successfully"),
			403: openapi.Response(description="Forbidden"),
			404: openapi.Response(description="Result not found"),
			500: openapi.Response(description="Internal Server Error"),
		},
		tags=["Result"],
	)
	def put(self, request, result_id):
		try:
			result = self.get_queryset().filter(id=result_id).first()
			if not result:
				return api_response(
					is_success=False,
					error_message="Result not found.",
					status_code=status.HTTP_404_NOT_FOUND,
				)

			if result.tournament.organizer_id != request.user.id:
				return api_response(
					is_success=False,
					error_message="You do not have permission to update this result.",
					status_code=status.HTTP_403_FORBIDDEN,
				)

			serializer = self.serializer_class(
				result,
				data=request.data,
				partial=True,
				context={"request": request},
			)
			if serializer.is_valid():
				updated = serializer.save()
				return api_response(
					is_success=True,
					status_code=status.HTTP_200_OK,
					result={
						"message": "Result updated successfully.",
						"result": ResultDetailSerializer(updated).data,
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
