from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import Appointment
from notifications.utils import send_push_notification

# ------------------------------
# Pre-procedure Reminder
# ------------------------------
@shared_task
def send_pre_procedure_reminder(appointment_id):
    try:
        appointment = Appointment.objects.get(id=appointment_id)
        message = f"Reminder: You have an upcoming appointment on {appointment.date} at {appointment.time}"
        
        # Send push notification
        send_push_notification(appointment.patient, "Upcoming Appointment", message)

        print("Pre-procedure reminder sent successfully!")

    except Appointment.DoesNotExist:
        print("Appointment not found.")


# ------------------------------
# Post-procedure Reminder
# ------------------------------
@shared_task
def send_post_procedure_reminder(appointment_id):
    try:
        appointment = Appointment.objects.get(id=appointment_id)
        message = "Hope your session went great! Follow your post-procedure steps."

        # Send push notification
        send_push_notification(appointment.patient, "Post Procedure Reminder", message)

        print("Post-procedure reminder sent successfully!")

    except Appointment.DoesNotExist:
        print("Appointment not found.")
