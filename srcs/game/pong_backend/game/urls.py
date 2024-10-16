from django.urls import path
from .views import WinStatsView, MatchCountView, GameProfileView, MultiGameHistoryView, AiGameHistoryView, TournamentsView

urlpatterns = [
    path('winstats/', WinStatsView.as_view()),
    path('matchcount/', MatchCountView.as_view()),
    path('gameprofile/', GameProfileView.as_view()),
    path('multigamehistory/', MultiGameHistoryView.as_view()),
    path('aigamehistory/', AiGameHistoryView.as_view()),
    path('tournaments/', TournamentsView.as_view()),
]