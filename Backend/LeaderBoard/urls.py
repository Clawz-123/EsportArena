from django.urls import path
from . import views

urlpatterns = [
	path("create/", views.CreateLeaderboardEntryView.as_view(), name="leaderboard-create"),
	path("tournament/<int:tournament_id>/",views.ListLeaderboardEntriesView.as_view(),name="leaderboard-list",),
	path("update/<int:entry_id>/",views.UpdateLeaderboardEntryView.as_view(),name="leaderboard-update",),
	path("delete/<int:entry_id>/",views.DeleteLeaderboardEntryView.as_view(),name="leaderboard-delete",),
]
