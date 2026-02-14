from rest_framework import serializers
from django.utils import timezone
from .models import Match
from tournament.models import Tournament


# Serializer for creating a match
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

    # Adding validation to check if the user is the organizer of the tournament before creating a match
    def validate(self, attrs):
        user = self.context.get("request").user if self.context.get("request") else None
        tournament = attrs.get('tournament')
        group = attrs.get('group')
        match_number = attrs.get('match_number')

      
        if user and tournament.organizer != user:
             raise serializers.ValidationError("Only the organizer of this tournament can create matches.")

        if tournament and group and match_number is not None:
            exists = Match.objects.filter(
                tournament=tournament,
                group=group,
                match_number=match_number,
            ).exists()
            if exists:
                raise serializers.ValidationError({
                    "match_number": "Match number already exists for this group."
                })
        
        return attrs

# Serializer for listing matches with tournament name
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
            'room_id',
            'room_pass',
            'announcement',
            'announcement_sent_at',
            'created_at',
            'updated_at',
        ]

# Serializer for updating a match
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
            'room_id',
            'room_pass',
            'announcement',
        ]

    def validate(self, attrs):
        instance = getattr(self, 'instance', None)
        if not instance:
            return attrs

        group = attrs.get('group', instance.group)
        match_number = attrs.get('match_number', instance.match_number)

        exists = Match.objects.filter(
            tournament=instance.tournament,
            group=group,
            match_number=match_number,
        ).exclude(id=instance.id).exists()

        if exists:
            raise serializers.ValidationError({
                "match_number": "Match number already exists for this group."
            })

        return attrs

    def update(self, instance, validated_data):
        announcing = any(
            key in validated_data for key in ('room_id', 'room_pass', 'announcement')
        )
        if announcing:
            instance.announcement_sent_at = timezone.now()

        return super().update(instance, validated_data)
