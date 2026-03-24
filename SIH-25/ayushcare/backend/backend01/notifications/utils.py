# from pyfcm import FCMNotification
# from .models import UserDevice
# from django.conf import settings

# def send_push_notification(user, title, message):
#     devices = UserDevice.objects.filter(user=user)

#     if not devices.exists():
#         return

#     push_service = FCMNotification(api_key=settings.FCM_SERVER_KEY)

#     for device in devices:
#         push_service.notify_single_device(
#             registration_id=device.device_token,
#             message_title=title,
#             message_body=message
#         )


import firebase_admin
from firebase_admin import credentials, messaging
from django.conf import settings
from .models import UserDevice

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

# Initialize only once
if not firebase_admin._apps:
    cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
    firebase_admin.initialize_app(cred)

def send_push_notification(user, title, message):
    devices = UserDevice.objects.filter(user=user)
    if not devices.exists():
        print("No device token found for user.")
        return

    for device in devices:
        message_data = messaging.Message(
            token=device.device_token,
            notification=messaging.Notification(
                title=title,
                body=message
            )
        )
        messaging.send(message_data)

def send_websocket_notification(title, message):
    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        "notifications",
        {
            "type": "send_notification",
            "title": title,
            "message": message,
        }
    )
