from django.urls import path
from . import views

# Urls for Match app
urlpatterns = [
    path('create/', views.CreateMatchView.as_view(), name='create-match'),
    path('tournament/<int:tournament_id>/', views.ListMatchesByTournamentView.as_view(), name='list-matches-by-tournament'),
    path('detail/<int:match_id>/', views.GetMatchDetailView.as_view(), name='match-detail'),
    path('update/<int:match_id>/', views.UpdateMatchView.as_view(), name='update-match'),
    path('delete/<int:match_id>/', views.DeleteMatchView.as_view(), name='delete-match'),
]
