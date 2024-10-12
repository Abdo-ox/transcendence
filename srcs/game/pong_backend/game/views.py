from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import WinStatSerializer

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
