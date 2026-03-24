from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
import random
# from centers.models import Center
from django.db.models.signals import post_save
from django.dispatch import receiver

class OTP(models.Model):
    email = models.EmailField(unique=True)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now=True) # auto_now=True refresh on save
    is_verified = models.BooleanField(default=False)
    OTP_EXPIRY_MINUTES = 5

    temp_username = models.CharField(max_length=150, null=True, blank=True)
    temp_password = models.CharField(max_length=200, null=True, blank=True)
    temp_role = models.CharField(max_length=50, null=True, blank=True)
    temp_phone = models.CharField(max_length=20, null=True, blank=True)

    def generate_otp(self):
        self.otp = str(random.randint(100000, 999999))
        self.is_verified = False # Reset on new OTP
        self.save()
    
    def is_expired(self):
        """Check if OTP has expired (5 minutes)"""
        expiry_time = self.created_at + timedelta(minutes=self.OTP_EXPIRY_MINUTES)
        return timezone.now() > expiry_time
    
    def is_valid(self, otp_code):
        """Check if OTP is valid and not expired"""
        if self.is_expired():
            return False
        return self.otp == otp_code


class UserSettings(models.Model):
    """User preferences and settings"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="settings")
    
    # Notification Preferences
    email_notifications = models.BooleanField(default=True)
    appointment_reminders = models.BooleanField(default=True)
    therapy_updates = models.BooleanField(default=True)
    doctor_messages = models.BooleanField(default=True)
    
    # Appointment Preferences
    default_reminder_time = models.IntegerField(default=24)  # hours before appointment
    preferred_center_id = models.IntegerField(null=True, blank=True)
    notification_sound = models.BooleanField(default=True)
    
    # Health Preferences
    medical_conditions = models.JSONField(default=list, blank=True)  # Array of tags
    ayurvedic_body_type = models.CharField(max_length=50, blank=True, null=True)
    health_notes = models.TextField(blank=True, null=True)
    
    # App UI Preferences
    theme = models.CharField(
        max_length=10,
        choices=[("light", "Light"), ("dark", "Dark")],
        default="light"
    )
    time_format = models.CharField(
        max_length=10,
        choices=[("12", "12-hour"), ("24", "24-hour")],
        default="12"
    )
    language = models.CharField(max_length=10, default="en")  # en, hi, es, fr, etc.
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Settings for {self.user.username}"


class UserProfile(models.Model):
    """Central profile to store user roles and common info"""
    ROLE_CHOICES = [
        ("PATIENT", "Patient"),
        ("DOCTOR", "Doctor"),
        ("THERAPIST", "Therapist"),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="user_profile")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="PATIENT")
    
    def __str__(self):
        return f"{self.user.username} - {self.role}"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        # Check if role was passed during creation (e.g. from Signup)
        # Default to PATIENT if not specified
        role = getattr(instance, '_role', 'PATIENT')
        
        UserProfile.objects.create(user=instance, role=role.upper())
        UserSettings.objects.create(user=instance)
        
        # Create sub-profile based on role
        if role.upper() == "PATIENT":
            from patients.models import PatientProfile
            if not hasattr(instance, 'patient_profile'):
                PatientProfile.objects.create(user=instance)
        elif role.upper() == "DOCTOR":
            from clinic.models import Doctor
            if not hasattr(instance, 'doctor'):
                Doctor.objects.create(user=instance, name=instance.username)
        elif role.upper() == "THERAPIST":
            from clinic.models import Therapist
            if not hasattr(instance, 'therapist_profile'):
                Therapist.objects.create(user=instance, name=instance.username)
