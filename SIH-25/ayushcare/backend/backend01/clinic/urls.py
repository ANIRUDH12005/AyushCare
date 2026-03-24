from django.urls import path
from . import views
from . import role_views
from . import assignment_views

app_name = "clinic"

urlpatterns = [
    # Doctor Dashboard APIs
    path("doctor/dashboard/", role_views.DoctorDashboardView.as_view(), name="doctor-dashboard"),
    path("doctor/appointments/", role_views.DoctorAppointmentsView.as_view(), name="doctor-appointments"),
    path("doctor/patients/<int:patient_id>/history/", role_views.DoctorPatientHistoryView.as_view(), name="doctor-patient-history"),
    path("doctor/therapists/", role_views.DoctorTherapistListView.as_view(), name="doctor-therapists"),
    path("doctor/assign-therapist/", role_views.DoctorAssignTherapistView.as_view(), name="doctor-assign-therapist"),
    
    # Therapist Dashboard APIs
    path("therapist/dashboard/", role_views.TherapistDashboardView.as_view(), name="therapist-dashboard"),
    path("therapist/appointments/", role_views.TherapistAppointmentsView.as_view(), name="therapist-appointments"),
    path("therapist/patients/<int:patient_id>/details/", role_views.TherapistPatientDetailsView.as_view(), name="therapist-patient-details"),
    path("therapist/sessions/<int:session_id>/update/", role_views.TherapistUpdateSessionView.as_view(), name="therapist-update-session"),
    path("therapist/appointments/<int:appointment_id>/complete/", role_views.TherapistMarkSessionCompleteView.as_view(), name="therapist-complete-session"),
    
    # Assignment & Consent APIs
    path("assignments/", assignment_views.AssignmentListView.as_view(), name="assignment-list"),
    path("assignments/create/", assignment_views.AssignTherapistView.as_view(), name="assignment-create"),
    path("assignments/<int:assignment_id>/consent/", assignment_views.UpdateConsentView.as_view(), name="assignment-consent"),
    path("therapists/list/", assignment_views.TherapistListView.as_view(), name="therapist-list"),
    
    # Note: Other views (appointments, inventory, billing, etc.) can be added later
    # For now, only doctor/therapist role-based views are active
]

