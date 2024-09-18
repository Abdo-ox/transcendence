from .views import createFriendRequest, acceptFriendRequest, cancelFriendRequest
from django.urls import path

urlpatterns = [
    path('request/', createFriendRequest),
    path('cancel/', cancelFriendRequest),
    path('accept/', acceptFriendRequest),
]