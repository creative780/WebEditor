/**
 * DPI calculation utilities for print quality assessment
 */

export interface DPIInfo {
  widthDPI: number;
  heightDPI: number;
  averageDPI: number;
  isPrintQuality: boolean;
  quality: 'low' | 'medium' | 'high' | 'excellent';
}

export interface ImageMetadata {
  width: number;
  height: number;
  originalDPI?: number;
  filename?: string;
}

// DPI quality thresholds
export const DPI_THRESHOLDS = {
  LOW: 150,
  MEDIUM: 200,
  HIGH: 300,
  EXCELLENT: 600,
} as const;

/**
 * Calculate effective DPI for an image at given print dimensions
 */
export function calculateDPI(
  imageWidth: number,
  imageHeight: number,
  printWidthInches: number,
  printHeightInches: number
): DPIInfo {
  const widthDPI = imageWidth / printWidthInches;
  const heightDPI = imageHeight / printHeightInches;
  const averageDPI = (widthDPI + heightDPI) / 2;

  const isPrintQuality = averageDPI >= DPI_THRESHOLDS.HIGH;

  let quality: DPIInfo['quality'];
  if (averageDPI >= DPI_THRESHOLDS.EXCELLENT) {
    quality = 'excellent';
  } else if (averageDPI >= DPI_THRESHOLDS.HIGH) {
    quality = 'high';
  } else if (averageDPI >= DPI_THRESHOLDS.MEDIUM) {
    quality = 'medium';
  } else {
    quality = 'low';
  }

  return {
    widthDPI: Math.round(widthDPI),
    heightDPI: Math.round(heightDPI),
    averageDPI: Math.round(averageDPI),
    isPrintQuality,
    quality,
  };
}

/**
 * Calculate maximum print size for an image at target DPI
 */
export function calculateMaxPrintSize(
  imageWidth: number,
  imageHeight: number,
  targetDPI: number = DPI_THRESHOLDS.HIGH
): { maxWidthInches: number; maxHeightInches: number } {
  return {
    maxWidthInches: imageWidth / targetDPI,
    maxHeightInches: imageHeight / targetDPI,
  };
}

/**
 * Calculate required image dimensions for print size at target DPI
 */
export function calculateRequiredImageSize(
  printWidthInches: number,
  printHeightInches: number,
  targetDPI: number = DPI_THRESHOLDS.HIGH
): { requiredWidth: number; requiredHeight: number } {
  return {
    requiredWidth: Math.round(printWidthInches * targetDPI),
    requiredHeight: Math.round(printHeightInches * targetDPI),
  };
}

/**
 * Get DPI quality color for UI display
 */
export function getDPIQualityColor(quality: DPIInfo['quality']): string {
  switch (quality) {
    case 'excellent':
      return '#10b981'; // green
    case 'high':
      return '#3b82f6'; // blue
    case 'medium':
      return '#f59e0b'; // yellow
    case 'low':
      return '#ef4444'; // red
    default:
      return '#6b7280'; // gray
  }
}

/**
 * Get DPI quality message for UI display
 */
export function getDPIQualityMessage(quality: DPIInfo['quality']): string {
  switch (quality) {
    case 'excellent':
      return 'Excellent print quality';
    case 'high':
      return 'Good print quality';
    case 'medium':
      return 'Acceptable print quality';
    case 'low':
      return 'Low print quality - may appear pixelated';
    default:
      return 'Unknown quality';
  }
}

/**
 * Check if image needs upscaling for print quality
 */
export function needsUpscaling(
  imageWidth: number,
  imageHeight: number,
  printWidthInches: number,
  printHeightInches: number,
  targetDPI: number = DPI_THRESHOLDS.HIGH
): boolean {
  const dpiInfo = calculateDPI(imageWidth, imageHeight, printWidthInches, printHeightInches);
  return dpiInfo.averageDPI < targetDPI;
}

/**
 * Calculate upscaling factor needed
 */
export function calculateUpscalingFactor(
  imageWidth: number,
  imageHeight: number,
  printWidthInches: number,
  printHeightInches: number,
  targetDPI: number = DPI_THRESHOLDS.HIGH
): number {
  const currentDPI = calculateDPI(imageWidth, imageHeight, printWidthInches, printHeightInches);
  return targetDPI / currentDPI.averageDPI;
}

/**
 * Get recommended print sizes for an image
 */
export function getRecommendedPrintSizes(
  imageWidth: number,
  imageHeight: number,
  targetDPI: number = DPI_THRESHOLDS.HIGH
): Array<{
  name: string;
  widthInches: number;
  heightInches: number;
  quality: DPIInfo['quality'];
}> {
  const aspectRatio = imageWidth / imageHeight;
  
  // Common print sizes
  const commonSizes = [
    { name: 'Business Card', width: 3.5, height: 2 },
    { name: 'Postcard', width: 4, height: 6 },
    { name: 'Half Sheet', width: 5.5, height: 8.5 },
    { name: 'Letter', width: 8.5, height: 11 },
    { name: 'A4', width: 8.27, height: 11.69 },
    { name: 'Square 4x4', width: 4, height: 4 },
    { name: 'Square 6x6', width: 6, height: 6 },
    { name: 'Square 8x8', width: 8, height: 8 },
  ];

  return commonSizes
    .map(size => {
      // Calculate height based on aspect ratio
      const calculatedHeight = size.width / aspectRatio;
      const heightDiff = Math.abs(calculatedHeight - size.height);
      
      // Use the size if it's close to the aspect ratio (within 10%)
      if (heightDiff / size.height < 0.1) {
        const dpiInfo = calculateDPI(imageWidth, imageHeight, size.width, calculatedHeight);
        return {
          name: size.name,
          widthInches: size.width,
          heightInches: calculatedHeight,
          quality: dpiInfo.quality,
        };
      }
      
      return null;
    })
    .filter(Boolean) as Array<{
      name: string;
      widthInches: number;
      heightInches: number;
      quality: DPIInfo['quality'];
    }>;
}

/**
 * Validate image for print use
 */
export function validateImageForPrint(
  image: ImageMetadata,
  printWidthInches: number,
  printHeightInches: number,
  targetDPI: number = DPI_THRESHOLDS.HIGH
): {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  dpiInfo: DPIInfo;
} {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  const dpiInfo = calculateDPI(
    image.width,
    image.height,
    printWidthInches,
    printHeightInches
  );

  // Check DPI quality
  if (dpiInfo.averageDPI < DPI_THRESHOLDS.LOW) {
    errors.push('Image resolution is too low for print quality');
  } else if (dpiInfo.averageDPI < DPI_THRESHOLDS.HIGH) {
    warnings.push('Image resolution may result in pixelated print');
  }

  // Check aspect ratio
  const imageAspectRatio = image.width / image.height;
  const printAspectRatio = printWidthInches / printHeightInches;
  const aspectRatioDiff = Math.abs(imageAspectRatio - printAspectRatio);
  
  if (aspectRatioDiff > 0.1) {
    warnings.push('Image aspect ratio does not match print dimensions');
  }

  // Check minimum dimensions
  if (image.width < 100 || image.height < 100) {
    errors.push('Image dimensions are too small');
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
    dpiInfo,
  };
}

