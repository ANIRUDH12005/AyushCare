"""
Role-based authentication views for Doctor and Therapist
These users are created by admin and login with unique credentials
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from django.contrib.auth.hashers import check_password
from rest_framework_simplejwt.tokens import RefreshToken

from clinic.models import Doctor, Therapist


class DoctorTherapistLoginView(APIView):
    """
    Login for Doctor and Therapist
    They use username/password created by admin
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        
        if not username or not password:
            return Response({
                "success": False,
                "message": "Username and password required"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({
                "success": False,
                "message": "Invalid credentials"
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        if not check_password(password, user.password):
            return Response({
                "success": False,
                "message": "Invalid credentials"
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check if user is doctor or therapist
        is_doctor = hasattr(user, 'doctor') and user.doctor is not None
        is_therapist = hasattr(user, 'therapist_profile') and user.therapist_profile is not None
        
        if not is_doctor and not is_therapist:
            return Response({
                "success": False,
                "message": "Access denied. This account is not a doctor or therapist."
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        role = "doctor" if is_doctor else "therapist"
        name = user.doctor.name if is_doctor else user.therapist_profile.name
        
        return Response({
            "success": True,
            "role": role,
            "name": name,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user_id": user.id,
        }, status=status.HTTP_200_OK)


class GetUserRoleView(APIView):
    """
    Get current user's role
    Used to determine which dashboard to show
    """
    def get(self, request):
        user = request.user
        
        is_doctor = hasattr(user, 'doctor') and user.doctor is not None
        is_therapist = hasattr(user, 'therapist_profile') and user.therapist_profile is not None
        
        if is_doctor:
            return Response({
                "success": True,
                "role": "doctor",
                "name": user.doctor.name,
            })
        elif is_therapist:
            return Response({
                "success": True,
                "role": "therapist",
                "name": user.therapist_profile.name,
            })
        else:
            return Response({
                "success": True,
                "role": "patient",
            })

