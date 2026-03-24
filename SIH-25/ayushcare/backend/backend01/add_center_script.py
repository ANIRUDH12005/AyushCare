import os
import django
import json

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from clinic.models import Center

def add_center():
    print("Creating sample center...")
    
    center_data = {
        "name": "AyushCare Wellness Center",
        "city": "Jabalpur",
        "state": "Madhya Pradesh",
        "pincode": "482001",
        "address": "Civic Center, Marhatal, Jabalpur",
        "phone": "+91 98765 43210",
        "website": "www.ayushcare.in",
        "rating": 4.9,
        "popular": True,
        "doctors": 5,
        "timing": "9:00 AM - 8:00 PM",
        # "specialties": ["Panchakarma", "Nadi Pariksha", "Shirodhara", "Detox"],
        "description": "Premium Ayurvedic center offering holistic healing and traditional Panchakarma therapies in the heart of Jabalpur.",
        "latitude": 23.1815,
        "longitude": 79.9498,
        "map_image_url": "https://goo.gl/maps/placeholder" # Prevent auto-generation overflow
    }

    # Check if exists to avoid duplicates
    if Center.objects.filter(name=center_data["name"]).exists():
        print(f"Center '{center_data['name']}' already exists!")
        return

    center = Center.objects.create(**center_data)
    print(f"Successfully created center: {center.name} (ID: {center.id})")

if __name__ == "__main__":
    add_center()
