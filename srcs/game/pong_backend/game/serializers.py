from rest_framework import serializers
from django.contrib.auth.models import User
from . models import Game


# TODO: create serializer for tournament        
class TournamentSerializer(serializers.ModelSerializer):
    pass

class GameSerializer(serializers.ModelSerializer):
    player = serializers.ReadOnlyField(source='player.username')
    
    class Meta:
        model = Game
        fields = '__all__'
        
# TODO: create serializer for multiplayer game