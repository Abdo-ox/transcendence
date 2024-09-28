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
from .serializers import UserSerializer, ChatUserSerializer
from rest_framework.response import Response


from django.contrib.auth import authenticate
from rest_framework.views import APIView
from .serializers import LoginSerializer
import requests

class AdminLoginView(APIView):
    def post(self, request, *args, **kwargs):
        superusers = User.objects.filter(is_superuser=True)
        for user in superusers:
            contact, created = Contact.objects.get_or_create(user=user)
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            user = authenticate(request, username=username, password=password)
            if user is not None and user.is_staff:
                # Authentication successful and user is an admin
                return Response({'detail': 'Login successful'}, status=status.HTTP_200_OK)
            else:
                # Authentication failed or user is not an admin
                return Response({'detail': 'Invalid credentials or not an admin'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def get_user_contact(username):
    user = get_object_or_404(User, username=username)
    contact  = get_object_or_404(Contact, user=user)
    return contact

# class UserListView(ListAPIView):
#     queryset = User.objects.all()
#     serializer_class = UserSerializer

class GetChatID(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):

        user1 = request.query_params.get('username1')
        user2 = request.query_params.get('username2')
        # authorization = request.headers.get('Authorization')
    
        # if authorization:
        #     token = authorization.split(' ')[1]  # 'Bearer <token>'
        #     print('Authorization Token:', token, flush=True)
        try:
            user1_contact = Contact.objects.get(user__username=user1)
            user2_contact = Contact.objects.get(user__username=user2)
            is_friend = user1_contact.user.friends.filter(user=user2_contact.user).exists()
            print('is_friend ------------', is_friend, flush=True)
        except Contact.DoesNotExist:
            return Response({'error': 'One or both users do not exist'}, status=status.HTTP_404_NOT_FOUND)
        # i can u get_or_create method in this case to optimise it
        chat = Chat.objects.filter(participants=user1_contact).filter(participants=user2_contact).first()
        if chat:
            serializer = ChatSerializer(chat)
            print("Chat already exists", flush=True)
            return Response({'ChatID': chat.id}, status=status.HTTP_200_OK)
        else:
            new_chat = Chat.objects.create()
            new_chat.participants.add(user1_contact, user2_contact)
            serializer = ChatSerializer(new_chat)
            return Response({'chat_id': new_chat.id}, status=status.HTTP_201_CREATED)

# class ChatListView(ListAPIView):
#     permission_classes = [IsAuthenticated]
#     serializer_class = ChatSerializer
#     permission_classes = (permissions.AllowAny, )

#     def get_queryset(self):
#         queryset = Chat.objects.all()
#         username = self.request.query_params.get('username', None)
#         if username is not None:
#             contact = get_user_contact(username)
#             queryset = contact.chats.all()
#         return queryset


class ChatDetailView(RetrieveAPIView):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer
    permission_classes = (permissions.AllowAny, )


# class ChatCreateView(CreateAPIView):
#     queryset = Chat.objects.all()
#     serializer_class = ChatSerializer
    # permission_classes = (permissions.IsAuthenticated, )


class ChatUpdateView(UpdateAPIView):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer
    permission_classes = (permissions.IsAuthenticated, )


class ChatDeleteView(DestroyAPIView):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer
    permission_classes = (permissions.IsAuthenticated, )
