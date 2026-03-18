import json
from django.utils import timezone
from rest_framework import serializers

from accounts.models import User
from .models import Tournament, TournamentTeam, TournamentParticipant


# Serializer for creating a tournament
class TournamentCreateSerializer(serializers.ModelSerializer):
	class Meta:
		model = Tournament
		fields = [
			"name",
			"game_title",
			"match_format",
			"description",
			"registration_start",
			"registration_end",
			"match_start",
			"expected_end",
			"max_participants",
			"auto_generate_bracket",
			"entry_fee",
			"prize_first",
			"prize_second",
			"prize_third",
			"match_rules",
			"require_result_proof",
			"proof_type",
			"result_time_limit_hours",
			"visibility",
			"auto_start_tournament",
			"is_draft",
		]

	def validate(self, attrs):
		user = self.context.get("request").user if self.context.get("request") else None
		if not user or not isinstance(user, User):
			raise serializers.ValidationError("User context is required.")
		if not getattr(user, "is_organizer", False):
			raise serializers.ValidationError("Only organizers can create tournaments.")
		return attrs

	def create(self, validated_data):
		request = self.context.get("request")
		user = request.user if request else None
		tournament = Tournament(organizer=user, **validated_data)
		tournament.full_clean()
		tournament.save()
		return tournament


# Serializer for updating a tournament
class TournamentUpdateSerializer(serializers.ModelSerializer):
	class Meta:
		model = Tournament
		fields = [
			"name",
			"game_title",
			"match_format",
			"description",
			"registration_start",
			"registration_end",
			"match_start",
			"expected_end",
			"max_participants",
			"auto_generate_bracket",
			"entry_fee",
			"prize_first",
			"prize_second",
			"prize_third",
			"match_rules",
			"require_result_proof",
			"proof_type",
			"result_time_limit_hours",
			"visibility",
			"auto_start_tournament",
			"is_draft",
		]

	def validate(self, attrs):
		instance = self.instance
		if not instance:
			return attrs

		today = timezone.now().date()
		if instance.registration_start and today < instance.registration_start:
			raise serializers.ValidationError("Tournament can only be edited when registration is open.")

		if instance.registration_end and today > instance.registration_end:
			raise serializers.ValidationError("Registration ended. Tournament cannot be edited.")

		if instance.match_start and instance.match_start <= today:
			raise serializers.ValidationError("Tournament cannot be updated after it has started.")

		return attrs

	# Overriding the update method to call full_clean for model validation before saving
	def update(self, instance, validated_data):
		for field, value in validated_data.items():
			setattr(instance, field, value)
		instance.full_clean()
		instance.save()
		return instance


# Serializer for listing tournaments with organizer details and total prize pool
class TournamentDetailSerializer(serializers.ModelSerializer):
	organizer_email = serializers.EmailField(source="organizer.email", read_only=True)
	organizer_name = serializers.CharField(source="organizer.name", read_only=True)
	organizer_profile_image = serializers.SerializerMethodField()
	total_prize_pool = serializers.IntegerField(read_only=True)

	def get_organizer_profile_image(self, obj):
		if obj.organizer and obj.organizer.profile_image:
			request = self.context.get('request')
			if request:
				return request.build_absolute_uri(obj.organizer.profile_image.url)
			return obj.organizer.profile_image.url
		return None

	class Meta:
		model = Tournament
		fields = [
			"id",
			"organizer_email",
			"organizer_name",
			"organizer_profile_image",
			"name",
			"game_title",
			"match_format",
			"description",
			"registration_start",
			"registration_end",
			"match_start",
			"expected_end",
			"max_participants",
			"auto_generate_bracket",
			"entry_fee",
			"prize_first",
			"prize_second",
			"prize_third",
			"total_prize_pool",
			"match_rules",
			"require_result_proof",
			"proof_type",
			"result_time_limit_hours",
			"visibility",
			"auto_start_tournament",
			"is_draft",
			"created_at",
			"updated_at",
		]
		read_only_fields = [
			"id",
			"organizer_email",
			"organizer_name",
			"organizer_profile_image",
			"total_prize_pool",
			"created_at",
			"updated_at",
		]


# Serializer for listing tournaments in a simple format (for tournament listing page)
class TournamentParticipantSerializer(serializers.ModelSerializer):
	player_name = serializers.CharField(source="player.name", read_only=True)
	player_email = serializers.EmailField(source="player.email", read_only=True)
	player_profile_image = serializers.SerializerMethodField()
	team_name = serializers.CharField(source="team.team_name", read_only=True)

	def get_player_profile_image(self, obj):
		if obj.player and obj.player.profile_image:
			request = self.context.get('request')
			if request:
				return request.build_absolute_uri(obj.player.profile_image.url)
			return obj.player.profile_image.url
		return None

	class Meta:
		model = TournamentParticipant
		fields = [
			"id",
			"player",
			"player_name",
			"player_email",
			"player_profile_image",
			"team",
			"team_name",
			"in_game_name",
			"is_captain",
			"joined_at",
		]
		read_only_fields = [
			"id",
			"player_name",
			"player_email",
			"player_profile_image",
			"team_name",
			"joined_at",
		]


