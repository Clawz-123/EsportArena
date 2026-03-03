from django.conf import settings
from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator


class PaymentOrder(models.Model):
	class Provider(models.TextChoices):
		KHALTI = 'khalti', 'Khalti'
		ESEWA = 'esewa', 'eSewa'
		STRIPE = 'stripe', 'Stripe'

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
	payment_url = models.URLField(blank=True, null=True, max_length=500)
	stripe_session_id = models.CharField(max_length=120, blank=True, null=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(default=timezone.now)


class WithdrawalRequest(models.Model):
	class Status(models.TextChoices):
		PENDING = 'pending', 'Pending'
		COMPLETED = 'completed', 'Completed'
		FAILED = 'failed', 'Failed'

	user = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name='withdrawal_requests',
	)
	amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
	coins = models.PositiveIntegerField(validators=[MinValueValidator(1)])
	status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
	stripe_account_id = models.CharField(max_length=120, blank=True, null=True)
	stripe_transfer_id = models.CharField(max_length=120, blank=True, null=True)
	stripe_payout_id = models.CharField(max_length=120, blank=True, null=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(default=timezone.now)

	class Meta:
		ordering = ['-created_at']

	def __str__(self):
		return f"{self.user.email} - {self.provider} - {self.status}"
