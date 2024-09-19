from django.contrib import admin
from django.urls import path, include
from .views import  getCsrfToken, sendOauthData, verify_2fa_code, uploadProfileImage
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.http import HttpResponse
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('friend/', include('friendship.urls')),
    path('api/', include('user.urls')),
    path('api/csrf_token/', getCsrfToken),
    path('api/42/data/', sendOauthData),
    path('upload/', uploadProfileImage),
    path('verify_2fa_code/',verify_2fa_code, name='verify_2fa_code'),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)