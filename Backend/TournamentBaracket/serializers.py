from rest_framework import serializers
from .models import TournamentBracket, TournamentLeaderboard

class TournamentBracketSerializer(serializers.ModelSerializer):
    class Meta:
        model = TournamentBracket
        fields = ['id', 'tournament', 'bracket_data', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class TournamentLeaderboardSerializer(serializers.ModelSerializer):
    class Meta:
        model = TournamentLeaderboard
        fields = ['id', 'tournament', 'leaderboard_data', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
