from django.contrib import admin
from django.urls import path, include
from .views import home, UserData, getCsrfToken, sendOauthData
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.http import HttpResponse
from friendship.views import createFreindRelation

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/csrf_token/', getCsrfToken),
    path('api/', include('user.urls')),
    path('api/42/data/', sendOauthData),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('friend/', createFreindRelation),
]
