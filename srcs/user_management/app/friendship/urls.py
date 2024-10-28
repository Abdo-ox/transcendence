from django.urls import path

from .views import (createFriendRequest,
acceptFriendRequest,
cancelFriendRequest,
declineFriendRequest,
sendFriendRequests,
unFriend,
userFriends,
makeFreindRequestReaded)


urlpatterns = [
    path('send/', createFriendRequest),
    path('accept/', acceptFriendRequest),
    path('cancel/', cancelFriendRequest),
    path('decline/', declineFriendRequest),
    path('unfriend/', unFriend),
    path('friendRequests/', sendFriendRequests),
    path('userFriends/', userFriends),
    path('friendRequest/readed/', makeFreindRequestReaded),
]