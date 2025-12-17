from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics

from rest_framework.permissions import IsAuthenticated, AllowAny

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication

from django.contrib.auth import authenticate
from django.db import transaction

from esport.response import api_response

from .serializers import(UserResponseSerializers, UserCreateSerializers, UserLoginSerializers, UserLogoutSerializers)

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

# Create your views here.


# User Registration View
class RegisterUserView(generics.CreateAPIView):
    serializer_class = UserCreateSerializers
    permission_classes = [AllowAny]

    
    @transaction.atomic
    # Helper method to create a new user
    def perform_create(self, serializer):
        user = serializer.save()
        return user


    @swagger_auto_schema(
        # API documentation for user registration
        operation_description="Register a new user",
        request_body=UserCreateSerializers,
        responses={
            201: openapi.Response(description="User registered successfully"),
            400: openapi.Response(description="Bad Request"),
            500: openapi.Response(description="Internal Server Error"),
        },
        tags=["User"],
    )

    # POST method to handle user registration
    def post(self, request):
        try:
            serializer = self.serializer_class(data=request.data)
            # Validate and create the user
            if serializer.is_valid():
                self.perform_create(serializer)
                return api_response(
                    is_sucess=True,
                    status_code=status.HTTP_201_CREATED,
                    result={
                        "message": "User registered successfully."
                    }

                )
            # Return validation errors
            return api_response(
                is_sucess=False,
                error_message=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        # Handle unexpected exceptions
        except Exception as e:
            return api_response(
                is_sucess=False,
                error_message=(e, "An error occurred during registration."),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

# User Login View
class LoginUserView(TokenObtainPairView):
    permission_classes = [AllowAny]
    authentication_classes = [JWTAuthentication]
    serializer_class = UserLoginSerializers

    @swagger_auto_schema(
        # API documentation for user login
        operation_description="Login a user and obtain JWT tokens",
        responses={
            200: openapi.Response(description="Login successful"),
            400: openapi.Response(description="Bad Request"),
            401: openapi.Response(description="Invalid credentials"),
            500: openapi.Response(description="Internal Server Error"),
        },
        tags=["User"],
    )

    def post(self, request):
        try:
            serializer = self.serializer_class(data=request.data)
            if serializer.is_valid():
                email = serializer.validated_data['email']
                password = serializer.validated_data['password']

                user = authenticate(request, email=email, password=password)

                if user is not None:
                    user_data = UserResponseSerializers(user).data
                    refresh = RefreshToken.for_user(user)
                    refresh_token = str(refresh)
                    access_token = str(refresh.access_token)

                    return api_response(
                        is_sucess=True,
                        status_code=status.HTTP_200_OK,
                        result={
                            "user": user_data,
                            "refresh": refresh_token,
                            "access": access_token,
                        }
                    )
                else:
                    return api_response(
                        is_sucess=False,
                        error_message="Invalid email or password.",
                        status_code=status.HTTP_401_UNAUTHORIZED,
                    )
            return api_response(
                is_sucess=False,
                error_message=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return api_response(
                is_sucess=False,
                error_message=(e, "An error occurred during login."),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

# User Logout View
class LogoutUserView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        # API documentation for user logout
        operation_description="Logout a user by blacklisting the refresh token",
        request_body=UserLogoutSerializers,
        responses={
            200: openapi.Response(description="Logout successful"),
            400: openapi.Response(description="Bad Request"),
            500: openapi.Response(description="Internal Server Error"),
        },
        tags=["User"],
    )   



    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return api_response(
                    is_sucess=False,
                    error_message="Refresh token is required.",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            token = RefreshToken(refresh_token)
            token.blacklist()

            return api_response(
                is_sucess=True,
                status_code=status.HTTP_200_OK,
                result={"message": "User logged out successfully."}
            )
        except Exception as e:
            return api_response(
                is_sucess=False,
                error_message=(e, "An error occurred during logout."),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
    




