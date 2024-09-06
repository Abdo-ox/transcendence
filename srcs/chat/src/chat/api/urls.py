from django.urls import path, re_path

from .views import (
    UserListView,
    ChatListView,
    ChatDetailView,
    ChatCreateView,
    ChatUpdateView,
    ChatDeleteView,
    AdminLoginView,
    GetChatID,
    test
)

app_name = 'chat'

urlpatterns = [ 
    path('AdminLoginView/', AdminLoginView.as_view()),
    # path('', ChatListView.as_view()),
    path('GetChatID/', GetChatID.as_view()),
    path('UserListView/', UserListView.as_view()),
    path('create/', ChatCreateView.as_view()),
    path('<pk>', ChatDetailView.as_view()),
    path('<pk>/update/', ChatUpdateView.as_view()),
    path('<pk>/delete/', ChatDeleteView.as_view()),
    path('test/', test)
]