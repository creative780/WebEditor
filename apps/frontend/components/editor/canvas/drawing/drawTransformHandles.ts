/**
 * Transform handles drawing functions
 */

import {
  getHandleLineWidth,
  getHandleRadius,
  getHoverHandleRadius,
  getRotationHandleOffset,
  getRotationHandleRadius,
} from '../utils/handleMetrics';

export interface DrawTransformHandlesOptions {
  paddingX?: number;
  paddingY?: number;
}

/**
 * Draw transform handles (rotation + corner resize handles)
 */
export function drawTransformHandles(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  zoom: number,
  hoveredHandle: string | null = null,
  options: DrawTransformHandlesOptions = {}
): void {
  const paddingX = options.paddingX ?? 0;
  const paddingY = options.paddingY ?? 0;

  // Effective selection bounds after padding expansion
  const left = 0;
  const top = 0;
  const right = width + paddingX * 2;
  const bottom = height + paddingY * 2;
  const centerX = (left + right) / 2;
  const centerY = (top + bottom) / 2;

  const baseRadius = getHandleRadius(zoom);
  const hoverRadius = getHoverHandleRadius(zoom);
  const handleLineWidth = getHandleLineWidth(zoom);

  const strokeColor = '#4B5563';
  const strokeHoverColor = '#2563EB';
  const fillColor = '#FFFFFF';
  const fillHoverColor = '#2563EB';
  const shadowColor = 'rgba(148, 163, 184, 0.35)';
  const guideColor = '#94A3B8';

  const drawCircularHandle = (
    cx: number,
    cy: number,
    isHovered: boolean,
    opts: { radius?: number } = {}
  ) => {
    const radius = opts.radius ?? (isHovered ? hoverRadius : baseRadius);
    const localLineWidth = handleLineWidth * (isHovered ? 1.1 : 1);
    const shadowOffset = Math.max(1, Math.min(4, radius * 0.2));

    ctx.save();

    ctx.beginPath();
    ctx.fillStyle = shadowColor;
    ctx.arc(cx + shadowOffset, cy + shadowOffset, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = isHovered ? fillHoverColor : fillColor;
    ctx.strokeStyle = isHovered ? strokeHoverColor : strokeColor;
    ctx.lineWidth = localLineWidth;
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  };

  const cornerHandles = [
    { type: 'nw', cx: left, cy: top },
    { type: 'ne', cx: right, cy: top },
    { type: 'se', cx: right, cy: bottom },
    { type: 'sw', cx: left, cy: bottom },
  ] as const;

  cornerHandles.forEach(({ type, cx, cy }) => {
    drawCircularHandle(cx, cy, hoveredHandle === type);
  });

  const edgeHandles = [
    { type: 'n', cx: centerX, cy: top },
    { type: 'e', cx: right, cy: centerY },
    { type: 's', cx: centerX, cy: bottom },
    { type: 'w', cx: left, cy: centerY },
  ] as const;

  edgeHandles.forEach(({ type, cx, cy }) => {
    drawCircularHandle(cx, cy, hoveredHandle === type);
  });

  // Highlight active border edge when hovering between handles
  if (hoveredHandle && ['n', 's', 'e', 'w'].includes(hoveredHandle)) {
    ctx.save();
    ctx.strokeStyle = strokeHoverColor;
    ctx.lineWidth = Math.max(handleLineWidth * 1.8, 2.25);
    ctx.beginPath();
    switch (hoveredHandle) {
      case 'n':
        ctx.moveTo(left, top);
        ctx.lineTo(right, top);
        break;
      case 's':
        ctx.moveTo(left, bottom);
        ctx.lineTo(right, bottom);
        break;
      case 'e':
        ctx.moveTo(right, top);
        ctx.lineTo(right, bottom);
        break;
      case 'w':
        ctx.moveTo(left, top);
        ctx.lineTo(left, bottom);
        break;
    }
    ctx.stroke();
    ctx.restore();
  }

  // Draw rotation handle (outside the top edge)
  const rotationHovered = hoveredHandle === 'rotate';
  const rotationCenterX = centerX;
  const rotationOffset = getRotationHandleOffset(zoom);
  const rotationCenterY = top - rotationOffset;
  const rotationRadius = getRotationHandleRadius(zoom, rotationHovered);

  // Stem connecting top edge to rotation handle
  ctx.save();
  ctx.strokeStyle = rotationHovered ? strokeHoverColor : guideColor;
  ctx.lineWidth = Math.max(1, handleLineWidth * 0.9);
  ctx.beginPath();
  ctx.moveTo(centerX, top);
  ctx.lineTo(rotationCenterX, rotationCenterY + rotationRadius);
  ctx.stroke();
  ctx.restore();

  drawCircularHandle(rotationCenterX, rotationCenterY, rotationHovered, {
    radius: rotationRadius,
  });

  // Rotation icon (subtle curved arrow)
  ctx.save();
  ctx.strokeStyle = rotationHovered ? '#FFFFFF' : strokeColor;
  ctx.lineWidth = rotationHovered
    ? Math.max(2, handleLineWidth * 1.35)
    : Math.max(1.6, handleLineWidth * 1.05);
  ctx.lineCap = 'round';

  const arrowRadius = Math.max(2, rotationRadius * 0.6);
  ctx.beginPath();
  ctx.arc(rotationCenterX, rotationCenterY, arrowRadius, -Math.PI / 2, Math.PI / 3);
  ctx.stroke();

  const arrowEndX = rotationCenterX + arrowRadius * Math.cos(Math.PI / 3);
  const arrowEndY = rotationCenterY + arrowRadius * Math.sin(Math.PI / 3);
  const arrowWing = Math.max(2.5, rotationRadius * 0.35);

  ctx.beginPath();
  ctx.moveTo(arrowEndX, arrowEndY);
  ctx.lineTo(arrowEndX - arrowWing * 0.75, arrowEndY - arrowWing * 0.25);
  ctx.moveTo(arrowEndX, arrowEndY);
  ctx.lineTo(arrowEndX, arrowEndY - arrowWing);
  ctx.stroke();
  ctx.restore();
}

/**
 * Draw rotation angle display
 */
export function drawRotationAngle(
  ctx: CanvasRenderingContext2D,
  obj: any,
  rotation: number,
  zoom: number,
  documentDpi: number
): void {
  // Calculate object center position
  const centerX = (obj.x + obj.width / 2) * documentDpi;
  const centerY = (obj.y + obj.height / 2) * documentDpi;

  // Position angle display above the object
  const displayX = centerX;
  const displayY = centerY - 60 / zoom; // 60px above center

  // Draw angle display background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(
    displayX - 40 / zoom,
    displayY - 15 / zoom,
    80 / zoom,
    30 / zoom
  );

  // Draw angle text
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${14 / zoom}px Inter, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const angleText = `${Math.round(rotation)}°`;
  ctx.fillText(angleText, displayX, displayY);

  // Draw rotation line from center to rotation handle
  const handleY = centerY - 40 / zoom;
  ctx.strokeStyle = '#007AFF';
  ctx.lineWidth = 2 / zoom;
  ctx.setLineDash([5 / zoom, 5 / zoom]);

  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(centerX, handleY);
  ctx.stroke();

  ctx.setLineDash([]);
}

