from django.db import models as dj_models
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Design, DesignObject
from .serializers import (
    DesignSerializer,
    DesignDetailSerializer,
    DesignObjectSerializer,
)


class DesignViewSet(viewsets.ModelViewSet):
    queryset = Design.objects.all().order_by('-updated_at')
    serializer_class = DesignSerializer
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return DesignDetailSerializer
        return super().get_serializer_class()

    @action(detail=True, methods=['post'], url_path='objects')
    def create_object(self, request, pk=None):
        design = self.get_object()
        data = request.data.copy()
        max_z = (
            DesignObject.objects.filter(design=design)
            .aggregate(dj_models.Max('z_index'))
            .get('z_index__max')
        )
        z_index = (max_z or -1) + 1
        data['design'] = str(design.id)
        data.setdefault('z_index', z_index)
        if 'x' not in data:
            data['x'] = float(design.width) / 2 - float(data.get('width', 0)) / 2
        if 'y' not in data:
            data['y'] = float(design.height) / 2 - float(data.get('height', 0)) / 2
        serializer = DesignObjectSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['PUT', 'DELETE'])
@permission_classes([AllowAny])
def object_detail(request, design_id, object_id):
    design = get_object_or_404(Design, pk=design_id)
    obj = get_object_or_404(DesignObject, pk=object_id, design=design)
    if request.method == 'PUT':
        serializer = DesignObjectSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    obj.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)









