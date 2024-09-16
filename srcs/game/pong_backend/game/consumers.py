import json
import asyncio
import random
import time
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from . models import Game, MultiGame
from . game import GameLogic


# protect from anonymous user

# TODO: seperate game logic from consumer and allow user to rejoin game, also implement time out
class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.game_active = False
        self.user = self.scope['user']
        self.game_state = {}
        self.keys = {}
        self.game = Game(player=self.user)
        await self.accept()

    async def disconnect(self, close_code):   
        self.game_active = False
        if self.game_state['started']:
            self.game.playerScore = self.game_state['paddle1']['score']
            self.game.aiScore = self.game_state['paddle2']['score']
            if (self.game_state['paddle1']['score'] > self.game_state['paddle2']['score']):
                self.game.won = True
            database_sync_to_async(self.game.save)() 

    async def receive(self, text_data):
        data = json.loads(text_data)
        if 'start' in data:
            self.initialize_game(data['width'], data['height'])
            await self.send_game_state()
        if 'start_game' in data:
            self.game_active = True
            self.game_state['started'] = True
            asyncio.create_task(self.game_loop())
        if 'key' in data:
            self.handle_key(data['key'])
        
    def initialize_game(self, width, height):
        self.game_state = {
            'ball': {
                'x': width / 4,
                'y': height / 3,
                'vx': 0.015 * height,
                'vy': 0.015 * height,
                'r': 0.015 * height,
            },
            'paddle1': {
                'x': 0.02 * width,         
                'y': (height / 2) - (0.125 * height), 
                'score': 0,
            },
            'paddle2': {
                'x': width - (0.02 * width) - 0.015 * height,
                'y': (height / 2) - (0.125 * height),  
                'score': 0,
            },
            'v': 0.015 * height,
            'len': 0.25 * height,
            'maxScore': 7,
            'over': False,
            'started': False,
            'width': width,
            'height': height,
        }

    async def game_loop(self):
        fps = 60
        await asyncio.sleep(3) # sleep for 3s to allow for 3s countdown
        while self.game_active:
            if self.game_state['started'] and not self.game_state['over']:
                self.update_game_state()
            await self.send_game_state()
            await asyncio.sleep(1 / fps)

    def handle_key(self, key):
        self.keys[key] = not self.keys.get(key, False)
        
    def update_paddle1(self):
        if self.keys.get('ArrowUp', False) or self.keys.get('w', False):
            delta_y = -self.game_state['v']
        elif self.keys.get('ArrowDown', False) or self.keys.get('s', False):
            delta_y = self.game_state['v']
        else:
            return
                            
        paddle1 = self.game_state['paddle1']
        new_y = paddle1['y'] + delta_y
        if 0 <= new_y <= self.game_state['height'] - self.game_state['len']:
            paddle1['y'] = new_y

    def update_paddle2(self):
        paddle2 = self.game_state['paddle2']
        ball = self.game_state['ball']
        if ball['x'] > self.game_state['width'] / 2 and ball['vx'] > 0:
            if paddle2['y'] > ball['y']:
                paddle2['y'] -= self.game_state['v']
            elif paddle2['y'] + self.game_state['len'] < ball['y']:
                paddle2['y'] += self.game_state['v']

    def update_ball(self):
        ball = self.game_state['ball']
        self.check_collision()
        ball['x'] += ball['vx']
        ball['y'] += ball['vy']

    def check_collision(self):
        ball = self.game_state['ball']
        paddle1 = self.game_state['paddle1']
        paddle2 = self.game_state['paddle2']
        width = self.game_state['width']
        height = self.game_state['height']

        if ball['x'] > width * 0.9 and ball['vx'] > 0:
            if ball['x'] + ball['r'] >= paddle2['x'] and ball['x'] + ball['r'] <= paddle2['x'] + ball['r']\
                    and paddle2['y'] <= ball['y'] <= paddle2['y'] + self.game_state['len']:
                ball['vx'] *= -1
            elif ball['x'] >= width:
                paddle1['score'] += 1
                self.reset_ball(2)
        elif ball['x'] < width * 0.1 and ball['vx'] < 0:
            if ball['x'] - ball['r'] <= paddle1['x'] + ball['r'] and ball['x'] - ball['r'] >= paddle1['x']\
                    and paddle1['y'] <= ball['y'] <= paddle1['y'] + self.game_state['len']:
                ball['vx'] *= -1
            elif ball['x'] <= 0:
                paddle2['score'] += 1
                self.reset_ball(1)

        if ball['y'] - ball['r'] <= 0 or ball['y'] + ball['r'] >= height:
            ball['vy'] *= -1

        self.check_game_over()

    def reset_ball(self, scored_on):
        ball = self.game_state['ball']
        width = self.game_state['width']
        height = self.game_state['height']
        if scored_on == 1:
            ball['x'] = width / 4
            ball['vx'] = self.game_state['v']
        else:
            ball['x'] = width * 0.75
            ball['vx'] = -self.game_state['v']
        ball['y'] = random.randint(0, height)

    def check_game_over(self):
        paddle1 = self.game_state['paddle1']
        paddle2 = self.game_state['paddle2']
        if paddle1['score'] >= self.game_state['maxScore'] or paddle2['score'] >= self.game_state['maxScore']:
            self.game_state['over'] = True

    def update_game_state(self):
        self.update_ball()
        self.update_paddle1()
        self.update_paddle2()

    async def send_game_state(self):
        await self.send(text_data=json.dumps(self.game_state))
        if self.game_state['over']:
            await self.close()


