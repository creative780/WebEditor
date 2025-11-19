from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from app.layers.services import layer_service
from app.layers.blending_service import blending_service
from app.designs.models import DesignObject
from app.collaboration.services import get_actual_design_id


class LayerViewSet(viewsets.ViewSet):
    """
    ViewSet for layer operations.
    """
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['post'], url_path='designs/(?P<design_id>[^/.]+)/layers/reorder')
    def reorder(self, request, design_id=None):
        """
        Reorder layers.
        POST /api/designs/:designId/layers/reorder
        """
        try:
            object_id = request.data.get('objectId')
            new_z_index = request.data.get('newZIndex')
            
            if not object_id or new_z_index is None:
                return Response(
                    {'error': 'Missing required parameters: objectId, newZIndex'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            layer_service.reorder_layer(design_id, object_id, new_z_index)
            return Response({'success': True})
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], url_path='designs/(?P<design_id>[^/.]+)/layers/(?P<object_id>[^/.]+)/forward')
    def forward(self, request, design_id=None, object_id=None):
        """
        Bring forward.
        POST /api/designs/:designId/layers/:objectId/forward
        """
        try:
            layer_service.bring_forward(design_id, object_id)
            return Response({'success': True})
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], url_path='designs/(?P<design_id>[^/.]+)/layers/(?P<object_id>[^/.]+)/backward')
    def backward(self, request, design_id=None, object_id=None):
        """
        Send backward.
        POST /api/designs/:designId/layers/:objectId/backward
        """
        try:
            layer_service.send_backward(design_id, object_id)
            return Response({'success': True})
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], url_path='designs/(?P<design_id>[^/.]+)/layers/(?P<object_id>[^/.]+)/front')
    def front(self, request, design_id=None, object_id=None):
        """
        Bring to front.
        POST /api/designs/:designId/layers/:objectId/front
        """
        try:
            layer_service.bring_to_front(design_id, object_id)
            return Response({'success': True})
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], url_path='designs/(?P<design_id>[^/.]+)/layers/(?P<object_id>[^/.]+)/back')
    def back(self, request, design_id=None, object_id=None):
        """
        Send to back.
        POST /api/designs/:designId/layers/:objectId/back
        """
        try:
            layer_service.send_to_back(design_id, object_id)
            return Response({'success': True})
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], url_path='designs/(?P<design_id>[^/.]+)/layers/group')
    def group(self, request, design_id=None):
        """
        Create group.
        POST /api/designs/:designId/layers/group
        """
        try:
            object_ids = request.data.get('objectIds', [])
            group_name = request.data.get('groupName')
            
            if not object_ids:
                return Response(
                    {'error': 'Missing required parameter: objectIds'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            group = layer_service.create_group(design_id, object_ids, group_name)
            return Response({'group': group})
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], url_path='designs/(?P<design_id>[^/.]+)/layers/ungroup')
    def ungroup(self, request, design_id=None):
        """
        Ungroup.
        POST /api/designs/:designId/layers/ungroup
        """
        try:
            group_id = request.data.get('groupId')
            
            if not group_id:
                return Response(
                    {'error': 'Missing required parameter: groupId'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            layer_service.ungroup(design_id, group_id)
            return Response({'success': True})
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], url_path='designs/(?P<design_id>[^/.]+)/layers/(?P<object_id>[^/.]+)/lock')
    def lock(self, request, design_id=None, object_id=None):
        """
        Lock layer.
        POST /api/designs/:designId/layers/:objectId/lock
        """
        try:
            layer_service.lock_layer(design_id, object_id)
            return Response({'success': True})
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], url_path='designs/(?P<design_id>[^/.]+)/layers/(?P<object_id>[^/.]+)/unlock')
    def unlock(self, request, design_id=None, object_id=None):
        """
        Unlock layer.
        POST /api/designs/:designId/layers/:objectId/unlock
        """
        try:
            layer_service.unlock_layer(design_id, object_id)
            return Response({'success': True})
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], url_path='designs/(?P<design_id>[^/.]+)/layers/(?P<object_id>[^/.]+)/toggle-visibility')
    def toggle_visibility(self, request, design_id=None, object_id=None):
        """
        Toggle visibility.
        POST /api/designs/:designId/layers/:objectId/toggle-visibility
        """
        try:
            visible = layer_service.toggle_visibility(design_id, object_id)
            return Response({'visible': visible})
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], url_path='designs/(?P<design_id>[^/.]+)/layers/(?P<object_id>[^/.]+)/duplicate')
    def duplicate(self, request, design_id=None, object_id=None):
        """
        Duplicate layer.
        POST /api/designs/:designId/layers/:objectId/duplicate
        """
        try:
            obj = layer_service.duplicate_layer(design_id, object_id)
            return Response({'object': obj})
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], url_path='designs/(?P<design_id>[^/.]+)/layers/hierarchy')
    def hierarchy(self, request, design_id=None):
        """
        Get layer hierarchy.
        GET /api/designs/:designId/layers/hierarchy
        """
        try:
            hierarchy = layer_service.get_layer_hierarchy(design_id)
            return Response({'hierarchy': hierarchy})
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], url_path='layers/(?P<layer_id>[^/.]+)/blend-mode')
    def blend_mode(self, request, layer_id=None):
        """
        Apply blend mode.
        POST /api/layers/:layerId/blend-mode
        """
        try:
            blend_mode = request.data.get('blendMode')
            
            if not blend_mode:
                return Response(
                    {'error': 'Missing required parameter: blendMode'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not blending_service.is_valid_blend_mode(blend_mode):
                return Response(
                    {'error': 'Invalid blend mode'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            result = blending_service.apply_blend_mode(layer_id, blend_mode)
            return Response(result)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], url_path='layers/(?P<layer_id>[^/.]+)/effects')
    def effects(self, request, layer_id=None):
        """
        Apply layer effects.
        POST /api/layers/:layerId/effects
        """
        try:
            effect = request.data.get('effect')
            
            if not effect:
                return Response(
                    {'error': 'Missing required parameter: effect'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            effect_type = effect.get('type')
            properties = effect.get('properties', {})
            
            if effect_type == 'drop-shadow':
                layer_effect = blending_service.create_drop_shadow(properties)
            elif effect_type == 'outer-glow':
                layer_effect = blending_service.create_outer_glow(properties)
            elif effect_type == 'inner-glow':
                layer_effect = blending_service.create_inner_glow(properties)
            elif effect_type == 'bevel':
                layer_effect = blending_service.create_bevel(properties)
            else:
                return Response(
                    {'error': 'Invalid effect type'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return Response({'effect': layer_effect})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


