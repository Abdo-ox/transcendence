from rest_framework import serializers
from . models import User, MultiGame, Game, Tournament


# TODO: create serializer for tournament        
class TournamentSerializer(serializers.ModelSerializer):
    pass

# win stats
class WinStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['score']

class GameProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['wins', 'losses', 'totalGames']

class MultiGameHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MultiGame
        fields = ['players', 'winner', 'Player1Score', 'Player2Score']