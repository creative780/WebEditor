"""
Blending Service - Blend modes and layer effects
Converted from TypeScript BlendingService.ts
"""
from typing import Literal, Dict, Any, Optional
from datetime import datetime


BlendMode = Literal[
    'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
    'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion'
]


class BlendingService:
    """Service for blend modes and layer effects"""
    
    VALID_BLEND_MODES = [
        'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
        'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion'
    ]
    
    def is_valid_blend_mode(self, blend_mode: str) -> bool:
        """Check if blend mode is valid"""
        return blend_mode in self.VALID_BLEND_MODES
    
    def apply_blend_mode(self, layer_id: str, blend_mode: BlendMode) -> Dict[str, Any]:
        """Apply blend mode to layer"""
        return {
            'blendMode': blend_mode,
            'timestamp': datetime.now().timestamp()
        }
    
    def create_drop_shadow(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Create drop shadow effect"""
        defaults = {
            'offsetX': 0,
            'offsetY': 4,
            'blur': 8,
            'spread': 0,
            'color': '#000000',
            'opacity': 0.25
        }
        defaults.update(params)
        
        return {
            'type': 'drop-shadow',
            'enabled': True,
            'properties': defaults
        }
    
    def create_outer_glow(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Create outer glow effect"""
        defaults = {
            'blur': 10,
            'spread': 0,
            'color': '#FFFFFF',
            'opacity': 0.75
        }
        defaults.update(params)
        
        return {
            'type': 'outer-glow',
            'enabled': True,
            'properties': defaults
        }
    
    def create_inner_glow(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Create inner glow effect"""
        defaults = {
            'blur': 10,
            'spread': 0,
            'color': '#FFFFFF',
            'opacity': 0.75
        }
        defaults.update(params)
        
        return {
            'type': 'inner-glow',
            'enabled': True,
            'properties': defaults
        }
    
    def create_bevel(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Create bevel effect"""
        defaults = {
            'depth': 5,
            'size': 3,
            'angle': 135,
            'highlightColor': '#FFFFFF',
            'shadowColor': '#000000',
            'highlightOpacity': 0.75,
            'shadowOpacity': 0.75
        }
        defaults.update(params)
        
        return {
            'type': 'bevel',
            'enabled': True,
            'properties': defaults
        }


blending_service = BlendingService()


