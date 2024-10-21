from rest_framework import serializers
from .models import User
from friendship.models import FriendRequest
from rest_framework import serializers
from .models import User, Coalition
from friendship.models import  FriendList
from project.settings import C as c

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email','profile_image','intraNet', 'first_name', 'last_name']
        
class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'profile_image'] 

class ChatUserSerializer(serializers.ModelSerializer):
    friends = UserDetailSerializer(many=True, read_only=True, source='user.friends') 

    class Meta:
        model = User
        fields = ['username','profile_image', 'friends']

class SuggestionSerializer(serializers.ModelSerializer):
    friend_request_status = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['username','profile_image', 'friend_request_status']
    
    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        super(SuggestionSerializer, self).__init__(*args, **kwargs)
        
    def get_friend_request_status(self, obj):
        user = self.user
        try:
            FriendRequest.objects.get(sender=user, receiver=obj, is_active=True)
            return "sent"
        except FriendRequest.DoesNotExist:
            try:
                FriendRequest.objects.get(sender=obj, receiver=user, is_active=True)
                return "received"
            except FriendRequest.DoesNotExist:
                return "none"

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email','profile_image','intraNet', 'first_name', 'last_name','intraNet','enable2fa']

class CurrentSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'profile_image']
        
class CoalitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coalition
        fields = ['name', 'image', 'score']