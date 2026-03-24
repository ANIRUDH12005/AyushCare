# appointments/models.py
from django.db import models
from django.contrib.auth.models import User


# =========================
# Panchakarma Procedure
# =========================
class PanchakarmaProcedure(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    typical_duration_days = models.PositiveIntegerField(default=7)
    base_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return self.name


# =================
# Treatment Plan
# =================
class TreatmentPlan(models.Model):
    PHASE_CHOICES = [
        ("pre", "Pre-procedure"),
        ("main", "Main procedure"),
        ("post", "Post-procedure"),
    ]

    STATUS_CHOICES = [
        ("ongoing", "Ongoing"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    patient = models.ForeignKey(
        User,
        related_name="treatment_plans",
        on_delete=models.CASCADE
    )
    doctor = models.ForeignKey(
        "clinic.Doctor",
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )
    procedure = models.ForeignKey(
        PanchakarmaProcedure,
        on_delete=models.CASCADE
    )

    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)

    current_phase = models.CharField(
        max_length=10,
        choices=PHASE_CHOICES,
        default="pre"
    )
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="ongoing"
    )

    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.patient.username} - {self.procedure.name}"


# =========================
# Daily Treatment Session
# =========================
class DailySession(models.Model):
    treatment_plan = models.ForeignKey(
        TreatmentPlan,
        related_name="daily_sessions",
        on_delete=models.CASCADE
    )
    session_date = models.DateField()
    day_number = models.PositiveIntegerField()
    procedure_done = models.CharField(max_length=150)
    doctor_notes = models.TextField(blank=True)
    patient_response = models.TextField(blank=True)

    def __str__(self):
        return f"Day {self.day_number} - {self.treatment_plan}"


# =========================
# Appointment
# =========================
class Appointment(models.Model):
    STATUS_CHOICES = [
        ("scheduled", "Scheduled"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
        ("checked_in", "Checked-in"),
        ("rescheduled", "Rescheduled"),
    ]

    APPT_TYPE_CHOICES = [
        ("therapy", "Therapy"),
        ("consultation", "Consultation"),
        ("followup", "Follow-up"),
        ("other", "Other"),
    ]

    patient = models.ForeignKey(
        User,
        related_name="appointments",
        on_delete=models.CASCADE
    )
    doctor = models.ForeignKey(
        "clinic.Doctor",
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )
    treatment_plan = models.ForeignKey(
        TreatmentPlan,
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    date = models.DateField()
    time = models.TimeField()

    appointment_type = models.CharField(
        max_length=30,
        choices=APPT_TYPE_CHOICES,
        default="therapy"
    )

    location_name = models.CharField(max_length=200, blank=True)
    building = models.CharField(max_length=200, blank=True)
    room = models.CharField(max_length=50, blank=True)

    notes = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="scheduled"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date", "-time"]
        unique_together = ("doctor", "date", "time")  # ✅ SLOT BLOCKING

    def __str__(self):
        return f"{self.patient.username} | {self.date} {self.time}"


# ==========
# Invoice
# ==========
class Invoice(models.Model):
    patient = models.ForeignKey(User, on_delete=models.CASCADE)
    treatment_plan = models.ForeignKey(
        TreatmentPlan,
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_status = models.CharField(
        max_length=20,
        choices=[
            ("pending", "Pending"),
            ("partial", "Partial"),
            ("paid", "Paid"),
        ],
        default="pending",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Invoice #{self.id} - {self.patient.username}"
