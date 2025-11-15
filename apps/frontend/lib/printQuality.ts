/**
 * Print Quality Validation System
 * Validates DPI, color gamut, bleed, and print specifications
 */

export interface PrintQualityReport {
  overall: 'excellent' | 'good' | 'warning' | 'error';
  score: number; // 0-100
  issues: PrintIssue[];
  recommendations: string[];
}

export interface PrintIssue {
  type: 'error' | 'warning' | 'info';
  category: 'dpi' | 'color' | 'bleed' | 'fonts' | 'images' | 'layout';
  message: string;
  severity: number; // 1-5
  fixable: boolean;
  suggestion?: string;
}

export interface DocumentSpecs {
  width: number;
  height: number;
  unit: 'px' | 'mm' | 'in';
  dpi: number;
  bleed: number;
  colorMode: 'CMYK' | 'RGB';
  colorProfile: string;
}

export interface ObjectQuality {
  id: string;
  type: 'text' | 'image' | 'shape' | 'path';
  dpi?: number;
  colorIssues: PrintIssue[];
  sizeIssues: PrintIssue[];
  fontIssues: PrintIssue[];
}

// DPI quality thresholds
export const DPI_THRESHOLDS = {
  EXCELLENT: 300,
  GOOD: 200,
  ACCEPTABLE: 150,
  POOR: 100,
  UNACCEPTABLE: 72
} as const;

// Color gamut thresholds
export const COLOR_THRESHOLDS = {
  MAX_TIC: 300, // Total Ink Coverage
  WARNING_TIC: 280,
  MAX_BLACK: 95,
  MIN_CONTRAST: 4.5 // WCAG AA standard
} as const;

// Bleed requirements
export const BLEED_REQUIREMENTS = {
  MIN_BLEED: 0.125, // inches
  RECOMMENDED_BLEED: 0.25, // inches
  MAX_BLEED: 0.5 // inches
} as const;

export class PrintQualityValidator {
  private static instance: PrintQualityValidator;

  static getInstance(): PrintQualityValidator {
    if (!PrintQualityValidator.instance) {
      PrintQualityValidator.instance = new PrintQualityValidator();
    }
    return PrintQualityValidator.instance;
  }

  // Validate entire document
  validateDocument(specs: DocumentSpecs, objects: any[]): PrintQualityReport {
    const issues: PrintIssue[] = [];
    const recommendations: string[] = [];

    // Validate document specs
    issues.push(...this.validateDocumentSpecs(specs));
    
    // Validate objects
    objects.forEach(obj => {
      issues.push(...this.validateObject(obj, specs));
    });

    // Generate recommendations
    recommendations.push(...this.generateRecommendations(issues, specs));

    // Calculate overall score
    const score = this.calculateScore(issues);
    const overall = this.getOverallRating(score);

    return {
      overall,
      score,
      issues,
      recommendations
    };
  }

  // Validate document specifications
  private validateDocumentSpecs(specs: DocumentSpecs): PrintIssue[] {
    const issues: PrintIssue[] = [];

    // Check DPI
    if (specs.dpi < DPI_THRESHOLDS.EXCELLENT) {
      issues.push({
        type: specs.dpi < DPI_THRESHOLDS.UNACCEPTABLE ? 'error' : 'warning',
        category: 'dpi',
        message: `Document DPI is ${specs.dpi}. Recommended: 300 DPI for print quality.`,
        severity: specs.dpi < DPI_THRESHOLDS.UNACCEPTABLE ? 5 : 3,
        fixable: true,
        suggestion: 'Increase document DPI to 300 for optimal print quality'
      });
    }

    // Check bleed
    if (specs.bleed < BLEED_REQUIREMENTS.MIN_BLEED) {
      issues.push({
        type: 'warning',
        category: 'bleed',
        message: `Bleed area is ${specs.bleed}in. Minimum recommended: ${BLEED_REQUIREMENTS.MIN_BLEED}in`,
        severity: 2,
        fixable: true,
        suggestion: 'Add bleed area to prevent white edges when trimming'
      });
    }

    // Check color mode
    if (specs.colorMode === 'RGB') {
      issues.push({
        type: 'warning',
        category: 'color',
        message: 'Document is in RGB mode. CMYK is recommended for print.',
        severity: 2,
        fixable: true,
        suggestion: 'Convert document to CMYK color mode for accurate print colors'
      });
    }

    return issues;
  }

