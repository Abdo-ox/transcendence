from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views import (
Register,
Oauth_42_callback,
sendUserData,
sendSuggestionFriend,
accountSettings,
UploadProfile,
currentUserData,
updateData,
EnableTwoFactor,)

urlpatterns = [
    path('register/', Register, name='register'),
    path('42/callback/', Oauth_42_callback, name='42'),
    path('user/data/', sendUserData),
    path('suggest/friend/', sendSuggestionFriend),
    path('settings/', accountSettings),
    path('upload-profile/', UploadProfile),
    path('update/', updateData),
    Path('currentUser/',currentUserData),
    Path('Enable2Fa/',EnableTwoFactor),
]