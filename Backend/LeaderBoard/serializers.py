from rest_framework import serializers

from .models import GroupLeaderboardEntry


class GroupLeaderboardEntrySerializer(serializers.ModelSerializer):
	team_name = serializers.CharField(source="team.team_name", read_only=True)

	class Meta:
		model = GroupLeaderboardEntry
		fields = [
			"id",
			"tournament",
			"bracket",
			"group_name",
			"team",
			"team_name",
			"rank",
			"wwcd",
			"placement_points",
			"kill_points",
			"total_points",
			"created_at",
			"updated_at",
		]
		read_only_fields = [
			"id",
			"team_name",
			"total_points",
			"created_at",
			"updated_at",
		]

	def validate(self, attrs):
		instance = getattr(self, "instance", None)
		tournament = attrs.get("tournament") or (instance.tournament if instance else None)
		bracket = attrs.get("bracket") or (instance.bracket if instance else None)
		team = attrs.get("team") or (instance.team if instance else None)

		if tournament and bracket and bracket.tournament_id != tournament.id:
			raise serializers.ValidationError("Bracket does not belong to this tournament.")
		if tournament and team and team.tournament_id != tournament.id:
			raise serializers.ValidationError("Team does not belong to this tournament.")

		return attrs
