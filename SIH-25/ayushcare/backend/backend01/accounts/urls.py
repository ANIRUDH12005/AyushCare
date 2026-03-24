from django.urls import path
from .views import (
    SignupView, VerifyOTPView, LoginView,
    UserSettingsView, UpdateProfileView, ChangePasswordView, LogoutAllDevicesView
)
from .role_auth_views import DoctorTherapistLoginView, GetUserRoleView

urlpatterns = [
    path("auth/signup/", SignupView.as_view()),
    path("auth/verify-otp/", VerifyOTPView.as_view()),
    path("auth/login/", LoginView.as_view()),
    
    # Doctor/Therapist login
    path("auth/doctor-therapist-login/", DoctorTherapistLoginView.as_view()),
    path("auth/user-role/", GetUserRoleView.as_view()),
    
    # Settings endpoints
    path("user/settings/", UserSettingsView.as_view()),
    path("user/update-profile/", UpdateProfileView.as_view()),
    path("user/change-password/", ChangePasswordView.as_view()),
    path("logout-all-devices/", LogoutAllDevicesView.as_view()),
]
