from django.utils import timezone
from rest_framework import serializers

from Match.models import Match
from tournament.models import TournamentParticipant

from .models import Result


class ResultDetailSerializer(serializers.ModelSerializer):
	match_number = serializers.IntegerField(source='match.match_number', read_only=True)
	match_group = serializers.CharField(source='match.group', read_only=True)
	submitted_by_email = serializers.EmailField(source='submitted_by.email', read_only=True)
	submitted_by_name = serializers.CharField(source='submitted_by.name', read_only=True)
	team_name = serializers.CharField(source='team.team_name', read_only=True)
	verified_by_email = serializers.EmailField(source='verified_by.email', read_only=True)

	class Meta:
		model = Result
		fields = [
			'id',
			'tournament',
			'match',
			'match_number',
			'match_group',
			'submitted_by',
			'submitted_by_email',
			'submitted_by_name',
			'team',
			'team_name',
			'group_name',
			'total_kills',
			'proof_image',
			'status',
			'organizer_note',
			'submitted_at',
			'verified_at',
			'verified_by',
			'verified_by_email',
		]
		read_only_fields = [
			'id',
			'match_number',
			'match_group',
			'submitted_by',
			'submitted_by_email',
			'submitted_by_name',
			'team',
			'team_name',
			'status',
			'organizer_note',
			'submitted_at',
			'verified_at',
			'verified_by',
			'verified_by_email',
		]


class ResultCreateSerializer(serializers.ModelSerializer):
	class Meta:
		model = Result
		fields = [
			'tournament',
			'match',
			'group_name',
			'total_kills',
			'proof_image',
		]

	def validate(self, attrs):
		request = self.context.get('request')
		user = request.user if request else None
		tournament = attrs.get('tournament')
		match = attrs.get('match')
		group_name = attrs.get('group_name')

		if not user:
			raise serializers.ValidationError('User context is required.')

		if getattr(user, 'is_organizer', False) or getattr(user, 'is_superuser', False):
			raise serializers.ValidationError('Organizers and superusers cannot submit results.')

		if match and tournament and match.tournament_id != tournament.id:
			raise serializers.ValidationError('Match does not belong to this tournament.')

		if match and group_name and match.group != group_name:
			raise serializers.ValidationError({'group_name': 'Group name does not match the selected match.'})

		participant = None
		if tournament:
			participant = TournamentParticipant.objects.filter(
				tournament=tournament,
				player=user,
			).select_related('team').first()

		if tournament and not participant:
			raise serializers.ValidationError('You are not registered in this tournament.')

		return attrs

	def create(self, validated_data):
		request = self.context.get('request')
		user = request.user if request else None
		tournament = validated_data.get('tournament')

		participant = TournamentParticipant.objects.filter(
			tournament=tournament,
			player=user,
		).select_related('team').first()

		team = participant.team if participant else None

		return Result.objects.create(
			submitted_by=user,
			team=team,
			**validated_data,
		)


class ResultUpdateSerializer(serializers.ModelSerializer):
	class Meta:
		model = Result
		fields = [
			'status',
			'organizer_note',
		]

	def update(self, instance, validated_data):
		status = validated_data.get('status')
		if status and status != instance.status:
			instance.verified_at = timezone.now()
			request = self.context.get('request')
			if request and request.user:
				instance.verified_by = request.user
		return super().update(instance, validated_data)
