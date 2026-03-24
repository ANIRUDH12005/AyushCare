from django.db import models
from django.contrib.auth.models import User


class PatientProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="patient_profile"
    )

    # ======================
    # Personal Information
    # ======================
    full_name = models.CharField(max_length=150, blank=True, null=True)

    gender = models.CharField(
        max_length=20,
        choices=[
            ("Male", "Male"),
            ("Female", "Female"),
            ("Other", "Other"),
        ],
        blank=True,
        null=True,
    )
    center = models.CharField(max_length=100,null=True, blank=True)  # ✅ satisfies admin
    age = models.PositiveIntegerField(null=True, blank=True)         # ✅ satisfies admin


    dob = models.DateField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)

    address = models.TextField(blank=True, null=True)

    marital_status = models.CharField(
        max_length=30,
        choices=[
            ("Single", "Single"),
            ("Married", "Married"),
            ("Divorced", "Divorced"),
            ("Widowed", "Widowed"),
            ("Other", "Other"),
        ],
        blank=True,
        null=True,
    )

    occupation = models.CharField(max_length=150, blank=True, null=True)

    lifestyle = models.CharField(
        max_length=30,
        choices=[
            ("Sedentary", "Sedentary"),
            ("Moderate", "Moderate"),
            ("Active", "Active"),
        ],
        blank=True,
        null=True,
    )

    # Emergency Contact
    emergency_contact_name = models.CharField(max_length=150, blank=True, null=True)
    emergency_contact_relation = models.CharField(max_length=80, blank=True, null=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True, null=True)

    preferred_communication = models.CharField(
        max_length=30,
        choices=[
            ("SMS", "SMS"),
            ("WhatsApp", "WhatsApp"),
            ("Email", "Email"),
        ],
        default="WhatsApp",
        blank=True,
        null=True,
    )

    # ======================
    # Medical Information
    # ======================
    blood_group = models.CharField(max_length=5, blank=True, null=True)
    height_cm = models.FloatField(blank=True, null=True)
    weight_kg = models.FloatField(blank=True, null=True)

    allergies = models.TextField(blank=True, null=True)
    current_medication = models.TextField(blank=True, null=True)

    past_medical_history = models.JSONField(default=list, blank=True)
    current_symptoms = models.JSONField(default=dict, blank=True)
    addictions = models.JSONField(default=list, blank=True)

    blood_pressure = models.CharField(max_length=50, blank=True, null=True)
    pulse_rate = models.CharField(max_length=20, blank=True, null=True)
    menstrual_history = models.TextField(blank=True, null=True)

    # ======================
    # Ayurvedic Profile
    # ======================
    prakriti = models.CharField(max_length=50, blank=True, null=True)
    vikriti = models.CharField(max_length=50, blank=True, null=True)

    seasonal_allergies = models.CharField(max_length=200, blank=True, null=True)
    body_type_tendency = models.CharField(max_length=100, blank=True, null=True)

    contraindications = models.JSONField(default=list, blank=True)
    treatment_goals = models.JSONField(default=list, blank=True)

    # ======================
    # System Fields
    # ======================
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.full_name or self.user.username} ({self.user.email})"
