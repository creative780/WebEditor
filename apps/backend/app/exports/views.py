from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Count
from app.exports.models import ExportJob
from app.exports.serializers import ExportJobSerializer, ExportJobCreateSerializer
from app.designs.models import Design
from app.collaboration.services import get_actual_design_id, ensure_design_exists


class ExportJobViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing export jobs.
    """
    queryset = ExportJob.objects.all()
    permission_classes = [AllowAny]
    serializer_class = ExportJobSerializer
    
    def create(self, request, *args, **kwargs):
        """
        Create a new export job.
        POST /api/exports/
        """
        serializer = ExportJobCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get design_id and user_id from request
        design_id = request.data.get('design_id')
        user_id = request.data.get('user_id', 'default-user')
        
        if not design_id:
            return Response(
                {'success': False, 'error': 'design_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Ensure design exists
        actual_design_id = ensure_design_exists(design_id, user_id)
        design = Design.objects.get(id=actual_design_id)
        
        # Create export job
        export_job = ExportJob.objects.create(
            design=design,
            user_id=user_id,
            format=serializer.validated_data['format'],
            quality=serializer.validated_data['quality'],
            options=serializer.validated_data.get('options'),
            status='pending',
        )
        
        response_serializer = ExportJobSerializer(export_job)
        return Response({'success': True, 'job': response_serializer.data}, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'], url_path='jobs/(?P<job_id>[^/.]+)')
    def get_job_status(self, request, job_id=None):
        """
        Get job status.
        GET /api/exports/jobs/:id
        """
        try:
            job = ExportJob.objects.get(id=job_id)
            serializer = ExportJobSerializer(job)
            return Response({'success': True, 'job': serializer.data})
        except ExportJob.DoesNotExist:
            return Response(
                {'success': False, 'error': 'Export job not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'], url_path='history/(?P<user_id>[^/.]+)')
    def get_history(self, request, user_id=None):
        """
        Get export history.
        GET /api/exports/history/:userId
        """
        limit = int(request.query_params.get('limit', 50))
        jobs = ExportJob.objects.filter(user_id=user_id).order_by('-created_at')[:limit]
        serializer = ExportJobSerializer(jobs, many=True)
        return Response({'success': True, 'history': serializer.data})
    
    @action(detail=False, methods=['post'], url_path='batch')
    def batch_export(self, request):
        """
        Batch export.
        POST /api/exports/batch
        """
        design_ids = request.data.get('design_ids', [])
        format_type = request.data.get('format', 'png')
        quality = request.data.get('quality', 'high')
        user_id = request.data.get('user_id', 'default-user')
        
        if not design_ids:
            return Response(
                {'success': False, 'error': 'Missing required parameter: design_ids'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        jobs = []
        for design_id in design_ids:
            actual_design_id = ensure_design_exists(design_id, user_id)
            design = Design.objects.get(id=actual_design_id)
            
            job = ExportJob.objects.create(
                design=design,
                user_id=user_id,
                format=format_type,
                quality=quality,
                status='pending'
            )
            jobs.append(job)
        
        serializer = ExportJobSerializer(jobs, many=True)
        return Response({'success': True, 'jobs': serializer.data}, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'], url_path='stats/(?P<user_id>[^/.]+)')
    def get_stats(self, request, user_id=None):
        """
        Get export statistics.
        GET /api/exports/stats/:userId
        """
        jobs = ExportJob.objects.filter(user_id=user_id)
        
        total = jobs.count()
        completed = jobs.filter(status='completed').count()
        failed = jobs.filter(status='failed').count()
        pending = jobs.filter(status='pending').count()
        
        format_counts = jobs.values('format').annotate(count=Count('id'))
        
        return Response({
            'success': True,
            'stats': {
                'total': total,
                'completed': completed,
                'failed': failed,
                'pending': pending,
                'formatCounts': {item['format']: item['count'] for item in format_counts}
            }
        })
