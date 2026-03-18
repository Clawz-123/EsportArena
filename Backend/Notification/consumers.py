from channels.generic.websocket import AsyncJsonWebsocketConsumer

from .services import get_user_notification_group


class NotificationConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        user = self.scope.get("user")

        if not user or not user.is_authenticated:
            await self.close(code=4001)
            return

        self.group_name = get_user_notification_group(user.id)

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        await self.send_json(
            {
                "event": "connected",
                "message": "Notifications websocket connected.",
            }
        )

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content, **kwargs):
        action = content.get("action")

        if action == "ping":
            await self.send_json({"event": "pong"})

    async def notification_message(self, event):
        await self.send_json(event["payload"])
