/**
 * Ruler drawing functions
 */

import { convertToUnit, formatUnitValue } from '../utils/coordinateUtils';

export interface RulerDrawingParams {
  documentUnit: 'px' | 'mm' | 'in' | 'cm' | 'ft';
  documentDpi: number;
  defaultViewScale: number;
  zoom: number;
  cursorPosition: { x: number; y: number };
  showCursorIndicators: boolean;
  isTransforming: boolean;
  isDraggingObject: boolean;
  isPanning: boolean;
  canvasBackground: {
    type: string;
    color: string;
    opacity: number;
    gridSize: number;
  };
}

/**
 * Draw rulers with live cursor tracking
 */
export function drawRulers(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  artboardX: number,
  artboardY: number,
  pageWidth: number,
  pageHeight: number,
  workspaceWidth: number,
  workspaceHeight: number,
  RULER_SIZE: number,
  params: RulerDrawingParams
): void {
  const {
    documentUnit,
    documentDpi,
    defaultViewScale,
    zoom,
    cursorPosition,
    showCursorIndicators,
    isTransforming,
    isDraggingObject,
    isPanning,
    canvasBackground,
  } = params;

  // Calculate artboard center positions for ruler alignment
  const artboardCenterX = artboardX + pageWidth / 2;
  const artboardCenterY = artboardY + pageHeight / 2;

  // Canvas boundaries - respect left panel (80px), right panel (300px), and top bar (60px)
  const leftPanelWidth = 80;
  const rightPanelWidth = 300;
  const topBarHeight = 60;

  // Calculate available canvas area (excluding panels and top bar)
  const availableCanvasWidth = canvasWidth - leftPanelWidth - rightPanelWidth;
  const availableCanvasHeight = canvasHeight - topBarHeight;

  // Calculate ruler positions - attached to canvas edges within panel boundaries
  const topRulerY = 0; // At the extreme top of the canvas

  // Calculate vertical ruler position - at the extreme right edge of the canvas, avoiding corner overlap
  const verticalRulerX = canvasWidth - RULER_SIZE - 1; // Slightly offset to avoid corner overlap

  // Get current unit and DPI for accurate calculations
  const currentUnit = documentUnit;
  const currentDpi = documentDpi;

  // Calculate zoom factor for boundary lines and ruler scaling
  const effectiveZoom = Math.max(zoom * defaultViewScale, 0.0001);
  const unitsToScreenPx = (valueInUnits: number) =>
    convertToUnit(valueInUnits, currentUnit, 'px', currentDpi) * effectiveZoom;
  const pixelsToUnits = (valueInPixels: number) =>
    convertToUnit(valueInPixels / effectiveZoom, 'px', currentUnit, currentDpi);

  // Dynamic range calculation based on zoom level
  // At 100% zoom (effectiveZoom = 0.25), show 4 units
  // When zooming out (smaller effectiveZoom), show more units
  // When zooming in (larger effectiveZoom), show fewer units
  const baseRange = 4; // Base range at 25% effective zoom (100% zoom value)
  const calculatedRange = baseRange / (effectiveZoom / 0.25); // Scale relative to 25% effective zoom

  const artboardWidthUnits =
    convertToUnit(pageWidth, 'px', currentUnit, currentDpi) / 2;
  const artboardHeightUnits =
    convertToUnit(pageHeight, 'px', currentUnit, currentDpi) / 2;
  const workspaceWidthUnits =
    convertToUnit(workspaceWidth, 'px', currentUnit, currentDpi) / 2;
  const workspaceHeightUnits =
    convertToUnit(workspaceHeight, 'px', currentUnit, currentDpi) / 2;

  const horizontalRange = Math.max(
    1,
    Math.ceil(
      Math.max(calculatedRange, artboardWidthUnits, workspaceWidthUnits)
    )
  );
  const verticalRange = Math.max(
    1,
    Math.ceil(
      Math.max(calculatedRange, artboardHeightUnits, workspaceHeightUnits)
    )
  );

  // Fill entire available area for rulers
  const backgroundEndX = verticalRulerX;

  // Draw top ruler background (horizontal) - Professional modern styling
  ctx.fillStyle = '#f8f9fa'; // Clean white background
  ctx.fillRect(0, topRulerY, backgroundEndX, RULER_SIZE);

  // Add subtle border to top ruler for definition
  ctx.strokeStyle = '#e9ecef';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, topRulerY, backgroundEndX, RULER_SIZE);

  // Draw vertical ruler background (vertical) - Professional modern styling
  ctx.fillStyle = '#f8f9fa'; // Clean white background
  ctx.fillRect(verticalRulerX, 0, canvasWidth - verticalRulerX, canvasHeight);

  // Add subtle border to vertical ruler for definition
  ctx.strokeStyle = '#e9ecef';
  ctx.lineWidth = 1;
  ctx.strokeRect(
    verticalRulerX,
    0,
    canvasWidth - verticalRulerX,
    canvasHeight
  );

  // Draw subtle boundary lines where the canvas starts
  ctx.strokeStyle = '#dee2e6'; // Subtle light gray boundary color
  ctx.lineWidth = 1;
  ctx.setLineDash([]); // Solid line

  // Left boundary line (vertical) - where canvas starts (aligned with zoom-adjusted range)
  const horizontalRangePx = unitsToScreenPx(horizontalRange);

  ctx.beginPath();
  ctx.moveTo(artboardCenterX - horizontalRangePx, 0);
  ctx.lineTo(artboardCenterX - horizontalRangePx, canvasHeight);
  ctx.stroke();

  // Bottom boundary line (horizontal) - where canvas starts (aligned with zoom-adjusted range)
  const verticalRangePx = unitsToScreenPx(verticalRange);

  ctx.beginPath();
  ctx.moveTo(0, artboardCenterY - verticalRangePx);
  ctx.lineTo(canvasWidth, artboardCenterY - verticalRangePx);
  ctx.stroke();

  // Calculate tick intervals based on current unit and zoom level
  let baseInterval: number, unitLabel: string;

  switch (currentUnit) {
    case 'in':
      baseInterval = 1; // 1 inch base interval
      unitLabel = '"';
      break;
    case 'cm':
      baseInterval = 1; // 1 cm base interval
      unitLabel = 'cm';
      break;
    case 'mm':
      baseInterval = 10; // 10mm base interval
      unitLabel = 'mm';
      break;
    case 'ft':
      baseInterval = 1; // 1 foot base interval
      unitLabel = "'";
      break;
    default:
      baseInterval = 100; // 100px base interval
      unitLabel = 'px';
  }

  // Dynamic interval adjustment based on zoom and range
  // Calculate the optimal interval based on the current range and zoom level
  let majorInterval: number;

  if (effectiveZoom <= 0.125) {
    // Very zoomed out (25% or less of default): show smaller intervals for more detail
    if (baseInterval === 1) {
      majorInterval = 1; // Keep whole numbers for units like in, cm, ft
    } else {
      majorInterval = Math.max(1, Math.floor(baseInterval / 4));
    }
  } else if (effectiveZoom <= 0.2) {
    // Moderately zoomed out (40% of default): moderate intervals
    if (baseInterval === 1) {
      majorInterval = 1;
    } else {
      majorInterval = Math.max(1, Math.floor(baseInterval / 2));
    }
  } else if (effectiveZoom >= 0.5) {
    // Zoomed in (200% or more): show larger intervals to avoid clutter
    majorInterval =
      baseInterval * Math.min(4, Math.ceil(effectiveZoom / 0.25));
  } else {
    // Normal zoom: use base interval
    majorInterval = baseInterval;
  }

  // Draw horizontal ruler ticks (top ruler) - Professional ruler with subdivisions
  const rulerStartX = artboardCenterX - horizontalRangePx;
  const rulerEndX = artboardCenterX + horizontalRangePx;

  // Draw major ticks (whole numbers) with labels
  for (
    let value = -horizontalRange;
    value <= horizontalRange;
    value += majorInterval
  ) {
    const x = artboardCenterX + unitsToScreenPx(value);
    if (x >= 0 && x <= canvasWidth) {
      const majorTickHeight = 10; // Major tick extends full height

      // Professional major tick styling
      ctx.strokeStyle = '#495057';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, topRulerY + RULER_SIZE - majorTickHeight);
      ctx.lineTo(x, topRulerY + RULER_SIZE);
      ctx.stroke();

      // Major tick label (whole numbers only) - Enhanced clarity
      ctx.fillStyle = '#212529';
      ctx.font = '500 12px Inter, system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${value}${unitLabel}`, x, topRulerY + RULER_SIZE / 2 + 4);
    }
  }

  // Draw minor subdivisions (quarter ticks) for professional look
  const minorInterval = majorInterval / 4; // Quarter subdivisions
  const minorTickRange = horizontalRange; // Allow infinite minor tick scaling
  for (
    let value = -minorTickRange;
    value <= minorTickRange;
    value += minorInterval
  ) {
    const x = artboardCenterX + unitsToScreenPx(value);
    if (x >= 0 && x <= canvasWidth) {
      // Skip major ticks (already drawn)
      if (value % majorInterval === 0) continue;

      const minorTickHeight = 6; // Smaller minor ticks

      // Professional minor tick styling (lighter color)
      ctx.strokeStyle = '#adb5bd'; // Lighter gray for minor ticks
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, topRulerY + RULER_SIZE - minorTickHeight);
      ctx.lineTo(x, topRulerY + RULER_SIZE);
      ctx.stroke();
    }
  }

  // Draw vertical ruler ticks - Professional ruler with subdivisions

  // Draw major ticks (whole numbers) with labels
  for (let value = -verticalRange; value <= verticalRange; value += majorInterval) {
    const y = artboardCenterY + unitsToScreenPx(value);
    if (y >= topRulerY + RULER_SIZE && y <= canvasHeight) {
      const majorTickHeight = 10; // Major tick extends full width

      // Professional major tick styling
      ctx.strokeStyle = '#495057';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(verticalRulerX, y);
      ctx.lineTo(verticalRulerX + majorTickHeight, y);
      ctx.stroke();

      // Major tick label (whole numbers only) - Enhanced clarity
      ctx.fillStyle = '#212529';
      ctx.font = '500 12px Inter, system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.save();
      ctx.translate(verticalRulerX + RULER_SIZE / 2, y);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(`${value}${unitLabel}`, 0, 0);
      ctx.restore();
    }
  }

  // Draw minor subdivisions (quarter ticks) for professional vertical ruler
  const verticalMinorInterval = majorInterval / 4; // Quarter subdivisions
  const verticalMinorTickRange = verticalRange; // Allow infinite minor tick scaling
  for (
    let value = -verticalMinorTickRange;
    value <= verticalMinorTickRange;
    value += verticalMinorInterval
  ) {
    const y = artboardCenterY + unitsToScreenPx(value);
    if (y >= topRulerY + RULER_SIZE && y <= canvasHeight) {
      // Skip major ticks (already drawn)
      if (value % majorInterval === 0) continue;

      const minorTickHeight = 6; // Smaller minor ticks

      // Professional minor tick styling (lighter color)
      ctx.strokeStyle = '#adb5bd'; // Lighter gray for minor ticks
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(verticalRulerX, y);
      ctx.lineTo(verticalRulerX + minorTickHeight, y);
      ctx.stroke();
    }
  }

  // Draw live cursor indicators (RED RECTANGLES) - 100% accurate positioning
  if (
    showCursorIndicators &&
    cursorPosition.x > RULER_SIZE &&
    cursorPosition.y > RULER_SIZE &&
    cursorPosition.x < canvasWidth - RULER_SIZE &&
    cursorPosition.y < canvasHeight - RULER_SIZE
  ) {
    // Horizontal cursor indicator (top ruler) - Rectangle pointing to ruler line
    ctx.fillStyle = '#DC2626'; // Red color
    ctx.fillRect(cursorPosition.x - 2, topRulerY + RULER_SIZE - 8, 4, 8); // Rectangle pointing to ruler line
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.strokeRect(cursorPosition.x - 2, topRulerY + RULER_SIZE - 8, 4, 8);

    // Vertical cursor indicator (right ruler) - Match tick direction
    ctx.fillStyle = '#DC2626'; // Same red color as top ruler
    ctx.fillRect(verticalRulerX, cursorPosition.y - 2, 8, 4); // Match tick direction: from left edge
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.strokeRect(verticalRulerX, cursorPosition.y - 2, 8, 4);

    // Show cursor position values - 100% accurate calculations with zoom and pan
    // Calculate cursor position relative to artboard center, accounting for zoom
    const cursorRelativeX = cursorPosition.x - artboardCenterX;
    const cursorRelativeY = cursorPosition.y - artboardCenterY;
    const cursorValueX = pixelsToUnits(cursorRelativeX);
    const cursorValueY = pixelsToUnits(cursorRelativeY);

    // Display cursor position on top ruler - Enhanced visibility
    ctx.fillStyle = '#DC2626'; // Red color for pointer text
    ctx.font = '600 11px Inter, system-ui, -apple-system, sans-serif'; // Improved font weight and size
    ctx.textAlign = 'center';
    ctx.fillText(
      `${formatUnitValue(cursorValueX, currentUnit)}${unitLabel}`,
      cursorPosition.x,
      topRulerY + RULER_SIZE / 2 + 3
    );

    // Display cursor position on vertical ruler - Exact copy of top ruler rotated 90 degrees
    ctx.save();
    ctx.translate(verticalRulerX + RULER_SIZE / 2, cursorPosition.y);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#DC2626'; // Same red color as top ruler
    ctx.font = '600 11px Inter, system-ui, -apple-system, sans-serif'; // Same improved font as top ruler
    ctx.textAlign = 'center';
    ctx.fillText(
      `${formatUnitValue(cursorValueY, currentUnit)}${unitLabel}`,
      0,
      0
    );
    ctx.restore();
  }
}

