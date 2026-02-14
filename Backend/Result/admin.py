from django.contrib import admin

from .models import Result


@admin.register(Result)
class ResultAdmin(admin.ModelAdmin):
	list_display = (
		'id',
		'tournament',
		'match',
		'group_name',
		'status',
		'submitted_by',
		'submitted_at',
	)
	list_filter = ('status', 'tournament', 'group_name')
	search_fields = ('submitted_by__email', 'submitted_by__name', 'group_name')
