/**
 * Coordinate conversion utilities
 * Converts between screen coordinates, artboard coordinates, and document units
 */

export function convertToPixels(value: number, unit: string, dpi: number): number {
  switch (unit) {
    case 'in':
      return value * dpi;
    case 'mm':
      return (value / 25.4) * dpi;
    case 'px':
    default:
      return value;
  }
}

export function convertToUnit(
  pixels: number,
  fromUnit: string,
  toUnit: string,
  dpi: number
): number {
  // Convert to base pixels first
  let basePixels = pixels;
  switch (fromUnit) {
    case 'in':
      basePixels = pixels * dpi;
      break;
    case 'cm':
      basePixels = pixels * (dpi / 2.54);
      break;
    case 'mm':
      basePixels = pixels * (dpi / 25.4);
      break;
    case 'ft':
      basePixels = pixels * (dpi * 12);
      break;
    case 'px':
      basePixels = pixels;
      break;
  }

  // Convert to target unit
  switch (toUnit) {
    case 'in':
      return basePixels / dpi;
    case 'cm':
      return basePixels / (dpi / 2.54);
    case 'mm':
      return basePixels / (dpi / 25.4);
    case 'ft':
      return basePixels / (dpi * 12);
    case 'px':
      return basePixels;
    default:
      return basePixels;
  }
}

export function formatUnitValue(value: number, unit: string): number {
  // Always show whole numbers for clean cursor position display
  return Math.round(value);
}

/**
 * Convert mouse coordinates to artboard coordinates
 */
export function screenToArtboard(
  mouseX: number,
  mouseY: number,
  canvasRect: DOMRect,
  canvasWidth: number,
  canvasHeight: number,
  panX: number,
  panY: number,
  zoom: number,
  defaultViewScale: number,
  artboardWidth: number,
  artboardHeight: number,
  dpi: number
): { x: number; y: number } {
  // Calculate artboard position
  const canvasCenterX = canvasWidth / 2;
  const canvasCenterY = canvasHeight / 2;
  const artboardOffsetX = canvasCenterX - artboardWidth / 2;
  const artboardOffsetY = canvasCenterY - artboardHeight / 2;
  const artboardX = artboardOffsetX + panX;
  const artboardY = artboardOffsetY + panY;

  // Artboard center position (where zoom transform is centered)
  const artboardCenterX = artboardX + artboardWidth / 2;
  const artboardCenterY = artboardY + artboardHeight / 2;

  // Mouse position in canvas coordinates
  const mouseCanvasX = mouseX - canvasRect.left;
  const mouseCanvasY = mouseY - canvasRect.top;

  // Reverse the renderCanvas center-based zoom transform
  const effectiveZoom = zoom * defaultViewScale;

  // Convert mouse to artboard coordinates (in pixels)
  const relativeX = mouseCanvasX - artboardCenterX;
  const relativeY = mouseCanvasY - artboardCenterY;

  // Reverse the scale (divide by zoom)
  const scaledX = relativeX / effectiveZoom;
  const scaledY = relativeY / effectiveZoom;

  // Add back the center offset to get position in artboard space (pixels)
  const artboardMouseX = scaledX + artboardWidth / 2;
  const artboardMouseY = scaledY + artboardHeight / 2;

  // Convert to document units (inches)
  const documentX = artboardMouseX / dpi;
  const documentY = artboardMouseY / dpi;

  return { x: documentX, y: documentY };
}

/**
 * Convert artboard coordinates to screen coordinates
 */
export function artboardToScreen(
  artboardX: number,
  artboardY: number,
  canvasWidth: number,
  canvasHeight: number,
  panX: number,
  panY: number,
  zoom: number,
  defaultViewScale: number,
  artboardWidth: number,
  artboardHeight: number,
  dpi: number
): { x: number; y: number } {
  const canvasCenterX = canvasWidth / 2;
  const canvasCenterY = canvasHeight / 2;
  const artboardOffsetX = canvasCenterX - artboardWidth / 2;
  const artboardOffsetY = canvasCenterY - artboardHeight / 2;
  const artboardPosX = artboardOffsetX + panX;
  const artboardPosY = artboardOffsetY + panY;

  const effectiveZoom = zoom * defaultViewScale;

  // Convert document units to pixels
  const pixelX = artboardX * dpi;
  const pixelY = artboardY * dpi;

  // Apply zoom transform
  const relativeX = pixelX - artboardWidth / 2;
  const relativeY = pixelY - artboardHeight / 2;
  const scaledX = relativeX * effectiveZoom;
  const scaledY = relativeY * effectiveZoom;

  // Convert to screen coordinates
  const screenX = artboardPosX + artboardWidth / 2 + scaledX;
  const screenY = artboardPosY + artboardHeight / 2 + scaledY;

  return { x: screenX, y: screenY };
}

