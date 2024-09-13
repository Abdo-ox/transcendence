from django.urls import include, path
from rest_framework import routers
from . import views

router = routers.DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'games', views.GameViewSet)

urlpatterns = [
    path('login/', views.login),
    path('signup/', views.signup),
    #path('new/', views.NewGame),
    path('', include(router.urls)),
]
