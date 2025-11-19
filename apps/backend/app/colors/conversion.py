"""
Color Conversion - Convert between color spaces
Converted from TypeScript ColorConversion.ts
"""
import math
from typing import Dict, Any


class RGBColor:
    def __init__(self, r: int, g: int, b: int):
        self.r = r
        self.g = g
        self.b = b
    
    def to_dict(self) -> Dict[str, int]:
        return {'r': self.r, 'g': self.g, 'b': self.b}


class CMYKColor:
    def __init__(self, c: float, m: float, y: float, k: float):
        self.c = c
        self.m = m
        self.y = y
        self.k = k
    
    def to_dict(self) -> Dict[str, float]:
        return {'c': self.c, 'm': self.m, 'y': self.y, 'k': self.k}


class LABColor:
    def __init__(self, l: float, a: float, b: float):
        self.l = l
        self.a = a
        self.b = b
    
    def to_dict(self) -> Dict[str, float]:
        return {'l': self.l, 'a': self.a, 'b': self.b}


class PantoneColor:
    def __init__(self, code: str, rgb: RGBColor, cmyk: CMYKColor):
        self.code = code
        self.rgb = rgb
        self.cmyk = cmyk
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'code': self.code,
            'rgb': self.rgb.to_dict(),
            'cmyk': self.cmyk.to_dict()
        }


class ColorConversion:
    """Service for color space conversions"""
    
    @staticmethod
    def hex_to_rgb(hex_color: str) -> RGBColor:
        """Convert HEX to RGB"""
        hex_color = hex_color.lstrip('#')
        if len(hex_color) != 6:
            raise ValueError('Invalid hex color')
        
        r = int(hex_color[0:2], 16)
        g = int(hex_color[2:4], 16)
        b = int(hex_color[4:6], 16)
        
        return RGBColor(r, g, b)
    
    @staticmethod
    def rgb_to_hex(rgb: RGBColor) -> str:
        """Convert RGB to HEX"""
        def to_hex(n: int) -> str:
            hex_val = format(int(round(n)), 'x')
            return hex_val if len(hex_val) == 2 else '0' + hex_val
        
        return f"#{to_hex(rgb.r)}{to_hex(rgb.g)}{to_hex(rgb.b)}"
    
    @staticmethod
    def rgb_to_cmyk(rgb: RGBColor) -> CMYKColor:
        """Convert RGB to CMYK"""
        r = rgb.r / 255.0
        g = rgb.g / 255.0
        b = rgb.b / 255.0
        
        k = 1.0 - max(r, g, b)
        
        if k == 1.0:
            return CMYKColor(0, 0, 0, 100)
        
        c = ((1.0 - r - k) / (1.0 - k)) * 100
        m = ((1.0 - g - k) / (1.0 - k)) * 100
        y = ((1.0 - b - k) / (1.0 - k)) * 100
        
        return CMYKColor(
            round(c),
            round(m),
            round(y),
            round(k * 100)
        )
    
    @staticmethod
    def cmyk_to_rgb(cmyk: CMYKColor) -> RGBColor:
        """Convert CMYK to RGB"""
        c = cmyk.c / 100.0
        m = cmyk.m / 100.0
        y = cmyk.y / 100.0
        k = cmyk.k / 100.0
        
        r = 255 * (1.0 - c) * (1.0 - k)
        g = 255 * (1.0 - m) * (1.0 - k)
        b = 255 * (1.0 - y) * (1.0 - k)
        
        return RGBColor(round(r), round(g), round(b))
    
    @staticmethod
    def rgb_to_lab(rgb: RGBColor) -> LABColor:
        """Convert RGB to LAB using D65 illuminant"""
        # First convert RGB to XYZ
        r = rgb.r / 255.0
        g = rgb.g / 255.0
        b = rgb.b / 255.0
        
        # Apply gamma correction
        r = ((r + 0.055) / 1.055) ** 2.4 if r > 0.04045 else r / 12.92
        g = ((g + 0.055) / 1.055) ** 2.4 if g > 0.04045 else g / 12.92
        b = ((b + 0.055) / 1.055) ** 2.4 if b > 0.04045 else b / 12.92
        
        # Convert to XYZ (D65 illuminant)
        x = (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) * 100
        y = (r * 0.2126729 + g * 0.7151522 + b * 0.072175) * 100
        z = (r * 0.0193339 + g * 0.119192 + b * 0.9503041) * 100
        
        # Convert XYZ to LAB
        xn = 95.047  # D65 reference white
        yn = 100.0
        zn = 108.883
        
        fx = ColorConversion._lab_f(x / xn)
        fy = ColorConversion._lab_f(y / yn)
        fz = ColorConversion._lab_f(z / zn)
        
        l = 116 * fy - 16
        a = 500 * (fx - fy)
        b_val = 200 * (fy - fz)
        
        return LABColor(
            round(l * 100) / 100,
            round(a * 100) / 100,
            round(b_val * 100) / 100
        )
    
    @staticmethod
    def _lab_f(t: float) -> float:
        """Helper function for LAB conversion"""
        delta = 6 / 29
        return t ** (1/3) if t > delta ** 3 else t / (3 * delta ** 2) + 4 / 29
    
    @staticmethod
    def calculate_delta_e(rgb1: RGBColor, rgb2: RGBColor) -> float:
        """Calculate Delta E (color difference) between two RGB colors"""
        lab1 = ColorConversion.rgb_to_lab(rgb1)
        lab2 = ColorConversion.rgb_to_lab(rgb2)
        
        delta_l = lab1.l - lab2.l
        delta_a = lab1.a - lab2.a
        delta_b = lab1.b - lab2.b
        
        return math.sqrt(delta_l ** 2 + delta_a ** 2 + delta_b ** 2)


color_conversion = ColorConversion()


