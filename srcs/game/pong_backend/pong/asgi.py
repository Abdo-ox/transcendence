import os
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application
from django.urls import path

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "pong.settings")

# Initialize Django ASGI application early to ensure the AppRegistry
# is populated before importing code that may import ORM models.
django_asgi_app = get_asgi_application()

from game.consumers import GameConsumer, MultiGameConsumer
from game.middleware import TokenAuthMiddleware  # Import the custom middleware

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(
        TokenAuthMiddleware(  # Use the custom middleware
            URLRouter([
                path("ws/game/", GameConsumer.as_asgi()),
                path("ws/multiplayer/", MultiGameConsumer.as_asgi()), 
            ])
        )
    ),
})
