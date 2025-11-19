from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Count, Q
from django.utils import timezone
from datetime import datetime
import secrets
from app.design_templates.models import (
    Template, TemplateVersion, TemplateShare, TemplateAnalytics, TemplateFavorite
)
from app.design_templates.serializers import TemplateSerializer, TemplateCreateSerializer


class TemplateViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing templates.
    """
    queryset = Template.objects.all()
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TemplateCreateSerializer
        return TemplateSerializer
    
    def create(self, request, *args, **kwargs):
        """
        Create a new template.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get creator_id from request body or use default
        creator_id = request.data.get('creator_id', 'default-user')
        
        template = Template.objects.create(
            creator_id=creator_id,
            **serializer.validated_data
        )
        
        response_serializer = TemplateSerializer(template)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'], url_path='versions')
    def create_version(self, request, pk=None):
        """
        Create template version.
        POST /api/templates/:id/versions
        """
        template = self.get_object()
        description = request.data.get('description', '')
        design_data = request.data.get('designData', template.design_data)
        created_by = request.data.get('createdBy', 'default-user')
        
        # Get next version number
        last_version = TemplateVersion.objects.filter(
            template=template
        ).order_by('-version_number').first()
        
        version_number = (last_version.version_number + 1) if last_version else 1
        
        version = TemplateVersion.objects.create(
            template=template,
            version_number=version_number,
            description=description,
            design_data=design_data,
            created_by=created_by
        )
        
        return Response({
            'id': str(version.id),
            'templateId': str(template.id),
            'versionNumber': version.version_number,
            'description': version.description,
            'designData': version.design_data,
            'createdBy': version.created_by,
            'createdAt': version.created_at.isoformat()
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'], url_path='versions')
    def list_versions(self, request, pk=None):
        """
        List template versions.
        GET /api/templates/:id/versions
        """
        template = self.get_object()
        versions = TemplateVersion.objects.filter(
            template=template
        ).order_by('-version_number')
        
        return Response({
            'versions': [
                {
                    'id': str(v.id),
                    'templateId': str(template.id),
                    'versionNumber': v.version_number,
                    'description': v.description,
                    'designData': v.design_data,
                    'createdBy': v.created_by,
                    'createdAt': v.created_at.isoformat()
                }
                for v in versions
            ]
        })
    
    @action(detail=True, methods=['post'], url_path='share')
    def create_share(self, request, pk=None):
        """
        Create share link.
        POST /api/templates/:id/share
        """
        template = self.get_object()
        expires_at = request.data.get('expiresAt')
        password = request.data.get('password')
        
        share_token = secrets.token_urlsafe(32)
        
        expires_at_parsed = None
        if expires_at:
            try:
                # Handle ISO format with or without timezone
                if expires_at.endswith('Z'):
                    expires_at_parsed = datetime.fromisoformat(expires_at.replace('Z', '+00:00'))
                else:
                    expires_at_parsed = datetime.fromisoformat(expires_at)
                expires_at_parsed = timezone.make_aware(expires_at_parsed) if timezone.is_naive(expires_at_parsed) else expires_at_parsed
            except (ValueError, AttributeError):
                expires_at_parsed = None
        
        share = TemplateShare.objects.create(
            template=template,
            share_token=share_token,
            expires_at=expires_at_parsed,
            password_hash=password  # In production, hash the password
        )
        
        return Response({
            'id': str(share.id),
            'templateId': str(template.id),
            'shareToken': share.share_token,
            'expiresAt': share.expires_at.isoformat() if share.expires_at else None,
            'accessCount': share.access_count,
            'createdAt': share.created_at.isoformat()
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'], url_path='analytics')
    def get_analytics(self, request, pk=None):
        """
        Get template analytics.
        GET /api/templates/:id/analytics
        """
        template = self.get_object()
        
        # Get analytics data
        analytics = TemplateAnalytics.objects.filter(template=template)
        
        views = analytics.filter(event_type='view').count()
        uses = analytics.filter(event_type='use').count()
        downloads = analytics.filter(event_type='download').count()
        
        return Response({
            'templateId': str(template.id),
            'views': views,
            'uses': uses,
            'downloads': downloads,
            'total': views + uses + downloads
        })
    
    @action(detail=False, methods=['get'], url_path='trending/list')
    def trending(self, request):
        """
        Get trending templates.
        GET /api/templates/trending/list
        """
        # Calculate trending score based on views, favorites, downloads
        templates = Template.objects.annotate(
            view_count=Count('analytics', filter=Q(analytics__event_type='view')),
            favorite_count=Count('favorites'),
            download_count=Count('analytics', filter=Q(analytics__event_type='download'))
        ).order_by('-download_count', '-favorite_count', '-view_count')[:20]
        
        serializer = TemplateSerializer(templates, many=True)
        return Response({'templates': serializer.data})
    
    @action(detail=True, methods=['post'], url_path='favorite')
    def favorite(self, request, pk=None):
        """
        Favorite template.
        POST /api/templates/:id/favorite
        """
        template = self.get_object()
        user_id = request.data.get('userId', 'default-user')
        
        favorite, created = TemplateFavorite.objects.get_or_create(
            template=template,
            user_id=user_id
        )
        
        return Response({
            'success': True,
            'favorited': created
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
    
    @action(detail=True, methods=['delete'], url_path='favorite')
    def unfavorite(self, request, pk=None):
        """
        Unfavorite template.
        DELETE /api/templates/:id/favorite
        """
        template = self.get_object()
        user_id = request.data.get('userId', 'default-user')
        
        TemplateFavorite.objects.filter(
            template=template,
            user_id=user_id
        ).delete()
        
        return Response({'success': True})
