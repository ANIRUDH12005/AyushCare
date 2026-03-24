# # appointments/serializers.py
# from rest_framework import serializers
# from .models import Appointment
# from clinic.models import Doctor, Center


# class DoctorSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Doctor
#         fields = [
#             "id",
#             "name",
#             "specialty",
#             "phone",
#             "clinic",
#             "timing",
#             "center",
#         ]


# class AppointmentSerializer(serializers.ModelSerializer):
#     # Read-only nested doctor
#     doctor = DoctorSerializer(read_only=True)

#     # Write-only doctor id
#     doctor_id = serializers.PrimaryKeyRelatedField(
#         queryset=Doctor.objects.all(),
#         source="doctor",
#         write_only=True,
#         required=True
#     )

#     patient_username = serializers.CharField(
#         source="patient.username",
#         read_only=True
#     )

#     class Meta:
#         model = Appointment
#         fields = [
#             "id",
#             "patient",
#             "patient_username",
#             "doctor",
#             "doctor_id",
#             "date",
#             "time",
#             "appointment_type",
#             "location_name",
#             "building",
#             "room",
#             "notes",
#             "status",
#             "created_at",
#             "updated_at",
#         ]

#         read_only_fields = [
#             "id",
#             "patient",
#             "created_at",
#             "updated_at",
#             "patient_username",
#         ]



# appointments/serializers.py
# appointments/serializers.py
from rest_framework import serializers
from .models import Appointment
from clinic.models import Doctor, Center


class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = ["id", "name", "specialty", "phone", "center", "timing"]


class AppointmentSerializer(serializers.ModelSerializer):
    doctor = DoctorSerializer(read_only=True)
    
    # Add doctor_name and center_name fields for frontend compatibility
    doctor_name = serializers.SerializerMethodField()
    center_name = serializers.SerializerMethodField()

    doctor_id = serializers.PrimaryKeyRelatedField(
        queryset=Doctor.objects.all(),
        source="doctor",
        write_only=True
    )

    center_id = serializers.PrimaryKeyRelatedField(
        queryset=Center.objects.all(),
        write_only=True
    )

    class Meta:
        model = Appointment
        fields = [
            "id",
            "doctor",
            "doctor_name",
            "center_name",
            "doctor_id",
            "center_id",
            "date",
            "time",
            "appointment_type",
            "location_name",
            "notes",
            "status",
            "created_at",
        ]

    def get_doctor_name(self, obj):
        """Return doctor name for frontend compatibility"""
        if obj.doctor:
            return obj.doctor.name
        return None
    
    def get_center_name(self, obj):
        """Return center name from location_name or doctor's center"""
        if obj.location_name:
            return obj.location_name
        if obj.doctor and obj.doctor.center:
            return obj.doctor.center.name
        return None

    def create(self, validated_data):
        validated_data.pop("center_id")  # ✅ KEY LINE
        return super().create(validated_data)
