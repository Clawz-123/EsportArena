from django.utils import timezone
from rest_framework import serializers

from accounts.models import User
from .models import Tournament


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
		if instance.match_start and instance.match_start <= today:
			raise serializers.ValidationError("Tournament cannot be updated after it has started.")

		return attrs

	def update(self, instance, validated_data):
		for field, value in validated_data.items():
			setattr(instance, field, value)
		instance.full_clean()
		instance.save()
		return instance


class TournamentDetailSerializer(serializers.ModelSerializer):
	organizer_email = serializers.EmailField(source="organizer.email", read_only=True)
	total_prize_pool = serializers.IntegerField(read_only=True)

	class Meta:
		model = Tournament
		fields = [
			"id",
			"organizer_email",
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
			"total_prize_pool",
			"created_at",
			"updated_at",
		]
