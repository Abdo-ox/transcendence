from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import UntypedToken
from jwt import InvalidTokenError
from django.db import close_old_connections
from urllib.parse import parse_qs
from rest_framework_simplejwt.authentication import JWTAuthentication
from asgiref.sync import sync_to_async

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        # Parse token from the query string
        query_string = parse_qs(scope['query_string'].decode())
        token = query_string.get('token', [None])[0]
        print('-------------------------------------------------')
        print(token, flush=True)

        if token:
            try:
                validated_token = UntypedToken(token)
                jwt_auth = JWTAuthentication()
                user = await sync_to_async(jwt_auth.get_user)(validated_token)

                scope['user'] = user
            except InvalidTokenError:
                scope['user'] = AnonymousUser()
        else:
            scope['user'] = AnonymousUser()

        close_old_connections()

        return await super().__call__(scope, receive, send)
