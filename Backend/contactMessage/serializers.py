from rest_framework import serializers
from .models import ContactMessage



class ContactMessageCreateSerializer(serializers.ModelSerializer):
    # Serializer for creating a new contact message
    class Meta:
        model = ContactMessage
        fields = ['name', 'email', 'subject', 'message']

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Name cannot be empty.")
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters.")
        return value.strip()

    def validate_subject(self, value):
        if not value.strip():
            raise serializers.ValidationError("Subject cannot be empty.")
        if len(value.strip()) < 5:
            raise serializers.ValidationError("Subject must be at least 5 characters.")
        return value.strip()

    def validate_message(self, value):
        if not value.strip():
            raise serializers.ValidationError("Message cannot be empty.")
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Message must be at least 10 characters.")
        return value.strip()



class ContactMessageListSerializer(serializers.ModelSerializer):
    # Serializer for listing contact messages
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'subject', 'message', 'created_at', 'is_read', 'is_resolved']
        read_only_fields = ['id', 'created_at']


class ContactMessageDetailSerializer(serializers.ModelSerializer):
    # Serializer for detailed view of a contact message
    class Meta:
        model = ContactMessage
        fields = '__all__'
        read_only_fields = ['id', 'name', 'email', 'subject', 'message', 'created_at']
