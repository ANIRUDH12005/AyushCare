import random
import secrets
from datetime import timedelta
from typing import Tuple

from django.conf import settings
from django.core.cache import cache
from django.core.mail import send_mail
from django.utils import timezone
from django.contrib.auth.models import User

from .models import PasswordResetToken, EmailOTP


def rate_limited(scope: str, identifier: str, limit: int = 5, window_seconds: int = 300) -> Tuple[bool, int]:
    """
    Simple sliding-window rate limiter using Django cache.
    Returns (is_limited, retry_after_seconds).
    """
    now = timezone.now()
    key = f"rl:{scope}:{identifier}"
    entry = cache.get(key)

    if not entry or entry.get("expires_at") < now:
        expires_at = now + timedelta(seconds=window_seconds)
        cache.set(key, {"count": 1, "expires_at": expires_at}, window_seconds)
        return False, window_seconds

    if entry["count"] >= limit:
        retry_after = int((entry["expires_at"] - now).total_seconds())
        return True, max(1, retry_after)

    entry["count"] += 1
    cache.set(key, entry, int((entry["expires_at"] - now).total_seconds()))
    retry_after = int((entry["expires_at"] - now).total_seconds())
    return False, retry_after


def issue_password_reset(email: str, ttl_minutes: int = 15) -> PasswordResetToken:
    """Create a reset token + OTP and send an email."""
    reset_obj = PasswordResetToken.create_for_email(email, ttl_minutes=ttl_minutes)
    try:
        send_mail(
            subject="AyushCare password reset OTP",
            message=f"Your password reset OTP is {reset_obj.otp}. It expires in {ttl_minutes} minutes.",
            from_email=settings.EMAIL_HOST_USER or "no-reply@ayushcare.app",
            recipient_list=[email],
            fail_silently=False,
        )
    except Exception as e:
        print(f"Error sending email: {e}")
    return reset_obj


def verify_reset_otp(email: str, otp: str) -> Tuple[bool, str, PasswordResetToken | None]:
    """
    Validate the OTP for the most recent, unused reset token.
    Returns tuple (is_valid, message, token_instance_or_none)
    """
    token_obj = (
        PasswordResetToken.objects.filter(email=email, used=False)
        .order_by("-created_at")
        .first()
    )
    if not token_obj:
        return False, "No active reset request. Please request a new OTP.", None

    if token_obj.is_expired():
        token_obj.used = True
        token_obj.save(update_fields=["used"])
        return False, "OTP has expired. Please request a new one.", None

    if token_obj.attempts >= token_obj.max_attempts:
        return False, "Too many attempts. Please request a new OTP.", None

    if token_obj.otp != otp:
        token_obj.increment_attempts()
        return False, "Invalid OTP.", None

    token_obj.verified = True
    token_obj.save(update_fields=["verified"])
    return True, "OTP verified", token_obj


def complete_password_reset(email: str, otp: str, new_password: str) -> Tuple[bool, str]:
    """
    Apply the password reset if otp is valid and mark token used.
    """
    ok, msg, token_obj = verify_reset_otp(email, otp)
    if not ok or not token_obj:
        return False, msg

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return False, "Account not found for this email."

    if not token_obj.verified:
        return False, "OTP not verified. Please verify again."

    user.set_password(new_password)
    user.save()

    token_obj.mark_used()
    return True, "Password updated successfully."


def issue_login_otp(email: str, ttl_minutes: int = 5) -> EmailOTP:
    """
    Issue a short-lived OTP for login validation.
    Reuses EmailOTP but enforces expiry through is_expired().
    """
    otp_entry, _ = EmailOTP.objects.get_or_create(email=email)
    otp_entry.generate_otp()
    otp_entry.created_at = timezone.now()
    otp_entry.save(update_fields=["otp", "created_at"])

    try:
        send_mail(
            subject="AyushCare login OTP",
            message=f"Your login OTP is {otp_entry.otp}. It expires in {ttl_minutes} minutes.",
            from_email=settings.EMAIL_HOST_USER or "no-reply@ayushcare.app",
            recipient_list=[email],
            fail_silently=False, 
        )
    except Exception as e:
        print(f"Error sending login OTP: {e}")
    return otp_entry

