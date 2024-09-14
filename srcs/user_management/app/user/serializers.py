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
    
    def __init__(self, *args, **kwargs):
        print(c.y, "kwargs:",kwargs)
        self.user = kwargs.pop('user', None)
        super(UserSerializer, self).__init__(*args, **kwargs)
        
    def get_friend_request_status(self, obj):
        print(c.r, "context:", self.context)
        user = self.context.get('user')
        print(c.r, "user:", self.user)
        try:
            FriendRequest.objects.get(sender=user, receiver=obj, is_active=True)
            print("sent", flush=True)
            return "sent"
        except FriendRequest.DoesNotExist:
            try:
                FriendRequest.objects.get(sender=obj, receiver=user, is_active=True)
                print("received", flush=True)
                return "received"
            except FriendRequest.DoesNotExist:
                print("none")
                return "none"

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email','profile_image','intraNet', 'first_name', 'last_name']