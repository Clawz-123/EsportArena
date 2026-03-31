from rest_framework import serializers

from .models import GroupLeaderboardEntry


class GroupLeaderboardEntrySerializer(serializers.ModelSerializer):
	# Serializer for the GroupLeaderboardEntry model
	team_name = serializers.CharField(source="team.team_name", read_only=True)
	team_logo = serializers.SerializerMethodField()

	def get_team_logo(self, obj):
		if obj.team and obj.team.team_logo:
			request = self.context.get('request')
			if request:
				return request.build_absolute_uri(obj.team.team_logo.url)
			return obj.team.team_logo.url
		return None

	class Meta:
		model = GroupLeaderboardEntry
		fields = [
			"id",
			"tournament",
			"bracket",
			"group_name",
			"team",
			"team_name",
			"team_logo",
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

	# Adding validation for checking the baracked are of same tu=ournament
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
