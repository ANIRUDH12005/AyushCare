from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import TherapistAssignment, Doctor, Therapist
from appointments.models import TreatmentPlan
from .serializers import TherapistAssignmentSerializer, TherapistSerializer
from django.contrib.auth.models import User
from notifications.utils import send_websocket_notification, send_push_notification

class AssignTherapistView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        # Ensure user is a doctor
        try:
            doctor = user.doctor
        except Doctor.DoesNotExist:
            return Response({"success": False, "message": "Only doctors can assign therapists"}, status=status.HTTP_403_FORBIDDEN)

        data = request.data
        patient_id = data.get("patient_id")
        therapist_id = data.get("therapist_id")
        treatment_plan_id = data.get("treatment_plan_id")
        notes = data.get("notes", "")

        if not patient_id or not therapist_id:
            return Response({"success": False, "message": "Patient ID and Therapist ID are required"}, status=status.HTTP_400_BAD_REQUEST)

        patient = get_object_or_404(User, id=patient_id)
        therapist = get_object_or_404(Therapist, id=therapist_id)
        treatment_plan = None
        if treatment_plan_id:
            treatment_plan = get_object_or_404(TreatmentPlan, id=treatment_plan_id)

        assignment = TherapistAssignment.objects.create(
            patient=patient,
            doctor=doctor,
            therapist=therapist,
            treatment_plan=treatment_plan,
            notes=notes
        )

        # Trigger notifications
        msg = f"Doctor {doctor.name} has assigned therapist {therapist.name} to you. Please provide your consent."
        send_websocket_notification("New Therapist Assignment", msg)
        try:
            send_push_notification(patient, "New Therapist Assignment", msg)
        except Exception as e:
            print(f"Push notification failed: {e}")
        
        serializer = TherapistAssignmentSerializer(assignment)
        return Response({
            "success": True, 
            "message": "Therapist assigned successfully. Waiting for patient consent.",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)

class AssignmentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        role = "PATIENT"
        try:
            role = user.user_profile.role
        except:
            pass

        if role == "DOCTOR":
            assignments = TherapistAssignment.objects.filter(doctor__user=user)
        elif role == "THERAPIST":
            assignments = TherapistAssignment.objects.filter(therapist__user=user)
        else:
            assignments = TherapistAssignment.objects.filter(patient=user)

        serializer = TherapistAssignmentSerializer(assignments, many=True)
        return Response({"success": True, "data": serializer.data})

class UpdateConsentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, assignment_id):
        assignment = get_object_or_404(TherapistAssignment, id=assignment_id, patient=request.user)
        
        action = request.data.get("action") # "approve" or "decline"
        if action == "approve":
            assignment.status = "approved"
            # TODO: Automatically create therapist appointment if needed
        elif action == "decline":
            assignment.status = "declined"
        else:
            return Response({"success": False, "message": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)
        
        assignment.save()

        # Trigger notification to doctor
        msg = f"Patient {request.user.username} has {assignment.status} the therapist assignment."
        send_websocket_notification("Consent Update", msg)
        if assignment.doctor.user:
            try:
                send_push_notification(assignment.doctor.user, "Consent Update", msg)
            except Exception as e:
                print(f"Push notification failed: {e}")

        return Response({
            "success": True, 
            "message": f"Assignment {assignment.status} successfully",
            "status": assignment.status
        })

class TherapistListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # List all active therapists for selection
        therapists = Therapist.objects.filter(is_active=True)
        serializer = TherapistSerializer(therapists, many=True)
        return Response({"success": True, "data": serializer.data})
