from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from app.colors.services import color_service, Gradient, GradientStop
from app.colors.validation import color_validation
from app.colors.pantone_service import pantone_service
from app.colors.conversion import ColorConversion


class ColorViewSet(viewsets.ViewSet):
    """
    ViewSet for color operations.
    """
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['post'], url_path='convert')
    def convert(self, request):
        """
        Convert color between formats.
        POST /api/colors/convert
        """
        try:
            color = request.data.get('color')
            from_format = request.data.get('from')
            to_format = request.data.get('to')
            
            if not color or not from_format or not to_format:
                return Response(
                    {'error': 'Missing required parameters: color, from, to'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            result = color_service.convert(color, from_format, to_format)
            return Response({'result': result})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], url_path='validate')
    def validate(self, request):
        """
        Validate color for print.
        POST /api/colors/validate
        """
        try:
            color = request.data.get('color')
            
            if not color:
                return Response(
                    {'error': 'Missing required parameter: color'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            validation = color_service.validate(color)
            return Response(validation)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], url_path='validate/batch')
    def validate_batch(self, request):
        """
        Batch validate colors.
        POST /api/colors/validate/batch
        """
        try:
            colors = request.data.get('colors')
            
            if not colors or not isinstance(colors, list):
                return Response(
                    {'error': 'Missing required parameter: colors (array)'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            results = color_validation.batch_validate(colors)
            return Response({
                'results': [r.to_dict() for r in results]
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], url_path='pantone/search')
    def pantone_search(self, request):
        """
        Search Pantone colors.
        GET /api/colors/pantone/search?q=query
        """
        try:
            query = request.query_params.get('q')
            
            if not query:
                return Response(
                    {'error': 'Missing query parameter: q'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            results = pantone_service.search(query)
            return Response({
                'results': [p.to_dict() for p in results]
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], url_path='pantone')
    def pantone_list(self, request):
        """
        List all Pantone colors.
        GET /api/colors/pantone
        """
        try:
            colors = pantone_service.get_all()
            return Response({
                'colors': [p.to_dict() for p in colors]
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'], url_path='pantone')
    def pantone_detail(self, request, pk=None):
        """
        Get Pantone by code.
        GET /api/colors/pantone/:code
        """
        try:
            pantone = pantone_service.get_by_code(pk)
            
            if not pantone:
                return Response(
                    {'error': 'Pantone color not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            return Response(pantone.to_dict())
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], url_path='pantone/match')
    def pantone_match(self, request):
        """
        Find closest Pantone match.
        POST /api/colors/pantone/match
        """
        try:
            color = request.data.get('color')
            
            if not color:
                return Response(
                    {'error': 'Missing required parameter: color'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            rgb = ColorConversion.hex_to_rgb(color)
            match = pantone_service.find_closest_match(rgb)
            return Response(match)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], url_path='gradients/generate')
    def gradients_generate(self, request):
        """
        Generate gradient.
        POST /api/colors/gradients/generate
        """
        try:
            start_color = request.data.get('startColor')
            end_color = request.data.get('endColor')
            intermediate_colors = request.data.get('intermediateColors', [])
            gradient_type = request.data.get('type', 'linear')
            stops = request.data.get('stops')
            angle = request.data.get('angle', 0)
            
            if stops:
                # Custom gradient with explicit stops
                gradient_stops = [
                    GradientStop(
                        position=stop.get('position', 0),
                        color=stop.get('color', '#000000'),
                        opacity=stop.get('opacity')
                    )
                    for stop in stops
                ]
                gradient = Gradient(
                    gradient_type=gradient_type,
                    stops=gradient_stops,
                    angle=angle
                )
            else:
                # Auto-generate gradient
                gradient = color_service.create_gradient(
                    start_color,
                    end_color,
                    intermediate_colors,
                    gradient_type
                )
            
            css = color_service.gradient_to_css(gradient)
            return Response({
                'gradient': gradient.to_dict(),
                'css': css
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], url_path='gradients/optimize')
    def gradients_optimize(self, request):
        """
        Optimize gradient.
        POST /api/colors/gradients/optimize
        """
        try:
            gradient_data = request.data.get('gradient')
            
            if not gradient_data:
                return Response(
                    {'error': 'Missing required parameter: gradient'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            stops = [
                GradientStop(
                    position=stop.get('position', 0),
                    color=stop.get('color', '#000000'),
                    opacity=stop.get('opacity')
                )
                for stop in gradient_data.get('stops', [])
            ]
            
            gradient = Gradient(
                gradient_type=gradient_data.get('type', 'linear'),
                stops=stops,
                angle=gradient_data.get('angle', 0),
                center_x=gradient_data.get('centerX', 0.5),
                center_y=gradient_data.get('centerY', 0.5)
            )
            
            optimized = color_service.optimize_gradient(gradient)
            css = color_service.gradient_to_css(optimized)
            
            return Response({
                'gradient': optimized.to_dict(),
                'css': css
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], url_path='harmony')
    def harmony(self, request):
        """
        Generate color harmony.
        POST /api/colors/harmony
        """
        try:
            color = request.data.get('color')
            scheme = request.data.get('scheme')
            
            if not color or not scheme:
                return Response(
                    {'error': 'Missing required parameters: color, scheme'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            harmony = color_service.generate_harmony(color, scheme)
            return Response(harmony.to_dict())
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], url_path='palette/generate')
    def palette_generate(self, request):
        """
        Generate color palette.
        POST /api/colors/palette/generate
        """
        try:
            base_color = request.data.get('baseColor')
            count = request.data.get('count', 5)
            
            if not base_color:
                return Response(
                    {'error': 'Missing required parameter: baseColor'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            palette = color_service.generate_palette(base_color, count)
            return Response({'palette': palette})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], url_path='palette/from-image')
    def palette_from_image(self, request):
        """
        Extract colors from image.
        POST /api/colors/palette/from-image
        """
        try:
            image_url = request.data.get('imageUrl')
            count = request.data.get('count', 5)
            
            if not image_url:
                return Response(
                    {'error': 'Missing required parameter: imageUrl'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            import asyncio
            colors = asyncio.run(color_service.extract_colors_from_image(image_url, count))
            return Response({'colors': colors})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], url_path='accessibility')
    def accessibility(self, request):
        """
        Check color accessibility.
        POST /api/colors/accessibility
        """
        try:
            foreground = request.data.get('foreground')
            background = request.data.get('background')
            
            if not foreground or not background:
                return Response(
                    {'error': 'Missing required parameters: foreground, background'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            result = color_service.check_accessibility(foreground, background)
            return Response(result)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], url_path='interpolate')
    def interpolate(self, request):
        """
        Interpolate colors.
        POST /api/colors/interpolate
        """
        try:
            color1 = request.data.get('color1')
            color2 = request.data.get('color2')
            steps = request.data.get('steps', 10)
            
            if not color1 or not color2:
                return Response(
                    {'error': 'Missing required parameters: color1, color2'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            colors = color_service.interpolate_gradient(color1, color2, steps)
            return Response({'colors': colors})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


