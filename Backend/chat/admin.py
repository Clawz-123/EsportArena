from django.contrib import admin

from .models import (
	BlockedMessage,
	ChatMessage,
	ModerationWord,
	ReportedMessage,
	ToxicUserWhitelist,
)



@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
	list_display = ("id", "tournament", "sender", "message_type", "created_at")
	list_filter = ("message_type", "created_at")
	search_fields = ("message", "sender__email", "sender__name", "tournament__name")


@admin.register(BlockedMessage)
class BlockedMessageAdmin(admin.ModelAdmin):
	list_display = ("id", "user", "source", "blocked_by", "confidence", "created_at")
	list_filter = ("source", "blocked_by", "created_at")
	search_fields = ("content", "cleaned_content", "user__email")


@admin.register(ToxicUserWhitelist)
class ToxicUserWhitelistAdmin(admin.ModelAdmin):
	list_display = ("id", "user", "created_at")
	search_fields = ("user__email", "user__name")


@admin.register(ModerationWord)
class ModerationWordAdmin(admin.ModelAdmin):
	list_display = ("id", "word", "created_at", "added_by")
	search_fields = ("word",)


@admin.register(ReportedMessage)
class ReportedMessageAdmin(admin.ModelAdmin):
	list_display = ("id", "message", "reported_by", "status", "created_at")
	list_filter = ("status", "created_at")
	search_fields = ("reason", "message__message", "reported_by__email")
