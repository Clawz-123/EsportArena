from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.authentication import JWTAuthentication


@database_sync_to_async
def get_user_from_token(raw_token):
    if not raw_token:
        return AnonymousUser()

    try:
        jwt_auth = JWTAuthentication()
        validated_token = jwt_auth.get_validated_token(raw_token)
        return jwt_auth.get_user(validated_token)
    except Exception:
        return AnonymousUser()


class JWTQueryAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        query_params = parse_qs(scope.get("query_string", b"").decode())
        token = query_params.get("token", [None])[0]

        if token and token.startswith("Bearer "):
            token = token.split(" ", 1)[1]

        scope["user"] = await get_user_from_token(token)
        return await super().__call__(scope, receive, send)


def JWTAuthMiddlewareStack(inner):
    # JWT middleware must run last so it can set/override scope['user'].
    return JWTQueryAuthMiddleware(inner)
