from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from app.shape_operations.services import shape_service, ShapeConfig
from app.shape_operations.boolean_service import boolean_service


class ShapeViewSet(viewsets.ViewSet):
    """
    ViewSet for shape operations.
    """
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['post'], url_path='generate')
    def generate(self, request):
        """
        Generate shape path.
        POST /api/shapes/generate
        """
        try:
            shape_type = request.data.get('type')
            config_data = request.data.get('config', {})
            params = {k: v for k, v in request.data.items() if k not in ['type', 'config']}
            
            # Create ShapeConfig
            config = ShapeConfig(
                width=config_data.get('width', 100),
                height=config_data.get('height', 100),
                center_x=config_data.get('centerX', config_data.get('width', 100) / 2),
                center_y=config_data.get('centerY', config_data.get('height', 100) / 2)
            )
            
            path = ""
            
            if shape_type == 'polygon':
                sides = params.get('sides', 6)
                points = shape_service.generate_polygon_points(sides, config)
                path = shape_service.points_to_path(points, True)
            elif shape_type == 'star':
                points_count = params.get('points', 5)
                inner_radius = params.get('innerRadius', 0.5)
                points = shape_service.generate_star_points(points_count, inner_radius, config)
                path = shape_service.points_to_path(points, True)
            elif shape_type == 'arrow':
                style = params.get('style', 'simple')
                path = shape_service.generate_arrow_path(style, config)
            elif shape_type == 'callout':
                style = params.get('style', 'rounded')
                tail_position = params.get('tailPosition', 0.5)
                path = shape_service.generate_callout_path(style, config, tail_position)
            elif shape_type == 'heart':
                path = shape_service.generate_heart_path(config)
            elif shape_type == 'gear':
                teeth = params.get('teeth', 8)
                path = shape_service.generate_gear_path(teeth, config)
            else:
                return Response(
                    {'error': 'Invalid shape type'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return Response({'pathData': path})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], url_path='boolean')
    def boolean(self, request):
        """
        Perform boolean operation on paths.
        POST /api/shapes/boolean
        """
        try:
            path1 = request.data.get('path1')
            path2 = request.data.get('path2')
            operation = request.data.get('operation')
            
            if not path1 or not path2 or not operation:
                return Response(
                    {'error': 'Missing required parameters: path1, path2, operation'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            result = boolean_service.perform_boolean_operation(path1, path2, operation)
            return Response({'pathData': result})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], url_path='simplify')
    def simplify(self, request):
        """
        Simplify path.
        POST /api/shapes/simplify
        """
        try:
            path_data = request.data.get('pathData')
            tolerance = request.data.get('tolerance', 1.0)
            
            if not path_data:
                return Response(
                    {'error': 'Missing required parameter: pathData'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            simplified = shape_service.simplify_path(path_data, tolerance)
            return Response({'pathData': simplified})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], url_path='smooth')
    def smooth(self, request):
        """
        Smooth path.
        POST /api/shapes/smooth
        """
        try:
            path_data = request.data.get('pathData')
            smoothness = request.data.get('smoothness', 0.3)
            
            if not path_data:
                return Response(
                    {'error': 'Missing required parameter: pathData'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            smoothed = shape_service.smooth_path(path_data, smoothness)
            return Response({'pathData': smoothed})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


