from django.urls import path

from .consumers import TournamentChatConsumer


websocket_urlpatterns = [
    path("ws/chat/tournaments/<int:tournament_id>/", TournamentChatConsumer.as_asgi()),
]
