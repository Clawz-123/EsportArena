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
