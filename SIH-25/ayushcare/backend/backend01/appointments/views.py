from rest_framework import generics, permissions, serializers, status
from rest_framework.response import Response
from django.db import IntegrityError
from django.utils import timezone

from rest_framework.generics import RetrieveUpdateDestroyAPIView

from .models import Appointment
from clinic.models import Doctor
from .serializers import AppointmentSerializer, DoctorSerializer
from notifications.models import Notification
from notifications.utils import send_push_notification
from django.core.mail import send_mail
from django.conf import settings


# -----------------------------------
# Create Appointment
# -----------------------------------
class AppointmentCreateView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AppointmentSerializer
    queryset = Appointment.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        doctor = serializer.validated_data.get("doctor")
        
        try:
            appointment = serializer.save(patient=request.user)
            
            # Create notification for successful booking
            doctor_name = doctor.name if doctor else "Doctor"
            notification_title = "Appointment Booked Successfully! 🎉"
            notification_message = (
                f"Your appointment with Dr. {doctor_name} "
                f"is scheduled for {appointment.date} at {appointment.time}. "
                f"Location: {appointment.location_name or 'Panchakarma Center'}"
            )
            
            # Create notification in database
            Notification.objects.create(
                user=request.user,
                title=notification_title,
                message=notification_message,
                notification_type="general",
                is_sent=True,
                sent_at=timezone.now()
            )
            
            # Send push notification
            try:
                send_push_notification(request.user, notification_title, notification_message)
            except Exception as e:
                print(f"Failed to send push notification: {e}")
            
            # Create pre-precaution notification
            precaution_title = "Pre-Procedure Precautions ⚠️"
            precaution_message = (
                "Before your Panchakarma therapy:\n"
                "• Avoid heavy meals 2-3 hours before\n"
                "• Stay hydrated with warm water\n"
                "• Inform doctor about any medications\n"
                "• Wear comfortable, loose clothing\n"
                "• Arrive 15 minutes early"
            )
            
            Notification.objects.create(
                user=request.user,
                title=precaution_title,
                message=precaution_message,
                notification_type="pre_procedure",
                is_sent=True,
                sent_at=timezone.now()
            )
            
            # Send precaution push notification
            try:
                send_push_notification(request.user, precaution_title, precaution_message)
            except Exception as e:
                print(f"Failed to send precaution notification: {e}")

            # Send Email Confirmation
            try:
                subject = "Appointment Confirmation - AyushCare"
                message = (
                    f"Dear {request.user.username},\n\n"
                    f"Your appointment has been successfully booked!\n\n"
                    f"Doctor: Dr. {doctor_name}\n"
                    f"Date: {appointment.date}\n"
                    f"Time: {appointment.time}\n"
                    f"Location: {appointment.location_name or 'Panchakarma Center'}\n\n"
                    f"Please arrive 15 minutes early.\n\n"
                    f"Best regards,\nAyushCare Team"
                )
                from_email = settings.EMAIL_HOST_USER or "no-reply@ayushcare.app"
                recipient_list = [request.user.email]
                send_mail(subject, message, from_email, recipient_list, fail_silently=True)
            except Exception as e:
                print(f"Failed to send email: {e}")
            
            headers = self.get_success_headers(serializer.data)
            return Response({
                "success": True,
                "message": "Appointment booked successfully",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED, headers=headers)
                
        except IntegrityError:
            return Response({
                "success": False,
                "error": "This time slot is already booked. Please choose another slot."
            }, status=status.HTTP_400_BAD_REQUEST)


# -----------------------------------
# Logged-in User Appointments
# -----------------------------------
class UserAppointmentsListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AppointmentSerializer

    def get_queryset(self):
        # Return all appointments for the user (including cancelled, but frontend can filter)
        # Only exclude cancelled if you want to hide them completely
        return Appointment.objects.filter(
            patient=self.request.user
        ).select_related('doctor').order_by("-date", "-time")


# -----------------------------------
# Cancel Appointment
# -----------------------------------
class AppointmentCancelView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AppointmentSerializer
    queryset = Appointment.objects.all()
    lookup_field = "id"

    def update(self, request, *args, **kwargs):
        appointment = self.get_object()

        if appointment.patient != request.user:
            return Response({"error": "Unauthorized"}, status=403)

        appointment.status = "cancelled"
        appointment.save()

        return Response({"message": "Appointment cancelled successfully"})


class AppointmentDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AppointmentSerializer
    queryset = Appointment.objects.all()
    lookup_field = "pk"

    def patch(self, request, *args, **kwargs):
        appointment = self.get_object()

        # Only allow patient to cancel their own appointment
        if appointment.patient != request.user:
            return Response({"success": False, "message": "Not allowed"}, status=403)

        new_status = request.data.get("status")

        if new_status not in ["cancelled", "rescheduled"]:
            return Response({"success": False, "message": "Invalid status"}, status=400)

        appointment.status = new_status
        appointment.save()

        return Response({
            "success": True,
            "message": f"Appointment {new_status} successfully",
            "data": self.get_serializer(appointment).data
        })

# -----------------------------------
# Doctors By Center
# -----------------------------------
class DoctorsByCenterView(generics.ListAPIView):
    serializer_class = DoctorSerializer

    def get_queryset(self):
        return Doctor.objects.filter(center_id=self.kwargs["center_id"])
