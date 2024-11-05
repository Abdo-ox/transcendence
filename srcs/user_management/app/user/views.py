from django.shortcuts import render, redirect
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
import urllib.parse
import requests
import json
from django.http import JsonResponse
from project.settings import C as c
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from django.views.decorators.csrf import csrf_exempt
from requests.auth import HTTPBasicAuth
from django.http import HttpResponse
from django.utils.crypto import get_random_string
import os
from pathlib import Path
from project.decorators import TwoFctor_Decorator
from django.db import IntegrityError

from friendship.models import FriendList
from user.models import User, Coalition

from user.forms import (RegisterationForm,
LoginForm,
EditUserForm
)
from .serializers import(UserSerializer,
ChatUserSerializer,
AccountSerializer,
CurrentSerializer,
SuggestionSerializer,
CoalitionSerializer
)  

@api_view(['POST'])
def Register(request):
    if request.headers.get('Content-Type') != "application/json":
        return JsonResponse({'error': ['Content-Type must be application/json']}, status=415)
    try:
        data = json.loads(request.body)
        if type(data) != dict:
            return JsonResponse({'error' : 'Invalid JSON format'}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({'error' : 'Invalid JSON format'}, status=400)
    form = RegisterationForm(data)
    if form.is_valid():
        try:
            User.objects.create_user(form.cleaned_data['username'], False, form.cleaned_data['password1'],**{
                    'email':form.cleaned_data['email'],
                    'first_name':form.cleaned_data['first_name'],
                    'last_name':form.cleaned_data['last_name'],
                })
            return JsonResponse({"state": "registered"})
        except (IntegrityError) as e:
            return JsonResponse({'errors': [str(e)]})
    errors = json.loads(form.errors.as_json())
    all_errors = []
    for fieldErrors in errors.values():
        for error in fieldErrors:
            all_errors.append(error.get('message'))
    return JsonResponse({'errors': all_errors})

def printJsonData(data):
    for key, value in data.items():
        if isinstance(value, dict):
            print(f"{c.g} {key}:")
            printJsonData(value)
        else:
            print(f"{c.b}{key}: {value}")

def create_jwt_for_Oauth(user):
    print(c.y, "create jwt token", flush=True)
    refreshToken = RefreshToken.for_user(user)
    accessToken = refreshToken.access_token
    return {'access': str(accessToken),
            'refresh':str(refreshToken)
            }

@api_view(['POST'])
def Oauth_42_callback(request):
    try:
        data = json.loads(request.body)
        code = data.get('code')
        conf = settings.OAUTH_CONFIG['42']
        params = {
            'client_id': conf['client_id'],
            'client_secret': conf['client_secret'],
            'grant_type': 'authorization_code',
            'redirect_uri': conf['redirect_uri'],
            'code': code
        }
        headers = {'Content-Type': 'application/json'}
        response = requests.post(
            conf['token_url'], 
            json=params, 
            headers=headers
        )
        if response.status_code == 200:
            access_token = response.json()['access_token']
            response = requests.get(conf['info_url'], params={'access_token': access_token})
            data = response.json()
            try:
                user = User.objects.get(username=data['login'])
                return(JsonResponse(create_jwt_for_Oauth(user)))
            except User.DoesNotExist:
                info_usr = {
                    'email': data['email'],
                    'first_name': data['first_name'],
                    'last_name': data['last_name'],
                    'profile_image': data['image']['versions']['medium'],
                }
                user = User.objects.create_user(data['login'], True, None, **info_usr)
                return JsonResponse(create_jwt_for_Oauth(user))
        return JsonResponse({'error': 'cannot log with 42 intranet please try again'})
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON in request body'}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sendUserData(request):
    serializer = ChatUserSerializer(request.user)
    return JsonResponse(serializer.data, safe=False)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def GetUserStatus(request):
    username = request.query_params.get('username')
    user = User.objects.get(username=username)
    print('username is :  ', user.username)
    print('and status is :  ', user.is_online)
    return JsonResponse({'is_online': user.is_online}, status=200)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@TwoFctor_Decorator
def sendSuggestionFriend(request):
    users = User.objects.exclude(id=request.user.id)
    friend_list, created = FriendList.objects.get_or_create(user=request.user)
    friends = friend_list.friends.all()
    suggestions = users.exclude(id__in=friends)
    if request.user.receiver.exists():
        suggestions = suggestions.exclude(id__in=request.user.receiver.filter(is_active=True).values_list('sender_id', flat=True))
    if request.user.sender.exists():
        suggestions = suggestions.exclude(id__in=request.user.sender.filter(is_active=True).values_list('receiver_id', flat=True))
    currentUser = UserSerializer(request.user)
    if suggestions.exists():
        serializer = SuggestionSerializer(suggestions, many=True, user=request.user)
        return JsonResponse({'currentUser':currentUser.data, 'suggestions':serializer.data}, safe=False)
    else:
        return JsonResponse({'currentUser':currentUser.data, 'suggestions': []})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@TwoFctor_Decorator
def accountSettings(request):
    currentUser = AccountSerializer(request.user)
    return JsonResponse(currentUser.data, safe=False)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@TwoFctor_Decorator
def currentUserData(request):
    curentuser = CurrentSerializer(request.user)
    return JsonResponse(curentuser.data)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@TwoFctor_Decorator
def UploadProfile(request):
    if 'image' in request.FILES:
        uploaded_file = request.FILES['image']
        file_name = get_random_string(6) + "_" + str(request.user.username) + Path(uploaded_file.name).suffix
        file_path = os.path.join(settings.MEDIA_ROOT, file_name)
        file_url = "https://localhost:8000/media/" + file_name
        with open(file_path, 'wb+') as destination:
            for chunk in uploaded_file.chunks():
                destination.write(chunk)
        request.user.profile_image = file_url
        request.user.save()
    return JsonResponse({"clear":"ok"},status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@TwoFctor_Decorator
def updateData(request):
    editedData = request.data
    form = EditUserForm(editedData,instance=request.user)
    if(form.is_valid()):
        form.save()
        return JsonResponse({"data":"edited"})   
    else:
        print("errors", form.errors,flush=True)
        return JsonResponse({"data":"error"})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def EnableTwoFactor(request):
    print("hello world",flush= True)
    body_data = json.loads(request.body)  # No decoding here
    enable = body_data.get('is_2Fa_enabled')
    request.user.enable2fa = enable
    request.user.save()
    return JsonResponse({"status" : "success"},status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@TwoFctor_Decorator
def UpdatePassword(request):
    body_data = json.loads(request.body)
    actualpass = body_data.get('actualPassword')
    newpassword = body_data.get('newPassword')
    if(request.user.check_password(actualpass)):
        request.user.set_password(newpassword)
        request.user.save()
        return JsonResponse({"status":"success"},status=200)
    return JsonResponse({"status": "failed"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def UpdateisPassed(request):
    print("is2passed : ",request.user.is_2fa_passed,flush=True )
    if(request.user.is_2fa_passed):
        request.user.is_2fa_passed = False
        request.user.save()
        return JsonResponse({"status":"ok"},status=200)
    return JsonResponse({"status":"also ok"},status=200)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def coalitions(request):
    coalitions = Coalition.objects.all()
    coalitions = CoalitionSerializer(coalitions, many=True)
    return JsonResponse(coalitions.data, safe=False)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def coalition(request):
    coalition = CoalitionSerializer(request.user.coalition)
    return JsonResponse(coalition.data)