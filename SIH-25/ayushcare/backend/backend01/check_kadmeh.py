import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from django.contrib.auth.hashers import check_password

email = 'kadmeh18@gmail.com'
u = User.objects.get(email=email)
print(f"User: {u.username}")
print(f"Created: {u.date_joined}")
print(f"Password in DB: {u.password[:30]}...")
print(f"Check password 'Kadam@123': {check_password('Kadam@123', u.password)}")
