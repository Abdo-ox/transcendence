# from django.contrib.auth import get_user_model

from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from rest_framework import permissions, status
from django.shortcuts import get_object_or_404
from rest_framework.generics import (
    ListAPIView,
    RetrieveAPIView,
    CreateAPIView,
    DestroyAPIView,
    UpdateAPIView
)
from chat.models import Chat, Contact, User
# from chat.views import get_user_contact
from .serializers import ChatSerializer
from rest_framework.response import Response


from django.contrib.auth import authenticate
from rest_framework.views import APIView
import requests

class GetChatID(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):

        user1 = request.query_params.get('username1')
        user2 = request.query_params.get('username2')
        try:
            user1_contact = Contact.objects.get(user__username=user1)
            user2_contact = Contact.objects.get(user__username=user2)
            is_friend = user1_contact.user.friends.filter(user=user2_contact.user).exists()
        except Contact.DoesNotExist:
            return Response({'error': 'One or both users do not exist'}, status=status.HTTP_404_NOT_FOUND)
        # i can do get_or_create method in this case to optimise it
        chat = Chat.objects.filter(participants=user1_contact).filter(participants=user2_contact).first()
        if chat:
            serializer = ChatSerializer(chat)
            # print("Chat already exists", flush=True)
            return Response({'ChatID': chat.id}, status=status.HTTP_200_OK)
        else:
            new_chat = Chat.objects.create()
            new_chat.participants.add(user1_contact, user2_contact)
            serializer = ChatSerializer(new_chat)
            return Response({'ChatID': new_chat.id}, status=status.HTTP_201_CREATED)
