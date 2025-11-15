/**
 * Pantone Color Management Service
 * Full Pantone color library with search and matching
 */

import ColorConversion, { RGBColor, CMYKColor, PantoneColor } from './ColorConversion';

export class PantoneService {
  private pantoneLibrary: PantoneColor[] = [
    // Pantone Reds
    { code: 'PANTONE 185 C', rgb: { r: 224, g: 0, b: 52 }, cmyk: { c: 0, m: 100, y: 79, k: 0 } },
    { code: 'PANTONE 186 C', rgb: { r: 200, g: 16, b: 46 }, cmyk: { c: 0, m: 100, y: 81, k: 4 } },
    { code: 'PANTONE 187 C', rgb: { r: 168, g: 12, b: 39 }, cmyk: { c: 0, m: 100, y: 81, k: 20 } },
    { code: 'PANTONE Red 032 C', rgb: { r: 239, g: 51, b: 64 }, cmyk: { c: 0, m: 91, y: 76, k: 0 } },
    
    // Pantone Blues
    { code: 'PANTONE Process Blue C', rgb: { r: 0, g: 133, b: 202 }, cmyk: { c: 100, m: 44, y: 0, k: 0 } },
    { code: 'PANTONE 286 C', rgb: { r: 0, g: 51, b: 160 }, cmyk: { c: 100, m: 86, y: 0, k: 0 } },
    { code: 'PANTONE 287 C', rgb: { r: 0, g: 57, b: 166 }, cmyk: { c: 100, m: 80, y: 0, k: 0 } },
    { code: 'PANTONE 2935 C', rgb: { r: 0, g: 123, b: 255 }, cmyk: { c: 100, m: 51, y: 0, k: 0 } },
    
    // Pantone Greens
    { code: 'PANTONE 354 C', rgb: { r: 0, g: 153, b: 68 }, cmyk: { c: 100, m: 0, y: 91, k: 0 } },
    { code: 'PANTONE 355 C', rgb: { r: 0, g: 143, b: 64 }, cmyk: { c: 100, m: 0, y: 91, k: 11 } },
    { code: 'PANTONE 356 C', rgb: { r: 0, g: 131, b: 62 }, cmyk: { c: 100, m: 0, y: 90, k: 21 } },
    { code: 'PANTONE Green C', rgb: { r: 0, g: 173, b: 131 }, cmyk: { c: 100, m: 0, y: 48, k: 0 } },
    
    // Pantone Yellows
    { code: 'PANTONE Yellow C', rgb: { r: 254, g: 221, b: 0 }, cmyk: { c: 0, m: 5, y: 100, k: 0 } },
    { code: 'PANTONE 109 C', rgb: { r: 255, g: 231, b: 0 }, cmyk: { c: 0, m: 0, y: 100, k: 0 } },
    { code: 'PANTONE 116 C', rgb: { r: 255, g: 209, b: 0 }, cmyk: { c: 0, m: 12, y: 100, k: 0 } },
    
    // Pantone Oranges
    { code: 'PANTONE Orange 021 C', rgb: { r: 254, g: 80, b: 0 }, cmyk: { c: 0, m: 75, y: 100, k: 0 } },
    { code: 'PANTONE 1585 C', rgb: { r: 255, g: 105, b: 0 }, cmyk: { c: 0, m: 63, y: 100, k: 0 } },
    
    // Pantone Purples
    { code: 'PANTONE Purple C', rgb: { r: 187, g: 41, b: 187 }, cmyk: { c: 31, m: 100, y: 0, k: 0 } },
    { code: 'PANTONE 2597 C', rgb: { r: 108, g: 30, b: 157 }, cmyk: { c: 85, m: 100, y: 0, k: 0 } },
    
    // Pantone Neutrals
    { code: 'PANTONE Black C', rgb: { r: 45, g: 41, b: 38 }, cmyk: { c: 0, m: 0, y: 0, k: 100 } },
    { code: 'PANTONE Cool Gray 11 C', rgb: { r: 83, g: 86, b: 90 }, cmyk: { c: 0, m: 0, y: 0, k: 80 } },
    { code: 'PANTONE Warm Gray 11 C', rgb: { r: 82, g: 76, b: 66 }, cmyk: { c: 0, m: 9, y: 16, k: 80 } },
  ];

  /**
   * Search Pantone colors by code or name
   */
  search(query: string): PantoneColor[] {
    const lowerQuery = query.toLowerCase();
    return this.pantoneLibrary.filter((p) =>
      p.code.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get Pantone by exact code
   */
  getByCode(code: string): PantoneColor | null {
    return this.pantoneLibrary.find((p) => p.code === code) || null;
  }

  /**
   * Find closest Pantone match for RGB color
   */
  findClosestMatch(rgb: RGBColor): {
    pantone: PantoneColor;
    distance: number;
    deltaE: number;
  } {
    let closestColor = this.pantoneLibrary[0];
    let minDistance = Infinity;

    for (const pantone of this.pantoneLibrary) {
      const distance = Math.sqrt(
        Math.pow(rgb.r - pantone.rgb.r, 2) +
        Math.pow(rgb.g - pantone.rgb.g, 2) +
        Math.pow(rgb.b - pantone.rgb.b, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestColor = pantone;
      }
    }

    // Calculate Delta E for accuracy
    const deltaE = ColorConversion.calculateDeltaE(rgb, closestColor.rgb);

    return {
      pantone: closestColor,
      distance: Math.round(minDistance),
      deltaE: Math.round(deltaE * 100) / 100,
    };
  }

  /**
   * Get all Pantone colors
   */
  getAll(): PantoneColor[] {
    return this.pantoneLibrary;
  }

  /**
   * Get Pantone colors by category
   */
  getByCategory(category: 'red' | 'blue' | 'green' | 'yellow' | 'orange' | 'purple' | 'neutral'): PantoneColor[] {
    const categoryMap: { [key: string]: string[] } = {
      red: ['185', '186', '187', 'Red'],
      blue: ['Blue', '286', '287', '2935'],
      green: ['354', '355', '356', 'Green'],
      yellow: ['Yellow', '109', '116'],
      orange: ['Orange', '1585'],
      purple: ['Purple', '2597'],
      neutral: ['Black', 'Gray'],
    };

    const keywords = categoryMap[category] || [];
    return this.pantoneLibrary.filter((p) =>
      keywords.some((keyword) => p.code.includes(keyword))
    );
  }
}

export default new PantoneService();

