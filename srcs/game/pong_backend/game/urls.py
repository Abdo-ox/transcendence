from django.urls import path
from .views import WinStatsView, MatchCountView, GameProfileView

urlpatterns = [
    path('winstats/', WinStatsView.as_view()),
    path('matchcount/', MatchCountView.as_view()),
    path('gameprofile/', GameProfileView.as_view()),
]