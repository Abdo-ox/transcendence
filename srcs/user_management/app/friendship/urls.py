from django.urls import path

from .views import (createFriendRequest,
acceptFriendRequest,
cancelFriendRequest,
declineFriendRequest,
sendFriendRequests)


urlpatterns = [
    path('send/', createFriendRequest),
    path('accept/', acceptFriendRequest),
    path('cancel/', cancelFriendRequest),
    path('decline/', declineFriendRequest),
    path('friendRequests/', sendFriendRequests),
]