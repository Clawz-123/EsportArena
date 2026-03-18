from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from esport.response import api_response

from .models import Notification
from .serializers import NotificationCreateSerializer, NotificationSerializer
from .services import send_notification_to_user


class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(recipient=request.user)
        serializer = NotificationSerializer(notifications, many=True)
        unread_count = notifications.filter(is_read=False).count()

        return api_response(
            is_success=True,
            status_code=status.HTTP_200_OK,
            result={
                "notifications": serializer.data,
                "unread_count": unread_count,
            },
        )


class MarkNotificationReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, notification_id):
        try:
            notification = Notification.objects.get(
                id=notification_id,
                recipient=request.user,
            )
        except Notification.DoesNotExist:
            return api_response(
                is_success=False,
                error_message="Notification not found.",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        notification.is_read = True
        notification.save(update_fields=["is_read"])

        return api_response(
            is_success=True,
            status_code=status.HTTP_200_OK,
            result=NotificationSerializer(notification).data,
        )


class MarkAllNotificationsReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)

        return api_response(
            is_success=True,
            status_code=status.HTTP_200_OK,
            result={"message": "All notifications marked as read."},
        )


class DeleteNotificationView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, notification_id):
        try:
            notification = Notification.objects.get(
                id=notification_id,
                recipient=request.user,
            )
        except Notification.DoesNotExist:
            return api_response(
                is_success=False,
                error_message="Notification not found.",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        notification.delete()

        return api_response(
            is_success=True,
            status_code=status.HTTP_200_OK,
            result={"message": "Notification deleted successfully."},
        )


class SendTestNotificationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = NotificationCreateSerializer(data=request.data)

        if not serializer.is_valid():
            return api_response(
                is_success=False,
                error_message=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        payload = serializer.validated_data
        notification = send_notification_to_user(
            recipient=request.user,
            title=payload["title"],
            message=payload["message"],
            notification_type=payload.get("notification_type", Notification.NotificationTypes.GENERAL),
            metadata=payload.get("metadata", {}),
        )

        return api_response(
            is_success=True,
            status_code=status.HTTP_201_CREATED,
            result=NotificationSerializer(notification).data,
        )
