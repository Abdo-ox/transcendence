from django.shortcuts import render, redirect
from user.models import User 
from .serializer import UserSerializer
from django.http import JsonResponse, HttpResponse
from django.middleware.csrf import get_token
from rest_framework.decorators import api_view
from django.conf import settings
from .settings import C as c
import os 

@api_view(['GET'])
def getCsrfToken(request):
    token = get_token(request)
    print(f"csrf_token:{token}", flush=True)
    return JsonResponse({'csrf_token': token})

@api_view(['GET'])
def home(request):
    (f"{c.g}{request.user.username}{c.d}")
    context = {}
    if request.user.is_authenticated: #request.user.friend_list.friends.all()
        users = User.objects.exclude(username=request.user.username)
        context['users'] =  users
        return render(request, 'home.html', context)
    else:
        return redirect('login')

def uploadProfileImage(request):
    print("csrf_token:", getCsrfToken())
    if request.method == 'POST':
        if 'file' in request.FILES:
            uploaded_file = request.FILES['file']
            file_path = os.path.join(settings.MEDIA_ROOT, uploaded_file.name)
            print("filePath:", file_path, flush=True)
            with open(file_path, 'wb+') as destination:
                for chunk in uploaded_file.chunks():
                    destination.write(chunk)
            return HttpResponse('File uploaded successfully')
        else:
            return HttpResponse('No file uploaded', status=400)
    else:
        return HttpResponse('Invalid request method', status=405)

def UserData(request):
    users = User.objects.all()
    seriaUsers = UserSerializer(users, many=True)
    return JsonResponse({'users': [seriaUsers.data]})

def sendOauthData(request):
    conf = settings.OAUTH_CONFIG['42']
    params = {
        'base_url': conf['base_url'],
        'app': {
            'redirect_uri': conf['redirect_uri'],
            'client_id': conf['client_id'],
            'response_type': 'code'
        }
    }
    return JsonResponse(params)


@api_view(['POST'])
def uploadProfileImage(request):
    if request.method == 'POST':
        if 'file' in request.FILES:
            uploaded_file = request.FILES['file']
            file_path = os.path.join(settings.MEDIA_ROOT, uploaded_file.name)
            print("filePath:", file_path, flush=True)
            with open(file_path, 'wb+') as destination:
                for chunk in uploaded_file.chunks():
                    destination.write(chunk)
            return HttpResponse('File uploaded successfully')
        else:
            return HttpResponse('No file uploaded', status=400)
    else:
        return HttpResponse('Invalid request method', status=405)