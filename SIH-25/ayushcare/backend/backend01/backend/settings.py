import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv
import base64
from corsheaders.defaults import default_headers, default_methods

# BASE DIR
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env if exists
ENV_PATH = BASE_DIR.parent / ".env"
load_dotenv(ENV_PATH)

GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "")

# SECURITY
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev-secret")
# Default should be False for security - only enable in development
DEBUG = os.getenv("DEBUG", "False") == "True"
# ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '.railway.app',  # Railway domain
    os.environ.get('ALLOWED_HOST', ''),
]
# Add Railway domain
if os.getenv("RAILWAY_ENVIRONMENT"):
    ALLOWED_HOSTS.append(".railway.app")

# Firebase key (Base64 from Railway)
FIREBASE_KEY_B64 = os.getenv("FIREBASE_KEY_B64")
if FIREBASE_KEY_B64:
    firebase_file = BASE_DIR / "firebase_key.json"
    with open(firebase_file, "wb") as f:
        f.write(base64.b64decode(FIREBASE_KEY_B64))
    FIREBASE_CREDENTIALS_PATH = str(firebase_file)
else:
    FIREBASE_CREDENTIALS_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH", "")

# Installed Apps
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "accounts.apps.AccountsConfig",
    "centers.apps.CenterConfig",

    # Third-party
    "rest_framework",
    "corsheaders",
    "channels",

    # Local apps
    # "centers",
    # "accounts",
    "clinic",
    "patients",
    "appointments",
    "notifications",
    "progress",
]

# Middleware
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    # 'whitenoise.middleware.WhiteNoiseMiddleware', 
    "whitenoise.middleware.WhiteNoiseMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",

    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


# URLS + Templates
ROOT_URLCONF = "backend.urls"

TEMPLATES = [{
    "BACKEND": "django.template.backends.django.DjangoTemplates",
    "DIRS": [],
    "APP_DIRS": True,
    "OPTIONS": {
        "context_processors": [
            "django.template.context_processors.debug",
            "django.template.context_processors.request",
            "django.contrib.auth.context_processors.auth",
            "django.contrib.messages.context_processors.messages",
        ],
    },
}]

# ASGI + WSGI
WSGI_APPLICATION = "backend.wsgi.application"
ASGI_APPLICATION = "backend.asgi.application"

# Database (Railway MySQL plugin)
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": os.getenv("MYSQLDATABASE") or os.getenv("MYSQL_DATABASE", "railway"),
        "USER": os.getenv("MYSQLUSER") or os.getenv("MYSQL_USER", "root"),
        "PASSWORD": os.getenv("MYSQLPASSWORD") or os.getenv("MYSQL_PASSWORD", ""),
        "HOST": os.getenv("MYSQLHOST") or os.getenv("MYSQL_HOST", "localhost"),
        "PORT": os.getenv("MYSQLPORT") or os.getenv("MYSQL_PORT", "3306"),
        # "OPTIONS": {"charset": "utf8mb4"},
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
            'charset': 'utf8mb4',
        },
    }
}

# REST + JWT
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(days=7),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=30),
}

# Channels + Redis (Railway)
REDIS_URL = os.getenv("REDIS_URL", "redis://127.0.0.1:6379/0")

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {"hosts": [REDIS_URL]},
    },
}

# Celery
CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = REDIS_URL
CELERY_TIMEZONE = "Asia/Kolkata"
CELERY_ENABLE_UTC = False

# Email
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")

# Static Files
STATIC_URL = "/static/"
# STATIC_ROOT = BASE_DIR / "staticfiles"
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media Files (for user uploads)
MEDIA_URL = "/media/"
# MEDIA_ROOT = BASE_DIR / "media"
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# CORS
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173", 
    "http://127.0.0.1:5173",
    "http://localhost:5174", 
    "http://127.0.0.1:5174",
    "http://localhost:5175", 
    "http://127.0.0.1:5175",
    os.environ.get('FRONTEND_URL', 'https://your-vercel-app.vercel.app'),
]
# Add Vercel frontend URL from environment
FRONTEND_URL = os.getenv("FRONTEND_URL", "")
if FRONTEND_URL:
    CORS_ALLOWED_ORIGINS.append(FRONTEND_URL)
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_HEADERS = True
CORS_ALLOW_ALL_METHODS = True


CORS_ALLOW_HEADERS = list(default_headers) + [
    "authorization",
]

CORS_ALLOW_METHODS = list(default_methods)