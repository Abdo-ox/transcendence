from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from .models import Chat, Contact, User


def get_last_10_messages(chatID): 
    chat = get_object_or_404(Chat, id=chatID)
    return chat.messages.order_by('-timestamp').all()

def get_user_contact(username):
    user = get_object_or_404(User, username=username)
    return get_object_or_404(Contact, user=user)

def get_current_ChatID(ChatID):
    return get_object_or_404(Chat, id=ChatID)

def get_participants(ChatID):
    CurrentChat = get_current_ChatID(ChatID)
    participant_names = [participant.user.username for participant in CurrentChat.participants.all()]
    return participant_names