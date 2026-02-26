import random
from datetime import timedelta
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone

from .models import User, OTP


# Created a generate otp function to generate a random 6-digit OTP code
def generate_otp(length=6):
    return ''.join([str(random.randint(0, 9)) for _ in range(length)])


# Created a send otp function to send the generated OTP code to the user's email address
def send_otp(email, otp):
    subject = "Your OTP Code - EsportArena"  
    message = f"""
    Hello,

    your OTP code is: {otp}
    This code will expire in 10 minutes.
    please do not share this code with anyone.


    Regards,
    EsportArena Team
    """
    from_email = settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@esportarena.np'
    
    print(f"[EMAIL DEBUG] Attempting to send OTP email")
    print(f"[EMAIL DEBUG] From: {from_email}")
    print(f"[EMAIL DEBUG] To: {email}")
    print(f"[EMAIL DEBUG] OTP: {otp}")
    print(f"[EMAIL DEBUG] EMAIL_HOST: {settings.EMAIL_HOST}")
    print(f"[EMAIL DEBUG] EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
    
    try:
        result = send_mail(
            subject=subject,
            message=message,  
            from_email=from_email,
            recipient_list=[email],
            fail_silently=False,
        )
        print(f"[EMAIL DEBUG] send_mail returned: {result}")
        print(f"[EMAIL DEBUG] Email sent successfully!")
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] Error sending email: {e}")
        import traceback
        traceback.print_exc()
        return False
    

# Created a function to create OTP and send it to the user's email address
def create_otp(email):
    OTP.objects.filter(email=email, is_used=False).update(is_used=True)
    otp_code = generate_otp()
    otp_instance = OTP.objects.create(email=email, otp=otp_code)
    
    email_sent = send_otp(email, otp_code)
    return otp_instance, email_sent  


# Created a function to verify the OTP code entered by the user and mark it as used if it's valid
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


# Created a function to resend OTP to the user's email address with rate limiting to prevent abuse
def resend_otp(email, allow_verified=False):
    try:
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return False, "User with this email does not exist"
        
        if user.is_verified and not allow_verified:
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


# Alias for backward compatibility
create_and_send_otp = create_otp
