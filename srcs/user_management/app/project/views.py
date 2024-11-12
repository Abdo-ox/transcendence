from user.models import User 
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
import json
from .decorators import TwoFctor_Decorator

@api_view(['POST'])
def resetpassword(request):
    body_data = json.loads(request.body)  # No decoding here
    user_email = body_data.get('email')
    try:
        user = User.objects.get(email=user_email)
    except User.DoesNotExist:
        return JsonResponse({"status": "no"},status=404)
    confirmation_code = str(random.randint(100000,999999))
    user.reset_Code = confirmation_code 
    user.save()
    subject = 'Your confirmation Code '
    message = f'Yourconfirmation code is :{confirmation_code}'
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [user_email]
    try:
        send_mail(subject,message,from_email,recipient_list)
        return JsonResponse({"status": "redirect", "message" : "code   send"},status=200)
    except Exception as e:
        return JsonResponse({"status" : "failed","message": f"Failed to send email: {str(e)}"}, status=500)
        
@api_view(['POST'])
def reset(request):
    body_data = json.loads(request.body) 
    code = body_data.get('code')
    psw  = body_data.get('password')
    user_email = body_data.get('email')
    try:
        user = User.objects.get(email=user_email)
    except User.DoesNotExist:
        return JsonResponse({"status": "failed", "message": "User not found"})
    if str(user.reset_Code) == code:
        user.set_password(psw)
        user.save()
        return JsonResponse({"status": "success", "message": "Password reset successful"}, status=200)    
    else:
        return JsonResponse({"status": "failed", "message": "Incorrect confirmation code"})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_2fa_code(request):
    if request.method == 'POST':
        body_data = json.loads(request.body)  # No decoding here
        submitted_code = body_data.get('code') 
        user_email = request.user.email
        if not submitted_code:
            return JsonResponse({"status":"error","error": " Code not provided"}, status=400)
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@TwoFctor_Decorator
def MailConfirmationfunc(request):
    body_data = json.loads(request.body)
    user_newemail = body_data.get('newemail')
    try:
         user = User.objects.get(email=user_newemail)
    except User.DoesNotExist:
        confirmation_code = str(random.randint(100000,999999))
        request.user.MailConfirmation = confirmation_code
        request.user.save()
        subject = 'Your email  confirmation Code '
        message = f'''Hi,To confirm your new email address, please use the following verification code:
        {confirmation_code}If you didn’t request this change, please ignore this email.
        Thank you!'''
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [user_newemail]
        try:
            send_mail(subject,message,from_email,recipient_list)
            return JsonResponse({"status": "redirect", "message" : "code   send"},status=200)
        except Exception as e:
            return JsonResponse({"status" : "failed","message": f"Failed to send email: {str(e)}"}, status=500)
    return JsonResponse({"status": "dublicated"})
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@TwoFctor_Decorator 
def EmailValidation(request):
    body_data = json.loads(request.body) 
    code = body_data.get('code')
    newemail = body_data.get('newemail')
    if str(request.user.MailConfirmation) == code:
        request.user.email = newemail
        request.user.save()
        return JsonResponse({"status": "redirect"}, status=200)    
    else:
        return JsonResponse({"status": "failed", "message": "Incorrect confirmation code"})
    