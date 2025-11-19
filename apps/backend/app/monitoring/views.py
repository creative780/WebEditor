from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
import psutil
import time


class MetricsViewSet(viewsets.ViewSet):
    """
    ViewSet for metrics and monitoring.
    """
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'], url_path='metrics')
    def metrics(self, request):
        """
        Prometheus metrics format.
        GET /api/metrics
        """
        # Simplified metrics endpoint
        metrics = [
            '# HELP http_requests_total Total number of HTTP requests',
            '# TYPE http_requests_total counter',
            'http_requests_total 0',
        ]
        return Response('\n'.join(metrics), content_type='text/plain')
    
    @action(detail=False, methods=['get'], url_path='monitoring/performance')
    def performance(self, request):
        """
        Performance metrics.
        GET /api/monitoring/performance
        """
        return Response({
            'timestamp': time.time(),
            'uptime': 0,  # In production, track actual uptime
            'requests': 0,
            'errors': 0
        })
    
    @action(detail=False, methods=['get'], url_path='monitoring/system')
    def system(self, request):
        """
        System metrics.
        GET /api/monitoring/system
        """
        try:
            cpu_percent = psutil.cpu_percent(interval=0.1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            return Response({
                'cpu': {
                    'percent': cpu_percent,
                    'count': psutil.cpu_count()
                },
                'memory': {
                    'total': memory.total,
                    'available': memory.available,
                    'percent': memory.percent
                },
                'disk': {
                    'total': disk.total,
                    'used': disk.used,
                    'percent': disk.percent
                }
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], url_path='monitoring/cache')
    def cache(self, request):
        """
        Cache metrics.
        GET /api/monitoring/cache
        """
        # Simplified cache metrics
        return Response({
            'hits': 0,
            'misses': 0,
            'hitRate': 0.0
        })


