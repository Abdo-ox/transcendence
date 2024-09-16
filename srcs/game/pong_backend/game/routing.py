# your_app/routing.py

from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/game/$', consumers.GameConsumer.as_asgi()),
    re_path(r'ws/multiplayer/$', consumers.MultiGameConsumer.as_asgi())
]