from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from .models import Chat, Contact, User
from django.http import Http404


def get_last_10_messages(chatID): 
    chat = get_object_or_404(Chat, id=chatID)
    return chat.messages.order_by('-timestamp').all()

def get_user_contact(username):
    try:
        user = User.objects.get(username=username)
        contact = Contact.objects.get(user=user)
        # print(f"User found: {user}", flush=True)  # Debugging output
    except Contact.DoesNotExist:
        print(f"Contact with username '{username}' not found.", flush=True)  # Debugging output
        raise Http404("Contact does not exist")
    except User.DoesNotExist:
        raise Http404("User does not exist")
    return contact

def get_current_ChatID(ChatID):
    return get_object_or_404(Chat, id=ChatID)

def get_participants(ChatID):
    CurrentChat = get_current_ChatID(ChatID)
    participant_names = [participant.user.username for participant in CurrentChat.participants.all()]
    return participant_names