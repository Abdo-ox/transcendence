import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from .models import Message
from django.contrib.auth.models import AnonymousUser
from .views import get_messages, get_user_contact, get_current_ChatID, get_participants
import time

# consumer for handling warm notif and status

class UserStatusConsumer(WebsocketConsumer):

    def connect(self):
        self.room_group_name = 'online_users'
        
        if self.scope['user'] != AnonymousUser():
            user = get_user_contact(self.scope['user'])
            user.is_online = True
            user.save()
            print("current status === ", user.is_online, flush=True)

            async_to_sync(self.channel_layer.group_add)(
                self.room_group_name, self.channel_name
            )

            self.accept()

            self.send_user_status("True")

        else:
            self.close()

    def disconnect(self, close_code):
        user = get_user_contact(self.scope['user'])
        user.is_online = False
        user.save()
        print("current status === ", user.is_online, flush=True)

        self.send_user_status("False")

        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name, self.channel_name
        )
    
    def send_user_status(self, status):
        # Send the status message to the group
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name, {
                "type": "user_status_message",
                "is_online": status,
                "username": self.scope['user'].username
            }
        )

    # Receive message from the group and handle it
    def user_status_message(self, event):
        print("user_status_message method called", flush=True)

        is_online = event["is_online"]
        username = event["username"]

        self.send(text_data=json.dumps({
            "is_online": is_online,
            "username": username
        }))

class NotificationConsumer(WebsocketConsumer):
    def GetParticipants(self, data):
        # print(f"too is ::: {data['to']}")
        # print('----------------------------', flush=True)
        # print(data, flush=True)
        if data['block'] == 'false' and data['playwith'] == 'null':
            content = {
                'message': data['message'],
                'to': data['to'],
                'flag': data['flag'],
                'img': data['img'],
                'from': data['from'],
                'block': 'false'
            }
        elif data['block'] == 'false' and data['playwith'] != 'null':
            content = {
                'playwith': data['playwith'],
                'room_name': data['room_name'],
                'block': 'false'
            }
        elif data['block'] == 'True':
            content = {
                'from': data['from'],
                'block': 'True',
                'block_target': data['block_target'],
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
