/**
 * Cursor utility tests
 * Ensures transform-edge segments map to appropriate cursors
 */

import { describe, it, expect } from '@jest/globals';
import { getCursorStyle } from '../components/editor/canvas/utils/cursorUtils';
import type { EdgeSegment } from '../lib/shapePathUtils';

const createSegment = (
  type: EdgeSegment['type'],
  normal: { x: number; y: number }
): EdgeSegment => ({
  index: 0,
  type,
  normal,
  direction: { x: 1, y: 0 },
  points: [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
  ],
  bounds: { minX: 0, minY: 0, maxX: 10, maxY: 0 },
});

describe('cursorUtils', () => {
  it('returns axis-aligned cursor when hovering edge segment', () => {
    const north = createSegment('n', { x: 0, y: -1 });
    const cursor = getCursorStyle(
      'move',
      null,
      north,
      true,
      false,
      false,
      null,
      null
    );
    expect(cursor).toBe('ns-resize');
  });

  it('returns edge-segment cursor during transformation without standard handle', () => {
    const customSegment = createSegment('custom', { x: 1, y: 0 });
    const cursor = getCursorStyle(
      'move',
      null,
      null,
      true,
      false,
      true,
      null,
      customSegment
    );
    expect(cursor).toBe('ew-resize');
  });

  it('falls back to pointer when segment has no orientation data', () => {
    const cursor = getCursorStyle(
      'move',
      null,
      {
        ...createSegment('custom', { x: 0, y: 0 }),
        normal: { x: 0, y: 0 },
      },
      true,
      false,
      false,
      null,
      null
    );
    expect(cursor).toBe('pointer');
  });
});

