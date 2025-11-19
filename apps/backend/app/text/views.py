from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from app.text.services import text_service


class TextViewSet(viewsets.ViewSet):
    """
    ViewSet for text operations.
    """
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'], url_path='fonts')
    def fonts(self, request):
        """
        List available fonts.
        GET /api/text/fonts
        """
        try:
            fonts = text_service.list_fonts()
            return Response(fonts)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], url_path='metrics')
    def metrics(self, request):
        """
        Calculate text metrics.
        POST /api/text/metrics
        """
        try:
            text = request.data.get('text', '')
            font_family = request.data.get('fontFamily', 'Inter')
            font_size = request.data.get('fontSize', 16)
            
            metrics = text_service.calculate_text_metrics(text, font_family, font_size)
            return Response(metrics)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], url_path='format')
    def format(self, request):
        """
        Format rich text.
        POST /api/text/format
        """
        try:
            text = request.data.get('text', '')
            format_type = request.data.get('format', {})
            
            formatted = text_service.format_rich_text(text, format_type)
            return Response({'formatted': formatted})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], url_path='text-on-path')
    def text_on_path(self, request):
        """
        Calculate text on path.
        POST /api/text/text-on-path
        """
        try:
            text = request.data.get('text', '')
            path_data = request.data.get('pathData', '')
            offset = request.data.get('offset', 0.0)
            
            if not text or not path_data:
                return Response(
                    {'error': 'Missing required parameters: text, pathData'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            chars = text_service.calculate_text_on_path(text, path_data, offset)
            return Response(chars)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


