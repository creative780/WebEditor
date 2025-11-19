from rest_framework import serializers
from app.design_templates.models import (
    Template, TemplateVersion, TemplateShare, TemplateAnalytics, TemplateFavorite
)


class TemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Template
        fields = [
            'id', 'creator_id', 'name', 'description', 'category', 'industry',
            'tags', 'thumbnail_url', 'preview_url', 'design_data', 'is_public',
            'is_premium', 'price', 'downloads', 'rating', 'review_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'downloads', 'rating', 'review_count', 'created_at', 'updated_at']


class TemplateCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Template
        fields = [
            'name', 'description', 'category', 'industry', 'tags',
            'thumbnail_url', 'preview_url', 'design_data', 'is_public',
            'is_premium', 'price'
        ]


class TemplateVersionSerializer(serializers.ModelSerializer):
    template_id = serializers.UUIDField(source='template.id', read_only=True)
    
    class Meta:
        model = TemplateVersion
        fields = [
            'id', 'template_id', 'version_number', 'description', 'design_data',
            'created_by', 'created_at'
        ]
        read_only_fields = ['id', 'version_number', 'created_at']


class TemplateShareSerializer(serializers.ModelSerializer):
    template_id = serializers.UUIDField(source='template.id', read_only=True)
    
    class Meta:
        model = TemplateShare
        fields = [
            'id', 'template_id', 'share_token', 'expires_at', 'password_hash',
            'access_count', 'created_at'
        ]
        read_only_fields = ['id', 'share_token', 'access_count', 'created_at']


class TemplateAnalyticsSerializer(serializers.ModelSerializer):
    template_id = serializers.UUIDField(source='template.id', read_only=True)
    
    class Meta:
        model = TemplateAnalytics
        fields = [
            'id', 'template_id', 'event_type', 'user_id', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class TemplateFavoriteSerializer(serializers.ModelSerializer):
    template_id = serializers.UUIDField(source='template.id', read_only=True)
    
    class Meta:
        model = TemplateFavorite
        fields = [
            'id', 'template_id', 'user_id', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


