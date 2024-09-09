from rest_framework import serializers
from chat.models import Chat
from django.contrib.auth import get_user_model
from chat.views import get_user_contact
from django.http import Http404

User = get_user_model()

class ContactSerializer(serializers.StringRelatedField):
    def to_internal_value(self, value):
        return value


class ChatSerializer(serializers.ModelSerializer):
    participants = ContactSerializer(many=True)

    class Meta:
        model = Chat
        fields = ('id', 'messages', 'participants')
        read_only = ('id')

    def create(self, validated_data):
        print('inside create method ----------------------------------------------------------')
        participants = validated_data.pop('participants')
        print(f"par 0: {participants[0]}, par 1:: {participants[1]}")
        all_chats = Chat.objects.all()
        flag = 0
        for chat in all_chats:
            # print(f"Chat {chat.pk} participants:")
            usernames = [participant.user.username for participant in chat.participants.all()]
            for username in usernames:
                if username == participants[0] or username == participants[1]:
                    flag += 1
            if flag == 2:
                print('A chat with these participants already exists.')
                return chat
            flag = 0
        chat = Chat()
        chat.save()
        # print(participant, flush=True)
        for username in participants:
            try:
                print(f"username is ->>>>>>>>>>>>>>>>>>>>>>>> {username}")
                contact = get_user_contact(username)
            except Http404:
                print("the contact does not exist", flush=True)
                return chat
            chat.participants.add(contact)
        chat.save()
        return chat

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()