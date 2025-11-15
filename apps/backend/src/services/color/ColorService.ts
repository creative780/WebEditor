/**
 * Main Color Service
 * Provides color operations, conversions, and gradient processing
 */

import ColorConversion, { RGBColor, CMYKColor, LABColor, PantoneColor } from './ColorConversion';
import ColorValidation, { ColorValidationResult } from './ColorValidation';

export interface GradientStop {
  position: number; // 0-1
  color: string; // hex color
  opacity?: number;
}

export interface Gradient {
  type: 'linear' | 'radial' | 'conic';
  angle?: number; // For linear gradients (degrees)
  centerX?: number; // For radial/conic (0-1)
  centerY?: number;
  stops: GradientStop[];
}

export interface ColorHarmony {
  scheme: 'complementary' | 'analogous' | 'triadic' | 'tetradic' | 'monochromatic';
  colors: string[];
}

export class ColorService {
  /**
   * Convert color between formats
   */
  convert(
    color: string,
    from: 'rgb' | 'cmyk' | 'lab',
    to: 'rgb' | 'cmyk' | 'lab' | 'hex'
  ): any {
    let rgb: RGBColor;

    // Parse source color
    if (from === 'rgb') {
      rgb = ColorConversion.hexToRgb(color);
    } else {
      // For now, assume input is hex, convert to RGB first
      rgb = ColorConversion.hexToRgb(color);
    }

    // Convert to target format
    switch (to) {
      case 'rgb':
        return rgb;
      case 'cmyk':
        return ColorConversion.rgbToCmyk(rgb);
      case 'lab':
        return ColorConversion.rgbToLab(rgb);
      case 'hex':
        return ColorConversion.rgbToHex(rgb);
      default:
        return rgb;
    }
  }

  /**
   * Validate color for print
   */
  validate(color: string): ColorValidationResult {
    return ColorValidation.validateForPrint(color);
  }

  /**
   * Search Pantone colors
   */
  searchPantone(query: string): PantoneColor[] {
    // Simplified Pantone database
    const pantoneDatabase: PantoneColor[] = [
      {
        code: 'PANTONE 186 C',
        rgb: { r: 200, g: 16, b: 46 },
        cmyk: { c: 0, m: 100, y: 81, k: 4 },
      },
      {
        code: 'PANTONE 185 C',
        rgb: { r: 224, g: 0, b: 52 },
        cmyk: { c: 0, m: 100, y: 79, k: 0 },
      },
      {
        code: 'PANTONE Process Blue C',
        rgb: { r: 0, g: 133, b: 202 },
        cmyk: { c: 100, m: 44, y: 0, k: 0 },
      },
      {
        code: 'PANTONE 354 C',
        rgb: { r: 0, g: 153, b: 68 },
        cmyk: { c: 100, m: 0, y: 91, k: 0 },
      },
      {
        code: 'PANTONE Yellow C',
        rgb: { r: 254, g: 221, b: 0 },
        cmyk: { c: 0, m: 5, y: 100, k: 0 },
      },
    ];

    const lowerQuery = query.toLowerCase();
    return pantoneDatabase.filter(
      (p) => p.code.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Generate gradient with multiple stops
   */
  generateGradient(gradient: Gradient): string {
    const { type, angle = 0, centerX = 0.5, centerY = 0.5, stops } = gradient;

    // Sort stops by position
    const sortedStops = [...stops].sort((a, b) => a.position - b.position);

    // Generate CSS gradient string
    switch (type) {
      case 'linear':
        const stopStrings = sortedStops.map(
          (stop) => `${stop.color} ${stop.position * 100}%`
        );
        return `linear-gradient(${angle}deg, ${stopStrings.join(', ')})`;

      case 'radial':
        const radialStops = sortedStops.map(
          (stop) => `${stop.color} ${stop.position * 100}%`
        );
        return `radial-gradient(circle at ${centerX * 100}% ${centerY * 100}%, ${radialStops.join(', ')})`;

      case 'conic':
        const conicStops = sortedStops.map(
          (stop) => `${stop.color} ${stop.position * 360}deg`
        );
        return `conic-gradient(from ${angle}deg at ${centerX * 100}% ${centerY * 100}%, ${conicStops.join(', ')})`;

      default:
        return '';
    }
  }

  /**
   * Interpolate colors in a gradient
   */
  interpolateGradient(
    color1: string,
    color2: string,
    steps: number
  ): string[] {
    const rgb1 = ColorConversion.hexToRgb(color1);
    const rgb2 = ColorConversion.hexToRgb(color2);

    const colors: string[] = [];

    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * t);
      const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * t);
      const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * t);

