import json
import asyncio
import random
import time
from django.core.cache import cache
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async
from django.db import IntegrityError
from . models import Game, Tournament
from . game import GameLogic, TournamentLogic, TournamentLogicInstances

# protect from anonymous user

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.game_active = False
        self.user = self.scope['user']
        self.game_state = {}
        self.keys = {}
        self.game = Game(player=self.user)
        self.del_cache = False
        self.prediction = 0
        await self.accept()

    async def disconnect(self, close_code):   
        self.game_active = False
        if self.del_cache:
            cache.delete(self.user.username)
        if self.game_state['started']:
            # user
            self.game.playerScore = self.game_state['paddle1']['score']
            self.user.score += self.game_state['paddle1']['score']
            self.game.aiScore = self.game_state['paddle2']['score']
            self.user.totalGames += 1
            if (self.game_state['paddle1']['score'] > self.game_state['paddle2']['score']):
                self.game.won = True
                self.user.wins += 1
            else:
                self.user.losses += 1
            await self.game.asave()
            await self.user.asave()
            # coalition
            coalition = await sync_to_async(lambda: self.user.coalition)()
            coalition.score += self.game_state['paddle1']['score']
            await coalition.asave()

    async def receive(self, text_data):
        data = json.loads(text_data)
        if 'start' in data:
            self.initialize_game(data['width'], data['height'])
            await self.send_game_state()
            in_game = cache.get(self.user.username)
            if in_game:
                await self.send(json.dumps({'uaig':True})) # abbreviation for 'user already in game'
                await self.close()
                return
            cache.set(self.user.username, True)
            self.del_cache = True
        if 'start_game' in data:
            self.game_active = True
            self.game_state['started'] = True
            asyncio.create_task(self.game_loop())
        if 'key' in data:
            self.handle_key(data['key'])
        
    def initialize_game(self, width, height):
        self.prediction = height / 2
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
        s = time.time()
        while self.game_active:
            if time.time() - s >= 1:
                s = time.time()
                await self.predict()
            if self.game_state['started'] and not self.game_state['over']:
                self.update_game_state()
            await self.send_game_state()
            await asyncio.sleep(1 / fps)

    async def predict(self):
        v = self.game_state['ball']['vy']
        vx = self.game_state['ball']['vx']
        y = self.game_state['ball']['y']
        x = self.game_state['ball']['x']
        r = -1
        while r < 0:
            pre_x = x
            pre_y = y
            if v < 0:
                x = x + vx * abs(y / v)
                y = 0
            else:
                x = x + vx * abs((self.game_state['height'] - y) / v)
                y = self.game_state['height']
                
            if vx > 0 and x + self.game_state['ball']['r'] >= self.game_state['paddle2']['x']:
                y = pre_y + v * abs((self.game_state['paddle2']['x'] - pre_x) / vx)
                r = y
            if vx < 0 and x <= self.game_state['paddle1']['x'] + self.game_state['ball']['r']:
                y = pre_y + v * abs((pre_x - (self.game_state['paddle1']['x'] + self.game_state['ball']['r'])) / vx)
                x = self.game_state['paddle1']['x'] + self.game_state['ball']['r']
                vx *= -1
                v *= -1
            v *= -1
            
        self.prediction = r
            
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
        len_ = self.game_state['len']
        height = self.game_state['height']
        if paddle2['y'] + len_ / 2 - self.prediction > self.game_state['v'] and paddle2['y'] > 0:
                paddle2['y'] -= self.game_state['v']
        elif paddle2['y'] + len_ / 2 - self.prediction < -self.game_state['v'] and paddle2['y'] + len_ < height:
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

        if ball['vx'] > 0:
            if ball['x'] + ball['r'] >= paddle2['x'] and ball['x'] + ball['r'] <= paddle2['x'] + ball['r']\
                    and paddle2['y'] <= ball['y'] <= paddle2['y'] + self.game_state['len']:
                ball['vx'] *= -1
            elif ball['x'] >= width:
                paddle1['score'] += 1
                self.reset_ball(2)
        elif ball['vx'] < 0:
            if ball['x'] - ball['r'] <= paddle1['x'] + ball['r'] and ball['x'] - ball['r'] >= paddle1['x']\
                    and paddle1['y'] <= ball['y'] <= paddle1['y'] + self.game_state['len']:
                ball['vx'] *= -1
            elif ball['x'] <= 0:
                paddle2['score'] += 1
                self.reset_ball(1)

        if (ball['y'] - ball['r'] <= 0 and ball['vy'] < 0) or (ball['y'] + ball['r'] >= height and ball['vy'] > 0):
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

user_queue = set()

class MultiGameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        self.role = None
        self.room_name = self.scope['url_route']['kwargs'].get('room_name', None)
        self.GameTask = None
        self.del_cache = False
        await self.accept()


    async def disconnect(self, close_code):
        if self.del_cache:
            cache.delete(self.user.username)
        if self.room_name:
            self.GameTask.disconnected = True
            await self.channel_layer.group_discard(self.room_name, self.channel_name)

        if self in user_queue:
            user_queue.remove(self)

    async def receive(self, text_data):
        data = json.loads(text_data)
        if 'start' in data:
            await self.send(text_data=json.dumps(GameLogic.initialize_game()))
            
            in_game = cache.get(self.user.username)
            if in_game:
                await self.send(json.dumps({'uaig':True})) # abbreviation for 'user already in game'
                await self.close()
                return
            cache.set(self.user.username, True)
            self.del_cache = True
            
            if not self.room_name:
                # Add the user to the queue
                user_queue.add(self)
    
                # Check if there are enough users to create a roomç
                if len(user_queue) >= 2:
                    await self.create_room()
            else:
                # TODO: check if logic instance is started: handle accordingly
                # TODO: set friendMatch field to true
                await self.channel_layer.group_add(self.room_name, self.channel_name)

        if 'key' in data:
            self.handle_key(data['key'])


    async def create_room(self):
        # Pop two users from the queue
        # user1
        user_queue.remove(self)
        user1 = self
        
        user2 = user_queue.pop()

        # Create a unique room name
        self.room_name = f"room_{user1.user.id}{user1.channel_name.split('!')[-1]}_{user2.channel_name.split('!')[-1]}{user2.user.id}"

        # Set the room name
        user1.room_name = self.room_name
        user2.room_name = self.room_name

        # Add both users to the room
        await user1.channel_layer.group_add(self.room_name, user1.channel_name)
        await user2.channel_layer.group_add(self.room_name, user2.channel_name)

        user1.role = 'paddle1'
        user2.role = 'paddle2'
        
        user1.GameTask = GameLogic(self.room_name, user1, user2)
        user2.GameTask = user1.GameTask
        
        await self.channel_layer.group_send(self.room_name, {
            'type': 'send.opp.data',
        })

    # sends opponent data and user role
    async def send_opp_data(self, event=None):
        # Extract fields from the model instance
        data = {
            'role': self.role,
            'username': self.GameTask.user1.username if self.role == 'paddle2' else self.GameTask.user2.username,
            'img': self.GameTask.user1.profile_image if self.role == 'paddle2' else self.GameTask.user2.profile_image,
        }

        # Send data as JSON over the WebSocket
        await self.send(text_data=json.dumps(data))
        
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



class RemoteTournamentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        self.room_name = None
        self.instance = None
        self.logic = None
        self.del_cache = False
        await self.accept()


    async def disconnect(self, close_code):
        if self.del_cache:
            cache.delete(self.user.username)

    async def receive(self, text_data):
        data = json.loads(text_data)
        self.room_name = data['name']

        # check if user already in game or tournament
        in_game = cache.get(self.user.username)
        if in_game:
            await self.send(json.dumps({'uaig':True})) # abbreviation for 'user already in game'
            await self.close()
            return

        await self.channel_layer.group_add(self.room_name, self.channel_name)

        if 'create' in data:
            try:
                self.instance = await database_sync_to_async(Tournament.objects.create)(name=self.room_name)
            except IntegrityError:
                await self.send(text_data=json.dumps({'duplicate':True}))
                await self.close()
                return
            
            await self.send(text_data=json.dumps({'created':True}))

            await database_sync_to_async(self.instance.players.add)(self.user)
            
            self.logic = TournamentLogic(self.room_name, self.instance, self.user)
            await self.send(text_data=json.dumps(self.logic.get_state()))

        elif 'join' in data:
            self.instance = await Tournament.objects.aget(name=self.room_name)
            if self.instance.Ongoing or self.instance.isOver:
                await self.send(text_data=json.dumps({'message':"Can't join tournamet. Try again!"}))
                await self.close()
                return
            await database_sync_to_async(self.instance.players.add)(self.user)

            # join room
            self.logic = TournamentLogicInstances[self.room_name]
            # invoke logic to send state udate to all users and update model instance


        elif 'continue' in data:
            self.logic = TournamentLogicInstances[self.room_name]
            self.logic.players.append(self.user)
            await self.send(text_data=json.dumps(self.logic.get_state()))
            # join room

        cache.set(self.user.username, True)
        self.del_cache = True

    async def send_tournament_state(self, event):
        await self.send(text_data=json.dumps(event['tournament_state']))