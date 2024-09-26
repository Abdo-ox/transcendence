from django.shortcuts import render, redirect
from user.models import User 
from .serializer import UserSerializer
from django.http import JsonResponse, HttpResponse
from django.middleware.csrf import get_token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from .settings import C as c
import os 
from django.utils.crypto import get_random_string

@api_view(['GET'])
def getCsrfToken(request):
    token = get_token(request)
    print(f"csrf_token:{token}", flush=True)
    return JsonResponse({'csrf_token': token})

@api_view(['GET'])
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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def isAuthenticated(request):
    return JsonResponse({"status":"ok"})

