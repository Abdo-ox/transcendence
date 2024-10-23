from rest_framework import serializers
from . models import User, MultiGame, Game, Tournament, Coalition

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'profile_image']

class MultiGameHistorySerializer(serializers.ModelSerializer):
    player1 = UserSerializer()
    player2 = UserSerializer()
    winner = UserSerializer()
    class Meta:
        model = MultiGame
        fields = ['player1', 'player2', 'winner', 'player1Score', 'player2Score']

class TournamentHistorySerializer(serializers.ModelSerializer):
    games = MultiGameHistorySerializer(many=True)
    winner = UserSerializer()
    class Meta:
        model = Tournament
        fields = ['winner', 'games']

class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = ['name']

# win stats
class WinStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['score']

class CoalitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coalition
        fields = ['name', 'image']

class GameProfileSerializer(serializers.ModelSerializer):
    coalition = CoalitionSerializer()
    class Meta:
        model = User
        fields = ['username','score','profile_image','wins', 'losses', 'totalGames', 'coalition']


class AiGameHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ['playerScore', 'aiScore', 'won']

class LeaderboardSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username','profile_image','score','last_score']