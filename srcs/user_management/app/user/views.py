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
    if form.is_valid():
        password = form.cleaned_data['password1']
        user = form.save()
        user.set_password(password)
        user.save()
        print(c.g, f"{user.username}\n{password}\n", c.d)
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
    access_token = AccessToken.for_user(user)
    access_token['provider'] = '42'
    print("access token is : ", access_token, flush=True)
    return {'access': str(access_token)}

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
                'profile_image': data['image']['versions']['medium'],
            }
            print("DATA debug is here *************", flush=True)
            user = User.objects.create_user(data['login'], None, **info_usr)
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
    user = request.user
    print("user:", user, flush=True)
    return JsonResponse({"usename": user.username,
                        #  "profile_image": user.profile_image
    })
