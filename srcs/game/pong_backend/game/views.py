from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import WinStatSerializer, GameProfileSerializer, MultiGameHistorySerializer, AiGameHistorySerializer, TournamentSerializer, LeaderboardSerializer, TournamentHistorySerializer
from .models import Game, MultiGame, Tournament, User

class WinStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = WinStatSerializer(user)
        data = serializer.data

        data['win_rate'] = user.wins / user.totalGames if user.totalGames else 0
        data['loss_rate'] = user.losses / user.totalGames if user.totalGames else 0

        return Response(data)

class MatchCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = {}
        user = request.user
        data['tournament'] = user.tournaments.count()
        data['ai_match'] = user.games.count()
        data['friend_match'] = user.multiPlayerGames.filter(friendMatch=True).count()
        data['unkown_match'] = user.multiPlayerGames.filter(friendMatch=False, tournament__isnull=True).count()

        return Response(data)

class GameProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = GameProfileSerializer(user)
        data = serializer.data

        data['tournaments'] = user.tournaments.count()

        return Response(data)

class MultiGameHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = MultiGameHistorySerializer(user.multiPlayerGames, many=True)

        return Response(serializer.data)

class AiGameHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = AiGameHistorySerializer(user.games, many=True)

        return Response(serializer.data)

class TournamentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = TournamentSerializer(Tournament.objects.all(), many=True)

        return Response(serializer.data)

class LeaderboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = User.objects.all()
        serializer = LeaderboardSerializer(users, many=True)

        return Response(serializer.data)

class TournamentHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = request.user
        serializer = TournamentHistorySerializer(user.tournaments, many=True)

        return Response(serializer.data)