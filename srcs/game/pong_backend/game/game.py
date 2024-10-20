from channels.layers import get_channel_layer
import asyncio
import random
import json
import time
from . models import MultiGame
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async

class GameLogic:
        
    def __init__(self, room_name, user1, user2, friend_match):
        self.room_name = room_name
        self.game_active = True
        self.game = None
        self.disconnected = False
        self.keys = {'paddle1': {}, 'paddle2': {}}
        self.game_state = GameLogic.initialize_game()
        self.game_state['started'] = True
        self.user1 = user1.user
        self.user2 = user2.user
        asyncio.create_task(self.init_task(user1.user, user2.user, room_name, friend_match))
        
    async def init_task(self, user1, user2, room_name, friend_match):
        self.game = await self.create_obj(user1, user2, room_name, friend_match)
        await self.game_loop()
    
    # to fix sync to async compatibility
    async def create_obj(self, user1, user2, room_name, friend_match):
        game = await MultiGame.objects.acreate(
            room_name = room_name,
            friendMatch = friend_match,
            player1 = user1,
            player2 = user2,
        )
        database_sync_to_async(game.players.add)(user1, user2)
        return game

    @staticmethod
    def initialize_game():
        width, height = 1, 1
        game_state = {
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
            'won': False,
            'countdown': True,
            'width': width,
            'height': height,
        }
        return game_state


    async def game_loop(self):
        channel_layer = get_channel_layer()
        fps = 40
        
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
        if self.disconnected:
            self.game_active = False
            self.game_state['over'] = True

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
        # user
        self.game.player1Score = self.game_state['paddle1']['score']
        self.user1.score += self.game_state['paddle1']['score']
        # coalition
        coalition = await sync_to_async(lambda: self.user1.coalition)()
        coalition.score += self.game_state['paddle1']['score']
        await coalition.asave()
        # user
        self.game.player2Score = self.game_state['paddle2']['score']
        self.user2.score += self.game_state['paddle2']['score']
        # coalition
        coalition = await sync_to_async(lambda: self.user2.coalition)()
        coalition.score += self.game_state['paddle2']['score']
        await coalition.asave()
        
        self.game.isOver = True
        if self.game.player1Score > self.game.player2Score:
            self.game.winner = self.user1
            self.user1.wins += 1
            self.user2.losses += 1
        elif self.game.player2Score > self.game.player1Score:
            self.game.winner = self.user2
            self.user2.wins += 1
            self.user1.losses += 1
        
        await self.user1.asave()
        await self.user2.asave()
        await self.game.asave()

    def update_game_state(self):
        self.update_ball()
        self.update_paddle('paddle1')
        self.update_paddle('paddle2')