# Serializer for listing tournament teams with captain details and member count
class TournamentTeamSerializer(serializers.ModelSerializer):
	captain_name = serializers.CharField(source="captain.name", read_only=True)
	captain_email = serializers.EmailField(source="captain.email", read_only=True)
	members = TournamentParticipantSerializer(many=True, read_only=True)
	member_count = serializers.SerializerMethodField()

	def get_member_count(self, obj):
		return obj.members.count()

	class Meta:
		model = TournamentTeam
		fields = [
			"id",
			"team_name",
			"team_logo",
			"captain",
			"captain_name",
			"captain_email",
			"members",
			"member_count",
			"created_at",
			"updated_at",
		]
		read_only_fields = [
			"id",
			"captain_name",
			"captain_email",
			"members",
			"member_count",
			"created_at",
			"updated_at",
		]


# Serializer for joining a tournament (for players to join a tournament and create a team if it's a team-based tournament)
class JoinTournamentSerializer(serializers.Serializer):
	tournament_id = serializers.IntegerField()
	team_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
	team_logo = serializers.ImageField(required=False, allow_null=True)
	team_members = serializers.ListField(
		child=serializers.IntegerField(),
		required=False,
		allow_empty=True,
	)
	in_game_names = serializers.JSONField(required=True)

	def validate_in_game_names(self, value):
		"""Parse in_game_names if it comes as a JSON string from FormData"""
		if isinstance(value, str):
			try:
				return json.loads(value)
			except json.JSONDecodeError:
				raise serializers.ValidationError("Invalid JSON format for in_game_names")
		return value

	def validate(self, attrs):
		tournament_id = attrs.get("tournament_id")
		team_members = attrs.get("team_members", [])
		in_game_names = attrs.get("in_game_names", {})
		request = self.context.get("request")
		user = request.user if request else None

		# Validate tournament exists
		try:
			tournament = Tournament.objects.get(id=tournament_id)
		except Tournament.DoesNotExist:
			raise serializers.ValidationError({"tournament_id": "Tournament not found."})

		attrs["tournament"] = tournament

		# Validate registration period
		today = timezone.now().date()
		if tournament.registration_start > today:
			raise serializers.ValidationError("Registration has not started yet.")
		if tournament.registration_end < today:
			raise serializers.ValidationError("Registration has ended.")

		# Validate none of the selected players are already registered in this tournament
		if user:
			participant_ids = [user.id] + [member_id for member_id in team_members]
			existing_participants = list(
				TournamentParticipant.objects.filter(
					tournament=tournament,
					player_id__in=participant_ids,
				).values_list("player__email", flat=True)
			)
			if existing_participants:
				raise serializers.ValidationError({
					"team_members": f"Some players are already registered: {', '.join(existing_participants)}"
				})

		# Validate tournament is not full
		current_participants = TournamentParticipant.objects.filter(tournament=tournament).count()
		is_team_based = tournament.match_format in [Tournament.MatchFormats.DUO, Tournament.MatchFormats.SQUAD]

		if is_team_based:
			required_members = 1 if tournament.match_format == Tournament.MatchFormats.DUO else 3
			total_new_members = 1 + len(team_members)  # captain + members

			if current_participants + total_new_members > tournament.max_participants:
				raise serializers.ValidationError("Tournament is full.")

			# Validate team name is provided
			if not attrs.get("team_name"):
				raise serializers.ValidationError({"team_name": "Team name is required for team-based tournaments."})

			# Validate correct number of members
			if len(team_members) != required_members:
				raise serializers.ValidationError({
					"team_members": f"You need exactly {required_members} teammate{'s' if required_members > 1 else ''} for {tournament.match_format} format."
				})

			# Validate all members exist and are valid players
			if team_members:
				members = User.objects.filter(
					id__in=team_members,
					is_verified=True,
					is_organizer=False,
					is_superuser=False,
				)
				if members.count() != len(team_members):
					raise serializers.ValidationError({"team_members": "One or more team members are invalid."})

			# Validate in-game names for captain and all members
			required_ign_ids = [str(user.id)] + [str(mid) for mid in team_members]
			for member_id in required_ign_ids:
				if member_id not in in_game_names or not in_game_names[member_id].strip():
					raise serializers.ValidationError({
						"in_game_names": f"In-game name is required for all team members."
					})

		else:
			# Solo tournament
			if current_participants + 1 > tournament.max_participants:
				raise serializers.ValidationError("Tournament is full.")

			# Validate captain has in-game name
			if str(user.id) not in in_game_names or not in_game_names[str(user.id)].strip():
				raise serializers.ValidationError({"in_game_names": "In-game name is required."})

		return attrs
