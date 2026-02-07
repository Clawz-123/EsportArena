from django.db import models
from TournamentBaracket.models import TournamentBracket
from tournament.models import Tournament, TournamentTeam


class GroupLeaderboardEntry(models.Model):
	tournament = models.ForeignKey(
		Tournament,
		on_delete=models.CASCADE,
		related_name="group_leaderboard_entries",
	)
	group_name = models.CharField(max_length=100)
	team = models.ForeignKey(
		TournamentTeam,
		on_delete=models.CASCADE,
		related_name="group_leaderboard_entries",
	)
	bracket = models.ForeignKey(
		TournamentBracket,
		on_delete=models.CASCADE,
		related_name="group_leaderboard_entries",
	)
	rank = models.PositiveIntegerField()

	wwcd = models.PositiveIntegerField(default=0)
	placement_points = models.PositiveIntegerField(default=0)
	kill_points = models.PositiveIntegerField(default=0)
	total_points = models.PositiveIntegerField(default=0)

	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		verbose_name = "Group Leaderboard Entry"
		verbose_name_plural = "Group Leaderboard Entries"
		ordering = ["group_name", "rank", "-total_points", "team__team_name"]
		unique_together = [["tournament", "bracket", "group_name", "team"]]

	def __str__(self):
		return f"{self.tournament.name} | {self.group_name} | {self.team.team_name}"

	def save(self, *args, **kwargs):
		if self.bracket_id and self.tournament_id and self.bracket.tournament_id != self.tournament_id:
			raise ValueError("Bracket tournament must match leaderboard tournament.")
		# Total points = placement points + kill points
		self.total_points = (self.placement_points or 0) + (self.kill_points or 0)
		super().save(*args, **kwargs)
