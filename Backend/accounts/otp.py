import random
from datetime import timedelta

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone

from .models import User, OTP


# Generate OTP
def generate_otp(length=6):
    return ''.join(str(random.randint(0, 9)) for _ in range(length))


# Create and send OTP
def create_and_send_otp(email, expiry_minutes=3):
    otp_code = generate_otp()
    
    # Remove old unused OTPs
    OTP.objects.filter(email=email, is_used=False).delete()

    otp = OTP.objects.create(
        email=email,
        otp=otp_code,
    )

    try:
        send_mail(
            subject="Your Email Verification OTP",
            message=f"Your OTP code is {otp_code}. It is valid for {expiry_minutes} minutes.",
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        otp.delete()
        raise Exception(f"Failed to send OTP email: {e}")


# Verify OTP
def verify_otp(email, otp_input, expiry_minutes=3):
    otp = OTP.objects.filter(email=email, is_used=False).order_by('-created_at').first()

    if not otp:
        return False, "No valid OTP found. Please request a new one."

    if timezone.now() > otp.created_at + timedelta(minutes=expiry_minutes):
        otp.delete()
        return False, "OTP has expired. Please request a new one."

    if otp.otp != otp_input:
        return False, "Invalid OTP."

    otp.is_used = True
    otp.save()

    try:
        user = User.objects.get(email=email)
        user.is_verified = True
        user.save()
        return True, "Email verified successfully."
    except User.DoesNotExist:
        return False, "User not found."


# Resend OTP
def resend_otp(email):
    try:
        user = User.objects.get(email=email)
        if user.is_verified:
            return False, "Email already verified."

        create_and_send_otp(email)
        return True, "OTP resent successfully."

    except User.DoesNotExist:
        return False, "User not found."
