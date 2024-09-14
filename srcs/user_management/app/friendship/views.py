from django.shortcuts import render
from django.http import HttpResponse
from .models import FriendList, FriendRequest
from django.contrib.auth import authenticate
from project.settings import C as c
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from user.models import User

def createFreindRelation(request):
    username1=request.GET.get('user1')
    username2=request.GET.get('user2')
    user1 = authenticate(username=username1)
    user2 = authenticate(username=username2)
    print(f"{c.b}user1:{user1}, user2:{user2}", flush=True)
    friend_list1, created1 = FriendList.objects.get_or_create(user=user1)
    friend_list2, created2 = FriendList.objects.get_or_create(user=user2)
    friend_list1.addFriend(user2)
    friend_list2.addFriend(user1)
    # print(c.g, user1.friends, flush=True)
    for fiend in user1.friends.all():
        print(fiend, flush=True)
    return HttpResponse("added to its friendlit")

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def createFriendRequest(request):
    user = User.objects.get(username=request.GET.get('username'))
    t, created = FriendRequest.objects.get_or_create(sender=request.user, receiver=user)
    t.is_active = True
    t.save()
    return HttpResponse("ok")