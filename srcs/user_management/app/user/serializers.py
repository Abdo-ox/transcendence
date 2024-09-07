from rest_framework import serializers
from .models import User

from rest_framework import serializers
from .models import User
from friendship.models import  FriendList

class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email']  # Adjust as needed

# class FriendListSerializer(serializers.ModelSerializer):
#     friends = UserDetailSerializer(many=True, read_only=True)

#     class Meta:
#         model = FriendList
#         fields = ['friends'] 

class UserSerializer(serializers.ModelSerializer):
    friends = UserDetailSerializer(many=True, read_only=True, source='user.friends') 

    class Meta:
        model = User
        fields = ['username', 'friends']
