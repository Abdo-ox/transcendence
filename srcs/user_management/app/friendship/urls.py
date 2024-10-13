from django.urls import path

from .views import (createFriendRequest,
acceptFriendRequest,
cancelFriendRequest,
sendFriendRequests)


urlpatterns = [
    path('create/', createFriendRequest),
    path('accept/', acceptFriendRequest),
    path('cancel/', cancelFriendRequest),
    path('decline/', declineFriendRequest),
    path('friendRequests/', sendFriendRequests),
]