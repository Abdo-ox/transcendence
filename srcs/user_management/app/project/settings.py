from pathlib import Path
import os
from datetime import timedelta
from corsheaders.defaults import default_headers

BASE_DIR = Path(__file__).resolve().parent.parent

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

STATIC_URL = '/static/'

# Directory where static files will be collected for production use
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')  # This is where `collectstatic` will put all files

# List of directories where Django will look for additional static files (including admin files)
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),  # Include your custom static files here
]

SECRET_KEY = os.environ.get('SECRET_KEY') 
DEBUG = True

AUTH_USER_MODEL = 'user.User'

AUTHENTICATION_BACKENDS = [
    'user.auth.MyBackend',  
    'django.contrib.auth.backends.ModelBackend',
]

ASGI_APPLICATION = 'myproject.asgi.application'

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=5),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUTH_HEADER_TYPES': ('Bearer',)
}

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'user',
    'project',
    'friendship',
    'rest_framework',
    'rest_framework_simplejwt', 
    'corsheaders',
    # 'django_otp',
    # 'django_otp.plugins.otp_totp',  
    # 'two_factor', 
    # 'qrcode',  
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}  
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django_otp.middleware.OTPMiddleware',
    # 'project.debug.CsrfDebugMiddlewar e',
]


ALLOWED_HOSTS = [
    "localhost",
    f"{os.environ.get('IP')}"
]

CORS_ALLOWED_ORIGINS = [
    f"https://localhost",
    f"https://{os.environ.get('IP')}"
]

CSRF_TRUSTED_ORIGINS =  [
    f"https://localhost",
    f"https://{os.environ.get('IP')}"
]

CORS_ALLOW_METHODS = [
    "DELETE",
    "GET",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT",
]


CORS_ALLOW_HEADERS = list(default_headers) + [
    'x-csrftoken',
]

CORS_ALLOW_CREDENTIALS = True

ROOT_URLCONF = 'project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'project.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASS'),
        'HOST': os.environ.get('DB_HOST'),
        'port': os.environ.get('DB_PORT'),
    }
}


AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

OAUTH_CONFIG = {
    '42': {
        'client_id': os.environ.get('client_id'),
        'client_secret': os.environ.get('client_secret'),
        'redirect_uri': f"https://{os.environ.get('IP')}/loading.html",
        'base_url': os.environ.get('base_url'),
        'token_url': os.environ.get('token_url'),
        'info_url': os.environ.get('info_url'),
        'usrs_url': os.environ.get('usrs_url'),
    }
}

class C:
    r = "\033[31;1m"
    g = "\033[32;1m"
    y = "\033[33;1m"
    b = "\033[34;1m"
    m = "\033[35;1m"
    c = "\033[36;1m"
    d = "\033[0m"


LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

STATIC_URL = 'static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

EMAIL_BACKEND = os.environ.get('EMAIL_BACKEND')
EMAIL_HOST = os.environ.get('EMAIL_HOST')
EMAIL_PORT = os.environ.get('EMAIL_PORT')
EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS')
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER