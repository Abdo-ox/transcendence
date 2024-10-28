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
EnableTwoFactor,
UpdatePassword,
UpdateisPassed,
coalitions,
coalition)

urlpatterns = [
    path('register/', Register, name='register'),
    path('42/callback/', Oauth_42_callback, name='42'),
    path('user/data/', sendUserData),
    path('suggest/friend/', sendSuggestionFriend),
    path('settings/', accountSettings),
    path('upload-profile/', UploadProfile),
    path('update/', updateData),
    path('currentUser/', currentUserData),
    path('Enable2Fa/', EnableTwoFactor),
    path('ChangePassword/', UpdatePassword),
    path('twoFaCalled/', UpdateisPassed),
    path('coalitions/', coalitions),
    path('coalition/', coalition),
]