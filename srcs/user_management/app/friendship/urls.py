from django.urls import path

from .views import (createFriendRequest,
acceptFriendRequest,
cancelFriendRequest,
sendFriendRequests)


urlpatterns = [
    path('request/', createFriendRequest),
    path('cancel/', cancelFriendRequest),
    path('accept/', acceptFriendRequest),
    path('friendRequests/', sendFriendRequests),
]