  // Validate individual objects
  private validateObject(obj: any, specs: DocumentSpecs): PrintIssue[] {
    const issues: PrintIssue[] = [];

    switch (obj.type) {
      case 'image':
        issues.push(...this.validateImage(obj, specs));
        break;
      case 'text':
        issues.push(...this.validateText(obj, specs));
        break;
      case 'shape':
        issues.push(...this.validateShape(obj, specs));
        break;
    }

    return issues;
  }

  // Validate image objects
  private validateImage(obj: any, specs: DocumentSpecs): PrintIssue[] {
    const issues: PrintIssue[] = [];

    if (obj.originalDPI && obj.originalDPI < DPI_THRESHOLDS.EXCELLENT) {
      issues.push({
        type: obj.originalDPI < DPI_THRESHOLDS.UNACCEPTABLE ? 'error' : 'warning',
        category: 'images',
        message: `Image "${obj.filename || 'Untitled'}" has ${obj.originalDPI} DPI. Recommended: 300 DPI`,
        severity: obj.originalDPI < DPI_THRESHOLDS.UNACCEPTABLE ? 5 : 3,
        fixable: false,
        suggestion: 'Replace with higher resolution image or reduce image size'
      });
    }

    // Check image size vs display size
    if (obj.originalWidth && obj.originalHeight) {
      const scaleX = obj.width / obj.originalWidth;
      const scaleY = obj.height / obj.originalHeight;
      const effectiveDPI = specs.dpi * Math.max(scaleX, scaleY);

      if (effectiveDPI < DPI_THRESHOLDS.EXCELLENT) {
        issues.push({
          type: effectiveDPI < DPI_THRESHOLDS.UNACCEPTABLE ? 'error' : 'warning',
          category: 'images',
          message: `Image effective DPI is ${Math.round(effectiveDPI)}. Recommended: 300 DPI`,
          severity: effectiveDPI < DPI_THRESHOLDS.UNACCEPTABLE ? 5 : 3,
          fixable: true,
          suggestion: 'Reduce image size or use higher resolution source'
        });
      }
    }

    return issues;
  }

  // Validate text objects
  private validateText(obj: any, specs: DocumentSpecs): PrintIssue[] {
    const issues: PrintIssue[] = [];

    // Check font size
    const fontSizeInPoints = obj.fontSize * (specs.unit === 'px' ? 0.75 : 1);
    if (fontSizeInPoints < 8) {
      issues.push({
        type: 'warning',
        category: 'fonts',
        message: `Text size is ${fontSizeInPoints.toFixed(1)}pt. Minimum recommended: 8pt`,
        severity: 2,
        fixable: true,
        suggestion: 'Increase font size for better readability'
      });
    }

    // Check color contrast
    if (obj.color && obj.backgroundColor) {
      const contrast = this.calculateContrast(obj.color, obj.backgroundColor);
      if (contrast < COLOR_THRESHOLDS.MIN_CONTRAST) {
        issues.push({
          type: 'warning',
          category: 'fonts',
          message: `Low color contrast (${contrast.toFixed(1)}:1). Minimum: ${COLOR_THRESHOLDS.MIN_CONTRAST}:1`,
          severity: 3,
          fixable: true,
          suggestion: 'Increase color contrast for better readability'
        });
      }
    }

    return issues;
  }

