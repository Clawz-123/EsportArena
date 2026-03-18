from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .models import Notification
from .serializers import NotificationSerializer


def get_user_notification_group(user_id):
    return f"notifications_user_{user_id}"


def send_notification_to_user(
    recipient,
    title,
    message,
    notification_type=Notification.NotificationTypes.GENERAL,
    metadata=None,
):
    notification = Notification.objects.create(
        recipient=recipient,
        title=title,
        message=message,
        notification_type=notification_type,
        metadata=metadata or {},
    )

    payload = NotificationSerializer(notification).data
    channel_layer = get_channel_layer()

    if channel_layer is not None:
        async_to_sync(channel_layer.group_send)(
            get_user_notification_group(recipient.id),
            {
                "type": "notification.message",
                "payload": {
                    "event": "new_notification",
                    "data": payload,
                },
            },
        )

    return notification
