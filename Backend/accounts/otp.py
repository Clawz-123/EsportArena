# import random
# import redis
# from django.conf import settings
# from django.core.mail import send_mail
# from .models import User

# # Connect to Redis
# redis_client = redis.StrictRedis(
#     host=settings.REDIS_HOST,
#     port=settings.REDIS_PORT,
#     db=settings.REDIS_DB,
#     password=settings.REDIS_PASSWORD,
#     decode_responses=True
# )

# def generate_otp(length=6):
#     return ''.join([str(random.randint(0, 9)) for _ in range(length)])

# def set_otp(email, otp, expiry=300):
#     redis_client.setex(f"otp:{email}", expiry, otp)

# def get_otp(email):
#     return redis_client.get(f"otp:{email}")

# def send_otp_email(email, otp):
#     subject = 'Your OTP Code'
#     message = f'Your OTP code is: {otp}. It is valid for 5 minutes.'
#     send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])

# def create_and_send_otp(email, expiry=300):
#     """Generate OTP, store in Redis, and send via email"""
#     otp = generate_otp()
#     set_otp(email, otp, expiry)
#     send_otp_email(email, otp)
#     return otp

# def verify_otp(email, otp_input):
#     stored_otp = get_otp(email)
#     if stored_otp and stored_otp == otp_input:
#         try:
#             user = User.objects.get(email=email)
#             user.is_verified = True
#             user.save()
#         except User.DoesNotExist:
#             return False
#         redis_client.delete(f"otp:{email}")
#         return True
#     return False
