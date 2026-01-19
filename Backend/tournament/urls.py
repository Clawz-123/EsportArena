from django.urls import path
from . import views

# All the urls created for tournament
urlpatterns = [
    path('create/', views.CreateTournamentView.as_view(), name='create-tournament'),
    path('list/', views.GetOrganizerTournamentsView.as_view(), name='list-tournaments'),
    path('detail/<int:tournament_id>/', views.GetTournamentDetailView.as_view(), name='tournament-detail'),
    path('update/<int:tournament_id>/', views.UpdateTournamentView.as_view(), name='update-tournament'),
    path('delete/<int:tournament_id>/', views.DeleteTournamentView.as_view(), name='delete-tournament'),
]
