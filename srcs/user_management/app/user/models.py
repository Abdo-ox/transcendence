from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

class UserManager(BaseUserManager):
    def create_user(self,username, password=None, **data):
        print(f"\33[32;1mthe usercreation called\33[0m")
        if not username:
            raise ValueError('User must have username')
        if not data or 'email' not in data:
            raise ValueError('User must have email address')
        user = self.model(
            email = self.normalize_email(data['email']),
            username = username,
            first_name = data['first_name'],
            last_name = data['last_name']
        )
        if password:
            user.set_password(password)
        user.save(using=self._db)
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
    profile_image = models.ImageField(max_length=255)
    hide_email    = models.BooleanField(default=True)

    USERNAME_FIELD  = 'username'
    REQUIRED_FIELDS = ['email', 'first_name', 'last_name']

    objects = UserManager()

    def __str__(self):
        return self.username

    def get_profile_image_filename(self):
        return str(self.profile_image)[str(self.profile_image).index('profile_images/' + str(self.pk) + "/"):]

    def has_perm(self, perm, obj=None):
        return self.is_admin

    def has_module_perms(self, app_label):
        return True
