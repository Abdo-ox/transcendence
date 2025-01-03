from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from project.settings import C as c

class UserManager(BaseUserManager):
    def create_user(self,username, intra=False, password=None, **data):
        if not username:
            raise ValueError('User must have username')
        if not data or 'email' not in data:
            raise ValueError('User must have email address')
        number, yes = AddCoalition.objects.get_or_create(id=1)
        user = self.model(
            email = self.normalize_email(data['email']),
            username = username,
            first_name = data['first_name'],
            last_name = data['last_name'],
            profile_image = data.get('profile_image', '/images/profile_images/unkown.jpg'),
            intraNet = intra,
            coalition = Coalition.objects.get(id=number.add)
        )
        number.add = number.add + 1
        if number.add > 3:
            number.add = 1
        number.save()
        if password:
            user.set_password(password)
        user.save(using=self._db)
        contact, created = Contact.objects.get_or_create(user=user)
        return user

    def create_superuser(self, username, password, **data):
        user = self.create_user(
            username,
            False,
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
    profile_image = models.TextField(max_length=255, blank=True, default='/images/profile_images/unkown.jpg')
    hide_email    = models.BooleanField(default=True)
    intraNet      = models.BooleanField(default=False)
    is_2fa_passed = models.BooleanField(default=False)
    Twofa_Code    = models.BigIntegerField(default=0)
    enable2fa     = models.BooleanField(default=False)
    reset_Code    = models.BigIntegerField(default=0)
    MailConfirmation = models.BigIntegerField(default=0)
    coalition     = models.ForeignKey('Coalition', related_name='users', on_delete=models.CASCADE)
    score         = models.IntegerField(default=0)
    totalGames    = models.IntegerField(default=0)
    wins          = models.IntegerField(default=0)
    losses        = models.IntegerField(default=0)
    is_online     = models.BooleanField(default=False)
    last_score    = models.IntegerField(default=0)

    class Meta:
        db_table = 'user'

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
    user = models.OneToOneField(User, related_name='user_friends', on_delete=models.CASCADE)
    # friends = models.ManyToManyField('self', blank=True)
    def __str__(self):
        return self.user.username


class Message(models.Model):
    class Meta:
        db_table = 'message'
    contact = models.ForeignKey(Contact, related_name='messages', on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.contact.user.username


class Chat(models.Model):
    class Meta:
        db_table = 'chat'
    participants = models.ManyToManyField(Contact, related_name='chats')
    messages = models.ManyToManyField(Message, blank=True)

    def __str__(self): 
        return "{}".format(self.pk)

class Coalition(models.Model):
    name = models.TextField(default='')
    score = models.PositiveIntegerField(default=0)
    image = models.TextField(default='')

    class Meta:
        db_table = 'coalition'

class AddCoalition(models.Model):
    add = models.PositiveIntegerField(default=1)

    class Meta:
        db_table = 'addcoalition'