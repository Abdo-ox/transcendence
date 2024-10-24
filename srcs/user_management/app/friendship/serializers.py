from rest_framework import serializers
from user.models import User

class UserSerializer(serializers.ModelSerializer):
    is_friend = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['username', 'profile_image', 'is_online']
        
    def get_is_friend(self, obj):
        if obj in self.context.get('friends'):
            return True
        return False
        
        