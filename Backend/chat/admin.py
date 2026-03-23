from django.contrib import admin

from .models import ChatMessage


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
	list_display = ("id", "tournament", "sender", "message_type", "created_at")
	list_filter = ("message_type", "created_at")
	search_fields = ("message", "sender__email", "sender__name", "tournament__name")
