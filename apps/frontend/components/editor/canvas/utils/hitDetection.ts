/**
 * Hit detection utilities for transform handles and object interactions
 */

import {
  getHandleHitRadius,
  getHandleLineWidth,
  getHoverHandleRadius,
  getRotationHandleOffset,
  getRotationHandleRadius,
  getSelectionBasePadding,
  getSelectionStrokePadding,
  getTextExtraPadding,
} from './handleMetrics';

export type TransformHandle =
  | 'nw'
  | 'n'
  | 'ne'
  | 'e'
  | 'se'
  | 's'
  | 'sw'
  | 'w'
  | 'rotate'
  | null;

/**
 * Compute padding around an object based on its type, stroke, and zoom
 */
export function calculateSelectionPadding(
  obj: any,
  zoom: number
): { paddingX: number; paddingY: number } {
  const basePadding = getSelectionBasePadding(zoom);

  if (obj.type === 'text') {
    const padding = basePadding + getTextExtraPadding(zoom);
    return { paddingX: padding, paddingY: padding };
  }

  const strokeWidth = Math.max(0, obj.stroke?.width || 0);
  const padding =
    basePadding + strokeWidth / 2 + getSelectionStrokePadding(zoom);
  return { paddingX: padding, paddingY: padding };
}

/**
 * Determine which transform handle (if any) is under the cursor.
 * Updated for precise handle hit detection — cursor changes only when hovering
 * directly over visible handles.
 */
export function getTransformHandleAt(
  x: number,
  y: number,
  objX: number,
  objY: number,
  objWidth: number,
  objHeight: number,
  zoom: number,
  paddingX = 0,
  paddingY = 0
): TransformHandle {
  const lineWidth = getHandleLineWidth(zoom);
  const hoverHandleRadius = getHoverHandleRadius(zoom);
  const handleDetectionRadius = hoverHandleRadius + lineWidth * 1.25;
  const paddedX = objX - paddingX;
  const paddedY = objY - paddingY;
  const paddedWidth = objWidth + paddingX * 2;
  const paddedHeight = objHeight + paddingY * 2;

  // Rotation handle (above top center)
  const rotationOffset = getRotationHandleOffset(zoom);
  const rotationCenterX = paddedX + paddedWidth / 2;
  const rotationCenterY = paddedY - rotationOffset;
  const rotationDetectionRadius =
    getRotationHandleRadius(zoom, true) + lineWidth * 1.25;

  const distToRotation = Math.hypot(x - rotationCenterX, y - rotationCenterY);
  if (distToRotation <= rotationDetectionRadius) {
    return 'rotate';
  }

  // Define corner and side handle coordinates
  const handles = {
    nw: { x: paddedX, y: paddedY },
    n: { x: paddedX + paddedWidth / 2, y: paddedY },
    ne: { x: paddedX + paddedWidth, y: paddedY },
    e: { x: paddedX + paddedWidth, y: paddedY + paddedHeight / 2 },
    se: { x: paddedX + paddedWidth, y: paddedY + paddedHeight },
    s: { x: paddedX + paddedWidth / 2, y: paddedY + paddedHeight },
    sw: { x: paddedX, y: paddedY + paddedHeight },
    w: { x: paddedX, y: paddedY + paddedHeight / 2 },
  };

  // Strict hit detection: only detect if within visible handle radius
  for (const [handle, pos] of Object.entries(handles)) {
    const distance = Math.hypot(x - pos.x, y - pos.y);
    if (distance <= handleDetectionRadius) {
      return handle as TransformHandle;
    }
  }

  // Border hit detection: allow resizing when dragging along selection edges
  const handleHitRadius = getHandleHitRadius(zoom);
  const borderHitRadius = Math.max(
    handleHitRadius * 0.85,
    hoverHandleRadius * 0.7,
    lineWidth * 5
  );

  const withinHorizontalBand =
    x >= paddedX - borderHitRadius && x <= paddedX + paddedWidth + borderHitRadius;
  const withinVerticalBand =
    y >= paddedY - borderHitRadius && y <= paddedY + paddedHeight + borderHitRadius;

  const distanceTop = Math.abs(y - paddedY);
  const distanceBottom = Math.abs(y - (paddedY + paddedHeight));
  const distanceLeft = Math.abs(x - paddedX);
  const distanceRight = Math.abs(x - (paddedX + paddedWidth));

  if (withinHorizontalBand && distanceTop <= borderHitRadius) {
    return 'n';
  }
  if (withinHorizontalBand && distanceBottom <= borderHitRadius) {
    return 's';
  }
  if (withinVerticalBand && distanceRight <= borderHitRadius) {
    return 'e';
  }
  if (withinVerticalBand && distanceLeft <= borderHitRadius) {
    return 'w';
  }

  // No handle hit
  return null;
}