logicInstances = {}
class TournamentGameLogic:
        
    def __init__(self, room_name, user1, user2, update_method):
        logicInstances[room_name] = self
        self.room_name = room_name
        self.update_method = update_method
        self.game_active = True
        self.game = None
        self.disconnected = False
        self.keys = {'paddle1': {}, 'paddle2': {}}
        self.game_state = GameLogic.initialize_game()
        self.game_state['started'] = True
        self.user1 = user1
        self.user2 = user2
        asyncio.create_task(self.init_loop())

    # to solve sync to async compatibility for model query
    async def init_loop(self):
        self.game = await MultiGame.objects.aget(room_name=self.room_name)
        await self.game_loop()

    @staticmethod
    def initialize_game():
        width, height = 1, 1
        game_state = {
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
            await self.update_game_state()
            await self.time_out()
            await channel_layer.group_send(self.room_name, {
                'type': 'send.game.state',
                'game_state': self.game_state
            })
            await asyncio.sleep(1 / fps)
            
        await self.save_game_results()

    async def get_winner(self):
        if self.game_state['paddle1']['score'] > self.game_state['paddle2']['score']:
            self.game_state['winner'] = self.user1.username
            winner = self.user1
        else:
            self.game_state['winner'] = self.user2.username
            winner = self.user2
        await self.update_method(winner)

    # set time out for user after disconnection
    async def time_out(self):
        if self.disconnected:
            self.game_active = False
            self.game_state['over'] = True
            await self.get_winner()

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

    async def update_ball(self):
        ball = self.game_state['ball']
        await self.check_collision()
        ball['x'] += ball['vx']
        ball['y'] += ball['vy']

    async def check_collision(self):
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

        await self.check_game_over()

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

    async def check_game_over(self):
        paddle1 = self.game_state['paddle1']
        paddle2 = self.game_state['paddle2']
        if paddle1['score'] >= self.game_state['maxScore'] or paddle2['score'] >= self.game_state['maxScore']:
            self.game_state['over'] = True
            self.game_active = False
            await self.get_winner()
            
    async def save_game_results(self):
        # user
        self.game.player1Score = self.game_state['paddle1']['score']
        self.user1.score += self.game_state['paddle1']['score']
        # coalition
        coalition = await sync_to_async(lambda: self.user1.coalition)()
        coalition.score += self.game_state['paddle1']['score']
        await coalition.asave()
        # user
        self.game.player2Score = self.game_state['paddle2']['score']
        self.user2.score += self.game_state['paddle2']['score']
        # coalition
        coalition = await sync_to_async(lambda: self.user2.coalition)()
        coalition.score += self.game_state['paddle2']['score']
        await coalition.asave()
        
        self.game.isOver = True
        if self.game.player1Score > self.game.player2Score:
            self.game.winner = self.user1
            self.user1.wins += 1
            self.user2.losses += 1
        elif self.game.player2Score > self.game.player1Score:
            self.game.winner = self.user2
            self.user2.wins += 1
            self.user1.losses += 1
        
        await self.user1.asave()
        await self.user2.asave()
        await self.game.asave()

    async def update_game_state(self):
        await self.update_ball()
        self.update_paddle('paddle1')
        self.update_paddle('paddle2')


TournamentLogicInstances = {}
class TournamentLogic:
    def __init__(self, room_name, tournament, creator):
        self.room_name = room_name
        self.tournament = tournament
        self.channel_layer = get_channel_layer()
        self.state = {}
        self.n = 0
        self.players = [creator] # user
        self.winners = [] # user
        TournamentLogicInstances[room_name] = self
        self.set_state()

    async def add_user_to_group(self, consumer):
        channel_layer = self.channel_layer
        await consumer.channel_layer.group_add(self.room_name, consumer.channel_name)
        await channel_layer.group_send(self.room_name, {
            'type': 'send.tournament.state',
            'state': self.get_state(),
        })
        if len(self.players) == 4:
            self.tournament.Ongoing = True
            await self.tournament.asave()
            await sync_to_async(self.init_games)()

    async def update_state(self, winner):
        idx = -1
        for i,e in enumerate(self.state['next_games']):
            if winner.username in e:
                idx = i
        if idx != -1:
            del self.state['next_games'][idx]

        self.n += 1
        self.winners.append(winner)
        state = self.get_state()
        await sync_to_async(self.init_games)()
        await self.channel_layer.group_send(self.room_name, {
            'type': 'send.tournament.state',
            'state': state,
        })

    # join game:
    # check if the instance has already started, otherwise, create instance
    async def join_game(self, user, consumer):
        # generate room name given username
        if user in self.winners:
            game_room = self.generate_names(self.state['winners'][:2])
            users = self.winners[:2]
        elif user in self.players[0:2]:
            game_room = self.generate_names(self.state['players'][:2])
            users = self.players[:2]
        else:
            game_room = self.generate_names(self.state['players'][2:])
            users = self.players[2:]
        # check if game instance already exists
        instance = logicInstances.get(game_room, None)
        consumer.role = 'paddle1' if user == users[0] else 'paddle2'
        await consumer.send(text_data=json.dumps({
            'users_data': True,
            'user1': users[0].username,
            'user1img': users[0].profile_image,
            'user2': users[1].username,
            'user2img': users[1].profile_image,
        }))
        if instance:
            # call function to send users data
            await consumer.channel_layer.group_add(game_room, consumer.channel_name)
            consumer.gameLogic = instance
        else:
            await consumer.channel_layer.group_add(game_room, consumer.channel_name)
            consumer.gameLogic = TournamentGameLogic(game_room, *users, self.update_state)


    def get_next_games(self):
        if len(self.players) == 4 and not self.n:
            players = [e.username for e in self.players]
            self.state['next_games'] = [players[0:2],players[2:]]
        elif self.n == 2:
            self.state['next_games'] = [[e.username for e in self.winners]]
        else:
            self.state['next_games'] = self.state.get('next_games', [])


    def set_state(self):
        self.state['players'] = [e.username for e in self.players]
        self.state['winners'] = [e.username for e in self.winners]
        self.state['n'] = self.n
        self.state['play'] = True

        self.get_next_games()

    def get_state(self):
        self.set_state()
        return self.state

    def init_games(self):
        if not self.n:
            game = MultiGame.objects.create(room_name = self.generate_names(self.state['players'][0:2]), player1=self.players[0], player2=self.players[1])
            game.players.add(*self.players[0:2])
            game = MultiGame.objects.create(room_name = self.generate_names(self.state['players'][2:]), player1=self.players[2], player2=self.players[3])
            game.players.add(*self.players[2:])            
        elif self.n == 2:
            game = MultiGame.objects.create(room_name = self.generate_names(self.state['winners']), player1=self.winners[0], player2=self.winners[1])
            game.players.add(*self.winners)

    def generate_names(self, players):
        return f'{players[0]}-{players[1]}-{self.room_name}'