from channels.layers import get_channel_layer
import asyncio
import random
import time
from . models import MultiGame
from channels.db import database_sync_to_async

class GameLogic:
    games_tasks = {}
    
    def __init__(self, room_name, user1, user2):
        self.room_name = room_name
        GameLogic.games_tasks[room_name] = self
        self.game_active = True
        self.game = None
        self.disconnected = {'paddle1': None, 'paddle2': None}
        self.keys = {'paddle1': {}, 'paddle2': {}}
        self.game_state = GameLogic.initialize_game()
        self.game_state['started'] = True
        self.user1 = user1.user
        self.user2 = user2.user
        asyncio.create_task(self.init_task(user1.user, user2.user, room_name))
        
    async def init_task(self, user1, user2, room_name):
        self.game = await self.create_obj(user1, user2, room_name)
        await self.game_loop()
    
    # to fix sync to async compatibility
    async def create_obj(self, user1, user2, room_name):
        game = await database_sync_to_async(MultiGame.objects.create)(
            room_name = room_name
        )
        database_sync_to_async(game.players.add)(user1, user2)
        return game

    @staticmethod
    def initialize_game():
        width, height = 1, 1
        game_state = {
            'ball': {
                'x': width / 4,
                'y': height / 4,
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
            'maxScore': 5,
            'over': False,
            'started': False,
            'won': False,
            'countdown': True,
            'width': width,
            'height': height,
        }
        return game_state


    async def game_loop(self):
        channel_layer = get_channel_layer()
        fps = 60
        
        # send game state to set off timer
        await channel_layer.group_send(self.room_name, {
            'type': 'send.game.state',
            'game_state': self.game_state
        })
        await asyncio.sleep(3) # sleep 3 seconds for game countdown / implemented in front end
        
        self.game_state['countdown'] = False
        while self.game_active:
            self.update_game_state()
            self.time_out()
            await channel_layer.group_send(self.room_name, {
                'type': 'send.game.state',
                'game_state': self.game_state
            })
            await asyncio.sleep(1 / fps)
            
        await self.save_game_results()
        
    # set time out for user after disconnection
    def time_out(self):
        to = 10
        for v in self.disconnected.values():
            if v:
                if time.time() - v > to:
                    self.game_active = False
                    self.game_state['over'] = True
                    GameLogic.games_tasks.pop(self.room_name)

    def update_paddle(self, paddle_key):
        if self.keys[paddle_key].get('ArrowUp', False) or self.keys[paddle_key].get('w', False):
            delta_y = -self.game_state['v']
        elif self.keys[paddle_key].get('ArrowDown', False) or self.keys[paddle_key].get('s', False):
            delta_y = self.game_state['v']
        else:
            return

        paddle = self.game_state[paddle_key]
        new_y = paddle['y'] + delta_y
        if 0 <= new_y <= self.game_state['height'] - self.game_state['len']:
            paddle['y'] = new_y

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

        if scored_on == 1:
            ball['x'] = width / 4
            ball['vx'] = self.game_state['v']
        else:
            ball['x'] = width * 0.75
            ball['vx'] = -self.game_state['v']
        ball['y'] = random.random()

    def check_game_over(self):
        paddle1 = self.game_state['paddle1']
        paddle2 = self.game_state['paddle2']
        if paddle1['score'] >= self.game_state['maxScore'] or paddle2['score'] >= self.game_state['maxScore']:
            self.game_state['over'] = True
            self.game_active = False
            
    async def save_game_results(self):
        self.game.player1Score = self.game_state['paddle1']['score']
        self.game.player2Score = self.game_state['paddle2']['score']
        self.game.isOver = True
        if self.game.player1Score > self.game.player2Score:
            self.game.winner = self.user1
        elif self.game.player2Score > self.game.player1Score:
            self.game.winner = self.user2
        
        await database_sync_to_async(self.game.save)()

    def update_game_state(self):
        self.update_ball()
        self.update_paddle('paddle1')
        self.update_paddle('paddle2')