from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

from .managers import CustomUserManager


class User(AbstractUser):
    class UserRoles(models.TextChoices):
        ORGANIZER = "Organizer", _("Organizer")
        PLAYER = "Player", _("Player")
        SUPERADMIN = "SuperAdmin", _("SuperAdmin")

    username = None
    first_name = None
    last_name = None
    email = models.EmailField(_('email address'), unique=True)
    
    name = models.CharField(max_length=255, blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    # is_verified = models.BooleanField(default=False)

    is_organizer = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    role = models.CharField(
        choices=UserRoles.choices,
        max_length=20,
        default=UserRoles.PLAYER
    )

    objects = CustomUserManager()
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def save(self, *args, **kwargs):
        if self.is_superuser:
            self.role = self.UserRoles.SUPERADMIN
        elif self.is_organizer:
            self.role = self.UserRoles.ORGANIZER
        else:
            self.role = self.UserRoles.PLAYER
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.email} ({self.role})"

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ['-date_joined']
