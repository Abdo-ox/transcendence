from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from .models import FriendList, FriendRequest
from django.contrib.auth import authenticate
from project.settings import C as c
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from user.models import User
from .serializers import FriendRequestSerializer
from django.core.exceptions import ValidationError
from .serializers import UserSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def acceptFriendRequest(request):
    try:
        print(c.r, "enter to accept", flush=True)
        username = request.GET.get('username')
        if not username:
            return JsonResponse({'error': 'pear username not send at the query string'})
        user = User.objects.get(username=username)
        try:
            friend_request = FriendRequest.objects.get(sender=user, receiver=request.user, is_active=True)
            friend_request.accept()
            return JsonResponse({})
        except FriendRequest.DoesNotExist:
            return JsonResponse({'error': f'there is no friend request sender: {user} reciever: {request.user}'})
    except User.DoesNotExist:
        return JsonResponse({'error': f'there is no user ander username {username}'})
 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cancelFriendRequest(request):
    try:
        username = request.GET.get('username')
        if not username:
            return JsonResponse({'error': 'pear username not send at the query string'},status=400)
        user = User.objects.get(username=username)
        try:
            friend_request = FriendRequest.objects.get(sender=request.user, receiver=user, is_active=True)
            friend_request.cancel()
            return JsonResponse({})
        except FriendRequest.DoesNotExist:
            return JsonResponse({'error': f'there is no friend request sender: {request.user} reciever: {user}'})
    except User.DoesNotExist:
        return JsonResponse({'error': f'there is no user ander username {username}'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def declineFriendRequest(request):
    try:
        username = request.GET.get('username')
        if not username:
            return JsonResponse({'error': 'pear username not send at the query string'},status=400)
        user = User.objects.get(username=username)
        try:
            friend_request = FriendRequest.objects.get(sender=user, receiver=request.user, is_active=True)
            friend_request.decline()
            return JsonResponse({})
        except FriendRequest.DoesNotExist:
            return JsonResponse({'error': f'there is no friend request sender: {user} reciever: {request.user}'})
    except User.DoesNotExist:
        return JsonResponse({'error': f'there is no user ander username {username}'})
      
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def createFriendRequest(request):
    try:
        username = request.GET.get('username')
        if not username:
            return JsonResponse({'error': 'pear username not send at the query string'})
        user = User.objects.get(username=username)
        friend_list, created = FriendList.objects.get_or_create(user=user)
        if request.user in friend_list.friends.all():
            return JsonResponse({'error': '${request.user}, {username} already friends'})
        try:
            t, created = FriendRequest.objects.get_or_create(sender=request.user, receiver=user)
            t.is_active = True
            t.save()
        except ValidationError as e:
            return JsonResponse({'error': f'{e}'})
        return JsonResponse({})
    except User.DoesNotExist:
        return JsonResponse({'error': f'there is no user ander username {username}'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sendFriendRequests(request):
    ids = FriendRequest.objects.filter(receiver=request.user, is_active=True).values_list('sender', flat=True)
    senders = User.objects.filter(id__in=ids)
    if senders.exists():
        data = FriendRequestSerializer(senders, many=True, context={'user': request.user})
        return JsonResponse(data.data, safe=False)
    return JsonResponse([], safe=False)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unFriend(request):
    try:
        username = request.GET.get('username')
        if not username:
            return JsonResponse({'error': 'pear username not send at the query string'})
        user = User.objects.get(username=username)
        friend_list, created = FriendList.objects.get_or_create(user=user)
        if request.user not in friend_list.friends.all():
            return JsonResponse({'error': '${request.user}, {username} are not friends'})
        friend_list.unfriend(request.user)
        return JsonResponse({})
    except User.DoesNotExist:
        return JsonResponse({'error': f'there is no user ander username {username}'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def userFriends(request):
    try:
        username = request.GET.get('username')
        if not username:
            return JsonResponse({'error': 'pear username not send at the query string'})
        user = User.objects.get(username=username)
        context = {
            'friends': FriendList.objects.get_or_create(user=request.user)[0].friends
        }
        friends = UserSerializer(FriendList.objects.get_or_create(user=user)[0].friends.exclude(id=request.user.id), many=True, context=context)       
        return JsonResponse(friends.data, safe=False)
    except User.DoesNotExist:
        return JsonResponse({'error': f'there is no user ander username {username}'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def makeFreindRequestReaded(request):
    friend_requests = FriendRequest.objects.filter(receiver=request.user, is_active=True)
    for friend_request in friend_requests:
        friend_request.is_read = True
        friend_request.save()
    return JsonResponse({})