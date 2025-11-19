"""
Design Service - Business logic for design operations
"""
from typing import List, Dict, Any
from decimal import Decimal
from app.designs.models import Design, DesignObject


class TransformService:
    """Handle design object transformations"""
    
    @staticmethod
    def align_objects(design_id: str, object_ids: List[str], alignment: str) -> List[Dict[str, Any]]:
        """
        Align objects relative to each other.
        
        Args:
            design_id: Design UUID
            object_ids: List of object IDs to align
            alignment: 'left', 'right', 'top', 'bottom', 'center-h', 'center-v'
        
        Returns:
            List of updated objects
        """
        objects = DesignObject.objects.filter(
            design_id=design_id,
            id__in=object_ids
        ).order_by('z_index')
        
        if not objects.exists():
            return []
        
        objects_list = list(objects)
        
        if alignment == 'left':
            min_x = min(obj.x for obj in objects_list)
            for obj in objects_list:
                obj.x = min_x
        elif alignment == 'right':
            max_x = max(obj.x + obj.width for obj in objects_list)
            for obj in objects_list:
                obj.x = max_x - obj.width
        elif alignment == 'top':
            min_y = min(obj.y for obj in objects_list)
            for obj in objects_list:
                obj.y = min_y
        elif alignment == 'bottom':
            max_y = max(obj.y + obj.height for obj in objects_list)
            for obj in objects_list:
                obj.y = max_y - obj.height
        elif alignment == 'center-h':
            center_x = sum(obj.x + obj.width / 2 for obj in objects_list) / len(objects_list)
            for obj in objects_list:
                obj.x = center_x - obj.width / 2
        elif alignment == 'center-v':
            center_y = sum(obj.y + obj.height / 2 for obj in objects_list) / len(objects_list)
            for obj in objects_list:
                obj.y = center_y - obj.height / 2
        
        # Save all objects
        DesignObject.objects.bulk_update(objects_list, ['x', 'y'])
        
        # Return serialized objects
        return [
            {
                'id': str(obj.id),
                'x': float(obj.x),
                'y': float(obj.y),
                'width': float(obj.width),
                'height': float(obj.height),
            }
            for obj in objects_list
        ]
    
    @staticmethod
    def distribute_objects(design_id: str, object_ids: List[str], direction: str) -> List[Dict[str, Any]]:
        """
        Distribute objects evenly.
        
        Args:
            design_id: Design UUID
            object_ids: List of object IDs to distribute
            direction: 'horizontal' or 'vertical'
        
        Returns:
            List of updated objects
        """
        objects = DesignObject.objects.filter(
            design_id=design_id,
            id__in=object_ids
        ).order_by('z_index')
        
        if not objects.exists() or len(object_ids) < 3:
            return []
        
        objects_list = list(objects)
        
        if direction == 'horizontal':
            # Sort by x position
            objects_list.sort(key=lambda o: o.x)
            min_x = objects_list[0].x
            max_x = objects_list[-1].x + objects_list[-1].width
            total_width = sum(obj.width for obj in objects_list)
            spacing = (max_x - min_x - total_width) / (len(objects_list) - 1)
            
            current_x = min_x
            for obj in objects_list:
                obj.x = current_x
                current_x += obj.width + spacing
        elif direction == 'vertical':
            # Sort by y position
            objects_list.sort(key=lambda o: o.y)
            min_y = objects_list[0].y
            max_y = objects_list[-1].y + objects_list[-1].height
            total_height = sum(obj.height for obj in objects_list)
            spacing = (max_y - min_y - total_height) / (len(objects_list) - 1)
            
            current_y = min_y
            for obj in objects_list:
                obj.y = current_y
                current_y += obj.height + spacing
        
        # Save all objects
        DesignObject.objects.bulk_update(objects_list, ['x', 'y'])
        
        # Return serialized objects
        return [
            {
                'id': str(obj.id),
                'x': float(obj.x),
                'y': float(obj.y),
                'width': float(obj.width),
                'height': float(obj.height),
            }
            for obj in objects_list
        ]
    
    @staticmethod
    def align_to_canvas(design_id: str, object_ids: List[str], alignment: str) -> List[Dict[str, Any]]:
        """
        Align objects to canvas edges.
        
        Args:
            design_id: Design UUID
            object_ids: List of object IDs to align
            alignment: 'left', 'right', 'top', 'bottom', 'center-h', 'center-v'
        
        Returns:
            List of updated objects
        """
        try:
            from app.designs.models import Design as DesignModel
            design = DesignModel.objects.get(id=design_id)
        except DesignModel.DoesNotExist:
            return []
        
        objects = DesignObject.objects.filter(
            design_id=design_id,
            id__in=object_ids
        )
        
        if not objects.exists():
            return []
        
        objects_list = list(objects)
        canvas_width = float(design.width)
        canvas_height = float(design.height)
        
        for obj in objects_list:
            if alignment == 'left':
                obj.x = Decimal('0')
            elif alignment == 'right':
                obj.x = Decimal(str(canvas_width - float(obj.width)))
            elif alignment == 'top':
                obj.y = Decimal('0')
            elif alignment == 'bottom':
                obj.y = Decimal(str(canvas_height - float(obj.height)))
            elif alignment == 'center-h':
                obj.x = Decimal(str((canvas_width - float(obj.width)) / 2))
            elif alignment == 'center-v':
                obj.y = Decimal(str((canvas_height - float(obj.height)) / 2))
        
        # Save all objects
        DesignObject.objects.bulk_update(objects_list, ['x', 'y'])
        
        # Return serialized objects
        return [
            {
                'id': str(obj.id),
                'x': float(obj.x),
                'y': float(obj.y),
                'width': float(obj.width),
                'height': float(obj.height),
            }
            for obj in objects_list
        ]

