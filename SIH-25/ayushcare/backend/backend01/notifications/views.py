from django.shortcuts import render
from django.contrib.auth.models import User

# Create your views here.

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework import generics, permissions
from .serializers import UserDeviceSerializer, NotificationSerializer
from .models import UserDevice, Notification
from .utils import send_push_notification, send_websocket_notification

@api_view(["POST"])
def register_device(request):
    """
    Save user's FCM device token.
    """
    serializer = UserDeviceSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Device registered"}, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def send_notification(request):
    user_id = request.data.get("user_id")
    title = request.data.get("title")
    message = request.data.get("message")

    try:
        user = User.objects.get(id=user_id)
    except:
        return Response({"error": "User not found"}, status=404)

    send_push_notification(user, title, message)
    return Response({"message": "Notification sent"})


@api_view(["POST"])
def broadcast_notification(request):
    title = request.data.get("title")
    message = request.data.get("message")

    send_websocket_notification(title, message)
    return Response({"message": "WebSocket message sent"})


# -----------------------------------
# User Notifications List
# -----------------------------------
class UserNotificationsListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(
            user=self.request.user
        ).order_by("-created_at")
