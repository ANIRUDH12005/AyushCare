from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken

from django.db import IntegrityError

import random
from .models import OTP, UserSettings
from .serializers import SignupSerializer, VerifyOTPSerializer, LoginSerializer, UserSettingsSerializer


class SignupView(APIView):
    def post(self, request):
        data = request.data
        serializer = SignupSerializer(data=data)

        if serializer.is_valid():

            email = data["email"]
            username = data["username"]
            password = data["password"]
            role = data.get("role", "patient")  # optional
            phone = data.get("phone")

            # Check if email already exists
            if User.objects.filter(email=email).exists():
                return Response({"success": False, "message": "Email already registered"}, status=400)

            # Create or update OTP entry
            otp_entry, created = OTP.objects.get_or_create(email=email)
            otp_entry.generate_otp()
            
            # Store temporary password + username + role
            otp_entry.temp_password = password
            otp_entry.temp_username = username
            otp_entry.temp_role = role.upper()
            otp_entry.temp_phone = phone
            otp_entry.save()

            print(f"[SignupView] Data received: {data}")
            print(f"[SignupView] OTP generated for {email}: {otp_entry.otp}")

            # Send OTP Email
            send_mail(
                subject="Your AyushCare OTP",
                message=f"Your OTP is {otp_entry.otp}. It expires in 5 minutes.",
                from_email="noreply@ayushcare.com",
                recipient_list=[email],
            )

            return Response(
                {"success": True, "message": "OTP sent to your email"},
                status=status.HTTP_200_OK
            )

        return Response({"success": False, "errors": serializer.errors}, status=400)



class VerifyOTPView(APIView):
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {"success": False, "errors": serializer.errors},
                status=400
            )

        email = serializer.validated_data["email"]
        otp = serializer.validated_data["otp"]

        otp_entry = OTP.objects.filter(email=email).first()
        if not otp_entry:
            return Response(
                {"success": False, "message": "OTP record not found"},
                status=404
            )

        if not otp_entry.is_valid(otp):
            if otp_entry.is_expired():
                return Response({"success": False, "message": "OTP expired"}, status=400)
            return Response({"success": False, "message": "Invalid OTP"}, status=400)

        # OTP is valid -> Mark verified
        otp_entry.is_verified = True
        otp_entry.save()

        # Final Account Creation
        try:
            username_to_use = otp_entry.temp_username or email.split('@')[0]
            # Handle username collision
            base_username = username_to_use.replace(" ", "_").lower()
            unique_username = base_username
            counter = 1
            while User.objects.filter(username=unique_username).exists():
                unique_username = f"{base_username}{counter}"
                counter += 1

            user = User(
                username=unique_username,
                email=email,
            )
            user.set_password(otp_entry.temp_password)
            
            # Critical: set _role so the post_save signal knows which profile to create
            role = otp_entry.temp_role or "PATIENT"
            user._role = role.upper()
            user.is_active = True
            user.save()

            print(f"[VerifyOTPView] User {user.username} created with role {user._role}")

            # The signal `create_user_profile` in accounts/models.py 
            # will now correctly create the UserProfile and the specific Doctor/Therapist/PatientProfile
            
            # Update specific profiles with temp data (phone number, etc.)
            # These profiles are now guaranteed to exist because the signal handled it.
            if user._role == "PATIENT" and hasattr(user, "patient_profile"):
                user.patient_profile.phone = otp_entry.temp_phone
                user.patient_profile.full_name = otp_entry.temp_username
                user.patient_profile.save()
            elif user._role == "DOCTOR" and hasattr(user, "doctor"): 
                user.doctor.phone = otp_entry.temp_phone
                user.doctor.name = otp_entry.temp_username
                user.doctor.save()
            elif user._role == "THERAPIST" and hasattr(user, "therapist_profile"):
                user.therapist_profile.phone = otp_entry.temp_phone
                user.therapist_profile.name = otp_entry.temp_username
                user.therapist_profile.save()

            otp_entry.delete()

            refresh = RefreshToken.for_user(user)
            refresh['role'] = user._role
            refresh['email'] = user.email
            refresh['username'] = user.username

            return Response({
                "success": True,
                "message": "Account created successfully",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "role": role.upper()
            }, status=201)

        except Exception as e:
            print(f"[VerifyOTPView] Creation error: {str(e)}")
            return Response({"success": False, "message": "Account creation failed"}, status=500)

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():
            identifier = serializer.validated_data["email"]
            password = serializer.validated_data["password"]
            provided_role = request.data.get("role")
            
            print(f"[LoginView] Login attempt for identifier: {identifier}, role: {provided_role}")

            # Lookup by email, username, or phone (patient profile)
            user = None
            if "@" in identifier:
                user = User.objects.filter(email=identifier).first()
            if user is None:
                user = User.objects.filter(username=identifier).first()
            if user is None:
                # Check PatientProfile
                try:
                    from patients.models import PatientProfile
                    profile = PatientProfile.objects.filter(phone=identifier).select_related("user").first()
                    if profile: user = profile.user
                except: pass
                
                # Check Doctor
                if user is None:
                    try:
                        from clinic.models import Doctor
                        doc = Doctor.objects.filter(phone=identifier).select_related("user").first()
                        if doc: user = doc.user
                    except: pass
                
                # Check Therapist
                if user is None:
                    try:
                        from clinic.models import Therapist
                        thera = Therapist.objects.filter(phone=identifier).select_related("user").first()
                        if thera: user = thera.user
                    except: pass

            if not user:
                print(f"[LoginView] User not found for identifier: {identifier}")
                return Response({"success": False, "message": "User not found"}, status=404)

            # Use authenticate for secure password checking and active status verification
            authenticated_user = authenticate(username=user.username, password=password)
            
            if not authenticated_user:
                print(f"[LoginView] Authentication failed for user: {user.username}")
                # check if inactive
                if not user.is_active:
                    return Response({"success": False, "message": "Account is inactive"}, status=403)
                return Response({"success": False, "message": "Incorrect password"}, status=400)
            
            user = authenticated_user

            # Validate Role
            user_role = "PATIENT"
            try:
                user_role = user.user_profile.role
            except:
                pass
            
            if provided_role and provided_role.upper() != user_role.upper():
                return Response({
                    "success": False, 
                    "message": f"Unauthorized. This account is registered as {user_role}. Please select the correct role."
                }, status=403)

            refresh = RefreshToken.for_user(user)
            role = user.user_profile.role
            
            refresh['role'] = role
            refresh['email'] = user.email
            refresh['username'] = user.username

            return Response({
                "success": True,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": user.username,
                "role": role,
            })

        return Response({"success": False, "errors": serializer.errors}, status=400)


class UserSettingsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get user settings"""
        try:
            settings = UserSettings.objects.get(user=request.user)
        except UserSettings.DoesNotExist:
            # Create default settings if they don't exist
            settings = UserSettings.objects.create(user=request.user)
        
        serializer = UserSettingsSerializer(settings)
        return Response({
            "success": True,
            "data": serializer.data
        }, status=status.HTTP_200_OK)
    
    def put(self, request):
        """Update user settings"""
        try:
            settings = UserSettings.objects.get(user=request.user)
        except UserSettings.DoesNotExist:
            settings = UserSettings.objects.create(user=request.user)
        
        serializer = UserSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "success": True,
                "message": "Settings updated successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        
        return Response({
            "success": False,
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request):
        """Update user profile information"""
        user = request.user
        data = request.data
        
        # Update user fields
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'email' in data:
            user.email = data['email']
        
        # Update profile picture if provided
        profile_picture = request.FILES.get('profile_picture')
        if profile_picture:
             pass
        
        user.save()
        
        # Also update patient profile if it exists
        from patients.models import PatientProfile
        try:
            patient_profile = PatientProfile.objects.get(user=user)
            if 'phone' in data:
                patient_profile.phone = data['phone']
            if 'address' in data:
                patient_profile.address = data['address']
            if 'dob' in data:
                patient_profile.dob = data['dob']
            if 'gender' in data:
                patient_profile.gender = data['gender']
            patient_profile.save()
        except PatientProfile.DoesNotExist:
            pass
        
        return Response({
            "success": True,
            "message": "Profile updated successfully"
        }, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request):
        """Change user password"""
        user = request.user
        data = request.data
        
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        confirm_password = data.get('confirm_password')
        
        if not current_password or not new_password or not confirm_password:
            return Response({
                "success": False,
                "message": "All password fields are required"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not check_password(current_password, user.password):
            return Response({
                "success": False,
                "message": "Current password is incorrect"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if new_password != confirm_password:
            return Response({
                "success": False,
                "message": "New passwords do not match"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if len(new_password) < 8:
            return Response({
                "success": False,
                "message": "Password must be at least 8 characters long"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user.password = make_password(new_password)
        user.save()
        
        return Response({
            "success": True,
            "message": "Password changed successfully"
        }, status=status.HTTP_200_OK)


class LogoutAllDevicesView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Logout from all devices by blacklisting all tokens"""
        user = request.user
        
        # Blacklist all outstanding tokens for this user
        tokens = OutstandingToken.objects.filter(user=user)
        for token in tokens:
            BlacklistedToken.objects.get_or_create(token=token)
        
        return Response({
            "success": True,
            "message": "Logged out from all devices successfully"
        }, status=status.HTTP_200_OK)
