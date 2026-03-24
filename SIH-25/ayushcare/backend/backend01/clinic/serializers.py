from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Doctor, Therapist, TherapistAssignment

class UserMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class DoctorSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    class Meta:
        model = Doctor
        fields = ['id', 'name', 'specialty', 'phone', 'email', 'timing']

class TherapistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Therapist
        fields = ['id', 'name', 'specialty', 'phone', 'email', 'experience_years', 'is_active']

class TherapistAssignmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.username', read_only=True)
    doctor_name = serializers.CharField(source='doctor.name', read_only=True)
    therapist_name = serializers.CharField(source='therapist.name', read_only=True)
    treatment_plan_name = serializers.CharField(source='treatment_plan.procedure.name', read_only=True)
    
    class Meta:
        model = TherapistAssignment
        fields = [
            'id', 'patient', 'doctor', 'therapist', 'treatment_plan',
            'status', 'notes', 'created_at', 'updated_at',
            'patient_name', 'doctor_name', 'therapist_name', 'treatment_plan_name'
        ]
        read_only_fields = ['doctor', 'created_at', 'updated_at']
