"""
Collaboration Service - Business logic for collaboration features
Handles design ID resolution and auto-creation
"""
import re
from typing import Optional
from app.designs.models import Design


def get_actual_design_id(design_id: str) -> Optional[str]:
    """
    Get the actual design UUID from design_id.
    Handles both UUID and string IDs (like "local-design").
    
    Args:
        design_id: Either a UUID string or a non-UUID string (stored in name field)
    
    Returns:
        The actual UUID of the design, or None if not found
    """
    uuid_regex = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', re.IGNORECASE)
    
    if uuid_regex.match(design_id):
        # It's a UUID, check if design exists
        try:
            design = Design.objects.get(id=design_id)
            return str(design.id)
        except Design.DoesNotExist:
            return None
    else:
        # Not a UUID, look up by name
        try:
            design = Design.objects.filter(name=design_id).order_by('-created_at').first()
            return str(design.id) if design else None
        except Design.DoesNotExist:
            return None


def ensure_design_exists(design_id: str, user_id: str) -> str:
    """
    Ensure design exists, create if it doesn't.
    Returns the actual design UUID (may differ from design_id if design_id is not a UUID).
    
    Args:
        design_id: Either a UUID string or a non-UUID string
        user_id: User ID to assign as owner
    
    Returns:
        The actual UUID of the design (either existing or newly created)
    """
    # First, try to get existing design
    existing_id = get_actual_design_id(design_id)
    if existing_id:
        return existing_id
    
    # Design doesn't exist, create it
    uuid_regex = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', re.IGNORECASE)
    is_uuid = uuid_regex.match(design_id)
    
    if is_uuid:
        # Valid UUID - create design with this ID
        design = Design.objects.create(
            id=design_id,
            user_id=user_id,
            name=f"Design {design_id[:8]}",
            width=8.5,  # Default letter size width
            height=11,  # Default letter size height
            unit='in',
            dpi=300,
            bleed=0.125,
            color_mode='rgb',
        )
        return str(design.id)
    else:
        # Not a valid UUID - create with auto-generated UUID
        # Store the original design_id in the name field for lookup
        design = Design.objects.create(
            user_id=user_id,
            name=design_id,  # Store the original design_id as the name for lookup
            width=8.5,
            height=11,
            unit='in',
            dpi=300,
            bleed=0.125,
            color_mode='rgb',
        )
        return str(design.id)


