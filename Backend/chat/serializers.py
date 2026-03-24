from rest_framework import serializers

from .models import ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    sender_id = serializers.IntegerField(source="sender.id", read_only=True)
    sender_name = serializers.SerializerMethodField()
    sender_profile_image = serializers.SerializerMethodField()
    sender_role = serializers.SerializerMethodField()

    class Meta:
        model = ChatMessage
        fields = [
            "id",
            "tournament",
            "sender_id",
            "sender_name",
            "sender_profile_image",
            "sender_role",
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
            "sender_role",
            "message_type",
            "created_at",
        ]

    def get_sender_name(self, obj):
        # Return name with fallback to email if name is empty
        name = obj.sender.name or obj.sender.email or "Unknown User"
        return name.strip() if name else "Unknown User"

    def get_sender_profile_image(self, obj):
        if not obj.sender.profile_image:
            return None

        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.sender.profile_image.url)
            
        # Fallback for WebSocket broadcasts without request context
        from django.conf import settings
        domain = getattr(settings, 'SITE_URL', 'http://localhost:8000')
        return f"{domain}{obj.sender.profile_image.url}"

    def get_sender_role(self, obj):
        # Determine if user is organizer (has tournament with id = tournament_id)
        # or player (has joined a team in this tournament)
        from tournament.models import Tournament
        
        tournament = obj.tournament
        if tournament.organizer_id == obj.sender.id:
            return "organizer"
        return "player"
