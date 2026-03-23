from channels.generic.websocket import AsyncJsonWebsocketConsumer

from tournament.models import Tournament

from .services import get_tournament_chat_group


class TournamentChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        user = self.scope.get("user")
        tournament_id = self.scope.get("url_route", {}).get("kwargs", {}).get("tournament_id")

        if not user or not user.is_authenticated:
            await self.close(code=4001)
            return

        exists = await Tournament.objects.filter(id=tournament_id).aexists()
        if not exists:
            await self.close(code=4004)
            return

        self.group_name = get_tournament_chat_group(tournament_id)
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        await self.send_json(
            {
                "event": "connected",
                "message": "Tournament chat websocket connected.",
            }
        )

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content, **kwargs):
        action = content.get("action")
        if action == "ping":
            await self.send_json({"event": "pong"})

    async def chat_message(self, event):
        await self.send_json(event["payload"])
