from django.urls import path

from .views import (createFriendRequest,
acceptFriendRequest,
cancelFriendRequest,
sendFriendRequests)


urlpatterns = [
    path('create/', createFriendRequest),
    path('cancel/', cancelFriendRequest),
    path('accept/', acceptFriendRequest),
    path('friendRequests/', sendFriendRequests),
]