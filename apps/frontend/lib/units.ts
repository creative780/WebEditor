/**
 * Unit conversion utilities for print design
 * Handles px ↔ mm ↔ in conversions with proper DPI calculations
 */

export type Unit = 'px' | 'mm' | 'cm' | 'in' | 'ft';

export interface UnitValue {
  value: number;
  unit: Unit;
}

// Standard DPI values
export const DPI = {
  SCREEN: 96,
  PRINT: 300,
  HIGH_RES: 600,
} as const;

// Conversion factors (base unit: px at 96 DPI)
export const CONVERSION_FACTORS = {
  px: 1,
  mm: 96 / 25.4, // 96 DPI / 25.4 mm per inch
  in: 96, // 96 DPI
} as const;

/**
 * Convert a value from one unit to another
 */
export function convertUnit(
  value: number,
  fromUnit: Unit,
  toUnit: Unit,
  dpi: number = DPI.SCREEN
): number {
  if (fromUnit === toUnit) return value;

  // Convert to pixels first
  const pixels = value * CONVERSION_FACTORS[fromUnit] * (dpi / DPI.SCREEN);
  
  // Convert from pixels to target unit
  return pixels / CONVERSION_FACTORS[toUnit] / (dpi / DPI.SCREEN);
}

/**
 * Parse a string value with unit (e.g., "3mm", "0.125in", "24px")
 */
export function parseUnitValue(input: string): UnitValue | null {
  const match = input.trim().match(/^([+-]?\d*\.?\d+)\s*(px|mm|in)$/i);
  if (!match) return null;

  return {
    value: parseFloat(match[1]),
    unit: match[2].toLowerCase() as Unit,
  };
}

/**
 * Format a value with unit
 */
export function formatUnitValue(
  value: number,
  unit: Unit,
  precision: number = 2
): string {
  const rounded = Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);
  return `${rounded}${unit}`;
}

/**
 * Convert a value to the most appropriate unit for display
 */
export function toDisplayUnit(
  value: number,
  fromUnit: Unit,
  targetUnit: Unit,
  dpi: number = DPI.SCREEN
): UnitValue {
  const converted = convertUnit(value, fromUnit, targetUnit, dpi);
  return {
    value: converted,
    unit: targetUnit,
  };
}

/**
 * Get the appropriate precision for a unit
 */
export function getUnitPrecision(unit: Unit): number {
  switch (unit) {
    case 'px':
      return 0;
    case 'mm':
      return 2;
    case 'in':
      return 3;
    default:
      return 2;
  }
}

/**
 * Round a value to the appropriate precision for its unit
 */
export function roundToUnitPrecision(value: number, unit: Unit): number {
  const precision = getUnitPrecision(unit);
  return Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);
}

/**
 * Calculate effective DPI for an image
 */
export function calculateEffectiveDPI(
  imageWidthPx: number,
  imageHeightPx: number,
  printWidthIn: number,
  printHeightIn: number
): { widthDPI: number; heightDPI: number; averageDPI: number } {
  const widthDPI = imageWidthPx / printWidthIn;
  const heightDPI = imageHeightPx / printHeightIn;
  const averageDPI = (widthDPI + heightDPI) / 2;

  return {
    widthDPI: Math.round(widthDPI),
    heightDPI: Math.round(heightDPI),
    averageDPI: Math.round(averageDPI),
  };
}

/**
 * Check if DPI is sufficient for print quality
 */
export function isPrintQualityDPI(dpi: number, threshold: number = DPI.PRINT): boolean {
  return dpi >= threshold;
}

/**
 * Convert document dimensions to pixels at print DPI
 */
export function documentToPixels(
  width: number,
  height: number,
  unit: Unit,
  dpi: number = DPI.PRINT
): { widthPx: number; heightPx: number } {
  return {
    widthPx: convertUnit(width, unit, 'px', dpi),
    heightPx: convertUnit(height, unit, 'px', dpi),
  };
}

/**
 * Convert pixels to document dimensions
 */
export function pixelsToDocument(
  widthPx: number,
  heightPx: number,
  unit: Unit,
  dpi: number = DPI.PRINT
): { width: number; height: number } {
  return {
    width: convertUnit(widthPx, 'px', unit, dpi),
    height: convertUnit(heightPx, 'px', unit, dpi),
  };
}

/**
 * Calculate bleed area in pixels
 */
export function calculateBleedPixels(
  bleedValue: number,
  bleedUnit: Unit,
  dpi: number = DPI.PRINT
): number {
  return convertUnit(bleedValue, bleedUnit, 'px', dpi);
}

/**
 * Common print dimensions in various units
 */
export const PRINT_SIZES = {
  // Business Cards
  BUSINESS_CARD: {
    name: 'Business Card',
    width: { value: 3.5, unit: 'in' as Unit },
    height: { value: 2, unit: 'in' as Unit },
    bleed: { value: 0.125, unit: 'in' as Unit },
  },
  // Standard Sizes
  LETTER: {
    name: 'Letter',
    width: { value: 8.5, unit: 'in' as Unit },
    height: { value: 11, unit: 'in' as Unit },
    bleed: { value: 0.125, unit: 'in' as Unit },
  },
  A4: {
    name: 'A4',
    width: { value: 210, unit: 'mm' as Unit },
    height: { value: 297, unit: 'mm' as Unit },
    bleed: { value: 3, unit: 'mm' as Unit },
  },
  // Flyers
  FLYER_HALF: {
    name: 'Half Sheet Flyer',
    width: { value: 5.5, unit: 'in' as Unit },
    height: { value: 8.5, unit: 'in' as Unit },
    bleed: { value: 0.125, unit: 'in' as Unit },
  },
  FLYER_FULL: {
    name: 'Full Sheet Flyer',
    width: { value: 8.5, unit: 'in' as Unit },
    height: { value: 11, unit: 'in' as Unit },
    bleed: { value: 0.125, unit: 'in' as Unit },
  },
} as const;
