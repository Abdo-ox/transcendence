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
        print(c.b, "friend", username, flush=True)
        if not username:
            return JsonResponse({'error':'user name of the sender not sent to backend !'}, status=400)
        user = User.objects.get(username=username)
        try:
            friend_request = FriendRequest.objects.get(sender=user, receiver=request.user, is_active=True)
            friend_request.accept()
            return JsonResponse({'error':'ok'})
        except FriendRequest.DoesNotExist:
            return JsonResponse({'error':'Forbidden'}, status=403)
    except User.DoesNotExist:
        return JsonResponse({'error':'send user not exist !'}, status=403)
 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cancelFriendRequest(request):
    try:
        username = request.GET.get('username')
        if not username:
            return HttpResponse('Bad request',status=400)
        user = User.objects.get(username=username)
        try:
            friend_request = FriendRequest.objects.get(sender=request.user, receiver=user, is_active=True)
            friend_request.cancel()
            return HttpResponse('ok')
        except FriendRequest.DoesNotExist:
            return HttpResponse('Forbidden', status=403)
    except User.DoesNotExist:
        return HttpResponse('Forbidden', status=403)
       
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def createFriendRequest(request):
    print(c.c, "createFriendRequestCalled", flush=True)
    try:
        print(c.g, f"user:{request.GET.get('username')}", flush=True)
        username = request.GET.get('username')
        if not username:
            return HttpResponse('Bad request',status=400)
        user = User.objects.get(username=username)
        friend_list, created = FriendList.objects.get_or_create(user=user)
        if request.user in friend_list.friends.all():
            raise User.DoesNotExist('')
        t, created = FriendRequest.objects.get_or_create(sender=request.user, receiver=user)
        t.is_active = True
        t.save()
        return HttpResponse("ok")
    except User.DoesNotExist:
        return HttpResponse("Forbidden", status=403)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sendFriendRequests(request):
    ids = FriendRequest.objects.filter(receiver=request.user, is_active=True).values_list('sender', flat=True)
    print(c.r, "ids", ids, flush=True)
    
    senders = User.objects.filter(id__in=ids)
    print(c.r, "senders", senders, flush=True)
    if senders.exists():
        data = CurrentSerializer(senders, many=True)
        return JsonResponse(data.data, safe=False)
    return JsonResponse([], safe=False)