# progress/models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from appointments.models import Appointment, TreatmentPlan


class ProgressEntry(models.Model):
    """
    Daily progress entry filled by patient after therapy session.
    Patient fills form on therapy day, then every 24 hours for 7 days.
    """
    patient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="progress_entries"
    )
    appointment = models.ForeignKey(
        Appointment,
        on_delete=models.CASCADE,
        related_name="progress_entries",
        null=True,
        blank=True
    )
    treatment_plan = models.ForeignKey(
        TreatmentPlan,
        on_delete=models.CASCADE,
        related_name="progress_entries",
        null=True,
        blank=True
    )
    
    # Entry metadata
    entry_date = models.DateField(default=timezone.now)
    day_number = models.PositiveIntegerField(
        help_text="Day 0 = therapy day, Day 1-7 = daily follow-ups"
    )
    is_therapy_day = models.BooleanField(
        default=False,
        help_text="True if this is the day of therapy"
    )
    
    # Progress metrics (0-100 scale)
    pain_level = models.IntegerField(
        default=0,
        help_text="Pain level (0-100, 0=no pain, 100=severe pain)"
    )
    sleep_quality = models.IntegerField(
        default=0,
        help_text="Sleep quality (0-100, 0=poor, 100=excellent)"
    )
    stress_level = models.IntegerField(
        default=0,
        help_text="Stress level (0-100, 0=no stress, 100=extreme stress)"
    )
    energy_level = models.IntegerField(
        default=0,
        help_text="Energy level (0-100, 0=no energy, 100=high energy)"
    )
    digestion_quality = models.IntegerField(
        default=0,
        help_text="Digestion quality (0-100, 0=poor, 100=excellent)"
    )
    mood_level = models.IntegerField(
        default=0,
        help_text="Mood level (0-100, 0=very low, 100=excellent)"
    )
    
    # Additional notes
    notes = models.TextField(
        blank=True,
        help_text="Additional observations or notes"
    )
    symptoms = models.JSONField(
        default=list,
        blank=True,
        help_text="List of symptoms experienced"
    )
    medications_taken = models.JSONField(
        default=list,
        blank=True,
        help_text="List of medications taken"
    )
    
    # Ayurvedic metrics (optional)
    agni_score = models.IntegerField(
        null=True,
        blank=True,
        help_text="Digestive fire score (0-100)"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["-entry_date", "-day_number"]
        unique_together = [("patient", "appointment", "day_number")]
        indexes = [
            models.Index(fields=["patient", "entry_date"]),
            models.Index(fields=["appointment", "day_number"]),
        ]
    
    def __str__(self):
        return f"{self.patient.username} - Day {self.day_number} ({self.entry_date})"
    
    def get_metrics_dict(self):
        """Return all metrics as a dictionary for easy charting"""
        return {
            "pain": self.pain_level,
            "sleep": self.sleep_quality,
            "stress": self.stress_level,
            "energy": self.energy_level,
            "digestion": self.digestion_quality,
            "mood": self.mood_level,
        }

