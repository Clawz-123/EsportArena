from django.conf import settings
from django.db import models


class Notification(models.Model):
    class NotificationTypes(models.TextChoices):
        GENERAL = "general", "General"
        TOURNAMENT = "tournament", "Tournament"
        PAYMENT = "payment", "Payment"
        RESULT = "result", "Result"
        SYSTEM = "system", "System"

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(
        max_length=20,
        choices=NotificationTypes.choices,
        default=NotificationTypes.GENERAL,
    )
    metadata = models.JSONField(default=dict, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.recipient_id} - {self.title}"
