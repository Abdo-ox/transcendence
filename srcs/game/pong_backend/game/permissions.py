from rest_framework import permissions

class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return obj.player == request.user

class IsOngoing(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method == 'PUT' and obj.isOver:
            return False
        
        return True