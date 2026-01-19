from django.db import models
from django.utils.translation import gettext_lazy as _


class ContactMessage(models.Model):
    name = models.CharField(_('name'), max_length=255)
    email = models.EmailField(_('email address'))
    subject = models.CharField(_('subject'), max_length=255)
    message = models.TextField(_('message'))
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(_('is read'), default=False)
    is_resolved = models.BooleanField(_('is resolved'), default=False)

    def __str__(self):
        return f"{self.name} - {self.subject}"

    class Meta:
        verbose_name = _('Contact Message')
        verbose_name_plural = _('Contact Messages')
        ordering = ['-created_at']
