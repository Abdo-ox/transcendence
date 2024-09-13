from rest_framework import serializers
from .models import User
from friendship.models import FriendRequest
from rest_framework import serializers
from .models import User
from friendship.models import  FriendList
from project.settings import C as c

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
    friend_request_status = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['username','profile_image', 'friend_request_status']
    
    def get_friend_request_status(self, obj):
        print(c.r, "context:", self.context)
        user = self.context['user']
        if FriendRequest.objects.get(sender=user, receiver=obj, is_active=True):
            print("sent", flush=True)
            return "sent"
        elif FriendRequest.objects.get(sender=obj, receiver=user, is_active=True):
            print("recieved")
            return "received"
        else:
            print("none")
            return "none"

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email','profile_image','intraNet', 'first_name', 'last_name']