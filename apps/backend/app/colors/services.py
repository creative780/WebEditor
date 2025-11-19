"""
Color Service - Main color operations service
Converted from TypeScript ColorService.ts
"""
from typing import List, Dict, Any, Literal, Optional
from app.colors.conversion import ColorConversion, RGBColor, CMYKColor, LABColor
from app.colors.validation import ColorValidation
from app.colors.pantone_service import PantoneService


class GradientStop:
    def __init__(self, position: float, color: str, opacity: Optional[float] = None):
        self.position = position
        self.color = color
        self.opacity = opacity
    
    def to_dict(self) -> Dict[str, Any]:
        result = {'position': self.position, 'color': self.color}
        if self.opacity is not None:
            result['opacity'] = self.opacity
        return result


class Gradient:
    def __init__(
        self,
        gradient_type: Literal['linear', 'radial', 'conic'],
        stops: List[GradientStop],
        angle: Optional[float] = None,
        center_x: Optional[float] = None,
        center_y: Optional[float] = None
    ):
        self.type = gradient_type
        self.stops = stops
        self.angle = angle or 0
        self.center_x = center_x or 0.5
        self.center_y = center_y or 0.5
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'type': self.type,
            'angle': self.angle,
            'centerX': self.center_x,
            'centerY': self.center_y,
            'stops': [stop.to_dict() for stop in self.stops]
        }


class ColorHarmony:
    def __init__(
        self,
        scheme: Literal['complementary', 'analogous', 'triadic', 'tetradic', 'monochromatic'],
        colors: List[str]
    ):
        self.scheme = scheme
        self.colors = colors
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'scheme': self.scheme,
            'colors': self.colors
        }


