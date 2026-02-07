from django.urls import path
from .views import TournamentBracketView

urlpatterns = [
    path('bracket/<int:tournament_id>/', TournamentBracketView.as_view(), name='tournament-bracket'),
]
