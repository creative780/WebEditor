/**
 * Shared helpers for transform handle sizing & hit regions.
 * Keeps visual size consistent in screen-space across zoom levels.
 * OPTIMIZED: Batched metrics calculation with caching
 */

const HANDLE_BASE_SCREEN_SIZE = 14; // px
const HANDLE_HOVER_SCALE = 1.28;
const HANDLE_MIN_WORLD_SIZE = 8; // prevent collapsing at extreme zoom-in
const HANDLE_MAX_WORLD_SIZE = 140; // prevent over-inflation at extreme zoom-out
const HANDLE_LINE_WIDTH_MIN = 1.4; // px
const HANDLE_LINE_WIDTH_MAX = 2.4; // px
const HANDLE_BORDER_PADDING_SCREEN = 9; // px
const HANDLE_BORDER_EXTRA_SCREEN = 2.5; // px
const TEXT_EXTRA_PADDING_SCREEN = 4; // px

const HANDLE_HIT_TARGET_SCREEN = 22; // px, cursor hit slop around handles/border
const ROTATION_HANDLE_OFFSET_MULTIPLIER = 2.5;
const ROTATION_HANDLE_RADIUS_MULTIPLIER = 1.12;

function clampZoom(zoom: number): number {
  return Math.max(zoom, 0.01);
}

// Cache for metrics based on zoom level
interface HandleMetrics {
  handleSize: number;
  handleRadius: number;
  hoverHandleRadius: number;
  handleLineWidth: number;
  rotationHandleOffset: number;
  rotationHandleRadius: number;
  rotationHandleRadiusHovered: number;
  handleHitRadius: number;
  selectionBasePadding: number;
  selectionStrokePadding: number;
  textExtraPadding: number;
}

const metricsCache = new Map<number, HandleMetrics>();

/**
 * Get all handle metrics at once (optimized batch calculation)
 * Results are cached per zoom level
 */
export function getAllHandleMetrics(zoom: number): HandleMetrics {
  const clampedZoom = clampZoom(zoom);
  const cacheKey = Math.round(clampedZoom * 1000) / 1000; // Round to 3 decimal places for cache key

  if (metricsCache.has(cacheKey)) {
    return metricsCache.get(cacheKey)!;
  }

  const handleSize = Math.min(
    HANDLE_MAX_WORLD_SIZE,
    Math.max(HANDLE_MIN_WORLD_SIZE, HANDLE_BASE_SCREEN_SIZE / clampedZoom)
  );
  const handleRadius = handleSize / 2;
  const hoverHandleRadius = handleRadius * HANDLE_HOVER_SCALE;
  const handleLineWidth = Math.max(
    HANDLE_LINE_WIDTH_MIN,
    Math.min(HANDLE_LINE_WIDTH_MAX, HANDLE_LINE_WIDTH_MAX / clampedZoom)
  );
  const rotationHandleOffset = handleSize * ROTATION_HANDLE_OFFSET_MULTIPLIER;
  const baseRotationRadius = handleRadius * ROTATION_HANDLE_RADIUS_MULTIPLIER;
  const handleHitRadius = HANDLE_HIT_TARGET_SCREEN / clampedZoom;
  const selectionBasePadding =
    handleRadius + HANDLE_BORDER_PADDING_SCREEN / clampedZoom;
  const selectionStrokePadding = HANDLE_BORDER_EXTRA_SCREEN / clampedZoom;
  const textExtraPadding = TEXT_EXTRA_PADDING_SCREEN / clampedZoom;

  const metrics: HandleMetrics = {
    handleSize,
    handleRadius,
    hoverHandleRadius,
    handleLineWidth,
    rotationHandleOffset,
    rotationHandleRadius: baseRotationRadius,
    rotationHandleRadiusHovered: baseRotationRadius * HANDLE_HOVER_SCALE,
    handleHitRadius,
    selectionBasePadding,
    selectionStrokePadding,
    textExtraPadding,
  };

  // Limit cache size to prevent memory leaks
  if (metricsCache.size > 100) {
    const firstKey = metricsCache.keys().next().value;
    metricsCache.delete(firstKey);
  }

  metricsCache.set(cacheKey, metrics);
  return metrics;
}

// Individual functions for backward compatibility (now use cache)
export function getHandleSize(zoom: number): number {
  return getAllHandleMetrics(zoom).handleSize;
}

export function getHandleRadius(zoom: number): number {
  return getAllHandleMetrics(zoom).handleRadius;
}

export function getHoverHandleRadius(zoom: number): number {
  return getAllHandleMetrics(zoom).hoverHandleRadius;
}

export function getHandleLineWidth(zoom: number): number {
  return getAllHandleMetrics(zoom).handleLineWidth;
}

export function getRotationHandleOffset(zoom: number): number {
  return getAllHandleMetrics(zoom).rotationHandleOffset;
}

export function getRotationHandleRadius(zoom: number, hovered = false): number {
  const metrics = getAllHandleMetrics(zoom);
  return hovered ? metrics.rotationHandleRadiusHovered : metrics.rotationHandleRadius;
}

export function getHandleHitRadius(zoom: number): number {
  return getAllHandleMetrics(zoom).handleHitRadius;
}

export function getSelectionBasePadding(zoom: number): number {
  return getAllHandleMetrics(zoom).selectionBasePadding;
}

export function getSelectionStrokePadding(zoom: number): number {
  return getAllHandleMetrics(zoom).selectionStrokePadding;
}

export function getTextExtraPadding(zoom: number): number {
  return getAllHandleMetrics(zoom).textExtraPadding;
}

/**
 * Clear metrics cache (useful for testing or memory management)
 */
export function clearMetricsCache(): void {
  metricsCache.clear();
}
