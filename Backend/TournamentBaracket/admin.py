from django.contrib import admin
from .models import TournamentBracket

@admin.register(TournamentBracket)
class TournamentBracketAdmin(admin.ModelAdmin):
    list_display = ('id', 'tournament', 'created_at', 'updated_at')
    search_fields = ('tournament__name',)
    readonly_fields = ('created_at', 'updated_at')
