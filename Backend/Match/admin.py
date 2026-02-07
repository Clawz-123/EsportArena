from django.contrib import admin
from .models import Match

@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ['id', 'tournament', 'group', 'match_number', 'date_time', 'map', 'mode', 'status', 'created_at']
    list_filter = ['status', 'date_time', 'tournament']
    search_fields = ['tournament__name', 'group', 'map', 'mode']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['date_time']
