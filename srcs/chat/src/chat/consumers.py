import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from .models import Message
from django.contrib.auth.models import AnonymousUser
from .views import get_messages, get_user_contact, get_current_ChatID, get_participants

class NotificationConsumer(WebsocketConsumer):
    def GetParticipants(self, data):
        # print(f"too is ::: {data['to']}")
        content = {
            'message': f"{data['message']}",
            'to': data['to'],
        }
        return self.send_chat_message(content)
    def connect(self):
        # Check if the user is authenticated
        self.room_group_name = 'notif'
        if self.scope['user'] == AnonymousUser():
            print("anonymousUser", flush=True)
            # If not authenticated, close the connection
            self.close()
        else:
            print(f"user is ------------>> {self.scope['user']}", flush=True)
            async_to_sync(self.channel_layer.group_add)(
                self.room_group_name, self.channel_name
            )
            self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
        self.room_group_name, self.channel_name
        )
    def receive(self, text_data):
        data = json.loads(text_data)
        self.GetParticipants(data)

    def send_chat_message(self, message):
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name, {
            "type": "chat_message",
            "message": message}
        )
    def chat_message(self, event):
        message = event["message"]
        self.send(text_data=json.dumps(message))




class ChatConsumer(WebsocketConsumer):

    def fetch_messages(self, data):
        messages = get_messages(data['ChatID'])
        content = {
            'command': 'messages',
            'messages': self.messages_to_json(messages)
        }
        self.send_message(content)

    def new_message(self, data):
        user_contact = get_user_contact(data['from'])
        message = Message.objects.create(
            contact=user_contact,
            content=data['message'])
        current_chat = get_current_ChatID(data['ChatID'])
        current_chat.messages.add(message)
        current_chat.save()
        content = {
            'command': 'new_message',
            'message': self.single_message_to_json(message)
        }
        return self.send_chat_message(content)

    def messages_to_json(self, messages):
        return [self.single_message_to_json(message) for message in messages]

    def single_message_to_json(self, message):
        return {
            'id': message.id,
            'author': message.contact.user.username,
            'content': message.content,
            'timestamp': str(message.timestamp)
        }

    commands = {
        'fetch_messages': fetch_messages,
        'new_message': new_message
    }

    def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"chat_{self.room_name}"
        if self.scope['user'] == AnonymousUser():
            print("anonymousUser", flush=True)
            self.close()
        # Join room group
        else:
            print(f"user is ------------>> {self.scope['user']}", flush=True)
            async_to_sync(self.channel_layer.group_add)(
                self.room_group_name, self.channel_name
            )

            self.accept()

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name, self.channel_name
        )

    # Receive message from WebSocket
    def receive(self, text_data):
        data = json.loads(text_data)
        self.commands[data['command']](self, data)

    def send_chat_message(self, message):
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name, {
            "type": "chat_message",
            "message": message}
        )

    def send_message(self, message):
        self.send(text_data=json.dumps(message))

    # Receive message from room group
    def chat_message(self, event):
        message = event["message"]
        self.send(text_data=json.dumps(message))
