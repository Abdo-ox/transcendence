from django.shortcuts import render, redirect
from user.forms import RegisterationForm, LoginForm
from django.contrib.auth import authenticate, login, logout
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
import urllib.parse
import requests
import json
from user.models import User
from django.http import JsonResponse
from project.settings import C as c
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from django.views.decorators.csrf import csrf_exempt
from requests.auth import HTTPBasicAuth
from .serializers import UserSerializer, ChatUserSerializer, AccountSerializer
from django.http import HttpResponse
from django.utils.crypto import get_random_string
import os
from pathlib import Path
from friendship.models import FriendList

@api_view(['POST'])
def Login(request):
    data = json.loads(request.body)
    form = LoginForm(data)
    if form.is_valid():
        username = form.cleaned_data.get('username')
        password = form.cleaned_data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            login(request, user)
            return redirect('/home.html')
    errors = form.errors.as_json()
    return JsonResponse(json.loads(errors))

@api_view(['POST'])
def Register(request):
    form = RegisterationForm(request.data)
    print(f"{request.data}", flush=True)
    if form.is_valid():
        User.objects.create_user(form.cleaned_data['username'], False, form.cleaned_data['password1'],**{
                'email':form.cleaned_data['email'],
                'first_name':form.cleaned_data['first_name'],
                'last_name':form.cleaned_data['last_name'],
            })
        return JsonResponse({"state": "registered"})
    errors = json.loads(form.errors.as_json())
    all_errors = []
    for fieldErrors in errors.values():
        for error in fieldErrors:
            all_errors.append(error.get('message'))
    print(c.r, all_errors, c.d)
    return JsonResponse({'errors': all_errors})

def printJsonData(data):
    for key, value in data.items():
        if isinstance(value, dict):
            print(f"{c.g} {key}:")
            printJsonData(value)
        else:
            print(f"{c.b}{key}: {value}")

def create_jwt_for_Oauth(user):
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
            print(data['login'], flush=True)
            print(data['first_name'], flush=True)
            print(data['last_name'], flush=True)
            print(data['email'], flush=True)
            user = authenticate(username=data['login'])
            if user:
                return(JsonResponse(create_jwt_for_Oauth(user)))
            info_usr = {
                'email': data['email'],
                'first_name': data['first_name'],
                'last_name': data['last_name'],
                'profile_image': data['image']['versions']['small'],
            }
            print("DATA debug is here *************", flush=True)
            user = User.objects.create_user(data['login'], True, None, **info_usr)
            return JsonResponse(create_jwt_for_Oauth(user))
        return JsonResponse({'error': 'cannot log with 42 intranet please try again'})
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON in request body'}, status=400)

def Logout(request):
    logout(request)
    return redirect('login')

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sendUserData(request):
    serializer = ChatUserSerializer(request.user)
    return JsonResponse(serializer.data, safe=False)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sendSuggestionFriend(request):
    users = User.objects.exclude(username=request.user.username)
    friend_list, created = FriendList.objects.get_or_create(user=request.user)
    friends = friend_list.friends.all()
    users = users.exclude(id__in=friends)
    context = {'user': request.user}
    print(c.y, "Context being passed to serializer:", context)
    serializer = UserSerializer(users, many=True, user=request.user)
    currentUser = UserSerializer(request.user)
    return JsonResponse({'currentUser':currentUser.data,'suggestions':serializer.data}, safe=False)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def accountSettings(request):
    print("hello get current user", flush=True)
    currentUser = AccountSerializer(request.user)
    return JsonResponse({'current':currentUser.data}, safe=False)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def UploadProfile(request):
    if 'image' in request.FILES:
        uploaded_file = request.FILES['image']
        print(f"{uploaded_file.name}", flush=True)
        file_name = get_random_string(6)+ "_" + str(request.user.username) + Path(uploaded_file.name).suffix
        file_path = os.path.join(settings.MEDIA_ROOT, file_name)
        file_url = "https://localhost:8000/media/" + file_name
        print("filePath:", file_path, flush=True)
        with open(file_path, 'wb+') as destination:
            for chunk in uploaded_file.chunks():
                destination.write(chunk)
        print("user profile image", request.user.profile_image, flush=True)
        request.user.profile_image = file_url
        request.user.save()
        print("user profile image", request.user.profile_image, flush=True)
        return JsonResponse({'File uploaded successfully' : 'status'})
    else:
        return JsonResponse({'No file uploaded': 'status'})

