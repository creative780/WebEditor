/**
 * AI Color Palette Generation
 * Generate harmonious color schemes
 */

export interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
  harmony: 'complementary' | 'analogous' | 'triadic' | 'tetradic' | 'monochromatic';
  mood: string;
}

export class ColorPaletteService {
  /**
   * Generate color palette from base color
   */
  generatePalette(baseColor: string, harmony: string = 'complementary', count: number = 5): ColorPalette {
    const hsl = this.hexToHSL(baseColor);
    const colors: string[] = [baseColor];

    switch (harmony) {
      case 'complementary':
        colors.push(this.hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l));
        colors.push(this.hslToHex(hsl.h, hsl.s * 0.7, hsl.l * 1.2));
        colors.push(this.hslToHex((hsl.h + 180) % 360, hsl.s * 0.7, hsl.l * 1.2));
        break;

      case 'analogous':
        colors.push(this.hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l));
        colors.push(this.hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l));
        colors.push(this.hslToHex(hsl.h, hsl.s * 0.6, hsl.l * 1.3));
        break;

      case 'triadic':
        colors.push(this.hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l));
        colors.push(this.hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l));
        colors.push(this.hslToHex(hsl.h, hsl.s * 0.5, hsl.l * 1.4));
        break;

      case 'monochromatic':
        colors.push(this.hslToHex(hsl.h, hsl.s, hsl.l * 0.7));
        colors.push(this.hslToHex(hsl.h, hsl.s, hsl.l * 1.3));
        colors.push(this.hslToHex(hsl.h, hsl.s * 0.5, hsl.l));
        break;

      default:
        // Complementary as default
        colors.push(this.hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l));
    }

    // Ensure we have the requested count
    while (colors.length < count) {
      const variation = this.hslToHex(
        (hsl.h + Math.random() * 60 - 30) % 360,
        hsl.s * (0.8 + Math.random() * 0.4),
        hsl.l * (0.8 + Math.random() * 0.4)
      );
      colors.push(variation);
    }

    return {
      id: `palette_${Date.now()}`,
      name: `${harmony.charAt(0).toUpperCase() + harmony.slice(1)} Palette`,
      colors: colors.slice(0, count),
      harmony: harmony as any,
      mood: this.determineMood(hsl)
    };
  }

  /**
   * Extract color palette from image (mock implementation)
   */
  async extractFromImage(imageUrl: string): Promise<ColorPalette> {
    // In production, this would analyze the image
    // For now, return a sample palette
    return {
      id: `extracted_${Date.now()}`,
      name: 'Extracted from Image',
      colors: ['#2c3e50', '#3498db', '#e74c3c', '#f39c12', '#95a5a6'],
      harmony: 'complementary',
      mood: 'professional'
    };
  }

  /**
   * Generate trending color palette
   */
  getTrendingPalette(industry: string): ColorPalette {
    const palettes: Record<string, ColorPalette> = {
      tech: {
        id: 'tech_trend',
        name: 'Tech Industry 2025',
        colors: ['#0f172a', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981'],
        harmony: 'triadic',
        mood: 'modern'
      },
      medical: {
        id: 'medical_trend',
        name: 'Healthcare 2025',
        colors: ['#1e40af', '#0891b2', '#10b981', '#f59e0b', '#dc2626'],
        harmony: 'analogous',
        mood: 'trustworthy'
      },
      restaurant: {
        id: 'food_trend',
        name: 'Restaurant 2025',
        colors: ['#7c2d12', '#ea580c', '#facc15', '#84cc16', '#059669'],
        harmony: 'analogous',
        mood: 'warm'
      }
    };

    return palettes[industry] || palettes.tech;
  }

  // Helper methods
  private hexToHSL(hex: string): { h: number; s: number; l: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { h: 0, s: 0, l: 0 };

    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return { h: h * 360, s, l };
  }

  private hslToHex(h: number, s: number, l: number): string {
    h = h / 360;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h * 12) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  private determineMood(hsl: { h: number; s: number; l: number }): string {
    if (hsl.l < 0.3) return 'dark';
    if (hsl.l > 0.7) return 'light';
    if (hsl.s < 0.3) return 'neutral';
    if (hsl.h < 60) return 'energetic';
    if (hsl.h < 180) return 'calm';
    if (hsl.h < 300) return 'creative';
    return 'warm';
  }
}

export const colorPaletteService = new ColorPaletteService();

