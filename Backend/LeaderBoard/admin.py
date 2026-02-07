from django.contrib import admin

from .models import GroupLeaderboardEntry


@admin.register(GroupLeaderboardEntry)
class GroupLeaderboardEntryAdmin(admin.ModelAdmin):
	list_display = (
		"id",
		"tournament",
		"bracket",
		"group_name",
		"team",
		"rank",
		"wwcd",
		"placement_points",
		"kill_points",
		"total_points",
		"updated_at",
	)
	list_filter = ("tournament", "group_name")
	search_fields = ("team__team_name", "group_name")
	ordering = ("group_name", "rank", "-total_points")