      colors.push(ColorConversion.rgbToHex({ r, g, b }));
    }

    return colors;
  }

  /**
   * Generate color harmonies
   */
  generateHarmony(baseColor: string, scheme: ColorHarmony['scheme']): ColorHarmony {
    const rgb = ColorConversion.hexToRgb(baseColor);
    const colors: string[] = [baseColor];

    // Convert to HSL for easier harmony calculation
    const hsl = this.rgbToHsl(rgb);

    switch (scheme) {
      case 'complementary':
        // Opposite on color wheel (180 degrees)
        colors.push(this.hslToHex({ h: (hsl.h + 180) % 360, s: hsl.s, l: hsl.l }));
        break;

      case 'analogous':
        // Adjacent colors (30 degrees apart)
        colors.push(this.hslToHex({ h: (hsl.h + 30) % 360, s: hsl.s, l: hsl.l }));
        colors.push(this.hslToHex({ h: (hsl.h - 30 + 360) % 360, s: hsl.s, l: hsl.l }));
        break;

      case 'triadic':
        // Evenly spaced (120 degrees)
        colors.push(this.hslToHex({ h: (hsl.h + 120) % 360, s: hsl.s, l: hsl.l }));
        colors.push(this.hslToHex({ h: (hsl.h + 240) % 360, s: hsl.s, l: hsl.l }));
        break;

      case 'tetradic':
        // Rectangle (90, 180, 270 degrees)
        colors.push(this.hslToHex({ h: (hsl.h + 90) % 360, s: hsl.s, l: hsl.l }));
        colors.push(this.hslToHex({ h: (hsl.h + 180) % 360, s: hsl.s, l: hsl.l }));
        colors.push(this.hslToHex({ h: (hsl.h + 270) % 360, s: hsl.s, l: hsl.l }));
        break;

      case 'monochromatic':
        // Same hue, different lightness
        colors.push(this.hslToHex({ h: hsl.h, s: hsl.s, l: Math.min(100, hsl.l + 20) }));
        colors.push(this.hslToHex({ h: hsl.h, s: hsl.s, l: Math.max(0, hsl.l - 20) }));
        break;
    }

    return {
      scheme,
      colors,
    };
  }

  /**
   * Extract dominant colors from image
   * Simplified implementation - in production use proper image processing
   */
  async extractColorsFromImage(imageUrl: string, count: number = 5): Promise<string[]> {
    // Placeholder implementation
    // In production, use libraries like node-vibrant or sharp
    return [
      '#6F1414',
      '#3b82f6',
      '#10b981',
      '#f59e0b',
      '#8b5cf6',
    ].slice(0, count);
  }

  /**
   * Generate color palette
   */
  generatePalette(baseColor: string, count: number = 5): string[] {
    const rgb = ColorConversion.hexToRgb(baseColor);
    const hsl = this.rgbToHsl(rgb);
    const palette: string[] = [baseColor];

    // Generate variations
    for (let i = 1; i < count; i++) {
      const variation = {
        h: (hsl.h + (360 / count) * i) % 360,
        s: hsl.s,
        l: hsl.l,
      };
      palette.push(this.hslToHex(variation));
    }

    return palette;
  }

  /**
   * RGB to HSL conversion
   */
  private rgbToHsl(rgb: RGBColor): { h: number; s: number; l: number } {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;

    if (max === min) {
      return { h: 0, s: 0, l: l * 100 };
    }

    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    let h = 0;
    if (max === r) {
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    } else if (max === g) {
      h = ((b - r) / d + 2) / 6;
    } else {
      h = ((r - g) / d + 4) / 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }

  /**
   * HSL to RGB conversion
   */
  private hslToRgb(hsl: { h: number; s: number; l: number }): RGBColor {
    const h = hsl.h / 360;
    const s = hsl.s / 100;
    const l = hsl.l / 100;

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }

  /**
   * HSL to HEX conversion
   */
  private hslToHex(hsl: { h: number; s: number; l: number }): string {
    const rgb = this.hslToRgb(hsl);
    return ColorConversion.rgbToHex(rgb);
  }

  /**
   * Check color accessibility (contrast ratio)
   */
  checkAccessibility(
    foreground: string,
    background: string
  ): {
    ratio: number;
    aa: boolean;
    aaa: boolean;
  } {
    const fg = ColorConversion.hexToRgb(foreground);
    const bg = ColorConversion.hexToRgb(background);

    const l1 = this.relativeLuminance(fg);
    const l2 = this.relativeLuminance(bg);

    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

    return {
      ratio: Math.round(ratio * 100) / 100,
      aa: ratio >= 4.5, // WCAG AA
      aaa: ratio >= 7, // WCAG AAA
    };
  }

  /**
   * Calculate relative luminance
   */
  private relativeLuminance(rgb: RGBColor): number {
    const rsRGB = rgb.r / 255;
    const gsRGB = rgb.g / 255;
    const bsRGB = rgb.b / 255;

    const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Optimize gradient for export
   */
  optimizeGradient(gradient: Gradient): Gradient {
    // Remove duplicate stops
    const uniqueStops = gradient.stops.filter((stop, index, self) =>
      index === self.findIndex((s) => s.position === stop.position)
    );

    // Ensure at least 2 stops
    if (uniqueStops.length < 2) {
      return {
        ...gradient,
        stops: [
          { position: 0, color: uniqueStops[0]?.color || '#000000' },
          { position: 1, color: uniqueStops[0]?.color || '#ffffff' },
        ],
      };
    }

    // Sort by position
    uniqueStops.sort((a, b) => a.position - b.position);

    return {
      ...gradient,
      stops: uniqueStops,
    };
  }

  /**
   * Convert gradient to CSS string
   */
  gradientToCSS(gradient: Gradient): string {
    const optimized = this.optimizeGradient(gradient);
    const stopStrings = optimized.stops.map(
      (stop) => `${stop.color} ${stop.position * 100}%`
    );

    switch (gradient.type) {
      case 'linear':
        return `linear-gradient(${gradient.angle || 0}deg, ${stopStrings.join(', ')})`;
      case 'radial':
        return `radial-gradient(circle at ${(gradient.centerX || 0.5) * 100}% ${(gradient.centerY || 0.5) * 100}%, ${stopStrings.join(', ')})`;
      case 'conic':
        return `conic-gradient(from ${gradient.angle || 0}deg at ${(gradient.centerX || 0.5) * 100}% ${(gradient.centerY || 0.5) * 100}%, ${stopStrings.join(', ')})`;
      default:
        return '';
    }
  }

  /**
   * Create multi-stop gradient
   */
  createGradient(
    startColor: string,
    endColor: string,
    intermediateColors: string[] = [],
    type: 'linear' | 'radial' | 'conic' = 'linear'
  ): Gradient {
    const allColors = [startColor, ...intermediateColors, endColor];
    const stops: GradientStop[] = allColors.map((color, index) => ({
      position: index / (allColors.length - 1),
      color,
      opacity: 1,
    }));

    return {
      type,
      angle: 0,
      stops,
    };
  }
}

export default new ColorService();

