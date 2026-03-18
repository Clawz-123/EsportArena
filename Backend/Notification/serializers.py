from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = (
            "id",
            "title",
            "message",
            "notification_type",
            "metadata",
            "is_read",
            "created_at",
        )


class NotificationCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    message = serializers.CharField()
    notification_type = serializers.ChoiceField(
        choices=Notification.NotificationTypes.choices,
        default=Notification.NotificationTypes.GENERAL,
    )
    metadata = serializers.JSONField(required=False)
