/**
 * Shape object drawing functions
 */

import { generateHeartPath } from '../../../../lib/shapes';
import { calculateSelectionPadding } from '../utils/hitDetection';
import { drawTransformHandles } from './drawTransformHandles';

export type GradientStop = {
  position: number;
  color: string;
  opacity?: number;
};

function normalizeHex(hex: string): string {
  if (hex.startsWith('#')) {
    const trimmed = hex.slice(1);
    if (trimmed.length === 3) {
      return (
        '#' +
        trimmed
          .split('')
          .map((char) => char + char)
          .join('')
      );
    }
    return `#${trimmed}`;
  }
  return hex;
}

function hexToRgba(hex: string, opacity: number = 1): string {
  if (!hex) return `rgba(0, 0, 0, ${opacity})`;
  const normalized = normalizeHex(hex);
  const value = parseInt(normalized.slice(1), 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, opacity))})`;
}

function createLinearGradientFill(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  angle: number | undefined,
  stops: GradientStop[]
): CanvasGradient {
  const normalizedAngle = ((angle ?? 0) % 360 + 360) % 360;
  const radians = (normalizedAngle * Math.PI) / 180;
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const halfDiagonal = Math.sqrt(width * width + height * height) / 2;

  const directionX = Math.cos(radians);
  const directionY = Math.sin(radians);

  const startX = halfWidth - directionX * halfDiagonal;
  const startY = halfHeight - directionY * halfDiagonal;
  const endX = halfWidth + directionX * halfDiagonal;
  const endY = halfHeight + directionY * halfDiagonal;

  const gradient = ctx.createLinearGradient(startX, startY, endX, endY);

  const sortedStops = [...stops].sort((a, b) => a.position - b.position);
  sortedStops.forEach((stop) => {
    gradient.addColorStop(
      Math.max(0, Math.min(1, stop.position)),
      hexToRgba(stop.color, stop.opacity ?? 1)
    );
  });

  return gradient;
}

function createRadialGradientFill(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  stops: GradientStop[]
): CanvasGradient {
  const centerX = width / 2;
  const centerY = height / 2;
  // Use the maximum radius to cover the entire shape
  const maxRadius = Math.sqrt(width * width + height * height) / 2;

  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);

  const sortedStops = [...stops].sort((a, b) => a.position - b.position);
  sortedStops.forEach((stop) => {
    gradient.addColorStop(
      Math.max(0, Math.min(1, stop.position)),
      hexToRgba(stop.color, stop.opacity ?? 1)
    );
  });

  return gradient;
}

function createConicGradientFill(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  angle: number | undefined,
  stops: GradientStop[]
): CanvasGradient {
  // Canvas API doesn't have native conic gradient support
  // We'll use a workaround by creating a radial gradient that approximates conic
  // For a better implementation, we'd need to use a pattern or offscreen canvas
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.sqrt(width * width + height * height) / 2;

  // Create a radial gradient as fallback (conic gradients require more complex rendering)
  // For now, we'll use a radial gradient that respects the angle for the starting position
  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);

  const sortedStops = [...stops].sort((a, b) => a.position - b.position);
  sortedStops.forEach((stop) => {
    gradient.addColorStop(
      Math.max(0, Math.min(1, stop.position)),
      hexToRgba(stop.color, stop.opacity ?? 1)
    );
  });

  return gradient;
}

export function getFillStyle(
  ctx: CanvasRenderingContext2D,
  obj: any,
  width: number,
  height: number
): string | CanvasGradient {
  const fill = obj.fill;
  if (!fill) {
    return 'transparent';
  }

  if (fill.type === 'gradient' && fill.gradient) {
    const stops = (fill.gradient.stops as GradientStop[]) ?? [];
    if (stops.length > 0) {
      if (fill.gradient.type === 'linear' || !fill.gradient.type) {
        return createLinearGradientFill(
          ctx,
          width,
          height,
          fill.gradient.angle,
          stops
        );
      }

      if (fill.gradient.type === 'radial') {
        return createRadialGradientFill(
          ctx,
          width,
          height,
          stops
        );
      }

      if (fill.gradient.type === 'conic') {
        return createConicGradientFill(
          ctx,
          width,
          height,
          fill.gradient.angle,
          stops
        );
      }

      // Fallback to the first stop color for unknown gradient types
      const firstStop = stops[0];
      if (firstStop) {
        return hexToRgba(firstStop.color, firstStop.opacity ?? 1);
      }
    }
  }

  if (fill.color) {
    return fill.color;
  }

  return 'transparent';
}

export interface ShapeDrawingParams {
  hoveredHandle: string | null;
  isDraggingObject: boolean;
}

/**
 * Draw shape object with all shape types
 */
export function drawShapeObject(
  ctx: CanvasRenderingContext2D,
  obj: any,
  width: number,
  height: number,
  isSelected: boolean,
  zoom: number,
  params: ShapeDrawingParams
): void {
  const { hoveredHandle, isDraggingObject } = params;

  // Set fill style
  ctx.fillStyle = getFillStyle(ctx, obj, width, height);

  // Set stroke style
  if (obj.stroke && obj.stroke.width > 0) {
    ctx.strokeStyle = obj.stroke.color || '#000000';
    ctx.lineWidth = obj.stroke.width;
    ctx.setLineDash(
      obj.stroke.style === 'dashed'
        ? [5, 5]
        : obj.stroke.style === 'dotted'
          ? [2, 2]
          : []
    );
  } else {
    ctx.strokeStyle = 'transparent';
    ctx.lineWidth = 0;
  }

  // Draw based on shape type
  switch (obj.shape) {
    case 'rectangle':
      if (obj.borderRadius && obj.borderRadius > 0) {
        // Rounded rectangle
        const radius = Math.min(obj.borderRadius, width / 2, height / 2);
        ctx.beginPath();
        ctx.roundRect(0, 0, width, height, radius);
        ctx.fill();
        ctx.stroke();
      } else {
        // Regular rectangle
        ctx.fillRect(0, 0, width, height);
        ctx.strokeRect(0, 0, width, height);
      }
      break;

    case 'circle':
      // Draw circle (width and height should be equal for perfect circle)
      const radius = Math.min(width, height) / 2;
      const centerX = width / 2;
      const centerY = height / 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      break;

    case 'triangle':
      // Draw triangle
      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;

    case 'arrow':
      // Draw arrow
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width * 0.7, height / 2);
      ctx.lineTo(width * 0.7, height * 0.3);
      ctx.lineTo(width, height / 2);
      ctx.lineTo(width * 0.7, height * 0.7);
      ctx.lineTo(width * 0.7, height / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;

    case 'star':
      // Draw 5-pointed star
      const starCenterX = width / 2;
      const starCenterY = height / 2;
      const outerRadius = Math.max(width, height) / 2;
      const innerRadius = outerRadius * 0.4;
      const points = 5;

      ctx.beginPath();
      for (let i = 0; i < points * 2; i++) {
        const angle = (i * Math.PI) / points;
        const r = i % 2 === 0 ? outerRadius : innerRadius;
        const x = starCenterX + Math.cos(angle - Math.PI / 2) * r;
        const y = starCenterY + Math.sin(angle - Math.PI / 2) * r;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;

    case 'line':
      // Draw line
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      break;

    case 'polygon':
      // Draw hexagon (6-sided polygon)
      const hexCenterX = width / 2;
      const hexCenterY = height / 2;
      const hexRadius = Math.max(width, height) / 2;
      const hexSides = 6;

      ctx.beginPath();
      for (let i = 0; i < hexSides; i++) {
        const angle = (i * Math.PI * 2) / hexSides - Math.PI / 2;
        const x = hexCenterX + hexRadius * Math.cos(angle);
        const y = hexCenterY + hexRadius * Math.sin(angle);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;

    case 'heart':
      // Draw heart shape using the same path generation as the shapes panel
      const heartConfig = {
        width: width,
        height: height,
        centerX: width / 2,
        centerY: height / 2,
      };
      const heartPathData = generateHeartPath(heartConfig);
      try {
        const path2D = new Path2D(heartPathData);
        ctx.fill(path2D);
        ctx.stroke(path2D);
      } catch (error) {
        // Fallback to rectangle if path creation fails
        ctx.fillRect(0, 0, width, height);
        ctx.strokeRect(0, 0, width, height);
      }
      break;

    case 'gear':
      // Draw gear
      const gearCenterX = width / 2;
      const gearCenterY = height / 2;
      const gearOuterRadius = Math.max(width, height) / 2;
      const gearInnerRadius = gearOuterRadius * 0.7;
      const teeth = 8;

      ctx.beginPath();
      for (let i = 0; i < teeth; i++) {
        const angle1 = (i * Math.PI * 2) / teeth;
        const angle2 = ((i + 0.4) * Math.PI * 2) / teeth;
        const angle3 = ((i + 0.6) * Math.PI * 2) / teeth;
        const angle4 = ((i + 1) * Math.PI * 2) / teeth;

        // Inner arc
        const x1 = gearCenterX + gearInnerRadius * Math.cos(angle1);
        const y1 = gearCenterY + gearInnerRadius * Math.sin(angle1);

        // Tooth start
        const x2 = gearCenterX + gearOuterRadius * Math.cos(angle2);
        const y2 = gearCenterY + gearOuterRadius * Math.sin(angle2);

        // Tooth end
        const x3 = gearCenterX + gearOuterRadius * Math.cos(angle3);
        const y3 = gearCenterY + gearOuterRadius * Math.sin(angle3);

        // Next inner arc
        const x4 = gearCenterX + gearInnerRadius * Math.cos(angle4);
        const y4 = gearCenterY + gearInnerRadius * Math.sin(angle4);

        if (i === 0) {
          ctx.moveTo(x1, y1);
        }

        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.lineTo(x4, y4);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;

    case 'callout':
      // Draw callout bubble
      const calloutRadius = Math.min(width, height) * 0.1;
      const calloutTailWidth = width * 0.15;
      const calloutTailHeight = height * 0.3;
      const calloutTailX = width / 2;

      ctx.beginPath();
      // Top left corner
      ctx.moveTo(calloutRadius, 0);
      ctx.lineTo(width - calloutRadius, 0);
      // Top right corner
      ctx.quadraticCurveTo(width, 0, width, calloutRadius);
      ctx.lineTo(width, height - calloutRadius);
      // Bottom right corner
      ctx.quadraticCurveTo(width, height, width - calloutRadius, height);
      ctx.lineTo(calloutTailX + calloutTailWidth, height);
      // Tail
      ctx.lineTo(calloutTailX, height + calloutTailHeight);
      ctx.lineTo(calloutTailX - calloutTailWidth, height);
      // Bottom left corner
      ctx.lineTo(calloutRadius, height);
      ctx.quadraticCurveTo(0, height, 0, height - calloutRadius);
      ctx.lineTo(0, calloutRadius);
      // Top left corner
      ctx.quadraticCurveTo(0, 0, calloutRadius, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;

    default:
      // Default rectangle
      ctx.fillRect(0, 0, width, height);
      ctx.strokeRect(0, 0, width, height);
  }

  // Reset line dash
  ctx.setLineDash([]);

  // Draw selection border and transform handles (hide during dragging)
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

