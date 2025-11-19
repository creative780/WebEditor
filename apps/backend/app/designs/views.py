from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from app.designs.models import Design, DesignObject
from app.designs.serializers import (
    DesignSerializer, DesignCreateSerializer, DesignUpdateSerializer,
    DesignObjectSerializer, DesignObjectCreateSerializer, DesignObjectUpdateSerializer
)
from app.designs.services import TransformService


class DesignViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing designs.
    """
    permission_classes = [AllowAny]  # For MVP, allow any. Later add proper auth
    
    def get_serializer_class(self):
        if self.action == 'create':
            return DesignCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return DesignUpdateSerializer
        return DesignSerializer
    
    def get_queryset(self):
        """
        Optionally filter by user_id if provided in query params.
        """
        # Import here to avoid circular import issues
        from app.designs.models import Design as DesignModel
        queryset = DesignModel.objects.all()
        user_id = self.request.query_params.get('user_id', None)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        return queryset.order_by('-updated_at')
    
    def create(self, request, *args, **kwargs):
        """
        Create a new design.
        """
        from app.designs.models import Design as DesignModel
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get user_id from request body or use default
        user_id = request.data.get('user_id', 'default-user')
        
        design = DesignModel.objects.create(
            user_id=user_id,
            **serializer.validated_data
        )
        
        response_serializer = DesignSerializer(design)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    def retrieve(self, request, *args, **kwargs):
        """
        Get design with all objects.
        """
        design = self.get_object()
        serializer = DesignSerializer(design)
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        """
        Update design.
        """
        design = self.get_object()
        serializer = self.get_serializer(design, data=request.data, partial=kwargs.get('partial', False))
        serializer.is_valid(raise_exception=True)
        
        # Update last_edited_by
        user_id = request.data.get('user_id', 'default-user')
        design.last_edited_by = user_id
        
        serializer.save()
        response_serializer = DesignSerializer(design)
        return Response(response_serializer.data)
    
    @action(detail=True, methods=['post'])
    def objects(self, request, pk=None):
        """
        Create a new object in the design.
        POST /api/designs/:id/objects/
        """
        from app.designs.models import Design as DesignModel
        design = self.get_object()
        serializer = DesignObjectCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        obj = DesignObject.objects.create(
            design=design,
            **serializer.validated_data
        )
        
        response_serializer = DesignObjectSerializer(obj)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['put'], url_path='objects/(?P<object_id>[^/.]+)')
    def update_object(self, request, pk=None, object_id=None):
        """
        Update an object in the design.
        PUT /api/designs/:id/objects/:objectId/
        """
        design = self.get_object()
        obj = get_object_or_404(DesignObject, id=object_id, design=design)
        
        serializer = DesignObjectUpdateSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        response_serializer = DesignObjectSerializer(obj)
        return Response(response_serializer.data)
    
    @action(detail=True, methods=['delete'], url_path='objects/(?P<object_id>[^/.]+)')
    def delete_object(self, request, pk=None, object_id=None):
        """
        Delete an object from the design.
        DELETE /api/designs/:id/objects/:objectId/
        """
        design = self.get_object()
        obj = get_object_or_404(DesignObject, id=object_id, design=design)
        obj.delete()
        return Response({'success': True}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], url_path='transform/align')
    def align(self, request, pk=None):
        """
        Align objects.
        POST /api/designs/:id/transform/align
        """
        design = self.get_object()
        object_ids = request.data.get('objectIds', [])
        alignment = request.data.get('alignment')
        
        if not object_ids or not alignment:
            return Response(
                {'error': 'objectIds and alignment are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        objects = TransformService.align_objects(str(design.id), object_ids, alignment)
        return Response(objects, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], url_path='transform/distribute')
    def distribute(self, request, pk=None):
        """
        Distribute objects.
        POST /api/designs/:id/transform/distribute
        """
        design = self.get_object()
        object_ids = request.data.get('objectIds', [])
        direction = request.data.get('direction')
        
        if not object_ids or not direction:
            return Response(
                {'error': 'objectIds and direction are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        objects = TransformService.distribute_objects(str(design.id), object_ids, direction)
        return Response(objects, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], url_path='transform/align-to-canvas')
    def align_to_canvas(self, request, pk=None):
        """
        Align objects to canvas.
        POST /api/designs/:id/transform/align-to-canvas
        """
        design = self.get_object()
        object_ids = request.data.get('objectIds', [])
        alignment = request.data.get('alignment')
        
        if not object_ids or not alignment:
            return Response(
                {'error': 'objectIds and alignment are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        objects = TransformService.align_to_canvas(str(design.id), object_ids, alignment)
        return Response(objects, status=status.HTTP_200_OK)
