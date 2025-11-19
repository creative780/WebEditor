"""
Pantone Service - Pantone color management
Converted from TypeScript PantoneService.ts
"""
from typing import List, Optional, Dict, Any, Literal
from app.colors.conversion import ColorConversion, RGBColor, PantoneColor, CMYKColor


class PantoneService:
    """Service for Pantone color operations"""
    
    def __init__(self):
        # Pantone color library
        self.pantone_library: List[PantoneColor] = [
            # Pantone Reds
            PantoneColor('PANTONE 185 C', RGBColor(224, 0, 52), CMYKColor(0, 100, 79, 0)),
            PantoneColor('PANTONE 186 C', RGBColor(200, 16, 46), CMYKColor(0, 100, 81, 4)),
            PantoneColor('PANTONE 187 C', RGBColor(168, 12, 39), CMYKColor(0, 100, 81, 20)),
            PantoneColor('PANTONE Red 032 C', RGBColor(239, 51, 64), CMYKColor(0, 91, 76, 0)),
            
            # Pantone Blues
            PantoneColor('PANTONE Process Blue C', RGBColor(0, 133, 202), CMYKColor(100, 44, 0, 0)),
            PantoneColor('PANTONE 286 C', RGBColor(0, 51, 160), CMYKColor(100, 86, 0, 0)),
            PantoneColor('PANTONE 287 C', RGBColor(0, 57, 166), CMYKColor(100, 80, 0, 0)),
            PantoneColor('PANTONE 2935 C', RGBColor(0, 123, 255), CMYKColor(100, 51, 0, 0)),
            
            # Pantone Greens
            PantoneColor('PANTONE 354 C', RGBColor(0, 153, 68), CMYKColor(100, 0, 91, 0)),
            PantoneColor('PANTONE 355 C', RGBColor(0, 143, 64), CMYKColor(100, 0, 91, 11)),
            PantoneColor('PANTONE 356 C', RGBColor(0, 131, 62), CMYKColor(100, 0, 90, 21)),
            PantoneColor('PANTONE Green C', RGBColor(0, 173, 131), CMYKColor(100, 0, 48, 0)),
            
            # Pantone Yellows
            PantoneColor('PANTONE Yellow C', RGBColor(254, 221, 0), CMYKColor(0, 5, 100, 0)),
            PantoneColor('PANTONE 109 C', RGBColor(255, 231, 0), CMYKColor(0, 0, 100, 0)),
            PantoneColor('PANTONE 116 C', RGBColor(255, 209, 0), CMYKColor(0, 12, 100, 0)),
            
            # Pantone Oranges
            PantoneColor('PANTONE Orange 021 C', RGBColor(254, 80, 0), CMYKColor(0, 75, 100, 0)),
            PantoneColor('PANTONE 1585 C', RGBColor(255, 105, 0), CMYKColor(0, 63, 100, 0)),
            
            # Pantone Purples
            PantoneColor('PANTONE Purple C', RGBColor(187, 41, 187), CMYKColor(31, 100, 0, 0)),
            PantoneColor('PANTONE 2597 C', RGBColor(108, 30, 157), CMYKColor(85, 100, 0, 0)),
            
            # Pantone Neutrals
            PantoneColor('PANTONE Black C', RGBColor(45, 41, 38), CMYKColor(0, 0, 0, 100)),
            PantoneColor('PANTONE Cool Gray 11 C', RGBColor(83, 86, 90), CMYKColor(0, 0, 0, 80)),
            PantoneColor('PANTONE Warm Gray 11 C', RGBColor(82, 76, 66), CMYKColor(0, 9, 16, 80)),
        ]
    
    def search(self, query: str) -> List[PantoneColor]:
        """Search Pantone colors by code or name"""
        lower_query = query.lower()
        return [
            p for p in self.pantone_library
            if lower_query in p.code.lower()
        ]
    
    def get_by_code(self, code: str) -> Optional[PantoneColor]:
        """Get Pantone by exact code"""
        for pantone in self.pantone_library:
            if pantone.code == code:
                return pantone
        return None
    
    def find_closest_match(self, rgb: RGBColor) -> Dict[str, Any]:
        """Find closest Pantone match for RGB color"""
        closest_color = self.pantone_library[0]
        min_distance = float('inf')
        
        for pantone in self.pantone_library:
            distance = (
                (rgb.r - pantone.rgb.r) ** 2 +
                (rgb.g - pantone.rgb.g) ** 2 +
                (rgb.b - pantone.rgb.b) ** 2
            ) ** 0.5
            
            if distance < min_distance:
                min_distance = distance
                closest_color = pantone
        
        # Calculate Delta E for accuracy
        delta_e = ColorConversion.calculate_delta_e(rgb, closest_color.rgb)
        
        return {
            'pantone': closest_color.to_dict(),
            'distance': round(min_distance),
            'deltaE': round(delta_e * 100) / 100
        }
    
    def get_all(self) -> List[PantoneColor]:
        """Get all Pantone colors"""
        return self.pantone_library


pantone_service = PantoneService()


