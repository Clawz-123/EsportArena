import random
import string
from datetime import timedelta
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from .models import OTP, User


def generate_otp(length=6):
    return ''.join(random.choices(string.digits, k=length))


def send_otp_email(email, otp):
    subject = "Your OTP Code - EsportArena"
    message = f"""
    Hello,

    Your OTP code is: {otp}

    This code will expire in 10 minutes.
    Please do not share this code with anyone.

    If you didn't request this code, please ignore this email.

    Best regards,
    EsportArena Team
    """
    from_email = settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@esportarena.com'
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=[email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False


def create_otp(email):
    OTP.objects.filter(email=email, is_used=False).update(is_used=True)
    
    otp_code = generate_otp()
    
    otp_instance = OTP.objects.create(
        email=email,
        otp=otp_code
    )
    
    email_sent = send_otp_email(email, otp_code)
    
    return otp_instance, email_sent


def verify_otp(email, otp_code):
    try:
        otp_instance = OTP.objects.filter(
            email=email,
            otp=otp_code,
            is_used=False
        ).order_by('-created_at').first()
        
        if not otp_instance:
            return False, "Invalid OTP code"
        
        expiry_time = otp_instance.created_at + timedelta(minutes=10)
        
        if timezone.now() > expiry_time:
            otp_instance.is_used = True
            otp_instance.save()
            return False, "OTP has expired"
        
        otp_instance.is_used = True
        otp_instance.save()
        
        try:
            user = User.objects.get(email=email)
            if not user.is_verified:
                user.is_verified = True
                user.save()
        except User.DoesNotExist:
            pass
        
        return True, "OTP verified successfully"
    
    except Exception as e:
        return False, f"Error verifying OTP: {str(e)}"


def resend_otp(email):
    try:
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return False, "User with this email does not exist"
        
        if user.is_verified:
            return False, "User is already verified"
        
        recent_otp = OTP.objects.filter(
            email=email,
            created_at__gte=timezone.now() - timedelta(minutes=2)
        ).first()
        
        if recent_otp:
            return False, "Please wait 2 minutes before requesting a new OTP"
        
        otp_instance, email_sent = create_otp(email)
        
        if email_sent:
            return True, "OTP has been sent to your email"
        else:
            return False, "Failed to send OTP email. Please try again later."
    
    except Exception as e:
        return False, f"Error resending OTP: {str(e)}"


create_and_send_otp = create_otp
