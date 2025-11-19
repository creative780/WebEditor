from rest_framework import serializers
from app.exports.models import ExportJob


class ExportJobSerializer(serializers.ModelSerializer):
    design_id = serializers.UUIDField(source='design.id', read_only=True)
    
    class Meta:
        model = ExportJob
        fields = [
            'id', 'design_id', 'user_id', 'format', 'quality', 'status',
            'options', 'result_url', 'error_message', 'created_at', 'completed_at'
        ]
        read_only_fields = ['id', 'status', 'result_url', 'error_message', 'created_at', 'completed_at']


class ExportJobCreateSerializer(serializers.Serializer):
    format = serializers.ChoiceField(choices=['pdf', 'png', 'jpg', 'svg'])
    quality = serializers.ChoiceField(choices=['low', 'medium', 'high', 'ultra'])
    options = serializers.JSONField(required=False)
    user_id = serializers.CharField(max_length=255, required=False)


