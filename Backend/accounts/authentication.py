from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.utils import timezone


class JWTBlockedAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        user = super().get_user(validated_token)
        if user is not None and not user.is_superuser:
            # Check if user is blocked or has an active temporal block
            if user.is_blocked or (user.blocked_until and user.blocked_until > timezone.now()):
                # Construct block message
                if user.blocked_until and user.blocked_until > timezone.now():
                    rem = user.blocked_until - timezone.now()
                    d, h, m = rem.days, rem.seconds // 3600, (rem.seconds % 3600) // 60
                    time_parts = []
                    if d > 0: time_parts.append(f"{d} days")
                    if h > 0: time_parts.append(f"{h} hours")
                    if m > 0 or not time_parts: time_parts.append(f"{m} minutes")
                    time_str = " ".join(time_parts)
                    
                    if "toxic" in (user.blocked_reason or "").lower():
                        msg = f"You have been blocked due to toxic word your account will be un block in {time_str}."
                    else:
                        msg = f"You have been blocked by admin for {time_str}."
                else:
                    msg = "You have been permanently blocked by admin."
                
                raise AuthenticationFailed(msg)
            
            # Auto-clear expired blocks if found during authentication
            if user.blocked_until and user.blocked_until <= timezone.now():
                user.is_blocked = False
                user.blocked_until = None
                user.blocked_reason = ""
                user.save(update_fields=["is_blocked", "blocked_until", "blocked_reason"])
                
        return user
