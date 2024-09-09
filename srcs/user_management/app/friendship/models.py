from django.db import models
from django.conf import settings
from django.utils import timezone


class FriendList(models.Model):
    user                = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="user")
    friends             = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, related_name="friends")

    class Meta:
        db_table = 'friendlist'

    def __str__(self):
        return self.user.username

    def addFriend(self, account):
        if account not in self.friends.all():
            print("add friend method called", flush=True)
            self.friends.add(account)

    def removeFriend(self, account):
        if account in self.friends.all():
            self.friends.remove(account)

    def unfriend(self, removee):
        self.removeFriend(removee)
        friend = frinedship.objects.get(user=removee)
        friend.removeFriend(self.user)
    
    def is_mutual_friend(self, friend):
        if friend in self.friends.all():
            return True
        return False

class FriendRequest(models.Model):
    sender              = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sender")
    receiver            = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="receiver")
    is_active           = models.BooleanField(blank=True, null=False,default=True)
    timestamp           = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.sender.username

    def accept(self):
        recieverList = friendlist.objects.get(user=self.receiver)
        if recieverList:
            recieverList.addFreind(self.sender)
            senderList = friendlist.objects.get(user=self.sender)
            if senderList:
                senderList.addFreind(self.receiver)
                self.is_active = False
                self.save()
    
    def decline(self):
        self.is_active = False
        self.save()

    def cancel(self):
        self.is_active = False
        self.save()  
