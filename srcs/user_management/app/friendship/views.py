from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from .models import FriendList, FriendRequest
from django.contrib.auth import authenticate
from project.settings import C as c
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from user.models import User
from user.serializers import CurrentSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def acceptFriendRequest(request):
    try:
        username = request.GET.get('username')
        if not username:
            return JsonResponse({'error': 'pear username not send at the query string'}, status=400)
        user = User.objects.get(username=username)
        try:
            friend_request = FriendRequest.objects.get(sender=user, receiver=request.user, is_active=True)
            friend_request.accept()
            return JsonResponse({})
        except FriendRequest.DoesNotExist:
            return JsonResponse({'error': f'there is no friend request sender: {user} reciever: {request.user}'}, status=403)
    except User.DoesNotExist:
        return JsonResponse({'error': f'there is no user ander username {username}'}, status=403)
 
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
            return JsonResponse({'error': f'there is no friend request sender: {request.user} reciever: {user}'}, status=403)
    except User.DoesNotExist:
        return JsonResponse({'error': f'there is no user ander username {username}'}, status=403)

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
            return JsonResponse({'error': f'there is no friend request sender: {user} reciever: {request.user}'}, status=403)
    except User.DoesNotExist:
        return JsonResponse({'error': f'there is no user ander username {username}'}, status=403)
      
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def createFriendRequest(request):
    try:
        username = request.GET.get('username')
        if not username:
            return JsonResponse({'error': 'pear username not send at the query string'}, status=400)
        user = User.objects.get(username=username)
        friend_list, created = FriendList.objects.get_or_create(user=user)
        if request.user in friend_list.friends.all():
            return JsonResponse({'error': '${request.user}, {username} already friends'}, status=400)
        t, created = FriendRequest.objects.get_or_create(sender=request.user, receiver=user)
        t.is_active = True
        t.save()
        return JsonResponse({})
    except User.DoesNotExist:
        return JsonResponse({'error': f'there is no user ander username {username}'}, status=403)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sendFriendRequests(request):
    ids = FriendRequest.objects.filter(receiver=request.user, is_active=True).values_list('sender', flat=True)
    senders = User.objects.filter(id__in=ids)
    if senders.exists():
        data = CurrentSerializer(senders, many=True)
        return JsonResponse(data.data, safe=False)
    return JsonResponse([], safe=False)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unFriend(request):
    try:
        username = request.GET.get('username')
        if not username:
            return JsonResponse({'error': 'pear username not send at the query string'}, status=400)
        user = User.objects.get(username=username)
        friend_list, created = FriendList.objects.get_or_create(user=user)
        if request.user not in friend_list.friends.all():
            return JsonResponse({'error': '${request.user}, {username} are not friends'}, status=400)
        friend_list.unfriend(request.user)
        # freind_list.save()
        return JsonResponse({})
    except User.DoesNotExist:
        return JsonResponse({'error': f'there is no user ander username {username}'}, status=403)