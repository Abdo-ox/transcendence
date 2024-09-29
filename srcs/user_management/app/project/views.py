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
import random
from django.core.mail import send_mail
from django.http import HttpResponse
from django.shortcuts import render
from django.conf import settings
import json
from django.contrib.auth import authenticate 
from rest_framework.permissions import IsAuthenticated

@api_view(['POST'])
def resetpassword(request):
    body_data = json.loads(request.body)  # No decoding here
    user_email = body_data.get('email')  
    try:
        user = User.objects.get(email=user_email)
        confirmation_code = str(random.randint(100000,999999))
        print("verfication code",confirmation_code,flush=True)
        subject = 'Your confirmation Code '
        message = f'Yourconfirmation code is :{confirmation_code}'
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [user_email]
        try:
            send_mail(subject,message,from_email,recipient_list)
            request.user.reset_Code = confirmation_code
            request.user.save()
            print("Two Factor  code is set",request.user.reset_Code,flush=True)
            return JsonResponse({"status": "redirect", "message" : "code   send"},status=200)
        except Exception as e:
            return JsonResponse({"status" : "failed","message": f"Failed to send email: {str(e)}"}, status=500)
    except User.DoesNotExist:
        print("User not found.")
        return JsonResponse({"status": "no", "message" : "code  2fa send"},status=200)
        
        

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_2fa_code(request):
    if request.method == 'POST':
        body_data = json.loads(request.body)  # No decoding here
        submitted_code = body_data.get('code') 
        print("Submitted_code : ", submitted_code, flush=True)
        user_email = request.user.email
        print("email: ", user_email, flush=True)
        if not submitted_code:
            return JsonResponse({"status":"error","error": " Code not provided"}, status=400)
        print("two factor code : ",request.user.Twofa_Code,flush=True)
        if submitted_code == str(request.user.Twofa_Code):
            request.user.is_2fa_passed = True
            request.user.save()
            return JsonResponse({"status": "success", "message": "2FA verification successful"}, status=200)
        else:
            return JsonResponse({"status": "error", "error": "Invalid 2FA code"}, status=400)

    return JsonResponse({"error": "Invalid request"}, status=400)

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

