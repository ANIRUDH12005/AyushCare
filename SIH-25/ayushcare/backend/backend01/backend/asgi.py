# backend01/backend/asgi.py

import os
import django
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from whitenoise import WhiteNoise
from notifications.routing import websocket_urlpatterns

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

# HTTP application wrapped with WhiteNoise
http_app = get_asgi_application()
http_app = WhiteNoise(http_app, root=os.path.join(os.path.dirname(os.path.dirname(__file__)), "staticfiles"))

# Main ASGI application
application = ProtocolTypeRouter({
    "http": http_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})
