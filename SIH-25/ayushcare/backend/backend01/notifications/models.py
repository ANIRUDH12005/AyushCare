from django.db import models
from django.contrib.auth.models import User


# ======================
# Device Tokens (FCM)
# ======================
class UserDevice(models.Model): 
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="devices"
    )
    device_token = models.TextField()
    device_type = models.CharField(
        max_length=20,
        default="web"  # web / android / ios
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.device_type}"


# ======================
# Doctor Notes
# ======================
class DoctorNote(models.Model):
    doctor = models.ForeignKey(
        "clinic.Doctor",
        on_delete=models.CASCADE,
        related_name="notes_written",
    )
    patient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="doctor_notes",
    )

    title = models.CharField(max_length=200)
    note = models.TextField()

    visible_to_patient = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.doctor} → {self.patient.username})"


# ======================
# Notifications
# ======================
class Notification(models.Model):
    NOTIFICATION_TYPE_CHOICES = [
        ("pre_procedure", "Pre-procedure"),
        ("post_procedure", "Post-procedure"),
        ("reminder", "Reminder"),
        ("general", "General"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notifications",
    )

    title = models.CharField(max_length=200)
    message = models.TextField()

    notification_type = models.CharField(
        max_length=30,
        choices=NOTIFICATION_TYPE_CHOICES,
        default="general",
    )

    scheduled_at = models.DateTimeField(blank=True, null=True)
    sent_at = models.DateTimeField(blank=True, null=True)
    is_sent = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} → {self.user.username}"


# ======================
# Feedback
# ======================
class Feedback(models.Model):
    patient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="feedbacks",
    )

    treatment_plan = models.ForeignKey(
        "appointments.TreatmentPlan",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="feedbacks",
    )

    rating = models.PositiveIntegerField(default=5)
    comments = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback by {self.patient.username} ({self.rating})"
