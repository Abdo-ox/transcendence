from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views import (
Register,
Logout,
Oauth_42_callback,
sendUserData,
sendSuggestionFriend,
accountSettings,
UploadProfile,
updateData )

urlpatterns = [
    path('register/', Register, name='register'),
    path('logout/',Logout, name='logout'),
    path('42/callback/', Oauth_42_callback, name='42'),
    path('user/data/', sendUserData),
    path('suggest/friend/', sendSuggestionFriend),
    path('settings/', accountSettings),
    path('upload-profile/', UploadProfile),
    path('update/', updateData),
]