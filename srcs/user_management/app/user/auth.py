from django.contrib.auth.backends import BaseBackend
from user.models import User

class MyBackend(BaseBackend):
    def authenticate(self, request, username, password=None):
        try:
            user = User.objects.get(username=username)
            if password and not user.check_password(password):
                return None
            return user
        except User.DoesNotExist:
            return None

    def get_user(self,user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
