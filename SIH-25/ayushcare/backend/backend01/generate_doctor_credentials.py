
import os
import django
import random
import string

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from clinic.models import Doctor

def generate_credentials():
    doctor_name = "Sanjay Nema"
    try:
        doctor = Doctor.objects.filter(name__icontains=doctor_name).first()
        if not doctor:
            print(f"Doctor '{doctor_name}' not found!")
            return

        username = f"dr.{doctor.name.split()[0].lower()}{random.randint(10, 99)}"
        password = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
        
        # Check if user already exists
        if doctor.user:
            user = doctor.user
            user.username = username
            user.set_password(password)
            user.save()
            print(f"Updated credentials for {doctor.name}")
        else:
            user = User(username=username)
            user.set_password(password)
            user._role = 'DOCTOR'
            user.is_active = True
            user.save()
            doctor.user = user
            doctor.save()
            print(f"Created new user for {doctor.name} with role DOCTOR")

        print("\n" + "="*30)
        print(f"CREDENTIALS FOR {doctor.name}")
        print("="*30)
        print(f"Username: {username}")
        print(f"Password: {password}")
        print("="*30 + "\n")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    generate_credentials()
