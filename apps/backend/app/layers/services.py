"""
Layer Service - Layer operations and z-index management
Converted from TypeScript LayerService.ts
"""
from django.db import transaction, models
from app.designs.models import DesignObject
from app.collaboration.services import get_actual_design_id


class LayerService:
    """Service for layer operations"""
    
    @transaction.atomic
    def reorder_layer(self, design_id: str, object_id: str, new_z_index: int) -> None:
        """Reorder layer (change z-index)"""
        actual_design_id = get_actual_design_id(design_id)
        if not actual_design_id:
            raise ValueError('Design not found')
        
        try:
            obj = DesignObject.objects.get(id=object_id, design_id=actual_design_id)
        except DesignObject.DoesNotExist:
            raise ValueError('Object not found')
        
        current_z_index = obj.z_index
        
        # Shift other objects
        if new_z_index > current_z_index:
            # Moving up - shift down objects in between
            DesignObject.objects.filter(
                design_id=actual_design_id,
                z_index__gt=current_z_index,
                z_index__lte=new_z_index
            ).update(z_index=models.F('z_index') - 1)
        elif new_z_index < current_z_index:
            # Moving down - shift up objects in between
            DesignObject.objects.filter(
                design_id=actual_design_id,
                z_index__gte=new_z_index,
                z_index__lt=current_z_index
            ).update(z_index=models.F('z_index') + 1)
        
        # Update object's z-index
        obj.z_index = new_z_index
        obj.save()
    
    def bring_forward(self, design_id: str, object_id: str) -> None:
        """Bring object forward (increase z-index by 1)"""
        actual_design_id = get_actual_design_id(design_id)
        if not actual_design_id:
            raise ValueError('Design not found')
        
        try:
            obj = DesignObject.objects.get(id=object_id, design_id=actual_design_id)
        except DesignObject.DoesNotExist:
            raise ValueError('Object not found')
        
        self.reorder_layer(design_id, object_id, obj.z_index + 1)
    
    def send_backward(self, design_id: str, object_id: str) -> None:
        """Send object backward (decrease z-index by 1)"""
        actual_design_id = get_actual_design_id(design_id)
        if not actual_design_id:
            raise ValueError('Design not found')
        
        try:
            obj = DesignObject.objects.get(id=object_id, design_id=actual_design_id)
        except DesignObject.DoesNotExist:
            raise ValueError('Object not found')
        
        if obj.z_index > 0:
            self.reorder_layer(design_id, object_id, obj.z_index - 1)
    
    def bring_to_front(self, design_id: str, object_id: str) -> None:
        """Bring to front (set to highest z-index)"""
        actual_design_id = get_actual_design_id(design_id)
        if not actual_design_id:
            raise ValueError('Design not found')
        
        max_z = DesignObject.objects.filter(
            design_id=actual_design_id
        ).aggregate(max_z=models.Max('z_index'))['max_z'] or 0
        
        self.reorder_layer(design_id, object_id, max_z)
    
    def send_to_back(self, design_id: str, object_id: str) -> None:
        """Send to back (set to lowest z-index)"""
        self.reorder_layer(design_id, object_id, 0)
    
    @transaction.atomic
    def create_group(self, design_id: str, object_ids: list, group_name: str = None) -> dict:
        """Create layer group"""
        from django.utils import timezone
        import uuid
        
        actual_design_id = get_actual_design_id(design_id)
        if not actual_design_id:
            raise ValueError('Design not found')
        
        # Create group ID
        group_id = f"group-{uuid.uuid4().hex[:12]}"
        
        # Update objects with group ID
        objects = DesignObject.objects.filter(
            design_id=actual_design_id,
            id__in=object_ids
        )
        
        for obj in objects:
            properties = obj.properties or {}
            properties['groupId'] = group_id
            obj.properties = properties
            obj.save()
        
        # Get average z-index for group
        avg_z = objects.aggregate(avg_z=models.Avg('z_index'))['avg_z'] or 0
        
        return {
            'id': group_id,
            'designId': actual_design_id,
            'name': group_name or f'Group {group_id[-8:]}',
            'objectIds': object_ids,
            'zIndex': int(avg_z),
            'locked': False,
            'visible': True,
            'createdAt': timezone.now().isoformat()
        }
    
    @transaction.atomic
    def ungroup(self, design_id: str, group_id: str) -> None:
        """Ungroup layers"""
        actual_design_id = get_actual_design_id(design_id)
        if not actual_design_id:
            raise ValueError('Design not found')
        
        # Remove group ID from objects
        objects = DesignObject.objects.filter(
            design_id=actual_design_id
        )
        
        for obj in objects:
            properties = obj.properties or {}
            if properties.get('groupId') == group_id:
                properties.pop('groupId', None)
                obj.properties = properties
                obj.save()
    
    def lock_layer(self, design_id: str, object_id: str) -> None:
        """Lock layer"""
        actual_design_id = get_actual_design_id(design_id)
        if not actual_design_id:
            raise ValueError('Design not found')
        
        try:
            obj = DesignObject.objects.get(id=object_id, design_id=actual_design_id)
            obj.locked = True
            obj.save()
        except DesignObject.DoesNotExist:
            raise ValueError('Object not found')
    
    def unlock_layer(self, design_id: str, object_id: str) -> None:
        """Unlock layer"""
        actual_design_id = get_actual_design_id(design_id)
        if not actual_design_id:
            raise ValueError('Design not found')
        
        try:
            obj = DesignObject.objects.get(id=object_id, design_id=actual_design_id)
            obj.locked = False
            obj.save()
        except DesignObject.DoesNotExist:
            raise ValueError('Object not found')
    
    def toggle_visibility(self, design_id: str, object_id: str) -> bool:
        """Toggle layer visibility"""
        actual_design_id = get_actual_design_id(design_id)
        if not actual_design_id:
            raise ValueError('Design not found')
        
        try:
            obj = DesignObject.objects.get(id=object_id, design_id=actual_design_id)
            obj.visible = not obj.visible
            obj.save()
            return obj.visible
        except DesignObject.DoesNotExist:
            raise ValueError('Object not found')
    
    def duplicate_layer(self, design_id: str, object_id: str) -> dict:
        """Duplicate layer"""
        from app.designs.serializers import DesignObjectSerializer
        
        actual_design_id = get_actual_design_id(design_id)
        if not actual_design_id:
            raise ValueError('Design not found')
        
        try:
            obj = DesignObject.objects.get(id=object_id, design_id=actual_design_id)
        except DesignObject.DoesNotExist:
            raise ValueError('Object not found')
        
        # Get max z-index
        max_z = DesignObject.objects.filter(
            design_id=actual_design_id
        ).aggregate(max_z=models.Max('z_index'))['max_z'] or 0
        
        # Create duplicate
        new_obj = DesignObject.objects.create(
            design_id=actual_design_id,
            type=obj.type,
            x=obj.x + 10,
            y=obj.y + 10,
            width=obj.width,
            height=obj.height,
            rotation=obj.rotation,
            opacity=obj.opacity,
            z_index=max_z + 1,
            locked=obj.locked,
            visible=obj.visible,
            name=f"{obj.name} (Copy)" if obj.name else "Copy",
            properties=obj.properties
        )
        
        serializer = DesignObjectSerializer(new_obj)
        return serializer.data
    
    def get_layer_hierarchy(self, design_id: str) -> list:
        """Get layer hierarchy"""
        actual_design_id = get_actual_design_id(design_id)
        if not actual_design_id:
            raise ValueError('Design not found')
        
        objects = DesignObject.objects.filter(
            design_id=actual_design_id
        ).order_by('z_index')
        
        return [
            {
                'id': str(obj.id),
                'type': obj.type,
                'name': obj.name,
                'zIndex': obj.z_index,
                'locked': obj.locked,
                'visible': obj.visible,
                'groupId': obj.properties.get('groupId') if obj.properties else None
            }
            for obj in objects
        ]


layer_service = LayerService()


