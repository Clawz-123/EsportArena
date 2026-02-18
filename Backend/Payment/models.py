from django.conf import settings
from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator


class PaymentOrder(models.Model):
	class Provider(models.TextChoices):
		KHALTI = 'khalti', 'Khalti'

	class Status(models.TextChoices):
		INITIATED = 'initiated', 'Initiated'
		PAID = 'paid', 'Paid'
		FAILED = 'failed', 'Failed'

	user = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name='payment_orders',
	)
	provider = models.CharField(max_length=20, choices=Provider.choices, default=Provider.KHALTI)
	amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
	coins = models.PositiveIntegerField(validators=[MinValueValidator(1)])
	status = models.CharField(max_length=20, choices=Status.choices, default=Status.INITIATED)
	pidx = models.CharField(max_length=100, blank=True, null=True, unique=True)
	payment_url = models.URLField(blank=True, null=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(default=timezone.now)

	class Meta:
		ordering = ['-created_at']

	def __str__(self):
		return f"{self.user.email} - {self.provider} - {self.status}"
