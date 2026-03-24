# progress/views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.utils import timezone
from datetime import timedelta, date
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings

from .models import ProgressEntry
from .serializers import ProgressEntrySerializer, ProgressSummarySerializer
from appointments.models import Appointment


class ProgressEntryCreateView(generics.CreateAPIView):
    """Create a new progress entry"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProgressEntrySerializer
    
    def perform_create(self, serializer):
        appointment_id = self.request.data.get("appointment_id")
        
        # Get or validate appointment
        appointment = None
        if appointment_id:
            try:
                appointment = Appointment.objects.get(
                    id=appointment_id,
                    patient=self.request.user
                )
            except Appointment.DoesNotExist:
                pass
        
        # Determine day number
        day_number = self.request.data.get("day_number", 0)
        is_therapy_day = day_number == 0
        
        # Create progress entry
        progress_entry = serializer.save(
            patient=self.request.user,
            appointment=appointment,
            day_number=day_number,
            is_therapy_day=is_therapy_day,
            entry_date=timezone.now().date()
        )
        
        # Send email notification with form copy
        self.send_progress_email(progress_entry)
        
        return progress_entry
    
    def send_progress_email(self, progress_entry):
        """Send email notification with form copy"""
        try:
            user = progress_entry.patient
            user_email = user.email
            
            if not user_email:
                return
            
            # Prepare email content
            subject = f"Progress Form Submitted - Day {progress_entry.day_number}"
            
            # Create email body with form data
            metrics = progress_entry.get_metrics_dict()
            
            email_body = f"""
Dear {user.get_full_name() or user.username},

Thank you for submitting your progress form!

Entry Details:
- Date: {progress_entry.entry_date}
- Day Number: {progress_entry.day_number}
- Type: {'Therapy Day' if progress_entry.is_therapy_day else 'Follow-up Day'}

Your Responses:
- Pain Level: {metrics['pain']}/100
- Sleep Quality: {metrics['sleep']}/100
- Stress Level: {metrics['stress']}/100
- Energy Level: {metrics['energy']}/100
- Digestion Quality: {metrics['digestion']}/100
- Mood Level: {metrics['mood']}/100

Notes: {progress_entry.notes or 'None'}

Symptoms: {', '.join(progress_entry.symptoms) if progress_entry.symptoms else 'None'}
Medications: {', '.join(progress_entry.medications_taken) if progress_entry.medications_taken else 'None'}

Your progress is being tracked. Keep up the great work!

Best regards,
AyushCare Team
"""
            
            # Send email
            send_mail(
                subject=subject,
                message=email_body,
                from_email=settings.EMAIL_HOST_USER or "noreply@ayushcare.com",
                recipient_list=[user_email],
                fail_silently=False,
            )
            
        except Exception as e:
            print(f"Failed to send progress email: {e}")


class UserProgressListView(generics.ListAPIView):
    """Get all progress entries for logged-in user"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProgressEntrySerializer
    
    def get_queryset(self):
        appointment_id = self.request.query_params.get("appointment_id")
        queryset = ProgressEntry.objects.filter(patient=self.request.user)
        
        if appointment_id:
            queryset = queryset.filter(appointment_id=appointment_id)
        
        return queryset.order_by("-entry_date", "-day_number")


class ProgressSummaryView(generics.RetrieveAPIView):
    """Get progress summary/statistics for a user"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        appointment_id = request.query_params.get("appointment_id")
        
        # Get all progress entries
        entries = ProgressEntry.objects.filter(patient=request.user)
        if appointment_id:
            entries = entries.filter(appointment_id=appointment_id)
        
        if not entries.exists():
            return Response({
                "success": False,
                "message": "No progress entries found"
            }, status=404)
        
        # Calculate statistics
        total_entries = entries.count()
        therapy_day_entry = entries.filter(is_therapy_day=True).exists()
        latest_entry = entries.first()
        
        # Calculate averages
        metrics_list = [entry.get_metrics_dict() for entry in entries]
        avg_metrics = {
            "pain": sum(m["pain"] for m in metrics_list) / len(metrics_list),
            "sleep": sum(m["sleep"] for m in metrics_list) / len(metrics_list),
            "stress": sum(m["stress"] for m in metrics_list) / len(metrics_list),
            "energy": sum(m["energy"] for m in metrics_list) / len(metrics_list),
            "digestion": sum(m["digestion"] for m in metrics_list) / len(metrics_list),
            "mood": sum(m["mood"] for m in metrics_list) / len(metrics_list),
        }
        
        # Calculate improvement trends (compare latest with first)
        if total_entries > 1:
            first_entry = entries.last()
            latest_metrics = latest_entry.get_metrics_dict()
            first_metrics = first_entry.get_metrics_dict()
            
            improvement_trends = {
                "pain": latest_metrics["pain"] - first_metrics["pain"],  # Negative is good
                "sleep": latest_metrics["sleep"] - first_metrics["sleep"],  # Positive is good
                "stress": latest_metrics["stress"] - first_metrics["stress"],  # Negative is good
                "energy": latest_metrics["energy"] - first_metrics["energy"],  # Positive is good
                "digestion": latest_metrics["digestion"] - first_metrics["digestion"],  # Positive is good
                "mood": latest_metrics["mood"] - first_metrics["mood"],  # Positive is good
            }
        else:
            improvement_trends = {}
        
        return Response({
            "success": True,
            "data": {
                "total_entries": total_entries,
                "therapy_day_entry": therapy_day_entry,
                "latest_entry_date": latest_entry.entry_date,
                "average_metrics": avg_metrics,
                "improvement_trends": improvement_trends,
                "entries": ProgressEntrySerializer(entries, many=True).data
            }
        })


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def can_submit_progress(request):
    """Check if user can submit progress form (24-hour cooldown)"""
    appointment_id = request.query_params.get("appointment_id")
    
    if not appointment_id:
        return Response({
            "success": False,
            "message": "appointment_id is required"
        }, status=400)
    
    # Get last entry for this appointment
    last_entry = ProgressEntry.objects.filter(
        patient=request.user,
        appointment_id=appointment_id
    ).order_by("-created_at").first()
    
    if not last_entry:
        return Response({
            "success": True,
            "can_submit": True,
            "message": "No previous entries found"
        })
    
    # Check if 24 hours have passed
    time_since_last = timezone.now() - last_entry.created_at
    hours_passed = time_since_last.total_seconds() / 3600
    
    can_submit = hours_passed >= 24
    
    return Response({
        "success": True,
        "can_submit": can_submit,
        "hours_since_last": round(hours_passed, 2),
        "next_submission_time": (last_entry.created_at + timedelta(hours=24)).isoformat() if not can_submit else None
    })

