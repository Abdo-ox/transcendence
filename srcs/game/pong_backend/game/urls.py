from django.urls import path
from .views import WinStatsView, MatchCountView, GameProfileView, MultiGameHistoryView, AiGameHistoryView, TournamentsView, LeaderboardView, TournamentHistoryView

urlpatterns = [
    path('winstats/', WinStatsView.as_view()),
    path('matchcount/', MatchCountView.as_view()),
    path('gameprofile/', GameProfileView.as_view()),
    path('gameprofile/<username>', GameProfileView.as_view()),
    path('multigamehistory/', MultiGameHistoryView.as_view()),
    path('multigamehistory/<username>', MultiGameHistoryView.as_view()),
    path('aigamehistory/', AiGameHistoryView.as_view()),
    path('aigamehistory/<username>', AiGameHistoryView.as_view()),
    path('tournaments/', TournamentsView.as_view()),
    path('leaderboard/', LeaderboardView.as_view()),
    path('tournamenthistory/', TournamentHistoryView.as_view()),
    path('tournamenthistory/<username>', TournamentHistoryView.as_view()),
]