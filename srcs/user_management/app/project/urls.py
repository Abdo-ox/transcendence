from django.contrib import admin
from django.urls import path, include
from .views import  getCsrfToken, sendOauthData, verify_2fa_code , isAuthenticated
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.http import HttpResponse
from django.conf.urls.static import static
from django.conf import settings


# temp 
from friendship.models import FriendList
from user.models import User
def friend(request):
    user1 = request.GET.get("user1")
    user2 = request.GET.get("user2")
    user1 = User.objects.get(username=user1)
    user2 = User.objects.get(username=user2)
    friendlist1, yes = FriendList.objects.get_or_create(user=user1)
    friendlist2, yes = FriendList.objects.get_or_create(user=user2)
    print("yes:", yes, "list:", friendlist1, flush=True)
    friendlist1.addFriend(user2)
    friendlist2.addFriend(user1)
    return HttpResponse("ok")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('is_authenticated/', isAuthenticated),
    path('api/csrf_token/', getCsrfToken),
    path('api/42/data/', sendOauthData),
    path('verify_2fa_code/',verify_2fa_code, name='verify_2fa_code'),
    path('friend/', include('friendship.urls')),
    path('friend/', friend), # temp 
    path('api/', include('user.urls')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)