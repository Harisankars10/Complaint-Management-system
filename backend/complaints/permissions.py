from rest_framework.permissions import BasePermission


class IsAdminRole(BasePermission):
    """Allow access only to users with admin role."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "admin")


class IsOwnerOrAdmin(BasePermission):
    """Allow object access to complaint owner or admin."""

    def has_object_permission(self, request, view, obj):
        return bool(request.user and request.user.is_authenticated and (obj.user_id == request.user.id or request.user.role == "admin"))
