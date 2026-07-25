from rest_framework.permissions import BasePermission
from .models import UserProfile


def get_user_role(user):
    """Returns the role string for a user, or None if no profile exists."""
    try:
        return user.userprofile.role
    except UserProfile.DoesNotExist:
        return None


class IsRecyclingOperatorOrAdmin(BasePermission):
    """
    Allows write access only to Recycling Facility Operators and
    Textile Manufacturer Administrators. Read access is open to any
    authenticated user regardless of role.
    """

    ALLOWED_WRITE_ROLES = {
        'Recycling Facility Operator',
        'Textile Manufacturer Administrator',
    }

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Anyone logged in can view (GET/HEAD/OPTIONS)
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True

        # Only specific roles can create/update/delete
        role = get_user_role(request.user)
        return role in self.ALLOWED_WRITE_ROLES


class IsAdministrator(BasePermission):
    """Restricts access entirely to Textile Manufacturer Administrators."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return get_user_role(request.user) == 'Textile Manufacturer Administrator'
