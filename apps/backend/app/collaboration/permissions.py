"""
Custom permissions for collaboration features.
"""
from rest_framework import permissions
from app.collaboration.models import DesignCollaborator
from app.designs.models import Design
from app.collaboration.services import get_actual_design_id


class IsDesignCollaborator(permissions.BasePermission):
    """
    Permission to check if user is a collaborator on a design.
    """
    
    def has_permission(self, request, view):
        # For MVP, allow all - later implement proper checks
        return True
    
    def has_object_permission(self, request, view, obj):
        # For MVP, allow all - later implement proper checks
        return True


class IsDesignOwner(permissions.BasePermission):
    """
    Permission to check if user is the owner of a design.
    """
    
    def has_permission(self, request, view):
        design_id = view.kwargs.get('design_id') or view.kwargs.get('pk')
        if not design_id:
            return False
        
        user_id = request.data.get('user_id') or request.query_params.get('user_id')
        if not user_id:
            return False
        
        actual_design_id = get_actual_design_id(design_id)
        if not actual_design_id:
            return False
        
        try:
            design = Design.objects.get(id=actual_design_id)
            return design.user_id == user_id
        except Design.DoesNotExist:
            return False


class IsDesignEditor(permissions.BasePermission):
    """
    Permission to check if user has editor or owner role on a design.
    """
    
    def has_permission(self, request, view):
        design_id = view.kwargs.get('design_id') or view.kwargs.get('pk')
        if not design_id:
            return False
        
        user_id = request.data.get('user_id') or request.query_params.get('user_id')
        if not user_id:
            return False
        
        actual_design_id = get_actual_design_id(design_id)
        if not actual_design_id:
            return False
        
        try:
            collaborator = DesignCollaborator.objects.get(
                design_id=actual_design_id,
                user_id=user_id
            )
            return collaborator.role in ['owner', 'editor']
        except DesignCollaborator.DoesNotExist:
            # Check if user is the design owner
            try:
                design = Design.objects.get(id=actual_design_id)
                return design.user_id == user_id
            except Design.DoesNotExist:
                return False


class HasDesignPermission(permissions.BasePermission):
    """
    Permission to check if user has required role on a design.
    """
    required_role = 'viewer'  # Default to viewer
    
    def has_permission(self, request, view):
        design_id = view.kwargs.get('design_id') or view.kwargs.get('pk')
        if not design_id:
            return False
        
        user_id = request.data.get('user_id') or request.query_params.get('user_id')
        if not user_id:
            return False
        
        actual_design_id = get_actual_design_id(design_id)
        if not actual_design_id:
            return False
        
        # Check collaborator role
        try:
            collaborator = DesignCollaborator.objects.get(
                design_id=actual_design_id,
                user_id=user_id
            )
            role_hierarchy = {'owner': 3, 'editor': 2, 'viewer': 1}
            required_level = role_hierarchy.get(self.required_role, 1)
            user_level = role_hierarchy.get(collaborator.role, 0)
            return user_level >= required_level
        except DesignCollaborator.DoesNotExist:
            # Check if user is the design owner (has all permissions)
            try:
                design = Design.objects.get(id=actual_design_id)
                return design.user_id == user_id
            except Design.DoesNotExist:
                return False


