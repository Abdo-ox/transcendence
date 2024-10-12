from rest_framework import serializers
from . models import User


# TODO: create serializer for tournament        
class TournamentSerializer(serializers.ModelSerializer):
    pass

# win stats
class WinStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['score']
