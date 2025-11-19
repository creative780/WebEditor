"""
Text Service - Text processing and font management
Converted from TypeScript TextService.ts
"""
from typing import Dict, List, Any
import re


class TextService:
    """Service for text operations"""
    
    def __init__(self):
        self.available_fonts = [
            'Inter',
            'Roboto',
            'Open Sans',
            'Helvetica',
            'Arial',
            'Times New Roman',
            'Georgia',
            'Courier New',
            'Verdana',
            'Trebuchet MS',
        ]
    
    def list_fonts(self) -> List[str]:
        """
        List available fonts.
        Returns a list of font families available on the system.
        """
        return self.available_fonts
    
    def calculate_text_metrics(
        self,
        text: str,
        font_family: str = 'Inter',
        font_size: float = 16
    ) -> Dict[str, Any]:
        """
        Calculate text metrics (width, height, etc.).
        This is a simplified implementation. In production, use a proper font rendering library.
        """
        # Simplified calculation based on average character width
        # In production, use a library like Pillow with font rendering
        
        # Average character width estimation (rough approximation)
        avg_char_width = font_size * 0.6  # Rough estimate
        lines = text.split('\n')
        max_line_length = max(len(line) for line in lines) if lines else 0
        width = max_line_length * avg_char_width
        height = len(lines) * font_size * 1.2  # Line height factor
        
        return {
            'width': width,
            'height': height,
            'lineCount': len(lines),
            'charCount': len(text),
            'estimated': True  # Indicate this is an estimation
        }
    
    def validate_font(self, font_family: str) -> bool:
        """Validate font"""
        return font_family in self.available_fonts
    
    def format_rich_text(self, text: str, format_type: Dict[str, bool] = None) -> str:
        """
        Format rich text.
        """
        if format_type is None:
            format_type = {}
        
        formatted = text
        
        if format_type.get('bold'):
            formatted = f'<strong>{formatted}</strong>'
        
        if format_type.get('italic'):
            formatted = f'<em>{formatted}</em>'
        
        if format_type.get('underline'):
            formatted = f'<u>{formatted}</u>'
        
        return formatted
    
    def calculate_text_on_path(
        self,
        text: str,
        path_data: str,
        offset: float = 0.0
    ) -> Dict[str, Any]:
        """
        Calculate text character positions along a path.
        This is a simplified implementation.
        """
        # Simplified: return character positions as points along path
        # In production, use proper path calculation
        
        chars = []
        path_length = 100.0  # Simplified path length estimation
        
        for i, char in enumerate(text):
            # Distribute characters evenly along path
            char_offset = offset + (i * path_length / len(text)) if len(text) > 0 else offset
            chars.append({
                'char': char,
                'x': char_offset,
                'y': 0,
                'rotation': 0
            })
        
        return {'chars': chars}


text_service = TextService()


