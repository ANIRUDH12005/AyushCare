import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from accounts.models import UserProfile, UserSettings

users = User.objects.all()
print(f"Total users: {len(users)}")

for user in users:
    if not hasattr(user, 'user_profile'):
        print(f"Fixing UserProfile for: {user.username} ({user.email})")
        # Default to PATIENT if not specified
        UserProfile.objects.get_or_create(user=user, defaults={'role': 'PATIENT'})
    
    if not hasattr(user, 'settings'):
        print(f"Fixing UserSettings for: {user.username}")
        UserSettings.objects.get_or_create(user=user)
        
    # Check for specific role sub-profiles
    role = user.user_profile.role
    if role == "PATIENT" and not hasattr(user, 'patient_profile'):
        from patients.models import PatientProfile
        PatientProfile.objects.get_or_create(user=user)
    elif role == "DOCTOR" and not hasattr(user, 'doctor'):
        from clinic.models import Doctor
        Doctor.objects.get_or_create(user=user, defaults={'name': user.username})
    elif role == "THERAPIST" and not hasattr(user, 'therapist_profile'):
        from clinic.models import Therapist
        Therapist.objects.get_or_create(user=user, defaults={'name': user.username})

print("Migration complete!")
