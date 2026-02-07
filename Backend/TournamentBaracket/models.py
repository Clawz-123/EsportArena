from django.db import models
from tournament.models import Tournament
from django.contrib.auth import get_user_model

User = get_user_model()

class TournamentBracket(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='brackets')
    bracket_data = models.JSONField(default=dict) 
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Bracket for {self.tournament.name}"

