import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from django.contrib.auth import authenticate

email = "kadammehta8@gmail.com"
password = "Kadam@123" # From the screenshot console log

print(f"Checking user: {email}")
user = User.objects.filter(email=email).first()

if not user:
    print("User not found")
else:
    print(f"Username: {user.username}")
    print(f"Is active: {user.is_active}")
    print(f"Password in DB (starts with): {user.password[:20]}...")
    
    # Try manual check
    from django.contrib.auth.hashers import check_password
    match = check_password(password, user.password)
    print(f"Manual check_password match: {match}")
    
    # Try authenticate
    auth_user = authenticate(username=user.username, password=password)
    print(f"Authenticate result: {auth_user}")
