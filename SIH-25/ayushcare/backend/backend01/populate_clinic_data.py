
import os
import django
import random

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from clinic.models import Center, Doctor
# from django.contrib.auth.models import User

def populate():
    print("Populating data...")
    
    # Dummy Data Arrays
    center_names = [
        "Jiva Ayurveda Clinic",
        "Patanjali Wellness Center",
        "Kairali Ayurvedic Centre",
        "Maharishi Ayurveda Hospital"
    ]
    
    cities = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Rishikesh", "Haridwar", "Pune"]
    states = ["Delhi", "Maharashtra", "Karnataka", "Tamil Nadu", "Uttarakhand", "Uttarakhand", "Maharashtra"]
    
    doctor_names = [
        "Dr. Rajesh Verma", "Dr. Priya Singh", "Dr. Amit Sharma", "Dr. Sneha Patil",
        "Dr. Rahul Gupta", "Dr. Anjali Mehta", "Dr. Vikram Malhotra", "Dr. Neha Kapoor",
        "Dr. Arjun Das", "Dr. Meera Nair", "Dr. Sanjay Kumar", "Dr. Ritu Desai"
    ]
    
    specialties = ["Panchakarma", "Kayachikitsa", "Shalya Tantra", "General Ayurveda", "Nadi Pariksha"]

    # Create Centers
    for i, name in enumerate(center_names):
        city = cities[i % len(cities)]
        state = states[i % len(states)]
        
        center, created = Center.objects.get_or_create(
            name=name,
            defaults={
                "city": city,
                "state": state,
                "address": f"Sector {random.randint(1, 100)}, {city}",
                "pincode": f"{random.randint(100000, 999999)}",
                "phone": f"98{random.randint(10000000, 99999999)}",
                "website": f"www.{name.lower().replace(' ', '')}.com",
                "rating": round(random.uniform(3.5, 5.0), 1),
                "popular": random.choice([True, False]),
                "specialties": random.sample(specialties, k=3),
                "timing": "9:00 AM - 6:00 PM",
                "doctors": 0, # Will update later
                "description": f"A premier center for authentic Ayurvedic treatments in {city}.",
                # "available_services": "Panchakarma, Massages, Consultation, Yoga", 
                "latitude": 20.5937 + random.uniform(-5, 5),
                "longitude": 78.9629 + random.uniform(-5, 5),
                "map_image_url": "http://example.com/map_placeholder.jpg" # Bypass auto-generation to avoid length error
            }
        )
        if created:
            print(f"Created Center: {center.name}")
        else:
            print(f"Center already exists: {center.name}")
            
        # Create Doctors for this center
        num_doctors = list(range(2, 4)) # 2 or 3 doctors
        for _ in range(random.choice(num_doctors)):
            doc_name = random.choice(doctor_names)
            
            # Check if doctor exists to avoid duplicates (optional but good)
            if not Doctor.objects.filter(name=doc_name, center=center).exists():
                Doctor.objects.create(
                    name=doc_name,
                    specialty=random.choice(specialties),
                    phone=f"98{random.randint(10000000, 99999999)}",
                    center=center,
                    timing=f"{random.randint(9,11)}:00 AM - {random.randint(4,7)}:00 PM"
                )
                print(f"  - Added Doctor: {doc_name}")
        
        # Update doctor count
        count = Doctor.objects.filter(center=center).count()
        center.doctors = count
        center.save()

    print("Population complete!")

if __name__ == '__main__':
    populate()
