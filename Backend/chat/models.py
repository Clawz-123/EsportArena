from django.conf import settings
from django.db import models


class ChatMessage(models.Model):
	class MessageTypes(models.TextChoices):
		GENERAL = "general", "General"
		ANNOUNCEMENT = "announcement", "Announcement"

	tournament = models.ForeignKey(
		"tournament.Tournament",
		on_delete=models.CASCADE,
		related_name="chat_messages",
	)
	sender = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name="chat_messages",
	)
	message_type = models.CharField(
		max_length=20,
		choices=MessageTypes.choices,
		default=MessageTypes.GENERAL,
	)
	message = models.TextField()
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ["created_at"]

	def __str__(self):
		return f"{self.tournament_id} - {self.sender_id} - {self.message_type}"


class BlockedMessage(models.Model):
	class Sources(models.TextChoices):
		CHAT = "chat", "Chat"
		FORUM = "forum", "Forum"
		ANNOUNCEMENT = "announcement", "Announcement"

	class BlockReasons(models.TextChoices):
		MODEL = "model", "Model"
		MANUAL = "manual", "Manual"

	user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
	content = models.TextField()
	cleaned_content = models.TextField(blank=True)
	confidence = models.FloatField(default=0.0)
	source = models.CharField(max_length=32, choices=Sources.choices, default=Sources.CHAT)
	blocked_by = models.CharField(max_length=16, choices=BlockReasons.choices, default=BlockReasons.MODEL)
	metadata = models.JSONField(default=dict, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ["-created_at"]

	def __str__(self):
		return f"{self.user_id or 'anon'} - {self.source} - {self.confidence:.2f}"


class ToxicUserWhitelist(models.Model):
	user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="toxic_whitelist")
	reason = models.CharField(max_length=255, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"{self.user_id} - whitelisted"


class ModerationWord(models.Model):
	word = models.CharField(max_length=128, unique=True)
	created_at = models.DateTimeField(auto_now_add=True)
	added_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="added_moderation_words")

	class Meta:
		ordering = ["word"]

	def __str__(self):
		return self.word
