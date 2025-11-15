from rest_framework import serializers
from .models import Design, DesignObject


class DesignObjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = DesignObject
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'design')


class DesignSerializer(serializers.ModelSerializer):
    class Meta:
        model = Design
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class DesignDetailSerializer(serializers.ModelSerializer):
    objects = DesignObjectSerializer(many=True, read_only=True)

    class Meta:
        model = Design
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')









