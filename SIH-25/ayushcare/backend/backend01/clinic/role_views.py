"""
Role-based Dashboard Views for Doctor and Therapist
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q
from django.utils import timezone
from datetime import date, timedelta

from django.contrib.auth.models import User
from patients.models import PatientProfile
from appointments.models import Appointment, TreatmentPlan, DailySession
from .models import Therapist, TherapistAttendance, Doctor
from notifications.models import Notification


def is_doctor(user):
    """Check if user is a doctor"""
    return hasattr(user, 'doctor') and user.doctor is not None


def is_therapist(user):
    """Check if user is a therapist"""
    return hasattr(user, 'therapist_profile') and user.therapist_profile is not None


# ======================
# DOCTOR DASHBOARD
# ======================
class DoctorDashboardView(APIView):
    """Doctor Dashboard - Overview"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not is_doctor(request.user):
            return Response(
                {"success": False, "message": "Access denied. Doctor role required."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        today = date.today()
        doctor = request.user.doctor
        
        # Today's appointments
        today_appointments = Appointment.objects.filter(
            doctor=doctor,
            date=today
        ).select_related("patient", "therapist").order_by("time")
        
        # Active therapy plans
        active_plans = TreatmentPlan.objects.filter(
            doctor=doctor,
            status="ongoing"
        ).select_related("patient", "procedure").count()
        
        # Assigned therapists
        assigned_therapists = Appointment.objects.filter(
            doctor=doctor,
            date__gte=today,
            therapist__isnull=False
        ).values("therapist__name", "therapist__id").distinct()
        
        # Patient count under care
        patient_count = TreatmentPlan.objects.filter(
            doctor=doctor,
            status="ongoing"
        ).values("patient").distinct().count()
        
        return Response({
            "success": True,
            "doctor_name": doctor.name,
            "today_appointments": [
                {
                    "id": apt.id,
                    "patient": apt.patient.username,
                    "therapist": apt.therapist.name if apt.therapist else None,
                    "time": str(apt.time),
                    "status": apt.status,
                    "type": apt.appointment_type,
                }
                for apt in today_appointments
            ],
            "active_plans": active_plans,
            "assigned_therapists": [
                {"id": t["therapist__id"], "name": t["therapist__name"]}
                for t in assigned_therapists
            ],
            "patient_count": patient_count,
        })


class DoctorAppointmentsView(APIView):
    """Doctor - View appointments"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not is_doctor(request.user):
            return Response(
                {"success": False, "message": "Access denied"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        doctor = request.user.doctor
        status_filter = request.query_params.get("status")
        
        queryset = Appointment.objects.filter(doctor=doctor).select_related("patient", "therapist")
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        appointments = queryset.order_by("-date", "-time")
        
        return Response({
            "success": True,
            "appointments": [
                {
                    "id": apt.id,
                    "patient": apt.patient.username,
                    "therapist": apt.therapist.name if apt.therapist else None,
                    "date": apt.date.isoformat(),
                    "time": str(apt.time),
                    "status": apt.status,
                    "type": apt.appointment_type,
                }
                for apt in appointments
            ]
        })


class DoctorPatientHistoryView(APIView):
    """Doctor - View patient history"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, patient_id):
        if not is_doctor(request.user):
            return Response(
                {"success": False, "message": "Access denied"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            patient = User.objects.get(pk=patient_id)
        except User.DoesNotExist:
            return Response(
                {"success": False, "message": "Patient not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get all treatment plans for this patient
        treatment_plans = TreatmentPlan.objects.filter(
            patient=patient,
            doctor=request.user.doctor
        ).select_related("procedure").order_by("-start_date")
        
        # Get all appointments
        appointments = Appointment.objects.filter(
            patient=patient,
            doctor=request.user.doctor
        ).order_by("-date", "-time")
        
        return Response({
            "success": True,
            "patient": {
                "id": patient.id,
                "username": patient.username,
                "email": patient.email,
            },
            "treatment_plans": [
                {
                    "id": plan.id,
                    "procedure": plan.procedure.name,
                    "status": plan.status,
                    "phase": plan.current_phase,
                    "start_date": plan.start_date.isoformat(),
                    "end_date": plan.end_date.isoformat() if plan.end_date else None,
                    "notes": plan.notes,
                }
                for plan in treatment_plans
            ],
            "appointments": [
                {
                    "id": apt.id,
                    "date": apt.date.isoformat(),
                    "time": str(apt.time),
                    "status": apt.status,
                    "type": apt.appointment_type,
                }
                for apt in appointments
            ],
        })


class DoctorTherapistListView(APIView):
    """Doctor - View all therapists with expertise"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not is_doctor(request.user):
            return Response(
                {"success": False, "message": "Access denied"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        therapists = Therapist.objects.filter(is_active=True).select_related("center")
        
        # Get workload for each therapist
        today = date.today()
        therapist_data = []
        for therapist in therapists:
            workload = Appointment.objects.filter(
                therapist=therapist,
                date=today
            ).count()
            
            # Check availability
            attendance = TherapistAttendance.objects.filter(
                therapist=therapist,
                date=today
            ).first()
            
            therapist_data.append({
                "id": therapist.id,
                "name": therapist.name,
                "specialty": therapist.specialty,
                "experience_years": therapist.experience_years,
                "center": therapist.center.name if therapist.center else None,
                "workload": workload,
                "availability": attendance.status if attendance else "unknown",
                "phone": therapist.phone,
                "email": therapist.email,
            })
        
        return Response({
            "success": True,
            "therapists": therapist_data,
        })


class DoctorAssignTherapistView(APIView):
    """Doctor - Assign therapist to therapy plan"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        if not is_doctor(request.user):
            return Response(
                {"success": False, "message": "Access denied"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        therapy_plan_id = request.data.get("therapy_plan_id")
        therapist_id = request.data.get("therapist_id")
        
        try:
            therapy_plan = TreatmentPlan.objects.get(
                pk=therapy_plan_id,
                doctor=request.user.doctor
            )
            therapist = Therapist.objects.get(pk=therapist_id)
        except TreatmentPlan.DoesNotExist:
            return Response(
                {"success": False, "message": "Therapy plan not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Therapist.DoesNotExist:
            return Response(
                {"success": False, "message": "Therapist not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Assign therapist to related appointments
        Appointment.objects.filter(
            treatment_plan=therapy_plan,
            therapist__isnull=True
        ).update(therapist=therapist)
        
        return Response({
            "success": True,
            "message": f"Therapist {therapist.name} assigned successfully",
        })


# ======================
# THERAPIST DASHBOARD
# ======================
class TherapistDashboardView(APIView):
    """Therapist Dashboard - Overview"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not is_therapist(request.user):
            return Response(
                {"success": False, "message": "Access denied. Therapist role required."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        today = date.today()
        therapist = request.user.therapist_profile
        
        # Today's assigned sessions
        today_sessions = Appointment.objects.filter(
            therapist=therapist,
            date=today
        ).select_related("patient", "doctor", "treatment_plan").order_by("time")
        
        # Pending sessions
        pending_sessions = Appointment.objects.filter(
            therapist=therapist,
            date__gte=today,
            status__in=["scheduled", "checked_in"]
        ).count()
        
        # Completed sessions
        completed_sessions = Appointment.objects.filter(
            therapist=therapist,
            status="completed"
        ).count()
        
        return Response({
            "success": True,
            "therapist_name": therapist.name,
            "today_sessions": [
                {
                    "id": apt.id,
                    "patient": apt.patient.username,
                    "doctor": apt.doctor.name if apt.doctor else None,
                    "time": str(apt.time),
                    "status": apt.status,
                    "type": apt.appointment_type,
                }
                for apt in today_sessions
            ],
            "pending_sessions": pending_sessions,
            "completed_sessions": completed_sessions,
        })


class TherapistAppointmentsView(APIView):
    """Therapist - View assigned appointments"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not is_therapist(request.user):
            return Response(
                {"success": False, "message": "Access denied"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        therapist = request.user.therapist_profile
        appointments = Appointment.objects.filter(
            therapist=therapist
        ).select_related("patient", "doctor").order_by("-date", "-time")
        
        return Response({
            "success": True,
            "appointments": [
                {
                    "id": apt.id,
                    "patient": apt.patient.username,
                    "doctor": apt.doctor.name if apt.doctor else None,
                    "date": apt.date.isoformat(),
                    "time": str(apt.time),
                    "status": apt.status,
                    "type": apt.appointment_type,
                }
                for apt in appointments
            ]
        })


class TherapistPatientDetailsView(APIView):
    """Therapist - View patient details and therapy plan"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, patient_id):
        if not is_therapist(request.user):
            return Response(
                {"success": False, "message": "Access denied"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        therapist = request.user.therapist_profile
        
        try:
            patient = User.objects.get(pk=patient_id)
        except User.DoesNotExist:
            return Response(
                {"success": False, "message": "Patient not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get therapy plans assigned to this therapist
        treatment_plans = TreatmentPlan.objects.filter(
            patient=patient
        ).filter(
            Q(appointments__therapist=therapist) | Q(daily_sessions__treatment_plan__patient=patient)
        ).distinct().select_related("procedure", "doctor")
        
        # Get daily sessions
        daily_sessions = DailySession.objects.filter(
            treatment_plan__patient=patient
        ).order_by("-session_date")
        
        # Get patient profile
        profile = None
        if hasattr(patient, 'patient_profile'):
            profile = patient.patient_profile
        
        return Response({
            "success": True,
            "patient": {
                "id": patient.id,
                "username": patient.username,
                "email": patient.email,
                "full_name": profile.full_name if profile else None,
                "phone": profile.phone if profile else None,
            },
            "therapy_plans": [
                {
                    "id": plan.id,
                    "procedure": plan.procedure.name,
                    "doctor": plan.doctor.name if plan.doctor else None,
                    "status": plan.status,
                    "phase": plan.current_phase,
                    "notes": plan.notes,
                }
                for plan in treatment_plans
            ],
            "daily_sessions": [
                {
                    "id": session.id,
                    "session_date": session.session_date.isoformat(),
                    "day_number": session.day_number,
                    "procedure_done": session.procedure_done,
                    "doctor_notes": session.doctor_notes,
                    "patient_response": session.patient_response,
                }
                for session in daily_sessions
            ],
        })


class TherapistUpdateSessionView(APIView):
    """Therapist - Update daily session"""
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, session_id):
        if not is_therapist(request.user):
            return Response(
                {"success": False, "message": "Access denied"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            session = DailySession.objects.get(pk=session_id)
        except DailySession.DoesNotExist:
            return Response(
                {"success": False, "message": "Session not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Update session
        if "procedure_done" in request.data:
            session.procedure_done = request.data["procedure_done"]
        if "patient_response" in request.data:
            session.patient_response = request.data["patient_response"]
        
        session.save()
        
        return Response({
            "success": True,
            "message": "Session updated successfully",
        })


class TherapistMarkSessionCompleteView(APIView):
    """Therapist - Mark appointment/session as complete"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, appointment_id):
        if not is_therapist(request.user):
            return Response(
                {"success": False, "message": "Access denied"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        therapist = request.user.therapist_profile
        
        try:
            appointment = Appointment.objects.get(
                pk=appointment_id,
                therapist=therapist
            )
        except Appointment.DoesNotExist:
            return Response(
                {"success": False, "message": "Appointment not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        appointment.status = "completed"
        appointment.completed_at = timezone.now()
        appointment.save()
        
        return Response({
            "success": True,
            "message": "Session marked as completed",
        })

