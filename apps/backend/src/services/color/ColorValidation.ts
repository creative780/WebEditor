/**
 * Color validation for print readiness
 */

import ColorConversion, { RGBColor, CMYKColor } from './ColorConversion';

export interface ColorValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  inkCoverage: number;
  isRichBlack: boolean;
  isPrintSafe: boolean;
}

export class ColorValidation {
  /**
   * Maximum ink coverage for print (Total Area Coverage)
   */
  private MAX_INK_COVERAGE = 300; // Standard limit is 300%

  /**
   * Minimum ink coverage for rich black
   */
  private MIN_RICH_BLACK_INK = 200;

  /**
   * Validate color for print
   */
  validateForPrint(color: string | RGBColor): ColorValidationResult {
    const rgb = typeof color === 'string' ? ColorConversion.hexToRgb(color) : color;
    const cmyk = ColorConversion.rgbToCmyk(rgb);

    const warnings: string[] = [];
    const errors: string[] = [];

    // Calculate total ink coverage
    const inkCoverage = cmyk.c + cmyk.m + cmyk.y + cmyk.k;

    // Check ink coverage
    if (inkCoverage > this.MAX_INK_COVERAGE) {
      errors.push(
        `Ink coverage (${inkCoverage}%) exceeds maximum (${this.MAX_INK_COVERAGE}%). May cause drying issues.`
      );
    } else if (inkCoverage > this.MAX_INK_COVERAGE * 0.9) {
      warnings.push(
        `Ink coverage (${inkCoverage}%) is high. Consider reducing for better print quality.`
      );
    }

    // Check for rich black
    const isRichBlack = this.isRichBlack(cmyk);
    if (isRichBlack) {
      warnings.push(
        'This is a rich black. Ensure proper registration for best results.'
      );
    }

    // Check if it's true black (K only)
    if (cmyk.c === 0 && cmyk.m === 0 && cmyk.y === 0 && cmyk.k === 100) {
      warnings.push(
        'Using 100% K only. Consider using rich black (C60 M40 Y40 K100) for deeper black.'
      );
    }

    // Check for very light colors that may not print well
    if (cmyk.c < 5 && cmyk.m < 5 && cmyk.y < 5 && cmyk.k < 5) {
      warnings.push(
        'Very light color. May appear almost white when printed.'
      );
    }

    // Check for out-of-gamut colors
    const rgbCheck = ColorConversion.cmykToRgb(cmyk);
    const deltaE = ColorConversion.calculateDeltaE(rgb, rgbCheck);
    
    if (deltaE > 10) {
      warnings.push(
        'Color may shift significantly when converted to CMYK. Preview in CMYK mode.'
      );
    }

    const isPrintSafe = errors.length === 0;

    return {
      isValid: isPrintSafe,
      warnings,
      errors,
      inkCoverage: Math.round(inkCoverage),
      isRichBlack,
      isPrintSafe,
    };
  }

  /**
   * Check if color is rich black
   * Rich black uses CMY colors in addition to K for deeper black
   */
  isRichBlack(cmyk: CMYKColor): boolean {
    const totalInk = cmyk.c + cmyk.m + cmyk.y + cmyk.k;
    return cmyk.k >= 80 && totalInk >= this.MIN_RICH_BLACK_INK;
  }

  /**
   * Calculate total ink coverage
   */
  calculateInkCoverage(cmyk: CMYKColor): number {
    return cmyk.c + cmyk.m + cmyk.y + cmyk.k;
  }

  /**
   * Validate color separation
   * Ensures proper CMYK separation for printing
   */
  validateSeparation(cmyk: CMYKColor): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Check for single plate colors (may cause banding)
    const activePlates = [
      cmyk.c > 0 ? 1 : 0,
      cmyk.m > 0 ? 1 : 0,
      cmyk.y > 0 ? 1 : 0,
      cmyk.k > 0 ? 1 : 0,
    ].reduce((a, b) => a + b, 0);

    if (activePlates === 1 && cmyk.k < 100) {
      issues.push(
        'Single plate color detected. May show banding. Consider adding second color.'
      );
    }

    // Check for registration issues (very small dots that may not align)
    const minPlateValue = 5; // Minimum recommended value
    if (
      (cmyk.c > 0 && cmyk.c < minPlateValue) ||
      (cmyk.m > 0 && cmyk.m < minPlateValue) ||
      (cmyk.y > 0 && cmyk.y < minPlateValue)
    ) {
      issues.push(
        'Very small color values detected. May cause registration issues.'
      );
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }

  /**
   * Suggest print-safe alternative for out-of-gamut colors
   */
  suggestPrintSafeColor(rgb: RGBColor): {
    original: RGBColor;
    suggested: RGBColor;
    cmyk: CMYKColor;
  } {
    const cmyk = ColorConversion.rgbToCmyk(rgb);
    const inkCoverage = this.calculateInkCoverage(cmyk);

    // If ink coverage is too high, reduce proportionally
    if (inkCoverage > this.MAX_INK_COVERAGE) {
      const scale = this.MAX_INK_COVERAGE / inkCoverage;
      const adjustedCmyk: CMYKColor = {
        c: Math.round(cmyk.c * scale),
        m: Math.round(cmyk.m * scale),
        y: Math.round(cmyk.y * scale),
        k: Math.round(cmyk.k * scale),
      };
      
      const suggested = ColorConversion.cmykToRgb(adjustedCmyk);
      
      return {
        original: rgb,
        suggested,
        cmyk: adjustedCmyk,
      };
    }

    // Color is already print-safe
    return {
      original: rgb,
      suggested: rgb,
      cmyk,
    };
  }

  /**
   * Batch validate colors
   */
  batchValidate(colors: string[]): ColorValidationResult[] {
    return colors.map(color => this.validateForPrint(color));
  }
}

export default new ColorValidation();

