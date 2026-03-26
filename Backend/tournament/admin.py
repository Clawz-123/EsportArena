from django.contrib import admin
from .models import Tournament, TournamentTeam, TournamentParticipant


class TournamentAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "name",
        "organizer",
        "game_title",
        "match_format",
        "registration_start",
        "registration_end",
        "match_start",
        "max_participants",
        "entry_fee",
        "total_prize_pool",
        "created_at",
    ]
    list_filter = [
        "game_title",
        "match_format",
        "created_at",
    ]
    search_fields = ["name", "organizer__email", "organizer__name"]
    readonly_fields = ["id", "total_prize_pool", "created_at", "updated_at"]
    fieldsets = (
        ("Basic Information", {
            "fields": ("organizer", "name", "game_title", "match_format", "description", "id")
        }),
        ("Schedule", {
            "fields": ("registration_start", "registration_end", "match_start", "expected_end")
        }),
        ("Tournament Structure", {
            "fields": ("max_participants", "auto_generate_bracket")
        }),
        ("Entry Fee & Prize", {
            "fields": ("entry_fee", "prize_first", "prize_second", "prize_third", "total_prize_pool")
        }),
        ("Rules & Results", {
            "fields": ("match_rules", "require_result_proof", "proof_type", "result_time_limit_hours")
        }),
        ("Control", {
            "fields": ("auto_start_tournament", "status", "started_at")
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )
    ordering = ["-created_at"]


admin.site.register(Tournament, TournamentAdmin)


class TournamentTeamAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "team_name",
        "tournament",
        "captain",
        "created_at",
    ]
    list_filter = ["tournament__game_title", "created_at"]
    search_fields = ["team_name", "captain__email", "captain__name", "tournament__name"]
    readonly_fields = ["id", "created_at", "updated_at"]
    ordering = ["-created_at"]


admin.site.register(TournamentTeam, TournamentTeamAdmin)


class TournamentParticipantAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "player",
        "tournament",
        "team",
        "in_game_name",
        "is_captain",
        "joined_at",
    ]
    list_filter = ["is_captain", "tournament__game_title", "joined_at"]
    search_fields = ["player__email", "player__name", "tournament__name", "in_game_name"]
    readonly_fields = ["id", "joined_at"]
    ordering = ["-joined_at"]


admin.site.register(TournamentParticipant, TournamentParticipantAdmin)
