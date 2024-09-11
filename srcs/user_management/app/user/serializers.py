from rest_framework import serializers
from .models import User

from rest_framework import serializers
from .models import User
from friendship.models import  FriendList

class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email'] 

class ChatUserSerializer(serializers.ModelSerializer):
    friends = UserDetailSerializer(many=True, read_only=True, source='user.friends') 

    class Meta:
        model = User
        fields = ['username','profile_image', 'friends']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username','profile_image']

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email','profile_image','intraNet', 'first_name', 'last_name']