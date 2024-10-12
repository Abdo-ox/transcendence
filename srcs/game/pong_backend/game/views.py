from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import WinStatSerializer
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
        data['tournament'] = Tournament.objects.count()
        data['ai_match'] = Game.objects.count()
        data['friend_match'] = MultiGame.objects.filter(friendMatch=True).count()
        data['unkown_match'] = MultiGame.objects.filter(friendMatch=False, tournaments__isnull=True).count()

        return Response(data)