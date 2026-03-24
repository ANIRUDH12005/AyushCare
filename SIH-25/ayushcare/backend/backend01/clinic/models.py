from django.db import models
from django.conf import settings
from urllib.parse import quote_plus
from django.contrib.auth.models import User


def center_image_upload(instance, filename):
    return f"centers/{instance.name}/{filename}"


class Doctor(models.Model):
    user = models.OneToOneField(User, null=True, blank=True, on_delete=models.SET_NULL)
    name = models.CharField(max_length=150)
    specialty = models.CharField(max_length=120, blank=True)
    phone = models.CharField(max_length=32, blank=True)

    center = models.ForeignKey("clinic.Center", null=True, blank=True,on_delete=models.SET_NULL, related_name="doctor_set")

    timing = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return self.name


class Center(models.Model):
    name = models.CharField(max_length=255)
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)

    phone = models.CharField(max_length=15)  # Frontend expects phone
    website = models.CharField(max_length=255, blank=True)

    rating = models.FloatField(default=0.0)
    popular = models.BooleanField(default=False)

    specialties = models.JSONField(default=list)  # <- ARRAY
    timing = models.CharField(max_length=100, blank=True)
    doctors = models.IntegerField(default=0)

    latitude = models.FloatField(default=0.0)
    longitude = models.FloatField(default=0.0)

    image1 = models.ImageField(upload_to=center_image_upload, null=True, blank=True)
    image2 = models.ImageField(upload_to=center_image_upload, null=True, blank=True)

    map_image_url = models.URLField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    def generate_map_url(self):
        api_key = getattr(settings, "GOOGLE_MAPS_API_KEY", None)
        if not api_key:
            return ""
        address = quote_plus(f"{self.name}, {self.city}, {self.state}")
        url = (
            f"https://maps.googleapis.com/maps/api/staticmap?"
            f"center={address}&zoom=14&size=600x300&maptype=roadmap"
            f"&markers=color:red%7Clabel:C%7C{address}"
            f"&key={api_key}"
        )
        return url

    def save(self, *args, **kwargs):
        if not self.map_image_url:
            try:
                self.map_image_url = self.generate_map_url()
            except Exception:
                self.map_image_url = ""
        super().save(*args, **kwargs)


# =========================
# Therapist Model
# =========================
class Therapist(models.Model):
    """Therapist model for clinic management"""
    user = models.OneToOneField(
        User, 
        null=True, 
        blank=True, 
        on_delete=models.SET_NULL,
        related_name="therapist_profile"
    )
    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=32, blank=True)
    email = models.EmailField(blank=True)
    
    center = models.ForeignKey(
        Center, 
        null=True, 
        blank=True, 
        on_delete=models.SET_NULL, 
        related_name="therapists"
    )
    
    specialty = models.CharField(max_length=120, blank=True)  # e.g., "Abhyanga", "Basti"
    experience_years = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["name"]
    
    def __str__(self):
        return f"{self.name} ({self.center.name if self.center else 'No Center'})"


# =========================
# Therapist Attendance
# =========================
class TherapistAttendance(models.Model):
    """Daily attendance tracking for therapists"""
    STATUS_CHOICES = [
        ("present", "Present"),
        ("absent", "Absent"),
        ("late", "Late"),
        ("on_leave", "On Leave"),
    ]
    
    therapist = models.ForeignKey(
        Therapist,
        on_delete=models.CASCADE,
        related_name="attendance_records"
    )
    date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="present")
    check_in_time = models.TimeField(null=True, blank=True)
    check_out_time = models.TimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ("therapist", "date")
        ordering = ["-date", "therapist__name"]
    
    def __str__(self):
        return f"{self.therapist.name} - {self.date} ({self.status})"


# =========================
# Inventory Item
# =========================
class InventoryItem(models.Model):
    """Inventory management for oils, medicines, equipment"""
    CATEGORY_CHOICES = [
        ("oil", "Oils"),
        ("medicine", "Medicines"),
        ("equipment", "Equipment"),
        ("herbs", "Herbs"),
        ("other", "Other"),
    ]
    
    UNIT_CHOICES = [
        ("ml", "Milliliters"),
        ("l", "Liters"),
        ("g", "Grams"),
        ("kg", "Kilograms"),
        ("pcs", "Pieces"),
        ("box", "Boxes"),
    ]
    
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default="other")
    description = models.TextField(blank=True)
    
    center = models.ForeignKey(
        Center,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="inventory_items"
    )
    
    # Stock Management
    current_stock = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES, default="pcs")
    min_stock_level = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_stock_level = models.DecimalField(max_digits=10, decimal_places=2, default=1000)
    
    # Pricing
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Status
    is_active = models.BooleanField(default=True)
    last_restocked = models.DateField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["name"]
    
    def __str__(self):
        return f"{self.name} ({self.current_stock} {self.unit})"
    
    @property
    def is_low_stock(self):
        """Check if stock is below minimum level"""
        return self.current_stock <= self.min_stock_level
    
    @property
    def stock_status(self):
        """Get stock status for alerts"""
        if self.current_stock <= 0:
            return "out_of_stock"
        elif self.is_low_stock:
            return "low_stock"
        return "in_stock"


# =========================
# Therapist Assignment
# =========================
class TherapistAssignment(models.Model):
    """Model to track doctor assigning therapist to patient"""
    STATUS_CHOICES = [
        ("pending_consent", "Pending Consent"),
        ("approved", "Approved"),
        ("declined", "Declined"),
    ]
    
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name="therapist_assignments")
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name="assignments_made")
    therapist = models.ForeignKey(Therapist, on_delete=models.CASCADE, related_name="assignments_received")
    
    treatment_plan = models.ForeignKey("appointments.TreatmentPlan", on_delete=models.SET_NULL, null=True, blank=True, related_name="assignments")
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending_consent")
    notes = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.doctor.name} assigned {self.therapist.name} to {self.patient.username} ({self.status})"
