from rest_framework import serializers
from .models import PatientProfile

class PatientProfileSerializer(serializers.ModelSerializer):
    email = serializers.SerializerMethodField(read_only=True)
    user_email = serializers.CharField(source="user.email", read_only=True)
    height = serializers.FloatField(source="height_cm", required=False)
    weight = serializers.FloatField(source="weight_kg", required=False)

    class Meta:
        model = PatientProfile
        # include all fields so frontend can update everything
        fields = [
            "id",
            "user",
            "full_name",
            "gender",
            "dob",
            "phone",
            "email",
            "user_email",
            "address",
            "marital_status",
            "occupation",
            "lifestyle",
            "emergency_contact_name",
            "emergency_contact_relation",
            "emergency_contact_phone",
            "preferred_communication",
            "blood_group",
            "height",
            "height_cm",
            "weight",
            "weight_kg",
            "allergies",
            "current_medication",
            "past_medical_history",
            "current_symptoms",
            "addictions",
            "blood_pressure",
            "pulse_rate",
            "menstrual_history",
            "prakriti",
            "vikriti",
            "seasonal_allergies",
            "body_type_tendency",
            "contraindications",
            "treatment_goals",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["user", "created_at", "updated_at", "email", "user_email"]

    def get_email(self, obj):
        # Prefer stored profile email, but fallback to user.email
        return obj.email or (obj.user.email if obj.user else None)
    
    def to_internal_value(self, data):
        # Handle height/weight mapping from form
        if 'height' in data and 'height_cm' not in data:
            data['height_cm'] = data.get('height')
        if 'weight' in data and 'weight_kg' not in data:
            data['weight_kg'] = data.get('weight')
        return super().to_internal_value(data)
    
    def create(self, validated_data):
        # Pre-fill email from user if not provided
        user = validated_data.get('user')
        if user and not validated_data.get('email'):
            validated_data['email'] = user.email
        return super().create(validated_data)

    def validate(self, data):
        # basic validation: required fields on creation
        request = self.context.get("request")
        if request and request.method in ("POST",):
            required = ["full_name", "phone", "address"]
            missing = [f for f in required if not data.get(f)]
            if missing:
                raise serializers.ValidationError(
                    { "missing_fields": f"Required fields missing: {', '.join(missing)}" }
                )
        return data
