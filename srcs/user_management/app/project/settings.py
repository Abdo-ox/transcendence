from pathlib import Path
import os
from datetime import timedelta
from corsheaders.defaults import default_headers

BASE_DIR = Path(__file__).resolve().parent.parent

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')


SECRET_KEY = 'django-insecure-_^@m%$xt&8mynfeu4w7c!i4@w7)2f(jegj%vey9v+_-w^yz9px'
DEBUG = True

ALLOWED_HOSTS = []

AUTH_USER_MODEL = 'user.User'

AUTHENTICATION_BACKENDS = [
    'user.auth.MyBackend',  
    'django.contrib.auth.backends.ModelBackend',
]

ASGI_APPLICATION = 'myproject.asgi.application'

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(seconds=10),
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
    'django_otp',
    'django_otp.plugins.otp_totp',  
    'two_factor', 
    'qrcode',  
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django_otp.middleware.OTPMiddleware',
    # 'project.debug.CsrfDebugMiddlewar e',
]


CORS_ALLOWED_ORIGINS = [
    "https://localhost",
    "https://127.0.0.1",
]

CORS_ALLOW_METHODS = [
    "DELETE",
    "GET",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT",
]

CSRF_TRUSTED_ORIGINS =  ['https://localhost', 'https://127.0.0.1']

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
        'client_id': 'u-s4t2ud-589237e6394550420d14a9a59740b48214effbb5b50d9943c952f85a1e639e46',
        'client_secret': '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',
        'redirect_uri': 'https://localhost/login/loading.html',
        'base_url': 'https://api.intra.42.fr/oauth/authorize',
        'token_url': 'https://api.intra.42.fr/oauth/token',
        'info_url': ' https://api.intra.42.fr/v2/me',
        'usrs_url': 'https://api.intra.42.fr/v2/users'
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

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com' 
EMAIL_PORT = 587 
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'trencenteam@gmail.com' 
EMAIL_HOST_PASSWORD = 'jprx jsfw vamr vdys'  # your email password
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER