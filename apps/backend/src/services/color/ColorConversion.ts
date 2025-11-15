/**
 * Color space conversion utilities
 * Supports RGB, CMYK, LAB, Pantone color spaces
 */

export interface RGBColor {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

export interface CMYKColor {
  c: number; // 0-100
  m: number; // 0-100
  y: number; // 0-100
  k: number; // 0-100
}

export interface LABColor {
  l: number; // 0-100
  a: number; // -128 to 127
  b: number; // -128 to 127
}

export interface PantoneColor {
  code: string; // e.g., "PANTONE 186 C"
  rgb: RGBColor;
  cmyk: CMYKColor;
}

export class ColorConversion {
  /**
   * Convert HEX to RGB
   */
  hexToRgb(hex: string): RGBColor {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
      throw new Error('Invalid hex color');
    }
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    };
  }

  /**
   * Convert RGB to HEX
   */
  rgbToHex(rgb: RGBColor): string {
    const toHex = (n: number) => {
      const hex = Math.round(n).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  }

  /**
   * Convert RGB to CMYK
   * Using standard conversion formula
   */
  rgbToCmyk(rgb: RGBColor): CMYKColor {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const k = 1 - Math.max(r, g, b);

    if (k === 1) {
      return { c: 0, m: 0, y: 0, k: 100 };
    }

    const c = ((1 - r - k) / (1 - k)) * 100;
    const m = ((1 - g - k) / (1 - k)) * 100;
    const y = ((1 - b - k) / (1 - k)) * 100;

    return {
      c: Math.round(c),
      m: Math.round(m),
      y: Math.round(y),
      k: Math.round(k * 100),
    };
  }

  /**
   * Convert CMYK to RGB
   */
  cmykToRgb(cmyk: CMYKColor): RGBColor {
    const c = cmyk.c / 100;
    const m = cmyk.m / 100;
    const y = cmyk.y / 100;
    const k = cmyk.k / 100;

    const r = 255 * (1 - c) * (1 - k);
    const g = 255 * (1 - m) * (1 - k);
    const b = 255 * (1 - y) * (1 - k);

    return {
      r: Math.round(r),
      g: Math.round(g),
      b: Math.round(b),
    };
  }

  /**
   * Convert RGB to LAB
   * Using D65 illuminant
   */
  rgbToLab(rgb: RGBColor): LABColor {
    // First convert RGB to XYZ
    let r = rgb.r / 255;
    let g = rgb.g / 255;
    let b = rgb.b / 255;

    // Apply gamma correction
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    // Convert to XYZ (D65 illuminant)
    const x = (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) * 100;
    const y = (r * 0.2126729 + g * 0.7151522 + b * 0.072175) * 100;
    const z = (r * 0.0193339 + g * 0.119192 + b * 0.9503041) * 100;

    // Convert XYZ to LAB
    const xn = 95.047; // D65 reference white
    const yn = 100.0;
    const zn = 108.883;

    const fx = this.labF(x / xn);
    const fy = this.labF(y / yn);
    const fz = this.labF(z / zn);

    const l = 116 * fy - 16;
    const a = 500 * (fx - fy);
    const bVal = 200 * (fy - fz);

    return {
      l: Math.round(l * 100) / 100,
      a: Math.round(a * 100) / 100,
      b: Math.round(bVal * 100) / 100,
    };
  }

  private labF(t: number): number {
    const delta = 6 / 29;
    return t > delta ** 3 ? Math.pow(t, 1 / 3) : t / (3 * delta ** 2) + 4 / 29;
  }

  /**
   * Convert LAB to RGB
   */
  labToRgb(lab: LABColor): RGBColor {
    // Convert LAB to XYZ
    const fy = (lab.l + 16) / 116;
    const fx = lab.a / 500 + fy;
    const fz = fy - lab.b / 200;

    const xn = 95.047;
    const yn = 100.0;
    const zn = 108.883;

    const x = xn * this.labFInv(fx);
    const y = yn * this.labFInv(fy);
    const z = zn * this.labFInv(fz);

    // Convert XYZ to RGB
    let r = (x * 0.032406 + y * -0.015372 + z * -0.004986) / 100;
    let g = (x * -0.009689 + y * 0.018758 + z * 0.00041) / 100;
    let b = (x * 0.000557 + y * -0.002040 + z * 0.010570) / 100;

    // Apply gamma correction
    r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
    g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
    b = b > 0.0031308 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : 12.92 * b;

    return {
      r: Math.max(0, Math.min(255, Math.round(r * 255))),
      g: Math.max(0, Math.min(255, Math.round(g * 255))),
      b: Math.max(0, Math.min(255, Math.round(b * 255))),
    };
  }

  private labFInv(t: number): number {
    const delta = 6 / 29;
    return t > delta ? t ** 3 : 3 * delta ** 2 * (t - 4 / 29);
  }

  /**
   * Get closest Pantone color match
   */
  findClosestPantone(rgb: RGBColor): PantoneColor {
    // Simplified Pantone matching - in production, use a full Pantone library
    const pantoneColors: PantoneColor[] = [
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
      // Add more Pantone colors as needed
    ];

    // Find closest match using Euclidean distance
    let closestColor = pantoneColors[0];
    let minDistance = Infinity;

    for (const pantone of pantoneColors) {
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

    return closestColor;
  }

  /**
   * Convert color from any format to RGB
   */
  toRgb(color: string | RGBColor | CMYKColor): RGBColor {
    if (typeof color === 'string') {
      return this.hexToRgb(color);
    } else if ('r' in color) {
      return color;
    } else {
      return this.cmykToRgb(color);
    }
  }

  /**
   * Check if color is in RGB gamut
   */
  isInRgbGamut(rgb: RGBColor): boolean {
    return rgb.r >= 0 && rgb.r <= 255 &&
           rgb.g >= 0 && rgb.g <= 255 &&
           rgb.b >= 0 && rgb.b <= 255;
  }

  /**
   * Check if color is in CMYK gamut
   */
  isInCmykGamut(cmyk: CMYKColor): boolean {
    return cmyk.c >= 0 && cmyk.c <= 100 &&
           cmyk.m >= 0 && cmyk.m <= 100 &&
           cmyk.y >= 0 && cmyk.y <= 100 &&
           cmyk.k >= 0 && cmyk.k <= 100;
  }

  /**
   * Calculate color difference (Delta E)
   * Using CIE76 formula (simple LAB distance)
   */
  calculateDeltaE(color1: RGBColor, color2: RGBColor): number {
    const lab1 = this.rgbToLab(color1);
    const lab2 = this.rgbToLab(color2);

    return Math.sqrt(
      Math.pow(lab1.l - lab2.l, 2) +
      Math.pow(lab1.a - lab2.a, 2) +
      Math.pow(lab1.b - lab2.b, 2)
    );
  }
}

export default new ColorConversion();

