/**
 * Path object drawing functions
 */

import { calculateSelectionPadding } from '../utils/hitDetection';
import { drawTransformHandles } from './drawTransformHandles';
import {
  getFillStyle,
  type GradientStop,
} from './drawShape';

export interface PathDrawingParams {
  hoveredHandle: string | null;
  isDraggingObject: boolean;
  documentDpi: number;
}

/**
 * Draw path object (for SVG paths)
 */
export function drawPathObject(
  ctx: CanvasRenderingContext2D,
  obj: any,
  width: number,
  height: number,
  isSelected: boolean,
  zoom: number,
  params: PathDrawingParams
): void {
  const { hoveredHandle, isDraggingObject, documentDpi } = params;

  // Set fill and stroke
  if (obj.fill?.type === 'gradient' && obj.fill.gradient) {
    const stops = (obj.fill.gradient.stops as GradientStop[]) ?? [];
    ctx.fillStyle =
      stops.length > 0
        ? getFillStyle(ctx, obj, width, height)
        : '#6F1414';
  } else {
    ctx.fillStyle = obj.fill?.color || '#6F1414';
  }
  ctx.strokeStyle = obj.stroke?.color || '#5A1010';
  ctx.lineWidth = obj.stroke?.width || 1;

  // Draw the SVG path if available
  if (obj.pathData) {
    try {
      const path2D = new Path2D(obj.pathData);
      ctx.save();
      ctx.scale(documentDpi, documentDpi);
      ctx.fill(path2D);
      ctx.stroke(path2D);
      ctx.restore();
    } catch (error) {
      // Fallback to rectangle
      ctx.fillRect(0, 0, width, height);
      ctx.strokeRect(0, 0, width, height);
    }
  } else {
    // No path data, draw rectangle
    ctx.fillRect(0, 0, width, height);
    ctx.strokeRect(0, 0, width, height);
  }

  // Draw selection border (hide during dragging)
  if (isSelected && !isDraggingObject) {
    // Enhanced professional padding with generous margin
    const { paddingX: focusPadding } = calculateSelectionPadding(obj, zoom);

    // Expand bounding box evenly around shape
    const selX = -focusPadding;
    const selY = -focusPadding;
    const selW = width + focusPadding * 2;
    const selH = height + focusPadding * 2;

    ctx.save();
    ctx.translate(selX, selY);

    // Enhanced professional border with subtle effects
    ctx.strokeStyle = 'rgba(0, 122, 255, 0.85)';
    ctx.lineWidth = 2; // Slightly thicker for better visibility
    ctx.setLineDash([]);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeRect(0, 0, selW, selH);

    // Handles placed symmetrically around border
    drawTransformHandles(ctx, width, height, zoom, hoveredHandle, {
      paddingX: focusPadding,
      paddingY: focusPadding,
    });

    ctx.restore();
  }
}

