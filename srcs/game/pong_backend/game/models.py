from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

class UserManager(BaseUserManager):
    def create_user(self,username, intra=False, password=None, **data):
        print(f"\33[32;1mthe usercreation called\33[0m", flush=True)
        if not username:
            raise ValueError('User must have username')
        if not data or 'email' not in data:
            raise ValueError('User must have email address')
        user = self.model(
            email = self.normalize_email(data['email']),
            username = username,
            first_name = data['first_name'],
            last_name = data['last_name'],
            profile_image = data.get('profile_image', 'https://localhost/home/profile_images/unkown.jpg'),
            intraNet = intra
        )
        if password:
            user.set_password(password)
        user.save(using=self._db)
        contact, created = Contact.objects.get_or_create(user=user)
        print(f"Contact created: {created}, Contact: {contact}", flush=True)  # Debugging output
        return user

    def create_superuser(self, username, password, **data):
        print(f"\33[31;1mthe superusercreation called\33[0m")
        user = self.create_user(
            username,
            password,
            **data
        )
        user.is_staff = True
        user.is_superuser = True
        user.is_admin = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser):
    first_name    = models.CharField(verbose_name="first_name", max_length=20, default='')
    last_name     = models.CharField(verbose_name="last_name", max_length=20, default='')
    email         = models.EmailField(verbose_name="email", unique=True, max_length=60)
    username      = models.CharField(verbose_name="username", unique=True, max_length=60)
    date_joined   = models.DateTimeField(verbose_name="date joined", auto_now_add=True)
    last_joined   = models.DateTimeField(verbose_name="last joined", auto_now=True)
    is_admin      = models.BooleanField(default=False)
    is_active     = models.BooleanField(default=True)
    is_staff      = models.BooleanField(default=False)
    is_superuser  = models.BooleanField(default=False)
    profile_image = models.TextField(max_length=255, blank=True, default='https://localhost/home/profile_images/unkown.jpg')
    hide_email    = models.BooleanField(default=True)
    intraNet      = models.BooleanField(default=False)
    class Meta:
        db_table = 'user'
        managed = False

    USERNAME_FIELD  = 'username'
    REQUIRED_FIELDS = ['email', 'first_name', 'last_name']
       
    objects = UserManager()

    def __str__(self):
        return self.username

    def has_perm(self, perm, obj=None):
        return self.is_admin

    def has_module_perms(self, app_label):
        return True


class Contact(models.Model):

    class Meta:
        db_table = 'contact'
        managed = False
    user = models.ForeignKey(User, related_name='user_friends', on_delete=models.CASCADE)
    # friends = models.ManyToManyField('self', blank=True)
    def __str__(self):
        return self.user.username

# Create your models here.
class Game(models.Model):
    player = models.ForeignKey(User, related_name='games', on_delete=models.CASCADE)
    aiScore = models.IntegerField(default=0)
    playerScore = models.IntegerField(default=0)
    won = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table='game'
    
class Tournament(models.Model):
    name = models.CharField(max_length=100, default='')
    players = models.ManyToManyField(User, related_name='tournaments')
    winner = models.ForeignKey(User, related_name='wonTournaments', null=True, blank=True, on_delete=models.DO_NOTHING)
    
    class Meta:
        db_table='tournament'

class MultiGame(models.Model):
    # fix related name
    players = models.ManyToManyField(User, related_name='multiPlayerGames')
    player2Score = models.IntegerField(default=0)
    player1Score = models.IntegerField(default=0)
    # to change to charfield later
    room_name = models.TextField(default='')
    tournaments = models.ForeignKey(Tournament, related_name='games', null=True, blank=True, on_delete=models.DO_NOTHING)
    winner = models.ForeignKey(User, related_name='wonGames', null=True, blank=True, on_delete=models.DO_NOTHING)
    isOver = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
        
    class Meta:
        db_table='multigame'