  // Validate shape objects
  private validateShape(obj: any, specs: DocumentSpecs): PrintIssue[] {
    const issues: PrintIssue[] = [];

    // Check stroke width
    if (obj.stroke && obj.stroke.width < 0.25) {
      issues.push({
        type: 'warning',
        category: 'layout',
        message: `Stroke width is ${obj.stroke.width}pt. Minimum recommended: 0.25pt`,
        severity: 2,
        fixable: true,
        suggestion: 'Increase stroke width for better visibility'
      });
    }

    return issues;
  }

  // Calculate color contrast ratio
  private calculateContrast(color1: string, color2: string): number {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    const lum1 = this.getLuminance(rgb1);
    const lum2 = this.getLuminance(rgb2);
    
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  }

  // Get relative luminance
  private getLuminance(rgb: { r: number; g: number; b: number }): number {
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  // Convert hex to RGB
  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { r: 0, g: 0, b: 0 };
    
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    };
  }

  // Generate recommendations based on issues
  private generateRecommendations(issues: PrintIssue[], specs: DocumentSpecs): string[] {
    const recommendations: string[] = [];

    const errorCount = issues.filter(i => i.type === 'error').length;
    const warningCount = issues.filter(i => i.type === 'warning').length;

    if (errorCount > 0) {
      recommendations.push('Fix critical errors before printing to avoid quality issues');
    }

    if (warningCount > 0) {
      recommendations.push('Review warnings to optimize print quality');
    }

    if (specs.dpi < DPI_THRESHOLDS.EXCELLENT) {
      recommendations.push('Increase document DPI to 300 for professional print quality');
    }

    if (specs.bleed < BLEED_REQUIREMENTS.RECOMMENDED_BLEED) {
      recommendations.push('Add 0.25" bleed area for safe trimming');
    }

    if (specs.colorMode === 'RGB') {
      recommendations.push('Convert to CMYK color mode for accurate print colors');
    }

    return recommendations;
  }

  // Calculate quality score
  private calculateScore(issues: PrintIssue[]): number {
    let score = 100;
    
    issues.forEach(issue => {
      switch (issue.type) {
        case 'error':
          score -= issue.severity * 15;
          break;
        case 'warning':
          score -= issue.severity * 8;
          break;
        case 'info':
          score -= issue.severity * 3;
          break;
      }
    });

    return Math.max(0, Math.min(100, score));
  }

  // Get overall rating
  private getOverallRating(score: number): 'excellent' | 'good' | 'warning' | 'error' {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 50) return 'warning';
    return 'error';
  }

  // Quick validation for real-time feedback
  validateQuick(obj: any, specs: DocumentSpecs): PrintIssue[] {
    return this.validateObject(obj, specs);
  }

  // Get print-ready checklist
  getPrintChecklist(specs: DocumentSpecs): {
    item: string;
    status: 'pass' | 'warning' | 'fail';
    description: string;
  }[] {
    return [
      {
        item: 'Document DPI',
        status: specs.dpi >= DPI_THRESHOLDS.EXCELLENT ? 'pass' : 
                specs.dpi >= DPI_THRESHOLDS.GOOD ? 'warning' : 'fail',
        description: `Current: ${specs.dpi} DPI (Recommended: 300 DPI)`
      },
      {
        item: 'Color Mode',
        status: specs.colorMode === 'CMYK' ? 'pass' : 'warning',
        description: `Current: ${specs.colorMode} (Recommended: CMYK)`
      },
      {
        item: 'Bleed Area',
        status: specs.bleed >= BLEED_REQUIREMENTS.MIN_BLEED ? 'pass' : 'warning',
        description: `Current: ${specs.bleed}in (Minimum: ${BLEED_REQUIREMENTS.MIN_BLEED}in)`
      },
      {
        item: 'Color Profile',
        status: specs.colorProfile ? 'pass' : 'warning',
        description: specs.colorProfile || 'No color profile specified'
      }
    ];
  }
}

// Export singleton instance
export const printQualityValidator = PrintQualityValidator.getInstance();

