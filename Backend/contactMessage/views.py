from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAdminUser

from esport.response import api_response
from .models import ContactMessage
from .serializers import (
    ContactMessageCreateSerializer,
    ContactMessageListSerializer,
    ContactMessageDetailSerializer,
)

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi


# View for Creating Contact Message (Public)
class CreateContactMessageView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_description="Submit a contact message",
        request_body=ContactMessageCreateSerializer,
        responses={
            201: openapi.Response(description="Message sent successfully"),
            400: openapi.Response(description="Bad Request"),
            500: openapi.Response(description="Internal Server Error"),
        },
        tags=["Contact"],
    )
    # Using post method to create a new contact message and save it to the database
    def post(self, request):
        try:
            serializer = ContactMessageCreateSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return api_response(
                    is_success=True,
                    status_code=status.HTTP_201_CREATED,
                    result={"message": "Your message has been sent successfully. We'll get back to you soon."}
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


# Created a view to list all the contact message in the database
class ListContactMessagesView(APIView):
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_description="Get all contact messages (Admin only)",
        responses={
            200: openapi.Response(description="Messages retrieved successfully"),
            403: openapi.Response(description="Forbidden"),
            500: openapi.Response(description="Internal Server Error"),
        },
        tags=["Contact"],
    )
    def get(self, request):
        try:
            messages = ContactMessage.objects.all()
            serializer = ContactMessageListSerializer(messages, many=True)
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


# Created a view to delete a contact message from the database
class DeleteContactMessageView(APIView):
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_description="Delete contact message (Admin only)",
        responses={
            200: openapi.Response(description="Message deleted successfully"),
            404: openapi.Response(description="Message not found"),
            500: openapi.Response(description="Internal Server Error"),
        },
        tags=["Contact"],
    )
    def delete(self, request, pk):
        try:
            message = ContactMessage.objects.get(pk=pk)
            message.delete()
            return api_response(
                is_success=True,
                status_code=status.HTTP_200_OK,
                result={"message": "Message deleted successfully"}
            )
        except ContactMessage.DoesNotExist:
            return api_response(
                is_success=False,
                error_message="Message not found",
                status_code=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return api_response(
                is_success=False,
                error_message=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

