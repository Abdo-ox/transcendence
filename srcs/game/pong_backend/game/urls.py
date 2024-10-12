from django.urls import path
from .views import WinStatsView, MatchCountView

urlpatterns = [
    path('winstats/', WinStatsView.as_view()),
    path('matchcount/', MatchCountView.as_view()),
]