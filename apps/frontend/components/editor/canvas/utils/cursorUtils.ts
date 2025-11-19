/**
 * Cursor style utilities
 * Determines the appropriate cursor based on tool, hover state, and object interactions
 * OPTIMIZED: Memoized cursor style calculation
 */

import { useMemo } from 'react';
import type { EdgeSegment } from '../../../../lib/shapePathUtils';

function getCursorForEdgeSegment(segment: EdgeSegment | null): string | null {
  if (!segment) return null;

  switch (segment.type) {
    case 'nw':
    case 'se':
      return 'nwse-resize';
    case 'ne':
    case 'sw':
      return 'nesw-resize';
    case 'n':
    case 's':
      return 'ns-resize';
    case 'e':
    case 'w':
      return 'ew-resize';
    default: {
      const absX = Math.abs(segment.normal?.x ?? 0);
      const absY = Math.abs(segment.normal?.y ?? 0);
      if (absX === 0 && absY === 0) return null;
      if (Math.abs(absX - absY) < 0.2) {
        return 'nwse-resize';
      }
      return absX > absY ? 'ew-resize' : 'ns-resize';
    }
  }
}

// Cache for cursor styles
const cursorCache = new Map<string, string>();

function getCursorCacheKey(
  activeTool: string,
  hoveredHandle: string | null,
  hoveredEdgeSegment: EdgeSegment | null,
  isOverArtboard: boolean,
  isDragging: boolean,
  isTransforming: boolean,
  transformHandle: string | null,
  transformEdgeSegment: EdgeSegment | null,
  hoveredObjectType?: string | null
): string {
  const segmentKey = hoveredEdgeSegment
    ? `${hoveredEdgeSegment.type}-${hoveredEdgeSegment.normal?.x}-${hoveredEdgeSegment.normal?.y}`
    : 'null';
  const transformSegmentKey = transformEdgeSegment
    ? `${transformEdgeSegment.type}-${transformEdgeSegment.normal?.x}-${transformEdgeSegment.normal?.y}`
    : 'null';
  return `${activeTool}-${hoveredHandle}-${segmentKey}-${isOverArtboard}-${isDragging}-${isTransforming}-${transformHandle}-${transformSegmentKey}-${hoveredObjectType || 'null'}`;
}

export function getCursorStyle(
  activeTool: string,
  hoveredHandle: string | null,
  hoveredEdgeSegment: EdgeSegment | null,
  isOverArtboard: boolean,
  isDragging: boolean,
  isTransforming: boolean,
  transformHandle: string | null,
  transformEdgeSegment: EdgeSegment | null,
  hoveredObjectType?: string | null
): string {
  const cacheKey = getCursorCacheKey(
    activeTool,
    hoveredHandle,
    hoveredEdgeSegment,
    isOverArtboard,
    isDragging,
    isTransforming,
    transformHandle,
    transformEdgeSegment,
    hoveredObjectType
  );

  if (cursorCache.has(cacheKey)) {
    return cursorCache.get(cacheKey)!;
  }

  let cursor: string;

  // Transform cursor should reflect active handle while transforming
  if (isTransforming && transformHandle) {
    switch (transformHandle) {
      case 'nw':
      case 'se':
        cursor = 'nwse-resize';
        break;
      case 'ne':
      case 'sw':
        cursor = 'nesw-resize';
        break;
      case 'n':
      case 's':
        cursor = 'ns-resize';
        break;
      case 'e':
      case 'w':
        cursor = 'ew-resize';
        break;
      case 'rotate':
        cursor = 'grabbing';
        break;
      default:
        cursor = 'move';
    }
  } else if (isTransforming) {
    const segmentCursor = getCursorForEdgeSegment(transformEdgeSegment);
    cursor = segmentCursor || 'move';
  } else if (isDragging) {
    // During object drag (not transform), show move cursor
    cursor = 'move';
  } else if (hoveredHandle) {
    // Transform handle cursors while hovering
    switch (hoveredHandle) {
      case 'nw':
      case 'se':
        cursor = 'nwse-resize';
        break;
      case 'ne':
      case 'sw':
        cursor = 'nesw-resize';
        break;
      case 'n':
      case 's':
        cursor = 'ns-resize';
        break;
      case 'e':
      case 'w':
        cursor = 'ew-resize';
        break;
      case 'rotate':
        cursor = 'grab';
        break;
      default:
        cursor = 'move';
    }
  } else if (hoveredEdgeSegment) {
    // Edge segment cursor (for path editing)
    const segmentCursor = getCursorForEdgeSegment(hoveredEdgeSegment);
    cursor = segmentCursor || 'pointer';
  } else if (hoveredObjectType === 'text' && !hoveredHandle) {
    // Show text cursor when hovering over text objects (but not over handles)
    cursor = 'text';
  } else if (isOverArtboard) {
    // Show grab cursor on empty artboard space (indicates you can pan)
    cursor = 'grab';
  } else if (
    [
      'rectangle',
      'circle',
      'triangle',
      'arrow',
      'star',
      'line',
      'polygon',
      'heart',
      'gear',
      'callout',
    ].includes(activeTool)
  ) {
    // Shape tools get crosshair cursor for better UX
    cursor = 'crosshair';
  } else {
    switch (activeTool) {
      case 'move':
        cursor = 'move';
        break;
      case 'brush':
        cursor = 'crosshair';
        break;
      case 'text':
        cursor = 'text';
        break;
      case 'crop':
        cursor = 'crosshair';
        break;
      default:
        cursor = 'grab';
    }
  }

  // Cache result (limit cache size)
  if (cursorCache.size > 100) {
    const firstKey = cursorCache.keys().next().value;
    cursorCache.delete(firstKey);
  }
  cursorCache.set(cacheKey, cursor);

  return cursor;
}

/**
 * Hook version with memoization for React components
 */
export function useCursorStyle(
  activeTool: string,
  hoveredHandle: string | null,
  hoveredEdgeSegment: EdgeSegment | null,
  isOverArtboard: boolean,
  isDragging: boolean,
  isTransforming: boolean,
  transformHandle: string | null,
  transformEdgeSegment: EdgeSegment | null,
  hoveredObjectType?: string | null
): string {
  return useMemo(
    () =>
      getCursorStyle(
        activeTool,
        hoveredHandle,
        hoveredEdgeSegment,
        isOverArtboard,
        isDragging,
        isTransforming,
        transformHandle,
        transformEdgeSegment,
        hoveredObjectType
      ),
    [
      activeTool,
      hoveredHandle,
      hoveredEdgeSegment,
      isOverArtboard,
      isDragging,
      isTransforming,
      transformHandle,
      transformEdgeSegment,
      hoveredObjectType,
    ]
  );
}

/**
 * Clear cursor cache (useful for testing)
 */
export function clearCursorCache(): void {
  cursorCache.clear();
}
