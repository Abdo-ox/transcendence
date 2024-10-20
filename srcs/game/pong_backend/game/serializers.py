from rest_framework import serializers
from . models import User, MultiGame, Game, Tournament


# TODO: create serializer for tournament        
class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = ['name']

# win stats
class WinStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['score']

class GameProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username','score','profile_image','wins', 'losses', 'totalGames']

class MultiGameHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MultiGame
        fields = ['player1', 'player2', 'winner', 'Player1Score', 'Player2Score']

class AiGameHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ['playerScore', 'aiScore', 'won']

class LeaderboardSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username','profile_image','score','last_score']