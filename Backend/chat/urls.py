from django.urls import path
from .views import TournamentAnnouncementView, TournamentChatMessageView


urlpatterns = [
    path("tournaments/<int:tournament_id>/messages/", TournamentChatMessageView.as_view(), name="chat-messages"),
    path("tournaments/<int:tournament_id>/announcements/", TournamentAnnouncementView.as_view(), name="chat-announcements"),
]
