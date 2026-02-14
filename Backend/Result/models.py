from django.conf import settings
from django.db import models


class Result(models.Model):
    class Status(models.TextChoices):
        PENDING = "Pending", "Pending"
        APPROVED = "Approved", "Approved"
        REJECTED = "Rejected", "Rejected"

    tournament = models.ForeignKey('tournament.Tournament',on_delete=models.CASCADE,related_name='results')
    match = models.ForeignKey('Match.Match',on_delete=models.CASCADE,related_name='results')
    submitted_by = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name='match_results')
    team = models.ForeignKey('tournament.TournamentTeam', on_delete=models.SET_NULL, null=True, blank=True, related_name='results')
    group_name = models.CharField(max_length=100)
    total_kills = models.PositiveIntegerField(default=0)
    proof_image = models.ImageField(upload_to='match_results/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    organizer_note = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,null=True,blank=True,related_name='verified_results'
    )

    class Meta:
        ordering = ['-submitted_at']
        constraints = [
            models.UniqueConstraint(
                fields=['match', 'submitted_by'],
                name='unique_result_per_player_match'
            ),
        ]

    def __str__(self):
        return f"Result: {self.match_id} - {self.submitted_by_id}"