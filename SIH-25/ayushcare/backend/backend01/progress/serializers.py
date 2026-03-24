# progress/serializers.py
from rest_framework import serializers
from .models import ProgressEntry
from appointments.serializers import AppointmentSerializer


class ProgressEntrySerializer(serializers.ModelSerializer):
    appointment_details = AppointmentSerializer(source="appointment", read_only=True)
    
    class Meta:
        model = ProgressEntry
        fields = [
            "id",
            "patient",
            "appointment",
            "appointment_details",
            "treatment_plan",
            "entry_date",
            "day_number",
            "is_therapy_day",
            "pain_level",
            "sleep_quality",
            "stress_level",
            "energy_level",
            "digestion_quality",
            "mood_level",
            "notes",
            "symptoms",
            "medications_taken",
            "agni_score",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "patient", "created_at", "updated_at"]
    
    def validate(self, data):
        """Validate that metrics are within 0-100 range"""
        metrics = [
            "pain_level", "sleep_quality", "stress_level",
            "energy_level", "digestion_quality", "mood_level"
        ]
        
        for metric in metrics:
            value = data.get(metric, 0)
            if value < 0 or value > 100:
                raise serializers.ValidationError(
                    f"{metric} must be between 0 and 100"
                )
        
        return data


class ProgressSummarySerializer(serializers.Serializer):
    """Serializer for progress summary/statistics"""
    total_entries = serializers.IntegerField()
    therapy_day_entry = serializers.BooleanField()
    latest_entry_date = serializers.DateField()
    average_metrics = serializers.DictField()
    improvement_trends = serializers.DictField()

