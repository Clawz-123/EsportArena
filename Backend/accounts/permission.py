from rest_framework.permissions import BasePermission
from django.utils import timezone


class IsSuperUser(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_superuser


class IsNotBlocked(BasePermission):
    def has_permission(self, request, view):
        user = getattr(request, "user", None)
        if user and user.is_authenticated:
            # Skip check for superusers
            if user.is_superuser:
                return True
                
            # Auto-clear expired blocks
            if user.blocked_until and user.blocked_until <= timezone.now():
                user.is_blocked = False
                user.blocked_until = None
                user.blocked_reason = ""
                user.save(update_fields=["is_blocked", "blocked_until", "blocked_reason"])
                return True

            # If still within block period
            if user.is_blocked or (user.blocked_until and user.blocked_until > timezone.now()):
                return False
        return True