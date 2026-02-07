from rest_framework import serializers
from .models import Match
from tournament.models import Tournament

class MatchCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = [
            'tournament',
            'group',
            'match_number',
            'date_time',
            'map',
            'mode',
            'status',
        ]

    def validate(self, attrs):
        user = self.context.get("request").user if self.context.get("request") else None
        tournament = attrs.get('tournament')

        # Check if the user is the organizer of the tournament
        if user and tournament.organizer != user:
             raise serializers.ValidationError("Only the organizer of this tournament can create matches.")
        
        return attrs

class MatchDetailSerializer(serializers.ModelSerializer):
    tournament_name = serializers.CharField(source='tournament.name', read_only=True)
    
    class Meta:
        model = Match
        fields = [
            'id',
            'tournament',
            'tournament_name',
            'group',
            'match_number',
            'date_time',
            'map',
            'mode',
            'status',
            'created_at',
            'updated_at',
        ]

class MatchUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = [
            'group',
            'match_number',
            'date_time',
            'map',
            'mode',
            'status',
        ]
