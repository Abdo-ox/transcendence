from django.contrib.auth import get_user_model
from rest_framework import permissions, status
from django.shortcuts import get_object_or_404
from rest_framework.generics import (
    ListAPIView,
    RetrieveAPIView,
    CreateAPIView,
    DestroyAPIView,
    UpdateAPIView
)
from chat.models import Chat, Contact
# from chat.views import get_user_contact
from .serializers import ChatSerializer
from .serializers import UserSerializer
from rest_framework.response import Response


from django.contrib.auth import authenticate
from rest_framework.views import APIView
from .serializers import LoginSerializer

User = get_user_model()


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

class UserListView(ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class GetChatID(APIView):
    def get(self, request):
        user1 = request.query_params.get('username1')
        user2 = request.query_params.get('username2')

        # Print the parameters in the terminal
        print(f"user1: {user1}, user2: {user2}")
        all_chats = Chat.objects.all()
        for chat in all_chats:
            usernames = [participant.user.username for participant in chat.participants.all()]
            if (user1 == usernames[0] or user1 == usernames[1]) and (user2 == usernames[0] or user2 == usernames[1]):
                print(f'chat id:  {chat.id}')
                return Response({'ChatID': chat.id}, status=status.HTTP_200_OK)
        print("the participant does't exist")
        # Respond with a simple JSON response
        return Response({'message': 'participant not found'}, status=status.HTTP_404_NOT_FOUND)



class ChatListView(ListAPIView):
    serializer_class = ChatSerializer
    permission_classes = (permissions.AllowAny, )

    def get_queryset(self):
        queryset = Chat.objects.all()
        username = self.request.query_params.get('username', None)
        if username is not None:
            contact = get_user_contact(username)
            queryset = contact.chats.all()
        return queryset


class ChatDetailView(RetrieveAPIView):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer
    permission_classes = (permissions.AllowAny, )


class ChatCreateView(CreateAPIView):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer
    # permission_classes = (permissions.IsAuthenticated, )


class ChatUpdateView(UpdateAPIView):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer
    permission_classes = (permissions.IsAuthenticated, )


class ChatDeleteView(DestroyAPIView):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer
    permission_classes = (permissions.IsAuthenticated, )