import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import authenticate
from django.contrib.auth.models import User

u = User.objects.get(email='kadammehta8@gmail.com')
print(f"Testing authenticate for user: {u.username}")
res = authenticate(username=u.username, password='Kadam@123')
print(f"Result: {res}")
