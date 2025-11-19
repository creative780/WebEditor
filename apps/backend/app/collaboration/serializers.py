from rest_framework import serializers
from app.collaboration.models import (
    DesignCollaborator, DesignComment, DesignVersion, DesignChangeLog
)


class CollaboratorSerializer(serializers.ModelSerializer):
    design_id = serializers.UUIDField(source='design.id', read_only=True)
    
    class Meta:
        model = DesignCollaborator
        fields = [
            'id', 'design_id', 'user_id', 'role', 'invited_by', 'invited_at'
        ]
        read_only_fields = ['id', 'invited_at']


class CollaboratorCreateSerializer(serializers.Serializer):
    user_id = serializers.CharField(max_length=255)
    role = serializers.ChoiceField(choices=['owner', 'editor', 'viewer'])
    invited_by = serializers.CharField(max_length=255, required=False)


class CommentSerializer(serializers.ModelSerializer):
    design_id = serializers.UUIDField(source='design.id', read_only=True)
    parent_id = serializers.UUIDField(source='parent.id', read_only=True, allow_null=True)
    
    class Meta:
        model = DesignComment
        fields = [
            'id', 'design_id', 'user_id', 'object_id', 'content', 'x', 'y',
            'parent_id', 'resolved', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CommentCreateSerializer(serializers.Serializer):
    content = serializers.CharField()
    object_id = serializers.UUIDField(required=False, allow_null=True)
    x = serializers.DecimalField(max_digits=10, decimal_places=4, required=False, allow_null=True)
    y = serializers.DecimalField(max_digits=10, decimal_places=4, required=False, allow_null=True)
    parent_id = serializers.UUIDField(required=False, allow_null=True)
    user_id = serializers.CharField(max_length=255, required=False)


class VersionSerializer(serializers.ModelSerializer):
    design_id = serializers.UUIDField(source='design.id', read_only=True)
    
    class Meta:
        model = DesignVersion
        fields = [
            'id', 'design_id', 'version_number', 'created_by', 'snapshot',
            'description', 'created_at'
        ]
        read_only_fields = ['id', 'version_number', 'created_at']


class VersionCreateSerializer(serializers.Serializer):
    snapshot = serializers.JSONField()
    description = serializers.CharField(required=False, allow_blank=True)
    user_id = serializers.CharField(max_length=255, required=False)


class ChangeLogSerializer(serializers.ModelSerializer):
    design_id = serializers.UUIDField(source='design.id', read_only=True)
    
    class Meta:
        model = DesignChangeLog
        fields = [
            'id', 'design_id', 'user_id', 'change_type', 'object_id',
            'description', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


