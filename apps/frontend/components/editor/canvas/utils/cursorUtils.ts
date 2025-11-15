/**
 * Cursor style utilities
 * Determines the appropriate cursor based on tool, hover state, and object interactions
 */

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

export function getCursorStyle(
  activeTool: string,
  hoveredHandle: string | null,
  hoveredEdgeSegment: EdgeSegment | null,
  isOverArtboard: boolean,
  isDragging: boolean,
  isTransforming: boolean,
  transformHandle: string | null,
  transformEdgeSegment: EdgeSegment | null
): string {
  // Transform cursor should reflect active handle while transforming
  if (isTransforming && transformHandle) {
    switch (transformHandle) {
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
      case 'rotate':
        return 'grabbing';
      default:
        return 'move';
    }
  } else if (isTransforming) {
    const segmentCursor = getCursorForEdgeSegment(transformEdgeSegment);
    if (segmentCursor) {
      return segmentCursor;
    }
  }

  // During object drag (not transform), show move cursor
  if (isDragging) {
    return 'move';
  }

  // Transform handle cursors while hovering
  if (hoveredHandle) {
    switch (hoveredHandle) {
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
      case 'rotate':
        return 'grab';
      default:
        return 'move';
    }
  }

  // Edge segment cursor (for path editing)
  if (hoveredEdgeSegment) {
    const segmentCursor = getCursorForEdgeSegment(hoveredEdgeSegment);
    if (segmentCursor) {
      return segmentCursor;
    }
    return 'pointer';
  }

  // Show grab cursor on empty artboard space (indicates you can pan)
  if (isOverArtboard) {
    return 'grab';
  }

  // Shape tools get crosshair cursor for better UX
  if (
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
    return 'crosshair';
  }

  switch (activeTool) {
    case 'move':
      return 'move';
    case 'brush':
      return 'crosshair';
    case 'text':
      return 'text';
    case 'crop':
      return 'crosshair';
    default:
      return 'grab';
  }
}

