from functools import wraps
import json
from django.http import JsonResponse
from django.utils.crypto import get_random_string
import random
from django.core.mail import send_mail
from django.http import HttpResponse
from django.shortcuts import render
from django.conf import settings

def TwoFctor_Decorator(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args,  **kwargs):
        print("value :",request.user.is_2fa_passed,flush=True)  
        print("enter ",flush=True)  
        if request.user.enable2fa and not request.user.is_2fa_passed :
            user_email = request.user.email
            username = request.user.username
            verification_code = str(random.randint(100000,999999))
            print("verfication code",verification_code,flush=True)
            subject = 'Your 2FA verification Code '
            message = f'Your verification code is :{verification_code}'
            from_email = settings.DEFAULT_FROM_EMAIL
            recipient_list = [user_email]
            try:
                send_mail(subject,message,from_email,recipient_list)
                request.user.Twofa_Code = verification_code
                request.user.save()
                print("Two Factor  code is set",request.user.Twofa_Code,flush=True)
                return JsonResponse({"status": "redirect", "message" : "code  2fa send","username" :username},status=200)
            except Exception as e:
                return JsonResponse({"status" : "redirect","message": f"Failed to send email: {str(e)}"}, status=500)
        else :    
            return view_func(request, *args, **kwargs)
    return _wrapped_view