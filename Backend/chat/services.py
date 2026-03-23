from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .serializers import ChatMessageSerializer


def get_tournament_chat_group(tournament_id):
    return f"tournament_chat_{tournament_id}"


def broadcast_chat_message(message_obj):
    channel_layer = get_channel_layer()
    if channel_layer is None:
        return

    payload = ChatMessageSerializer(message_obj).data
    async_to_sync(channel_layer.group_send)(
        get_tournament_chat_group(message_obj.tournament_id),
        {
            "type": "chat.message",
            "payload": {
                "event": "chat_message",
                "data": payload,
            },
        },
    )
