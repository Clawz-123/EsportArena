from django.db import models
from django.utils.translation import gettext_lazy as _
from tournament.models import Tournament

class Match(models.Model):
    tournament = models.ForeignKey(
        Tournament, 
        on_delete=models.CASCADE, 
        related_name='matches',
        verbose_name=_('tournament')
    )
    group = models.CharField(_('group'), max_length=100)
    match_number = models.PositiveIntegerField(_('match number'))
    date_time = models.DateTimeField(_('date and time'))
    map = models.CharField(_('map'), max_length=100, blank=True, null=True)
    mode = models.CharField(_('mode'), max_length=100, blank=True, null=True)
    status = models.CharField(_('status'), max_length=20, default='Scheduled', choices=[
        ('Scheduled', 'Scheduled'),
        ('Ongoing', 'Ongoing'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ])

    room_id = models.CharField(_('room id'), max_length=100, blank=True, null=True)
    room_pass = models.CharField(_('room pass'), max_length=100, blank=True, null=True)
    announcement = models.TextField(_('announcement'), blank=True)
    announcement_sent_at = models.DateTimeField(_('announcement sent at'), blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Match {self.match_number} - {self.group}"

    class Meta:
        verbose_name = _('Match')
        verbose_name_plural = _('Matches')
        ordering = ['date_time']
        constraints = [
            models.UniqueConstraint(
                fields=['tournament', 'group', 'match_number'],
                name='unique_match_number_per_group',
            ),
        ]
