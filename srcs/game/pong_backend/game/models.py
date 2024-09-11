from django.db import models

# Create your models here.
class Game(models.Model):
    player = models.ForeignKey('auth.User', related_name='games', on_delete=models.CASCADE)
    aiScore = models.IntegerField(default=0)
    playerScore = models.IntegerField(default=0)

    won = models.BooleanField(default=False)
    
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    
class Tournament(models.Model):
    name = models.CharField(max_length=100, default='')
    players = models.ManyToManyField('auth.User', related_name='tournaments')
    winner = models.ForeignKey('auth.User', related_name='wonTournaments', null=True, blank=True, on_delete=models.DO_NOTHING)

class MultiGame(models.Model):
    # fix related name
    players = models.ManyToManyField('auth.User', related_name='multiPlayerGames')
    player2Score = models.IntegerField(default=0)
    player1Score = models.IntegerField(default=0)
    
    # to change to charfield later
    room_name = models.TextField(default='')
    
    tournaments = models.ForeignKey(Tournament, related_name='games', null=True, blank=True, on_delete=models.DO_NOTHING)
    
    winner = models.ForeignKey('auth.User', related_name='wonGames', null=True, blank=True, on_delete=models.DO_NOTHING)
    isOver = models.BooleanField(default=False)
    
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)