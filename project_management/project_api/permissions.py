from rest_framework import permissions

class IsApprovedUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_approved

class IsProjectOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # For tasks, check the project owner
        if hasattr(obj, 'project'):
            return request.user.role == 'ADMIN' or obj.project.owner == request.user
        # For projects
        return request.user.role == 'ADMIN' or obj.owner == request.user 