# Multiplayer consumer

user_queue = []

class MultiGameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        self.role = None
        self.room_name = None
        self.GameTask = None

        await self.accept()
        
        game = await MultiGame.objects.filter(isOver=False).afirst()
        if game:
            self.GameTask = GameLogic.games_tasks.get(game.room_name, None)
            if self.GameTask:
                self.room_name = game.room_name
                await self.channel_layer.group_add(game.room_name, self.channel_name)
                
                if self.user == self.GameTask.user1:
                    self.role = 'paddle1'
                else:
                    self.role = 'paddle2'
                self.GameTask.disconnected[self.role] = None
            else:
                game.isOver = True
                await game.asave()
            
        if not self.room_name:
            # Add the user to the queue
            user_queue.append(self)

            # Check if there are enough users to create a room
            if len(user_queue) >= 2:
                await self.create_room()
            else:
                asyncio.create_task(self.queue_timeout())
                
    async def queue_timeout(self):
        await asyncio.sleep(60) # sleep for n seconds
        if not self.room_name:
            await self.close()


    async def disconnect(self, close_code):
        if self.room_name:
            self.GameTask.disconnected[self.role] = time.time()
            await self.channel_layer.group_discard(self.room_name, self.channel_name)

        if self in user_queue:
            user_queue.remove(self)

    async def receive(self, text_data):
        data = json.loads(text_data)
        if 'start' in data:
            await self.send(text_data=json.dumps(GameLogic.initialize_game()))

        if 'key' in data:
            self.handle_key(data['key'])


    async def create_room(self):
        # Pop two users from the queue
        user1 = user_queue.pop(0)
        user2 = user_queue.pop(0)

        # Create a unique room name
        room_name = f"room_{user1.user.id}_{user2.user.id}"

        # Set the room name
        user1.room_name = room_name
        user2.room_name = room_name

        # Add both users to the room
        await user1.channel_layer.group_add(room_name, user1.channel_name)
        await user2.channel_layer.group_add(room_name, user2.channel_name)

        user1.role = 'paddle1'
        user2.role = 'paddle2'
        
        user1.GameTask = GameLogic(self.room_name, user1, user2)
        user2.GameTask = user1.GameTask

        
    def handle_key(self, key):
        self.GameTask.keys[self.role][key] = not self.GameTask.keys[self.role].get(key, False)


    async def send_game_state(self, event):
        if event['game_state']['over']:
            opponent_role = 'paddle1' if self.role == 'paddle2' else 'paddle2'
            event['game_state']['won'] = event['game_state'][self.role]['score'] > event['game_state'][opponent_role]['score']
                
            await self.send(text_data=json.dumps(event['game_state']))
            
            await self.close()
        else:        
            await self.send(text_data=json.dumps(event['game_state']))