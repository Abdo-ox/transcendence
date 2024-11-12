from rest_framework import serializers, status
from chat.models import Chat
from django.contrib.auth import get_user_model
from chat.views import get_user_contact
from django.http import Http404

User = get_user_model()

# from chat.models import  FriendList




class ContactSerializer(serializers.StringRelatedField):
    def to_internal_value(self, value):
        return value

class ChatSerializer(serializers.ModelSerializer):
    participants = ContactSerializer(many=True)
    
    class Meta:
        model = Chat
        fields = ('id', 'messages', 'participants')
        read_only_fields = ('id',)

