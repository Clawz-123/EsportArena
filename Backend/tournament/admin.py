from django.contrib import admin
from .models import Tournament


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
        "visibility",
        "is_draft",
        "created_at",
    ]
    list_filter = [
        "game_title",
        "match_format",
        "visibility",
        "is_draft",
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
        ("Visibility & Control", {
            "fields": ("visibility", "auto_start_tournament", "is_draft")
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )
    ordering = ["-created_at"]


admin.site.register(Tournament, TournamentAdmin)
