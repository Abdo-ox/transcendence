from rest_framework import serializers
from user.models import User
from project.settings import C as c
class UserSerializer(serializers.ModelSerializer):
    is_friend = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['username', 'profile_image', 'is_friend']
        
    def get_is_friend(self, obj):
        if obj in self.context.get('friends').all():
            return True
        return False
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if representation['is_friend']:
            representation['is_online'] = instance.is_online
        return representation