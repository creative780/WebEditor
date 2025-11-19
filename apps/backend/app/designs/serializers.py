from rest_framework import serializers
from app.designs.models import Design, DesignObject


class DesignObjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = DesignObject
        fields = [
            'id', 'type', 'x', 'y', 'width', 'height', 'rotation', 'opacity',
            'z_index', 'locked', 'visible', 'name', 'properties', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class DesignSerializer(serializers.ModelSerializer):
    objects = serializers.SerializerMethodField()
    
    class Meta:
        model = Design
        fields = [
            'id', 'user_id', 'name', 'width', 'height', 'unit', 'dpi', 'bleed',
            'color_mode', 'last_edited_by', 'created_at', 'updated_at', 'objects'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_objects(self, obj):
        """Get design objects using the new related_name."""
        objects = obj.design_objects.all()
        return DesignObjectSerializer(objects, many=True).data


class DesignCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Design
        fields = [
            'name', 'width', 'height', 'unit', 'dpi', 'bleed', 'color_mode'
        ]


class DesignUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Design
        fields = [
            'name', 'width', 'height', 'unit', 'dpi', 'bleed', 'color_mode'
        ]


class DesignObjectCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DesignObject
        fields = [
            'type', 'x', 'y', 'width', 'height', 'rotation', 'opacity',
            'z_index', 'locked', 'visible', 'name', 'properties'
        ]


class DesignObjectUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DesignObject
        fields = [
            'x', 'y', 'width', 'height', 'rotation', 'opacity',
            'z_index', 'locked', 'visible', 'name', 'properties'
        ]
