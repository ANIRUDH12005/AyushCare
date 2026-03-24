# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# from rest_framework import status

# from .models import PatientProfile
# from .serializers import PatientProfileSerializer

# class PatientProfileView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         try:
#             profile = request.user.profile
#             serializer = PatientProfileSerializer(profile)
#             # determine "incomplete" by checking a few key fields
#             is_incomplete = (
#                 not profile.full_name or
#                 not profile.phone or
#                 not profile.address
#             )
#             return Response({"success": True, "incomplete": is_incomplete, "data": serializer.data}, status=200)
#         except PatientProfile.DoesNotExist:
#             # no profile created yet
#             return Response({"success": False, "incomplete": True, "message": "Profile not created"}, status=404)

#     def post(self, request):
#         # ❗ Prevent creating duplicate profile
#         if hasattr(request.user, "profile"):
#             return Response(
#                 {"success": False, "message": "Profile already exists"},
#                 status=400
#             )

#         serializer = PatientProfileSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save(user=request.user)
#             return Response(
#                 {"success": True, "message": "Profile created"},
#                 status=201
#             )

#         return Response(serializer.errors, status=400)

#     def put(self, request):
#         # update existing profile
#         try:
#             profile = request.user.profile
#         except PatientProfile.DoesNotExist:
#             return Response({"success": False, "message": "Profile not found"}, status=404)

#         serializer = PatientProfileSerializer(profile, data=request.data, partial=True, context={"request": request})
#         if serializer.is_valid():
#             profile = serializer.save()
#             out = PatientProfileSerializer(profile)
#             return Response({"success": True, "message": "Profile updated", "data": out.data}, status=200)
#         return Response({"success": False, "errors": serializer.errors}, status=400)



# patients/views.py
# patients/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.contrib.auth.models import User
from .models import PatientProfile
from .serializers import PatientProfileSerializer


class PatientProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get patient profile, check if incomplete"""
        try:
            profile = PatientProfile.objects.get(user=request.user)
        except PatientProfile.DoesNotExist:
            return Response(
                {"success": False, "incomplete": True, "message": "Profile not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Check if profile is incomplete
        is_incomplete = (
            not profile.full_name or
            not profile.phone or
            not profile.address or
            not profile.blood_group or
            not profile.height_cm or
            not profile.weight_kg
        )

        serializer = PatientProfileSerializer(profile, context={'request': request})
        return Response(
            {
                "success": True,
                "incomplete": is_incomplete,
                "data": serializer.data
            },
            status=status.HTTP_200_OK,
        )
    
    def post(self, request):
        """Create new patient profile"""
        serializer = PatientProfileSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            # Pre-fill email from user if not provided
            if not serializer.validated_data.get('email'):
                serializer.validated_data['email'] = request.user.email
            
            profile = serializer.save(user=request.user)
            return Response(
                {
                    "success": True,
                    "message": "Profile created successfully",
                    "data": PatientProfileSerializer(profile, context={'request': request}).data
                },
                status=status.HTTP_201_CREATED
            )
        
        return Response(
            {"success": False, "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    def put(self, request):
        """Update existing patient profile"""
        try:
            profile = PatientProfile.objects.get(user=request.user)
        except PatientProfile.DoesNotExist:
            return Response(
                {"success": False, "message": "Profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = PatientProfileSerializer(
            profile,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        
        if serializer.is_valid():
            updated_profile = serializer.save()
            return Response(
                {
                    "success": True,
                    "message": "Profile updated successfully",
                    "data": PatientProfileSerializer(updated_profile, context={'request': request}).data
                },
                status=status.HTTP_200_OK
            )
        
        return Response(
            {"success": False, "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )
