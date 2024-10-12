from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import WinStatSerializer, GameProfileSerializer, MultiGameHistorySerializer
from .models import Game, MultiGame, Tournament

class WinStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        print('here', flush=True)
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
        data['unkown_match'] = user.multiPlayerGames.filter(friendMatch=False, tournaments__isnull=True).count()

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
