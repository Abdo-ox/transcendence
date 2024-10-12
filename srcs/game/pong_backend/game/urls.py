from django.urls import path
from .views import WinStatsView

urlpatterns = [
    path('winstats/', WinStatsView.as_view()),
]