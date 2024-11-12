from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path(r"ws/chat/(?P<room_name>\w+)/$", consumers.ChatConsumer.as_asgi()),
    re_path(r"ws/notif/(?P<notif_id>[a-zA-Z0-9-_]+)", consumers.NotificationConsumer.as_asgi()),
    re_path(r"ws/status/", consumers.UserStatusConsumer.as_asgi())
]