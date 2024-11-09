from django.urls import path, re_path

from .views import (
    GetChatID,
)

app_name = 'chat'

urlpatterns = [ 
    path('GetChatID/', GetChatID.as_view()),
]