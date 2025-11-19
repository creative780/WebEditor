/**
 * Caching utilities for handle positions and padding calculations
 * Optimizes performance by avoiding redundant calculations
 */

interface HandlePosition {
  x: number;
  y: number;
}

interface HandlePositions {
  nw: HandlePosition;
  n: HandlePosition;
  ne: HandlePosition;
  e: HandlePosition;
  se: HandlePosition;
  s: HandlePosition;
  sw: HandlePosition;
  w: HandlePosition;
  rotate: HandlePosition;
}

interface PaddingCache {
  paddingX: number;
  paddingY: number;
}

interface ObjectBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Cache for handle positions: key = `${objectId}-${zoom}-${x}-${y}-${width}-${height}`
const handlePositionsCache = new Map<string, HandlePositions>();

// Cache for padding: key = `${objectId}-${zoom}-${strokeWidth}-${type}`
const paddingCache = new Map<string, PaddingCache>();

// Cache for object bounds: key = objectId
const objectBoundsCache = new Map<string, ObjectBounds>();

/**
 * Generate cache key for handle positions
 */
function getHandlePositionsKey(
  objectId: string,
  zoom: number,
  bounds: ObjectBounds,
  paddingX: number,
  paddingY: number
): string {
  // Round values to avoid cache misses due to floating point precision
  const x = Math.round(bounds.x * 100) / 100;
  const y = Math.round(bounds.y * 100) / 100;
  const w = Math.round(bounds.width * 100) / 100;
  const h = Math.round(bounds.height * 100) / 100;
  const pX = Math.round(paddingX * 100) / 100;
  const pY = Math.round(paddingY * 100) / 100;
  const z = Math.round(zoom * 1000) / 1000;
  return `${objectId}-${z}-${x}-${y}-${w}-${h}-${pX}-${pY}`;
}

/**
 * Generate cache key for padding
 */
function getPaddingKey(
  objectId: string,
  zoom: number,
  strokeWidth: number,
  type: string
): string {
  const z = Math.round(zoom * 1000) / 1000;
  const sw = Math.round(strokeWidth * 100) / 100;
  return `${objectId}-${z}-${sw}-${type}`;
}

/**
 * Calculate and cache handle positions
 */
export function getCachedHandlePositions(
  objectId: string,
  objX: number,
  objY: number,
  objWidth: number,
  objHeight: number,
  zoom: number,
  paddingX: number,
  paddingY: number,
  rotationOffset: number
): HandlePositions {
  const bounds: ObjectBounds = { x: objX, y: objY, width: objWidth, height: objHeight };
  const cacheKey = getHandlePositionsKey(objectId, zoom, bounds, paddingX, paddingY);

  if (handlePositionsCache.has(cacheKey)) {
    return handlePositionsCache.get(cacheKey)!;
  }

  const paddedX = objX - paddingX;
  const paddedY = objY - paddingY;
  const paddedWidth = objWidth + paddingX * 2;
  const paddedHeight = objHeight + paddingY * 2;

  const positions: HandlePositions = {
    nw: { x: paddedX, y: paddedY },
    n: { x: paddedX + paddedWidth / 2, y: paddedY },
    ne: { x: paddedX + paddedWidth, y: paddedY },
    e: { x: paddedX + paddedWidth, y: paddedY + paddedHeight / 2 },
    se: { x: paddedX + paddedWidth, y: paddedY + paddedHeight },
    s: { x: paddedX + paddedWidth / 2, y: paddedY + paddedHeight },
    sw: { x: paddedX, y: paddedY + paddedHeight },
    w: { x: paddedX, y: paddedY + paddedHeight / 2 },
    rotate: {
      x: paddedX + paddedWidth / 2,
      y: paddedY - rotationOffset,
    },
  };

  // Limit cache size
  if (handlePositionsCache.size > 200) {
    const firstKey = handlePositionsCache.keys().next().value;
    handlePositionsCache.delete(firstKey);
  }

  handlePositionsCache.set(cacheKey, positions);
  return positions;
}

/**
 * Get cached padding or calculate and cache it
 */
export function getCachedPadding(
  objectId: string,
  obj: any,
  zoom: number,
  basePadding: number,
  strokePadding: number,
  textExtraPadding: number
): PaddingCache {
  const strokeWidth = Math.max(0, obj.stroke?.width || 0);
  const cacheKey = getPaddingKey(objectId, zoom, strokeWidth, obj.type || 'unknown');

  if (paddingCache.has(cacheKey)) {
    return paddingCache.get(cacheKey)!;
  }

  let paddingX: number;
  let paddingY: number;

  if (obj.type === 'text') {
    const padding = basePadding + textExtraPadding;
    paddingX = padding;
    paddingY = padding;
  } else {
    const padding = basePadding + strokeWidth / 2 + strokePadding;
    paddingX = padding;
    paddingY = padding;
  }

  const result: PaddingCache = { paddingX, paddingY };

  // Limit cache size
  if (paddingCache.size > 200) {
    const firstKey = paddingCache.keys().next().value;
    paddingCache.delete(firstKey);
  }

  paddingCache.set(cacheKey, result);
  return result;
}

/**
 * Update object bounds cache
 */
export function updateObjectBounds(objectId: string, bounds: ObjectBounds): void {
  objectBoundsCache.set(objectId, bounds);
}

/**
 * Get cached object bounds
 */
export function getCachedObjectBounds(objectId: string): ObjectBounds | null {
  return objectBoundsCache.get(objectId) || null;
}

/**
 * Check if object bounds have changed
 */
export function hasObjectBoundsChanged(
  objectId: string,
  bounds: ObjectBounds
): boolean {
  const cached = objectBoundsCache.get(objectId);
  if (!cached) return true;

  const threshold = 0.01; // Small threshold for floating point comparison
  return (
    Math.abs(cached.x - bounds.x) > threshold ||
    Math.abs(cached.y - bounds.y) > threshold ||
    Math.abs(cached.width - bounds.width) > threshold ||
    Math.abs(cached.height - bounds.height) > threshold
  );
}

/**
 * Clear all caches (useful for testing or memory management)
 */
export function clearHandleCaches(): void {
  handlePositionsCache.clear();
  paddingCache.clear();
  objectBoundsCache.clear();
}

/**
 * Clear cache for a specific object
 */
export function clearObjectCache(objectId: string): void {
  // Remove from bounds cache
  objectBoundsCache.delete(objectId);

  // Remove all related entries from positions and padding caches
  for (const key of handlePositionsCache.keys()) {
    if (key.startsWith(objectId + '-')) {
      handlePositionsCache.delete(key);
    }
  }

  for (const key of paddingCache.keys()) {
    if (key.startsWith(objectId + '-')) {
      paddingCache.delete(key);
    }
  }
}

