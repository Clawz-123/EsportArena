from .models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics

from rest_framework.permissions import IsAuthenticated, AllowAny

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication

from django.contrib.auth import authenticate
from django.db import transaction

from .permission import IsSuperUser
from esport.response import api_response
from .otp import verify_otp, resend_otp

from .serializers import(
    UserResponseSerializers,
    UserCreateSerializers,
    UserLoginSerializers,
    VerifyOTPSerializer,
    ResendOTPSerializer,
    UserLogoutSerializers,
    ResetPasswordSerializer,
    UserProfileSerializer,
)

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

# Create your views here.


# View for User Registration
class RegisterUserView(generics.CreateAPIView):
    serializer_class = UserCreateSerializers
    permission_classes = [AllowAny]

    
    @transaction.atomic
    def perform_create(self, serializer):
        user = serializer.save()
        return user

    @swagger_auto_schema(
        operation_description="Register a new user",
        request_body=UserCreateSerializers,
        responses={
            201: openapi.Response(description="User registered successfully"),
            400: openapi.Response(description="Bad Request"),
            500: openapi.Response(description="Internal Server Error"),
        },
        tags=["User"],
    )

# Created post method for user registration
    def post(self, request):
        try:
            serializer = self.serializer_class(data=request.data)
            if serializer.is_valid():
                user = self.perform_create(serializer) 
                request.session['otp_email'] = user.email
                request.session.set_expiry(1800)  
                return api_response(
                    is_success=True,
                    status_code=status.HTTP_201_CREATED,
                    result={
                        "message": "User registered successfully. Please Verify OTP"
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
                error_message=(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# View for Verifying OTP
class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

   
    @swagger_auto_schema(
        operation_description="Verify OTP sent to user email",
        request_body=VerifyOTPSerializer,
        responses={
            200: openapi.Response(description="OTP verified successfully"),
            400: openapi.Response(description="Invalid or expired OTP"),
            500: openapi.Response(description="Internal Server Error"),
        },
        tags=["OTP"],
    )

# Created post method for verifying OTP
    def post(self, request):
        try:
            serializer = VerifyOTPSerializer(data=request.data)
            if not serializer.is_valid():
                return api_response(
                    is_success=False,
                    error_message=serializer.errors,
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            email = serializer.validated_data['email']
            otp = serializer.validated_data['otp']

            is_valid, message = verify_otp(email, otp)

            if is_valid:
                request.session["reset_email"] = email
                request.session.set_expiry(600)
                return api_response(
                    is_success=True,
                    status_code=status.HTTP_200_OK,
                    result={"message": "OTP verified successfully. You can now reset your password."}
                )
            else:
                return api_response(
                    is_success=False,
                    error_message={"error": message},
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# View for Resetting Password
class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_description="Reset user password after OTP verification",
        request_body=ResetPasswordSerializer,
        responses={
            200: openapi.Response(description="Password reset successful"),
            400: openapi.Response(description="Bad Request"),
            404: openapi.Response(description="User not found"),
            500: openapi.Response(description="Internal Server Error"),
        },
        tags=["User"],
    )

#  Created post method for resetting password
    def post(self, request):
        try:
            serializer = ResetPasswordSerializer(data=request.data)
            if not serializer.is_valid():
                return api_response(
                    is_success=False,
                    error_message=serializer.errors,
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            email = request.session.get("reset_email") or request.data.get("email")
            if not email:
                return api_response(
                    is_success=False,
                    error_message="OTP verification required before resetting password.",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return api_response(
                    is_success=False,
                    error_message="User not found.",
                    status_code=status.HTTP_404_NOT_FOUND,
                )

            user.set_password(serializer.validated_data["new_password"])
            user.save()

            if "reset_email" in request.session:
                del request.session["reset_email"]

            return api_response(
                is_success=True,
                status_code=status.HTTP_200_OK,
                result={"message": "Password reset successfully."},
            )
        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        
# View for Resending OTP
class ResendOTPView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_description="Resend OTP to user email",
        request_body=ResendOTPSerializer,
        responses={
            200: openapi.Response(description="OTP resent successfully"),
            400: openapi.Response(description="Bad Request"),
            500: openapi.Response(description="Internal Server Error"),
            },
        tags=["OTP"]
    )
# Created post method for resending OTP
    def post(self, request):
        try:
            serializer = ResendOTPSerializer(data=request.data)
            if not serializer.is_valid():
                return api_response(
                    is_success=False,
                    error_message=serializer.errors,
                    status_code=status.HTTP_400_BAD_REQUEST,
                )
            
            email = serializer.validated_data['email']
            
            result, message = resend_otp(email)

            if result:
                request.session['otp_email'] = email
                request.session.set_expiry(1800)
                return api_response(
                    is_success=True,
                    status_code=status.HTTP_200_OK,
                    result={"message": "OTP has been resent to your email."}
                )
            else:
                return api_response(
                    is_success=False,
                    error_message={"error": message},
                    status_code=status.HTTP_400_BAD_REQUEST,
                )
        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

# View for User Login
class LoginUserView(TokenObtainPairView):
    permission_classes = [AllowAny]
    authentication_classes = [JWTAuthentication]
    serializer_class = UserLoginSerializers

    @swagger_auto_schema(
        operation_description="Login a user and obtain JWT tokens",
        responses={
            200: openapi.Response(description="Login successful"),
            400: openapi.Response(description="Bad Request"),
            401: openapi.Response(description="Invalid credentials"),
            500: openapi.Response(description="Internal Server Error"),
        },
        tags=["User"],
    )

# Created post method for user login
    def post(self, request):
        try:
            serializer = self.serializer_class(data=request.data)
            if serializer.is_valid():
                email = serializer.validated_data['email']
                password = serializer.validated_data['password']
                user = authenticate(request, username=email, password=password)

                if user is not None:
                    # Update last_login
                    from django.contrib.auth import update_session_auth_hash
                    from django.utils import timezone
                    user.last_login = timezone.now()
                    user.save(update_fields=['last_login'])
                    
                    user_data = UserResponseSerializers(user).data
                    refresh = RefreshToken.for_user(user)
                    refresh_token = str(refresh)
                    access_token = str(refresh.access_token)

                    return api_response(
                        is_success=True,
                        status_code=status.HTTP_200_OK,
                        result={
                            "message": "Login Sucessful",
                            "user": user_data,
                            "refresh": refresh_token,
                            "access": access_token,
                        }
                    )
                else:
                    return api_response(
                        is_success=False,
                        error_message="Invalid email or password.",
                        status_code=status.HTTP_401_UNAUTHORIZED,
                    )
            return api_response(
                is_success=False,
                error_message=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return api_response(
                is_success=False,
                error_message=(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

# View for User Logout
class LogoutUserView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Logout a user by blacklisting the refresh token",
        request_body=UserLogoutSerializers,
        responses={
            200: openapi.Response(description="Logout successful"),
            400: openapi.Response(description="Bad Request"),
            500: openapi.Response(description="Internal Server Error"),
        },
        tags=["User"],
    )   

# Created post method for user logout
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return api_response(
                    is_success=False,
                    error_message="Refresh token is required.",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            token = RefreshToken(refresh_token)
            token.blacklist()

            return api_response(
                is_success=True,
                status_code=status.HTTP_200_OK,
                result={"message": "User logged out successfully."}
            )
        except Exception as e:
            return api_response(
                is_success=False,
                error_message=(e, "An error occurred during logout."),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
    
# View for Getting all Users
class GetUserView(generics.ListAPIView):
    """
    Get all registered users
    """
    queryset = User.objects.all()
    serializer_class = UserResponseSerializers
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsSuperUser]

    @swagger_auto_schema(
        operation_description="Get list of all registered users",
        responses={
            200: openapi.Response(
                description="User list retrieved successfully",
                schema=UserResponseSerializers(many=True)
            ),
            500: openapi.Response(description="Internal Server Error"),
        },
        tags=["User"],
    )
# Created get method for getting all users by authenticated superuser
    def get(self, request, *args, **kwargs):
        try:
            users = self.get_queryset()
            serializer = self.serializer_class(users, many=True)
            return api_response(
                is_success=True,
                status_code=status.HTTP_200_OK,
                result={
                    "count": users.count(),
                    "users": serializer.data
                }
            )
        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        
# View for Getting User Details
class UserDetailView(generics.RetrieveAPIView):
    """
    Get details of a specific user by ID
    """
    queryset = User.objects.all()
    serializer_class = UserResponseSerializers
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsSuperUser]

    @swagger_auto_schema(
        operation_description="Get details of a specific user by ID",
        responses={
            200: openapi.Response(
                description="User details retrieved successfully",
                schema=UserResponseSerializers()
            ),
            404: openapi.Response(description="User not found"),
            500: openapi.Response(description="Internal Server Error"),
        },
        tags=["User"],
    )

# Created get method for getting user details by ID by authenticated superuser
    def get(self, request, *args, **kwargs):
        try:
            user = self.get_object()
            serializer = self.serializer_class(user)
            return api_response(
                is_success=True,
                status_code=status.HTTP_200_OK,
                result=serializer.data
            )
        except User.DoesNotExist:
            return api_response(
                is_success=False,
                error_message="User not found.",
                status_code=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        

# View for Profile Management
class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    @swagger_auto_schema(
        operation_description="Retrieve the authenticated user's profile",
        responses={
            200: openapi.Response(
                description="User profile retrieved successfully",
                schema=UserProfileSerializer()
            ),
            500: openapi.Response(description="Internal Server Error"),
        },
        tags=["Profile"],
    )
    # Getting the data for authenticated user for profile
    def get(self, request, *args, **kwargs):
        try:
            user = self.get_object()
            serializer = self.serializer_class(user, context={'request': request})
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

    @swagger_auto_schema(
        operation_description="Update the authenticated user's profile (name, phone_number)",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'name': openapi.Schema(type=openapi.TYPE_STRING, description='User or Organizer name'),
                'phone_number': openapi.Schema(type=openapi.TYPE_STRING, description='Contact phone number'),
            },
        ),
        responses={
            200: openapi.Response(
                description="Profile updated successfully",
                schema=UserProfileSerializer()
            ),
            400: openapi.Response(description="Bad Request"),
            500: openapi.Response(description="Internal Server Error"),
        },
        tags=["Profile"],
    )

    # For updating the profile of authenticated user
    def patch(self, request, *args, **kwargs):
        try:
            user = self.get_object()
            
            # Only allow updating specific fields
            allowed_fields = ['name', 'phone_number', 'profile_image']
            update_data = {k: v for k, v in request.data.items() if k in allowed_fields}

            # Explicitly handle uploaded file from request.FILES
            if 'profile_image' in request.FILES:
                update_data['profile_image'] = request.FILES['profile_image']
            
            if not update_data:
                return api_response(
                    is_success=False,
                    error_message="No valid fields to update. Allowed fields: name, phone_number, profile_image",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )
            
            # Validate phone_number if provided
            if 'phone_number' in update_data:
                phone = update_data['phone_number']
                if phone and not phone.isdigit():
                    return api_response(
                        is_success=False,
                        error_message="Phone number must contain only digits.",
                        status_code=status.HTTP_400_BAD_REQUEST,
                    )
            
            # Validate name if provided
            if 'name' in update_data:
                name = update_data['name']
                if not name or not name.strip():
                    return api_response(
                        is_success=False,
                        error_message="Name cannot be empty.",
                        status_code=status.HTTP_400_BAD_REQUEST,
                    )
            
            # Update user fields
            for field, value in update_data.items():
                setattr(user, field, value)
            user.save()
            
            # Return updated profile
            serializer = self.serializer_class(user, context={'request': request})
            return api_response(
                is_success=True,
                status_code=status.HTTP_200_OK,
                result={
                    "message": "Profile updated successfully.",
                    "profile": serializer.data
                }
            )
        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @swagger_auto_schema(
        operation_description="Fully update the authenticated user's profile (name, phone_number)",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'name': openapi.Schema(type=openapi.TYPE_STRING, description='User or Organizer name'),
                'phone_number': openapi.Schema(type=openapi.TYPE_STRING, description='Contact phone number'),
            },
        ),
        responses={
            200: openapi.Response(
                description="Profile updated successfully",
                schema=UserProfileSerializer()
            ),
            400: openapi.Response(description="Bad Request"),
            500: openapi.Response(description="Internal Server Error"),
        },
        tags=["Profile"],
    )
    def put(self, request, *args, **kwargs):
        """
        PUT delegates to PATCH logic to keep validation consistent.
        """
        return self.patch(request, *args, **kwargs)
