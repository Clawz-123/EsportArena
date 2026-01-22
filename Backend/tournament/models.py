from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models


class Tournament(models.Model):
	class GameTitles(models.TextChoices):
		PUBG_MOBILE = "PUBG Mobile", "PUBG Mobile"
		FREE_FIRE = "Free Fire", "Free Fire"

	class MatchFormats(models.TextChoices):
		SOLO = "Solo", "Solo"
		DUO = "Duo", "Duo"
		SQUAD = "Squad", "Squad"

	class ProofTypes(models.TextChoices):
		SCREENSHOT_ONLY = "Screenshot Only", "Screenshot Only"

	class Visibility(models.TextChoices):
		PUBLIC = "Public", "Public"
		PRIVATE = "Private", "Private"

	organizer = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name="tournaments",
	)
	name = models.CharField(max_length=255)
	game_title = models.CharField(max_length=50, choices=GameTitles.choices)
	match_format = models.CharField(max_length=20, choices=MatchFormats.choices)
	description = models.TextField(blank=True)

	registration_start = models.DateField()
	registration_end = models.DateField()
	match_start = models.DateField()
	expected_end = models.DateField(null=True, blank=True)

	max_participants = models.PositiveIntegerField(validators=[MinValueValidator(1)])
	auto_generate_bracket = models.BooleanField(default=False)

	entry_fee = models.PositiveIntegerField(default=0)
	prize_first = models.PositiveIntegerField(default=0)
	prize_second = models.PositiveIntegerField(default=0)
	prize_third = models.PositiveIntegerField(default=0)

	match_rules = models.TextField(blank=True)
	require_result_proof = models.BooleanField(default=False)
	proof_type = models.CharField(
		max_length=30,
		choices=ProofTypes.choices,
		default=ProofTypes.SCREENSHOT_ONLY,
	)
	result_time_limit_hours = models.PositiveIntegerField(
		default=24,
		validators=[MinValueValidator(1)],
	)

	visibility = models.CharField(
		max_length=10,
		choices=Visibility.choices,
		default=Visibility.PUBLIC,
	)
	auto_start_tournament = models.BooleanField(default=False)

	is_draft = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ["-created_at"]

	def __str__(self) -> str:
		return f"{self.name} ({self.game_title})"

	@property
	def total_prize_pool(self) -> int:
		return self.prize_first + self.prize_second + self.prize_third

	def clean(self) -> None:
		if self.organizer and not getattr(self.organizer, "is_organizer", False):
			raise ValidationError("Only organizers can create tournaments.")
		if self.registration_start and self.registration_end:
			if self.registration_end < self.registration_start:
				raise ValidationError("Registration end must be on or after start date.")
		if self.registration_end and self.match_start:
			if self.registration_end >= self.match_start:
				raise ValidationError("Registration must close before matches start.")
		if self.expected_end and self.match_start:
			if self.expected_end < self.match_start:
				raise ValidationError("Expected end must be on or after match start.")


class TournamentTeam(models.Model):
	tournament = models.ForeignKey(
		Tournament,
		on_delete=models.CASCADE,
		related_name="teams",
	)
	team_name = models.CharField(max_length=100)
	team_logo = models.ImageField(upload_to="tournament_teams/", null=True, blank=True)
	captain = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name="captained_teams",
	)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ["-created_at"]
		unique_together = [["tournament", "team_name"]]

	def __str__(self) -> str:
		return f"{self.team_name} - {self.tournament.name}"

	def clean(self) -> None:
		# Validate team already exists in tournament
		if self.pk is None and TournamentTeam.objects.filter(
			tournament=self.tournament, 
			team_name__iexact=self.team_name
		).exists():
			raise ValidationError("A team with this name already exists in the tournament.")


class TournamentParticipant(models.Model):
	tournament = models.ForeignKey(
		Tournament,
		on_delete=models.CASCADE,
		related_name="participants",
	)
	player = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name="tournament_participations",
	)
	team = models.ForeignKey(
		TournamentTeam,
		on_delete=models.CASCADE,
		related_name="members",
		null=True,
		blank=True,
	)
	in_game_name = models.CharField(max_length=100)
	is_captain = models.BooleanField(default=False)
	joined_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ["-joined_at"]
		unique_together = [["tournament", "player"]]

	def __str__(self) -> str:
		return f"{self.player.email} - {self.tournament.name}"

	def clean(self) -> None:
		# Validate player is not organizer or superuser
		if self.player and (getattr(self.player, "is_organizer", False) or getattr(self.player, "is_superuser", False)):
			raise ValidationError("Organizers and superusers cannot participate in tournaments.")
		
		# Validate player is not already in tournament
		if self.pk is None and TournamentParticipant.objects.filter(
			tournament=self.tournament,
			player=self.player
		).exists():
			raise ValidationError("Player is already registered in this tournament.")
