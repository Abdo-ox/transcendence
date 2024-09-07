from rest_framework import serializers
from .models import User

from rest_framework import serializers
from .models import User
from friendship.models import  FriendList

class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email'] 

class UserSerializer(serializers.ModelSerializer):
    friends = UserDetailSerializer(many=True, read_only=True, source='user.friends') 

    class Meta:
        model = User
        fields = ['username','profile_image', 'friends']
