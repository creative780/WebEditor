/**
 * Geometry calculation utilities
 */

/**
 * Calculate distance between two points
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.hypot(x2 - x1, y2 - y1);
}

/**
 * Calculate angle between two points
 */
export function angle(x1: number, y1: number, x2: number, y2: number): number {
  return Math.atan2(y2 - y1, x2 - x1);
}

/**
 * Rotate point around center
 */
export function rotatePoint(
  x: number,
  y: number,
  centerX: number,
  centerY: number,
  angle: number
): { x: number; y: number } {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const dx = x - centerX;
  const dy = y - centerY;
  return {
    x: centerX + dx * cos - dy * sin,
    y: centerY + dx * sin + dy * cos,
  };
}

/**
 * Calculate bounding box for rotated rectangle
 */
export function getRotatedBounds(
  width: number,
  height: number,
  rotation: number
): { width: number; height: number } {
  const absCos = Math.abs(Math.cos(rotation));
  const absSin = Math.abs(Math.sin(rotation));
  return {
    width: width * absCos + height * absSin,
    height: width * absSin + height * absCos,
  };
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