class ColorService:
    """Main service for color operations"""
    
    def __init__(self):
        self.conversion = ColorConversion()
        self.validation = ColorValidation()
        self.pantone = PantoneService()
    
    def convert(
        self,
        color: str,
        from_format: Literal['rgb', 'cmyk', 'lab'],
        to_format: Literal['rgb', 'cmyk', 'lab', 'hex']
    ) -> Any:
        """Convert color between formats"""
        # Parse source color
        if from_format == 'rgb':
            rgb = self.conversion.hex_to_rgb(color)
        else:
            # For now, assume input is hex, convert to RGB first
            rgb = self.conversion.hex_to_rgb(color)
        
        # Convert to target format
        if to_format == 'rgb':
            return rgb.to_dict()
        elif to_format == 'cmyk':
            return self.conversion.rgb_to_cmyk(rgb).to_dict()
        elif to_format == 'lab':
            return self.conversion.rgb_to_lab(rgb).to_dict()
        elif to_format == 'hex':
            return self.conversion.rgb_to_hex(rgb)
        else:
            return rgb.to_dict()
    
    def validate(self, color: str) -> Dict[str, Any]:
        """Validate color for print"""
        result = self.validation.validate_for_print(color)
        return result.to_dict()
    
    def create_gradient(
        self,
        start_color: str,
        end_color: str,
        intermediate_colors: List[str] = None,
        gradient_type: Literal['linear', 'radial', 'conic'] = 'linear'
    ) -> Gradient:
        """Create multi-stop gradient"""
        if intermediate_colors is None:
            intermediate_colors = []
        
        all_colors = [start_color] + intermediate_colors + [end_color]
        stops = [
            GradientStop(
                position=i / (len(all_colors) - 1) if len(all_colors) > 1 else 0,
                color=color,
                opacity=1.0
            )
            for i, color in enumerate(all_colors)
        ]
        
        return Gradient(
            gradient_type=gradient_type,
            stops=stops,
            angle=0
        )
    
    def gradient_to_css(self, gradient: Gradient) -> str:
        """Convert gradient to CSS string"""
        optimized = self.optimize_gradient(gradient)
        stop_strings = [
            f"{stop.color} {stop.position * 100}%" for stop in optimized.stops
        ]
        
        if gradient.type == 'linear':
            return f"linear-gradient({gradient.angle}deg, {', '.join(stop_strings)})"
        elif gradient.type == 'radial':
            return f"radial-gradient(circle at {gradient.center_x * 100}% {gradient.center_y * 100}%, {', '.join(stop_strings)})"
        elif gradient.type == 'conic':
            return f"conic-gradient(from {gradient.angle}deg at {gradient.center_x * 100}% {gradient.center_y * 100}%, {', '.join(stop_strings)})"
        else:
            return ''
    
    def optimize_gradient(self, gradient: Gradient) -> Gradient:
        """Optimize gradient for export"""
        # Remove duplicate stops
        unique_stops = []
        seen_positions = set()
        for stop in gradient.stops:
            if stop.position not in seen_positions:
                unique_stops.append(stop)
                seen_positions.add(stop.position)
        
        # Ensure at least 2 stops
        if len(unique_stops) < 2:
            unique_stops = [
                GradientStop(0, unique_stops[0].color if unique_stops else '#000000'),
                GradientStop(1, unique_stops[0].color if unique_stops else '#ffffff')
            ]
        
        # Sort by position
        unique_stops.sort(key=lambda s: s.position)
        
        return Gradient(
            gradient_type=gradient.type,
            stops=unique_stops,
            angle=gradient.angle,
            center_x=gradient.center_x,
            center_y=gradient.center_y
        )
    
    def interpolate_gradient(self, color1: str, color2: str, steps: int = 10) -> List[str]:
        """Interpolate colors in a gradient"""
        rgb1 = self.conversion.hex_to_rgb(color1)
        rgb2 = self.conversion.hex_to_rgb(color2)
        
        colors = []
        
        for i in range(steps):
            t = i / (steps - 1) if steps > 1 else 0
            r = round(rgb1.r + (rgb2.r - rgb1.r) * t)
            g = round(rgb1.g + (rgb2.g - rgb1.g) * t)
            b = round(rgb1.b + (rgb2.b - rgb1.b) * t)
            
            colors.append(self.conversion.rgb_to_hex(RGBColor(r, g, b)))
        
        return colors
    
    def generate_harmony(
        self,
        base_color: str,
        scheme: Literal['complementary', 'analogous', 'triadic', 'tetradic', 'monochromatic']
    ) -> ColorHarmony:
        """Generate color harmonies"""
        rgb = self.conversion.hex_to_rgb(base_color)
        colors = [base_color]
        
        # Convert to HSL for easier harmony calculation
        hsl = self._rgb_to_hsl(rgb)
        
        if scheme == 'complementary':
            # Opposite on color wheel (180 degrees)
            colors.append(self._hsl_to_hex((hsl['h'] + 180) % 360, hsl['s'], hsl['l']))
        elif scheme == 'analogous':
            # Adjacent colors (30 degrees apart)
            colors.append(self._hsl_to_hex((hsl['h'] + 30) % 360, hsl['s'], hsl['l']))
            colors.append(self._hsl_to_hex((hsl['h'] - 30 + 360) % 360, hsl['s'], hsl['l']))
        elif scheme == 'triadic':
            # Evenly spaced (120 degrees)
            colors.append(self._hsl_to_hex((hsl['h'] + 120) % 360, hsl['s'], hsl['l']))
            colors.append(self._hsl_to_hex((hsl['h'] + 240) % 360, hsl['s'], hsl['l']))
        elif scheme == 'tetradic':
            # Rectangle (90, 180, 270 degrees)
            colors.append(self._hsl_to_hex((hsl['h'] + 90) % 360, hsl['s'], hsl['l']))
            colors.append(self._hsl_to_hex((hsl['h'] + 180) % 360, hsl['s'], hsl['l']))
            colors.append(self._hsl_to_hex((hsl['h'] + 270) % 360, hsl['s'], hsl['l']))
        elif scheme == 'monochromatic':
            # Same hue, different lightness
            colors.append(self._hsl_to_hex(hsl['h'], hsl['s'], min(100, hsl['l'] + 20)))
            colors.append(self._hsl_to_hex(hsl['h'], hsl['s'], max(0, hsl['l'] - 20)))
        
        return ColorHarmony(scheme, colors)
    
    def generate_palette(self, base_color: str, count: int = 5) -> List[str]:
        """Generate color palette"""
        rgb = self.conversion.hex_to_rgb(base_color)
        hsl = self._rgb_to_hsl(rgb)
        palette = [base_color]
        
        # Generate variations
        for i in range(1, count):
            variation_h = (hsl['h'] + (360 / count) * i) % 360
            palette.append(self._hsl_to_hex(variation_h, hsl['s'], hsl['l']))
        
        return palette
    
    def check_accessibility(self, foreground: str, background: str) -> Dict[str, Any]:
        """Check color accessibility (contrast ratio)"""
        fg = self.conversion.hex_to_rgb(foreground)
        bg = self.conversion.hex_to_rgb(background)
        
        l1 = self._relative_luminance(fg)
        l2 = self._relative_luminance(bg)
        
        ratio = (max(l1, l2) + 0.05) / (min(l1, l2) + 0.05)
        
        return {
            'ratio': round(ratio * 100) / 100,
            'aa': ratio >= 4.5,  # WCAG AA
            'aaa': ratio >= 7  # WCAG AAA
        }
    
    async def extract_colors_from_image(self, image_url: str, count: int = 5) -> List[str]:
        """Extract dominant colors from image (simplified implementation)"""
        # Placeholder implementation
        # In production, use libraries like Pillow or scikit-image
        return [
            '#6F1414',
            '#3b82f6',
            '#10b981',
            '#f59e0b',
            '#8b5cf6',
        ][:count]
    
    def _rgb_to_hsl(self, rgb: RGBColor) -> Dict[str, float]:
        """Convert RGB to HSL"""
        r = rgb.r / 255.0
        g = rgb.g / 255.0
        b = rgb.b / 255.0
        
        max_val = max(r, g, b)
        min_val = min(r, g, b)
        l = (max_val + min_val) / 2.0
        
        if max_val == min_val:
            return {'h': 0, 's': 0, 'l': l * 100}
        
        d = max_val - min_val
        s = d / (2 - max_val - min_val) if l > 0.5 else d / (max_val + min_val)
        
        h = 0
        if max_val == r:
            h = ((g - b) / d + (6 if g < b else 0)) / 6
        elif max_val == g:
            h = ((b - r) / d + 2) / 6
        else:
            h = ((r - g) / d + 4) / 6
        
        return {
            'h': round(h * 360),
            's': round(s * 100),
            'l': round(l * 100)
        }
    
    def _hsl_to_hex(self, h: float, s: float, l: float) -> str:
        """Convert HSL to HEX"""
        h = h / 360.0
        s = s / 100.0
        l = l / 100.0
        
        if s == 0:
            r = g = b = l
        else:
            def hue2rgb(p: float, q: float, t: float) -> float:
                if t < 0:
                    t += 1
                if t > 1:
                    t -= 1
                if t < 1/6:
                    return p + (q - p) * 6 * t
                if t < 1/2:
                    return q
                if t < 2/3:
                    return p + (q - p) * (2/3 - t) * 6
                return p
            
            q = l * (1 + s) if l < 0.5 else l + s - l * s
            p = 2 * l - q
            
            r = hue2rgb(p, q, h + 1/3)
            g = hue2rgb(p, q, h)
            b = hue2rgb(p, q, h - 1/3)
        
        rgb = RGBColor(round(r * 255), round(g * 255), round(b * 255))
        return self.conversion.rgb_to_hex(rgb)
    
    def _relative_luminance(self, rgb: RGBColor) -> float:
        """Calculate relative luminance"""
        rs_rgb = rgb.r / 255.0
        gs_rgb = rgb.g / 255.0
        bs_rgb = rgb.b / 255.0
        
        r = rs_rgb / 12.92 if rs_rgb <= 0.03928 else ((rs_rgb + 0.055) / 1.055) ** 2.4
        g = gs_rgb / 12.92 if gs_rgb <= 0.03928 else ((gs_rgb + 0.055) / 1.055) ** 2.4
        b = bs_rgb / 12.92 if bs_rgb <= 0.03928 else ((bs_rgb + 0.055) / 1.055) ** 2.4
        
        return 0.2126 * r + 0.7152 * g + 0.0722 * b


color_service = ColorService()


