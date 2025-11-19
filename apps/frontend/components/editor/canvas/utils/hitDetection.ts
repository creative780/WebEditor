/**
 * Hit detection utilities for transform handles and object interactions
 * OPTIMIZED: Uses caching and early exits for better performance
 */

import {
  getAllHandleMetrics,
  getHandleHitRadius,
  getHandleLineWidth,
  getHoverHandleRadius,
  getRotationHandleOffset,
  getRotationHandleRadius,
  getSelectionBasePadding,
  getSelectionStrokePadding,
  getTextExtraPadding,
} from './handleMetrics';
import {
  getCachedHandlePositions,
  getCachedPadding,
} from './handleCache';

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
 * OPTIMIZED: Uses caching to avoid redundant calculations
 */
export function calculateSelectionPadding(
  obj: any,
  zoom: number,
  objectId?: string
): { paddingX: number; paddingY: number } {
  // Use cache if objectId is provided
  if (objectId) {
    const metrics = getAllHandleMetrics(zoom);
    return getCachedPadding(
      objectId,
      obj,
      zoom,
      metrics.selectionBasePadding,
      metrics.selectionStrokePadding,
      metrics.textExtraPadding
    );
  }

  // Fallback to direct calculation (backward compatibility)
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
 * Quick bounding box check - early exit if point is clearly outside
 */
function isPointInBounds(
  x: number,
  y: number,
  objX: number,
  objY: number,
  objWidth: number,
  objHeight: number,
  paddingX: number,
  paddingY: number,
  maxDetectionRadius: number
): boolean {
  const paddedX = objX - paddingX;
  const paddedY = objY - paddingY;
  const paddedWidth = objWidth + paddingX * 2;
  const paddedHeight = objHeight + paddingY * 2;

  // Expand bounds by max detection radius for early exit
  const minX = paddedX - maxDetectionRadius;
  const maxX = paddedX + paddedWidth + maxDetectionRadius;
  const minY = paddedY - maxDetectionRadius * 2; // Extra space for rotation handle
  const maxY = paddedY + paddedHeight + maxDetectionRadius;

  return x >= minX && x <= maxX && y >= minY && y <= maxY;
}

/**
 * Determine which transform handle (if any) is under the cursor.
 * OPTIMIZED: Uses caching, early exits, and batched metrics
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
  paddingY = 0,
  objectId?: string
): TransformHandle {
  // Get all metrics at once (cached)
  const metrics = getAllHandleMetrics(zoom);
  const handleDetectionRadius = metrics.hoverHandleRadius + metrics.handleLineWidth * 1.25;
  const maxDetectionRadius = Math.max(
    handleDetectionRadius,
    metrics.rotationHandleRadiusHovered + metrics.handleLineWidth * 1.25
  );

  // Early exit: quick bounding box check
  if (
    !isPointInBounds(
      x,
      y,
      objX,
      objY,
      objWidth,
      objHeight,
      paddingX,
      paddingY,
      maxDetectionRadius
    )
  ) {
    return null;
  }

  const paddedX = objX - paddingX;
  const paddedY = objY - paddingY;
  const paddedWidth = objWidth + paddingX * 2;
  const paddedHeight = objHeight + paddingY * 2;

  // Check rotation handle first (most common interaction, positioned outside bounds)
  const rotationCenterX = paddedX + paddedWidth / 2;
  const rotationCenterY = paddedY - metrics.rotationHandleOffset;
  const rotationDetectionRadius =
    metrics.rotationHandleRadiusHovered + metrics.handleLineWidth * 1.25;

  const distToRotation = Math.hypot(x - rotationCenterX, y - rotationCenterY);
  if (distToRotation <= rotationDetectionRadius) {
    return 'rotate';
  }

  // Use cached handle positions if objectId provided
  let handles: Record<string, { x: number; y: number }>;
  
  if (objectId) {
    const cachedPositions = getCachedHandlePositions(
      objectId,
      objX,
      objY,
      objWidth,
      objHeight,
      zoom,
      paddingX,
      paddingY,
      metrics.rotationHandleOffset
    );
    handles = {
      nw: cachedPositions.nw,
      n: cachedPositions.n,
      ne: cachedPositions.ne,
      e: cachedPositions.e,
      se: cachedPositions.se,
      s: cachedPositions.s,
      sw: cachedPositions.sw,
      w: cachedPositions.w,
    };
  } else {
    // Fallback to direct calculation
    handles = {
      nw: { x: paddedX, y: paddedY },
      n: { x: paddedX + paddedWidth / 2, y: paddedY },
      ne: { x: paddedX + paddedWidth, y: paddedY },
      e: { x: paddedX + paddedWidth, y: paddedY + paddedHeight / 2 },
      se: { x: paddedX + paddedWidth, y: paddedY + paddedHeight },
      s: { x: paddedX + paddedWidth / 2, y: paddedY + paddedHeight },
      sw: { x: paddedX, y: paddedY + paddedHeight },
      w: { x: paddedX, y: paddedY + paddedHeight / 2 },
    };
  }

  // Check corner handles first (more precise, smaller hit area)
  const cornerHandles: Array<[string, { x: number; y: number }]> = [
    ['nw', handles.nw],
    ['ne', handles.ne],
    ['se', handles.se],
    ['sw', handles.sw],
  ];

  for (const [handle, pos] of cornerHandles) {
    const distance = Math.hypot(x - pos.x, y - pos.y);
    if (distance <= handleDetectionRadius) {
      return handle as TransformHandle;
    }
  }

  // Then check edge handles
  const edgeHandles: Array<[string, { x: number; y: number }]> = [
    ['n', handles.n],
    ['e', handles.e],
    ['s', handles.s],
    ['w', handles.w],
  ];

  for (const [handle, pos] of edgeHandles) {
    const distance = Math.hypot(x - pos.x, y - pos.y);
    if (distance <= handleDetectionRadius) {
      return handle as TransformHandle;
    }
  }

  // Border hit detection: allow resizing when dragging along selection edges
  const borderHitRadius = Math.max(
    metrics.handleHitRadius * 0.85,
    metrics.hoverHandleRadius * 0.7,
    metrics.handleLineWidth * 5
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
