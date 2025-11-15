/**
 * Mouse event utility functions for coordinate conversion
 */

/**
 * Convert mouse event coordinates to artboard coordinates
 */
export function convertMouseToArtboard(
  mouseX: number,
  mouseY: number,
  canvasRect: DOMRect,
  canvasWidth: number,
  canvasHeight: number,
  panX: number,
  panY: number,
  zoom: number,
  defaultViewScale: number,
  documentDpi: number
): {
  artboardMouseX: number;
  artboardMouseY: number;
  documentX: number;
  documentY: number;
  effectiveZoom: number;
} {
  const ARTBOARD_WIDTH = 1800; // 6 * 300
  const ARTBOARD_HEIGHT = 1200; // 4 * 300

  // Calculate artboard position EXACTLY as renderCanvas does
  const canvasCenterX = canvasWidth / 2;
  const canvasCenterY = canvasHeight / 2;
  const artboardOffsetX = canvasCenterX - ARTBOARD_WIDTH / 2;
  const artboardOffsetY = canvasCenterY - ARTBOARD_HEIGHT / 2;
  const artboardX = artboardOffsetX + panX;
  const artboardY = artboardOffsetY + panY;

  // Artboard center position (where zoom transform is centered)
  const artboardCenterX = artboardX + ARTBOARD_WIDTH / 2;
  const artboardCenterY = artboardY + ARTBOARD_HEIGHT / 2;

  // Mouse position in canvas coordinates
  const mouseCanvasX = mouseX - canvasRect.left;
  const mouseCanvasY = mouseY - canvasRect.top;

  // Calculate effective zoom
  const effectiveZoom = zoom * defaultViewScale;

  // Reverse the center-based zoom transform used in rendering:
  // Rendering: translate(center) -> scale(zoom) -> translate(-center)
  // Reversing: translate(center) -> scale(1/zoom) -> translate(-center)
  
  // Step 1: Get mouse position relative to artboard center (in screen pixels)
  const relativeX = mouseCanvasX - artboardCenterX;
  const relativeY = mouseCanvasY - artboardCenterY;

  // Step 2: Reverse the scale (divide by zoom) to get position in artboard space
  const scaledX = relativeX / effectiveZoom;
  const scaledY = relativeY / effectiveZoom;

  // Step 3: Add back the center offset to get position in artboard coordinate space (pixels)
  // Artboard origin (0,0) is at top-left of artboard
  const artboardMouseX = scaledX + ARTBOARD_WIDTH / 2;
  const artboardMouseY = scaledY + ARTBOARD_HEIGHT / 2;

  // Convert to document units (inches) for object position comparison
  // Objects store position in inches, so convert artboard pixels to inches
  const documentX = artboardMouseX / documentDpi;
  const documentY = artboardMouseY / documentDpi;

  return {
    artboardMouseX, // In pixels, artboard coordinate space
    artboardMouseY, // In pixels, artboard coordinate space
    documentX,      // In inches, document coordinate space
    documentY,      // In inches, document coordinate space
    effectiveZoom,
  };
}

/**
 * Check if point is within artboard bounds
 */
export function isPointInArtboard(
  artboardMouseX: number,
  artboardMouseY: number
): boolean {
  const ARTBOARD_WIDTH = 1800;
  const ARTBOARD_HEIGHT = 1200;
  return (
    artboardMouseX >= 0 &&
    artboardMouseX <= ARTBOARD_WIDTH &&
    artboardMouseY >= 0 &&
    artboardMouseY <= ARTBOARD_HEIGHT
  );
}

