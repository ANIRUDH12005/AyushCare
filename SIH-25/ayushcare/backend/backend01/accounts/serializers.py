from rest_framework import serializers
from .models import UserSettings, UserProfile
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class SignupSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    phone = serializers.CharField()
    password = serializers.CharField()
    role = serializers.CharField(required=False, default="patient")


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField()


class LoginSerializer(serializers.Serializer):
    # accepts email OR phone OR username in the same field
    email = serializers.CharField()
    password = serializers.CharField()


class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        fields = [
            "email_notifications",
            "appointment_reminders",
            "therapy_updates",
            "doctor_messages",
            "default_reminder_time",
            "preferred_center_id",
            "notification_sound",
            "medical_conditions",
            "ayurvedic_body_type",
            "health_notes",
            "theme",
            "time_format",
            "language",
        ]


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        
        # Get role from UserProfile
        try:
            profile = user.user_profile
            token['role'] = profile.role
        except Exception:
            token['role'] = 'PATIENT'

        return token
