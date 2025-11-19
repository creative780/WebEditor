"""
Color Validation - Validate colors for print readiness
Converted from TypeScript ColorValidation.ts
"""
from typing import List, Dict, Any, Union
from app.colors.conversion import ColorConversion, RGBColor, CMYKColor


class ColorValidationResult:
    def __init__(
        self,
        is_valid: bool,
        warnings: List[str],
        errors: List[str],
        ink_coverage: float,
        is_rich_black: bool,
        is_print_safe: bool
    ):
        self.is_valid = is_valid
        self.warnings = warnings
        self.errors = errors
        self.ink_coverage = ink_coverage
        self.is_rich_black = is_rich_black
        self.is_print_safe = is_print_safe
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'isValid': self.is_valid,
            'warnings': self.warnings,
            'errors': self.errors,
            'inkCoverage': self.ink_coverage,
            'isRichBlack': self.is_rich_black,
            'isPrintSafe': self.is_print_safe
        }


class ColorValidation:
    """Service for validating colors for print"""
    
    MAX_INK_COVERAGE = 300.0  # Standard limit is 300%
    MIN_RICH_BLACK_INK = 200.0
    
    def validate_for_print(self, color: Union[str, RGBColor]) -> ColorValidationResult:
        """Validate color for print"""
        if isinstance(color, str):
            rgb = ColorConversion.hex_to_rgb(color)
        else:
            rgb = color
        
        cmyk = ColorConversion.rgb_to_cmyk(rgb)
        
        warnings = []
        errors = []
        
        # Calculate total ink coverage
        ink_coverage = cmyk.c + cmyk.m + cmyk.y + cmyk.k
        
        # Check ink coverage
        if ink_coverage > self.MAX_INK_COVERAGE:
            errors.append(
                f'Ink coverage ({ink_coverage}%) exceeds maximum ({self.MAX_INK_COVERAGE}%). May cause drying issues.'
            )
        elif ink_coverage > self.MAX_INK_COVERAGE * 0.9:
            warnings.append(
                f'Ink coverage ({ink_coverage}%) is high. Consider reducing for better print quality.'
            )
        
        # Check for rich black
        is_rich_black = self.is_rich_black(cmyk)
        if is_rich_black:
            warnings.append(
                'This is a rich black. Ensure proper registration for best results.'
            )
        
        # Check if it's true black (K only)
        if cmyk.c == 0 and cmyk.m == 0 and cmyk.y == 0 and cmyk.k == 100:
            warnings.append(
                'Using 100% K only. Consider using rich black (C60 M40 Y40 K100) for deeper black.'
            )
        
        # Check for very light colors
        if cmyk.c < 5 and cmyk.m < 5 and cmyk.y < 5 and cmyk.k < 5:
            warnings.append(
                'Very light color. May appear almost white when printed.'
            )
        
        # Check for out-of-gamut colors
        rgb_check = ColorConversion.cmyk_to_rgb(cmyk)
        delta_e = ColorConversion.calculate_delta_e(rgb, rgb_check)
        
        if delta_e > 10:
            warnings.append(
                'Color may shift significantly when converted to CMYK. Preview in CMYK mode.'
            )
        
        is_print_safe = len(errors) == 0
        
        return ColorValidationResult(
            is_print_safe,
            warnings,
            errors,
            round(ink_coverage),
            is_rich_black,
            is_print_safe
        )
    
    def is_rich_black(self, cmyk: CMYKColor) -> bool:
        """Check if color is rich black"""
        total_ink = cmyk.c + cmyk.m + cmyk.y + cmyk.k
        return cmyk.k >= 80 and total_ink >= self.MIN_RICH_BLACK_INK
    
    def calculate_ink_coverage(self, cmyk: CMYKColor) -> float:
        """Calculate total ink coverage"""
        return cmyk.c + cmyk.m + cmyk.y + cmyk.k
    
    def batch_validate(self, colors: List[str]) -> List[ColorValidationResult]:
        """Batch validate colors"""
        return [self.validate_for_print(color) for color in colors]


color_validation = ColorValidation()


