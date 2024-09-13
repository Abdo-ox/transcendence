from .views import createFriendRequest
from django.urls import path

urlpatterns = [
    path('request/', createFriendRequest),
]