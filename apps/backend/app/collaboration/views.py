from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from django.db import IntegrityError
from app.designs.models import Design
from app.collaboration.models import (
    DesignCollaborator, DesignComment, DesignVersion
)
from app.collaboration.serializers import (
    CollaboratorSerializer, CollaboratorCreateSerializer,
    CommentSerializer, CommentCreateSerializer,
    VersionSerializer, VersionCreateSerializer
)
from app.collaboration.services import get_actual_design_id, ensure_design_exists


class CollaboratorViewSet(viewsets.ViewSet):
    """
    ViewSet for managing design collaborators.
    """
    permission_classes = [AllowAny]  # For MVP - can be changed to [IsDesignEditor] later
    
    def list(self, request, design_id=None):
        """
        Get all collaborators for a design.
        GET /api/designs/:designId/collaborators/
        """
        actual_design_id = get_actual_design_id(design_id)
        if not actual_design_id:
            return Response({'success': True, 'collaborators': []}, status=status.HTTP_200_OK)
        
        collaborators = DesignCollaborator.objects.filter(design_id=actual_design_id)
        serializer = CollaboratorSerializer(collaborators, many=True)
        return Response({'success': True, 'collaborators': serializer.data})
    
    def create(self, request, design_id=None):
        """
        Add a collaborator to a design.
        POST /api/designs/:designId/collaborators/
        """
        try:
            serializer = CollaboratorCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            # Get user_id and invited_by
            user_id = serializer.validated_data.get('user_id')
            role = serializer.validated_data.get('role', 'editor')
            invited_by = serializer.validated_data.get('invited_by', request.data.get('invited_by', 'default-user'))
            
            # Ensure design exists
            actual_design_id = ensure_design_exists(design_id, invited_by)
            design = Design.objects.get(id=actual_design_id)
            
            # Create or update collaborator
            collaborator, created = DesignCollaborator.objects.update_or_create(
                design=design,
                user_id=user_id,
                defaults={
                    'role': role,
                    'invited_by': invited_by,
                }
            )
            
            response_serializer = CollaboratorSerializer(collaborator)
            return Response({'success': True, 'collaborator': response_serializer.data}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'success': False, 'error': 'Failed to add collaborator'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def destroy(self, request, design_id=None, user_id=None):
        """
        Remove a collaborator from a design.
        DELETE /api/designs/:designId/collaborators/:userId/
        """
        actual_design_id = get_actual_design_id(design_id)
        if not actual_design_id:
            return Response(
                {'success': False, 'error': 'Design not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            collaborator = DesignCollaborator.objects.get(design_id=actual_design_id, user_id=user_id)
            collaborator.delete()
            return Response({'success': True}, status=status.HTTP_200_OK)
        except DesignCollaborator.DoesNotExist:
            return Response(
                {'success': False, 'error': 'Collaborator not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class CommentViewSet(viewsets.ViewSet):
    """
    ViewSet for managing design comments.
    """
    permission_classes = [AllowAny]  # For MVP - can be changed to [HasDesignPermission] later
    
    def list(self, request, design_id=None):
        """
        Get all comments for a design (flat list with parent_id for frontend to build tree).
        GET /api/designs/:designId/comments/
        """
        actual_design_id = get_actual_design_id(design_id)
        if not actual_design_id:
            return Response({'success': True, 'comments': []}, status=status.HTTP_200_OK)
        
        # Get ALL comments (frontend will build the tree structure)
        comments = DesignComment.objects.filter(
            design_id=actual_design_id
        ).order_by('-created_at')
        
        serializer = CommentSerializer(comments, many=True)
        return Response({'success': True, 'comments': serializer.data})
    
    def create(self, request, design_id=None):
        """
        Create a comment on a design.
        POST /api/designs/:designId/comments/
        """
        try:
            serializer = CommentCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            # Get user_id
            user_id = serializer.validated_data.get('user_id', request.data.get('user_id', 'default-user'))
            
            # Ensure design exists
            actual_design_id = ensure_design_exists(design_id, user_id)
            design = Design.objects.get(id=actual_design_id)
            
            # Get parent if provided
            parent = None
            parent_id = serializer.validated_data.get('parent_id')
            if parent_id:
                try:
                    parent = DesignComment.objects.get(id=parent_id)
                except DesignComment.DoesNotExist:
                    pass
            
            # Create comment
            comment = DesignComment.objects.create(
                design=design,
                user_id=user_id,
                content=serializer.validated_data['content'],
                object_id=serializer.validated_data.get('object_id'),
                x=serializer.validated_data.get('x'),
                y=serializer.validated_data.get('y'),
                parent=parent,
            )
            
            response_serializer = CommentSerializer(comment)
            return Response({'success': True, 'comment': response_serializer.data}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'success': False, 'error': 'Failed to create comment'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'], url_path='resolve')
    def resolve(self, request, design_id=None, pk=None):
        """
        Resolve a comment.
        POST /api/designs/:designId/comments/:id/resolve
        """
        try:
            comment = DesignComment.objects.get(id=pk)
            comment.resolved = True
            comment.save()
            
            response_serializer = CommentSerializer(comment)
            return Response({'success': True, 'comment': response_serializer.data})
        except DesignComment.DoesNotExist:
            return Response(
                {'success': False, 'error': 'Comment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def destroy(self, request, design_id=None, pk=None):
        """
        Delete a comment.
        DELETE /api/designs/:designId/comments/:id
        """
        try:
            comment = DesignComment.objects.get(id=pk)
            comment.delete()
            return Response({'success': True}, status=status.HTTP_200_OK)
        except DesignComment.DoesNotExist:
            return Response(
                {'success': False, 'error': 'Comment not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class VersionViewSet(viewsets.ViewSet):
    """
    ViewSet for managing design versions.
    """
    permission_classes = [AllowAny]  # For MVP - can be changed to [IsDesignEditor] later
    
    def list(self, request, design_id=None):
        """
        Get all versions for a design.
        GET /api/designs/:designId/versions/
        """
        actual_design_id = get_actual_design_id(design_id)
        if not actual_design_id:
            return Response({'success': True, 'versions': []}, status=status.HTTP_200_OK)
        
        versions = DesignVersion.objects.filter(design_id=actual_design_id).order_by('-version_number')
        serializer = VersionSerializer(versions, many=True)
        return Response({'success': True, 'versions': serializer.data})
    
    def create(self, request, design_id=None):
        """
        Create a new version snapshot.
        POST /api/designs/:designId/versions/
        """
        try:
            serializer = VersionCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            # Get user_id
            user_id = serializer.validated_data.get('user_id', request.data.get('user_id', 'default-user'))
            
            # Ensure design exists
            actual_design_id = ensure_design_exists(design_id, user_id)
            design = Design.objects.get(id=actual_design_id)
            
            # Get next version number
            last_version = DesignVersion.objects.filter(design=design).order_by('-version_number').first()
            next_version = (last_version.version_number + 1) if last_version else 1
            
            # Create version
            version = DesignVersion.objects.create(
                design=design,
                version_number=next_version,
                created_by=user_id,
                snapshot=serializer.validated_data['snapshot'],
                description=serializer.validated_data.get('description', ''),
            )
            
            response_serializer = VersionSerializer(version)
            return Response({'success': True, 'version': response_serializer.data}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'success': False, 'error': 'Failed to create version'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'], url_path='restore')
    def restore(self, request, design_id=None, pk=None):
        """
        Restore a version.
        POST /api/designs/:designId/versions/:id/restore
        """
        try:
            version = DesignVersion.objects.get(id=pk)
            return Response({'success': True, 'snapshot': version.snapshot})
        except DesignVersion.DoesNotExist:
            return Response(
                {'success': False, 'error': 'Version not found'},
                status=status.HTTP_404_NOT_FOUND
            )
