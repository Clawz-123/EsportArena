from rest_framework.permissions import BasePermission

# Permission class to check for SuperAdmin role
class IsSuperUser (BasePermission):
    # Check if the user has SuperAdmin role
    def has_permission(self, request):
        return bool(request.user.is_authenticated
                    and request.user.role == "SuperAdmin")