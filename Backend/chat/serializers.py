from rest_framework import serializers

from .models import ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    sender_id = serializers.IntegerField(source="sender.id", read_only=True)
    sender_name = serializers.SerializerMethodField()
    sender_profile_image = serializers.SerializerMethodField()

    class Meta:
        model = ChatMessage
        fields = [
            "id",
            "tournament",
            "sender_id",
            "sender_name",
            "sender_profile_image",
            "message_type",
            "message",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "tournament",
            "sender_id",
            "sender_name",
            "sender_profile_image",
            "message_type",
            "created_at",
        ]

    def get_sender_name(self, obj):
        return obj.sender.name or obj.sender.email

    def get_sender_profile_image(self, obj):
        if not obj.sender.profile_image:
            return None

        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.sender.profile_image.url)
        return obj.sender.profile_image.url
