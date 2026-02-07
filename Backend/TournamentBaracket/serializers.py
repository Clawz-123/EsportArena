from rest_framework import serializers
from .models import TournamentBracket

class TournamentBracketSerializer(serializers.ModelSerializer):
    class Meta:
        model = TournamentBracket
        fields = ['id', 'tournament', 'bracket_data', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']