/**
 * Shared helpers for transform handle sizing & hit regions.
 * Keeps visual size consistent in screen-space across zoom levels.
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

export function getHandleSize(zoom: number): number {
  const size = HANDLE_BASE_SCREEN_SIZE / clampZoom(zoom);
  return Math.min(HANDLE_MAX_WORLD_SIZE, Math.max(HANDLE_MIN_WORLD_SIZE, size));
}

export function getHandleRadius(zoom: number): number {
  return getHandleSize(zoom) / 2;
}

export function getHoverHandleRadius(zoom: number): number {
  return getHandleRadius(zoom) * HANDLE_HOVER_SCALE;
}

export function getHandleLineWidth(zoom: number): number {
  const width = HANDLE_LINE_WIDTH_MAX / clampZoom(zoom);
  return Math.max(HANDLE_LINE_WIDTH_MIN, Math.min(width, HANDLE_LINE_WIDTH_MAX));
}

export function getRotationHandleOffset(zoom: number): number {
  return getHandleSize(zoom) * ROTATION_HANDLE_OFFSET_MULTIPLIER;
}

export function getRotationHandleRadius(zoom: number, hovered = false): number {
  const radius =
    getHandleRadius(zoom) * ROTATION_HANDLE_RADIUS_MULTIPLIER;
  return hovered ? radius * HANDLE_HOVER_SCALE : radius;
}

export function getHandleHitRadius(zoom: number): number {
  return HANDLE_HIT_TARGET_SCREEN / clampZoom(zoom);
}

export function getSelectionBasePadding(zoom: number): number {
  return (
    getHandleRadius(zoom) + HANDLE_BORDER_PADDING_SCREEN / clampZoom(zoom)
  );
}

export function getSelectionStrokePadding(zoom: number): number {
  return HANDLE_BORDER_EXTRA_SCREEN / clampZoom(zoom);
}

export function getTextExtraPadding(zoom: number): number {
  return TEXT_EXTRA_PADDING_SCREEN / clampZoom(zoom);
}

