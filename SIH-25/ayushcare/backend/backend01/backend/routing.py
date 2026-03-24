from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path
from notifications import consumers
from notifications.routing import websocket_urlpatterns

application = ProtocolTypeRouter({
    "websocket": URLRouter([
        path("ws/notifications/", consumers.NotificationConsumer.as_asgi()),
    ])
})
