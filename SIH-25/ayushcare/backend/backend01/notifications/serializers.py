from rest_framework import serializers
from .models import UserDevice, Notification

class UserDeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserDevice
        fields = ["id", "user", "device_token", "device_type"]


class NotificationSerializer(serializers.ModelSerializer):
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            "id",
            "title",
            "message",
            "notification_type",
            "is_sent",
            "created_at",
            "sent_at",
            "time_ago",
        ]
        read_only_fields = ["id", "created_at", "sent_at", "is_sent"]
    
    def get_time_ago(self, obj):
        from django.utils import timezone
        from datetime import timedelta
        
        if not obj.created_at:
            return "Just now"
        
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff < timedelta(minutes=1):
            return "Just now"
        elif diff < timedelta(hours=1):
            minutes = int(diff.total_seconds() / 60)
            return f"{minutes}m ago"
        elif diff < timedelta(days=1):
            hours = int(diff.total_seconds() / 3600)
            return f"{hours}h ago"
        elif diff < timedelta(days=7):
            days = diff.days
            return f"{days}d ago"
        else:
            return obj.created_at.strftime("%b %d, %Y")
