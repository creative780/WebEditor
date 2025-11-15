/**
 * Professional Color Management System for Print
 * Supports CMYK, RGB, Pantone, and Spot colors
 */

export type ColorSpace = 'CMYK' | 'RGB' | 'Pantone' | 'Spot' | 'LAB';

export interface ColorProfile {
  id: string;
  name: string;
  type: ColorSpace;
  profile: string;
  gamut: ColorGamut;
  description: string;
}

export interface ColorGamut {
  min: [number, number, number, number?];
  max: [number, number, number, number?];
}

export interface CMYKColor {
  c: number; // 0-100
  m: number; // 0-100
  y: number; // 0-100
  k: number; // 0-100
  alpha?: number; // 0-1
}

export interface RGBColor {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
  alpha?: number; // 0-1
}

export interface PantoneColor {
  code: string; // e.g., "PANTONE 186 C"
  name: string;
  cmyk: CMYKColor;
  rgb: RGBColor;
  hex: string;
  category: string;
  description?: string;
}

export interface SpotColor {
  name: string;
  cmyk: CMYKColor;
  pantone?: string;
  description?: string;
}

// Standard Color Profiles
export const COLOR_PROFILES: ColorProfile[] = [
  {
    id: 'sRGB',
    name: 'sRGB IEC61966-2.1',
    type: 'RGB',
    profile: 'sRGB',
    gamut: { min: [0, 0, 0], max: [255, 255, 255] },
    description: 'Standard RGB color space for web and general use'
  },
  {
    id: 'AdobeRGB',
    name: 'Adobe RGB (1998)',
    type: 'RGB',
    profile: 'AdobeRGB1998',
    gamut: { min: [0, 0, 0], max: [255, 255, 255] },
    description: 'Wide gamut RGB for professional photography'
  },
  {
    id: 'CMYK_US',
    name: 'US Web Coated (SWOP) v2',
    type: 'CMYK',
    profile: 'CoatedFOGRA39',
    gamut: { min: [0, 0, 0, 0], max: [100, 100, 100, 100] },
    description: 'Standard CMYK for US commercial printing'
  },
  {
    id: 'CMYK_EU',
    name: 'ISO Coated v2 (FOGRA39)',
    type: 'CMYK',
    profile: 'CoatedFOGRA39',
    gamut: { min: [0, 0, 0, 0], max: [100, 100, 100, 100] },
    description: 'Standard CMYK for European commercial printing'
  }
];

// Popular Pantone Colors
export const PANTONE_COLORS: PantoneColor[] = [
  {
    code: 'PANTONE 186 C',
    name: 'Red 032 C',
    cmyk: { c: 0, m: 96, y: 95, k: 0 },
    rgb: { r: 218, g: 41, b: 28 },
    hex: '#DA291C',
    category: 'Red',
    description: 'Bright red, perfect for branding'
  },
  {
    code: 'PANTONE 286 C',
    name: 'Blue 072 C',
    cmyk: { c: 100, m: 69, y: 0, k: 0 },
    rgb: { r: 0, g: 61, b: 165 },
    hex: '#003DA5',
    category: 'Blue',
    description: 'Corporate blue, professional and trustworthy'
  },
  {
    code: 'PANTONE 348 C',
    name: 'Green 356 C',
    cmyk: { c: 100, m: 0, y: 100, k: 0 },
    rgb: { r: 0, g: 122, b: 51 },
    hex: '#007A33',
    category: 'Green',
    description: 'Nature green, eco-friendly branding'
  },
  {
    code: 'PANTONE 116 C',
    name: 'Yellow 012 C',
    cmyk: { c: 0, m: 14, y: 100, k: 0 },
    rgb: { r: 255, g: 220, b: 0 },
    hex: '#FFDC00',
    category: 'Yellow',
    description: 'Bright yellow, attention-grabbing'
  },
  {
    code: 'PANTONE 2685 C',
    name: 'Purple 2685 C',
    cmyk: { c: 100, m: 100, y: 0, k: 0 },
    rgb: { r: 102, g: 45, b: 145 },
    hex: '#662D91',
    category: 'Purple',
    description: 'Royal purple, luxury branding'
  },
  {
    code: 'PANTONE Black C',
    name: 'Black C',
    cmyk: { c: 0, m: 0, y: 0, k: 100 },
    rgb: { r: 0, g: 0, b: 0 },
    hex: '#000000',
    category: 'Neutral',
    description: 'Pure black for text and contrast'
  },
  {
    code: 'PANTONE Cool Gray 11 C',
    name: 'Cool Gray 11 C',
    cmyk: { c: 0, m: 0, y: 0, k: 60 },
    rgb: { r: 102, g: 102, b: 102 },
    hex: '#666666',
    category: 'Neutral',
    description: 'Professional gray for secondary text'
  }
];

// Color conversion utilities
export class ColorManager {
  private static instance: ColorManager;
  private profiles: Map<string, ColorProfile> = new Map();
  private pantoneColors: Map<string, PantoneColor> = new Map();

  constructor() {
    this.initializeProfiles();
    this.initializePantoneColors();
  }

  static getInstance(): ColorManager {
    if (!ColorManager.instance) {
      ColorManager.instance = new ColorManager();
    }
    return ColorManager.instance;
  }

  private initializeProfiles(): void {
    COLOR_PROFILES.forEach(profile => {
      this.profiles.set(profile.id, profile);
    });
  }

  private initializePantoneColors(): void {
    PANTONE_COLORS.forEach(color => {
      this.pantoneColors.set(color.code, color);
    });
  }

  // RGB to CMYK conversion
  rgbToCmyk(rgb: RGBColor): CMYKColor {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const k = 1 - Math.max(r, g, b);
    const c = k === 1 ? 0 : (1 - r - k) / (1 - k);
    const m = k === 1 ? 0 : (1 - g - k) / (1 - k);
    const y = k === 1 ? 0 : (1 - b - k) / (1 - k);

    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100),
      alpha: rgb.alpha
    };
  }

  // CMYK to RGB conversion
  cmykToRgb(cmyk: CMYKColor): RGBColor {
    const c = cmyk.c / 100;
    const m = cmyk.m / 100;
    const y = cmyk.y / 100;
    const k = cmyk.k / 100;

    const r = Math.round(255 * (1 - c) * (1 - k));
    const g = Math.round(255 * (1 - m) * (1 - k));
    const b = Math.round(255 * (1 - y) * (1 - k));

    return {
      r: Math.max(0, Math.min(255, r)),
      g: Math.max(0, Math.min(255, g)),
      b: Math.max(0, Math.min(255, b)),
      alpha: cmyk.alpha
    };
  }

  // Hex to RGB conversion
  hexToRgb(hex: string): RGBColor {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
      throw new Error('Invalid hex color');
    }

    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    };
  }

  // RGB to Hex conversion
  rgbToHex(rgb: RGBColor): string {
    const toHex = (n: number) => {
      const hex = Math.round(n).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  }

  // RGB to HSL conversion
  rgbToHsl(rgb: RGBColor): { h: number; s: number; l: number } {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return {
      h: h * 360,
      s: s,
      l: l
    };
  }

  // Get Pantone color by code
  getPantoneColor(code: string): PantoneColor | undefined {
    return this.pantoneColors.get(code);
  }

  // Search Pantone colors
  searchPantoneColors(query: string): PantoneColor[] {
    const lowerQuery = query.toLowerCase();
    return PANTONE_COLORS.filter(color => 
      color.code.toLowerCase().includes(lowerQuery) ||
      color.name.toLowerCase().includes(lowerQuery) ||
      color.category.toLowerCase().includes(lowerQuery)
    );
  }

  // Get color profile by ID
  getColorProfile(id: string): ColorProfile | undefined {
    return this.profiles.get(id);
  }

  // Get all available color profiles
  getAllColorProfiles(): ColorProfile[] {
    return Array.from(this.profiles.values());
  }

  // Validate color for print
  validateColorForPrint(color: RGBColor | CMYKColor, profile: string): {
    isValid: boolean;
    warnings: string[];
    errors: string[];
  } {
    const warnings: string[] = [];
    const errors: string[] = [];

    if ('r' in color) {
      // RGB color validation
      const cmyk = this.rgbToCmyk(color);
      
      // Check for out-of-gamut colors
      if (cmyk.c + cmyk.m + cmyk.y + cmyk.k > 300) {
        warnings.push('Color may be too saturated for print');
      }
      
      // Check for very light colors
      if (color.r > 240 && color.g > 240 && color.b > 240) {
        warnings.push('Very light color may not print well');
      }
      
      // Check for very dark colors
      if (color.r < 15 && color.g < 15 && color.b < 15) {
        warnings.push('Very dark color may appear muddy in print');
      }
    } else {
      // CMYK color validation
      const total = color.c + color.m + color.y + color.k;
      
      if (total > 300) {
        errors.push('Total ink coverage exceeds 300% - may cause printing issues');
      }
      
      if (total > 280) {
        warnings.push('High ink coverage may cause drying issues');
      }
      
      if (color.k > 95) {
        warnings.push('Very high black ink may cause registration issues');
      }
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors
    };
  }

  // Convert color between spaces
  convertColor(color: RGBColor | CMYKColor, from: ColorSpace, to: ColorSpace): RGBColor | CMYKColor {
    if (from === to) {
      return color;
    }

    if (from === 'RGB' && to === 'CMYK') {
      return this.rgbToCmyk(color as RGBColor);
    }

    if (from === 'CMYK' && to === 'RGB') {
      return this.cmykToRgb(color as CMYKColor);
    }

    throw new Error(`Conversion from ${from} to ${to} not supported`);
  }

  // Get color preview (for UI display)
  getColorPreview(color: RGBColor | CMYKColor, space: ColorSpace): string {
    if (space === 'RGB' || space === 'Pantone') {
      const rgb = 'r' in color ? color : this.cmykToRgb(color as CMYKColor);
      return this.rgbToHex(rgb);
    }
    
    if (space === 'CMYK') {
      const cmyk = 'c' in color ? color : this.rgbToCmyk(color as RGBColor);
      return `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;
    }

    return '#000000';
  }
}

// Export singleton instance
export const colorManager = ColorManager.getInstance();

