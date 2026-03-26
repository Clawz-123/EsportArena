from django.urls import path
from . import views

# All the urls created for tournament
urlpatterns = [
    path('create/', views.CreateTournamentView.as_view(), name='create-tournament'),
    path('list/', views.GetOrganizerTournamentsView.as_view(), name='list-tournaments'),
    path('public/', views.GetAllPublicTournamentsView.as_view(), name='public-tournaments'),
    path('my-joined/', views.GetMyJoinedTournamentsView.as_view(), name='my-joined-tournaments'),
    path('detail/<int:tournament_id>/', views.GetTournamentDetailView.as_view(), name='tournament-detail'),
    path('update/<int:tournament_id>/', views.UpdateTournamentView.as_view(), name='update-tournament'),
    path('delete/<int:tournament_id>/', views.DeleteTournamentView.as_view(), name='delete-tournament'),
    path('join/', views.JoinTournamentView.as_view(), name='join-tournament'),
    path('participants/<int:tournament_id>/', views.GetTournamentParticipantsView.as_view(), name='tournament-participants'),
    path('teams/<int:tournament_id>/', views.GetTournamentTeamsView.as_view(), name='tournament-teams'),
    path('player-history/', views.PlayerTournamentHistoryView.as_view(), name='player-history'),
    path('organizer-history/', views.OrganizerTournamentHistoryView.as_view(), name='organizer-history'),
]
