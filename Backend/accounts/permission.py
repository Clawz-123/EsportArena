from rest_framework.permissions import BasePermission

class IsSuperUser (BasePermission):
    def has_permission(self, request):
        return bool(request.user.is_authenticated
                    and request.user.role == "SuperAdmin")