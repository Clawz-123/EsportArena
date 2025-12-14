from django.conf import settings 
from django.db import models 
from django.utils.translation import gettext_lazy as _
from django.core.validators import RegexValidator


# Basic phone validator (allows digits, 7-15 length)
phone_validator = RegexValidator(r'^\d{7,15}$', message=_('Enter a valid phone number (7-15 digits)'))


class Player(models.Model):
	"""Profile for players."""
	user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='player_profile')
	display_name = models.CharField(max_length=50, blank=True)
	phone = models.CharField(max_length=15, blank=True, validators=[phone_validator])
	is_verified = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		verbose_name = _('player')
		verbose_name_plural = _('players')
		ordering = ['-created_at']

	def __str__(self):
		return self.display_name or getattr(self.user, 'get_full_name', lambda: '')() or self.user.email


class Organizer(models.Model):
	"""Profile for organizers/organizations."""
	user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='organizer_profile')
	organization_name = models.CharField(max_length=150)
	phone = models.CharField(max_length=15, blank=True, validators=[phone_validator])
	website = models.URLField(blank=True)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		verbose_name = _('organizer')
		verbose_name_plural = _('organizers')
		ordering = ['-created_at']

	def __str__(self):
		return self.organization_name or getattr(self.user, 'get_full_name', lambda: '')() or self.user.email

