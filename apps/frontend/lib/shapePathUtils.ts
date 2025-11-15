/**
 * Shape path utilities for generating and detecting edge segments
 */

import type { ShapeObj } from '../state/useEditorStore';
import { Point } from './shapes';
import {
  generateStarPoints,
  generatePolygonPoints,
  generateHeartPath,
  generateGearPath,
  generateArrowPath,
} from './shapes';

export interface EdgeSegment {
  index: number;
  type: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | 'custom';
  points: Point[];
  direction: { x: number; y: number }; // Normalized direction vector
  normal: { x: number; y: number }; // Normal vector (perpendicular to edge)
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
}

/**
 * Calculate distance from point to line segment
 */
export function distanceToLineSegment(
  point: Point,
  lineStart: Point,
  lineEnd: Point
): { distance: number; closestPoint: Point } {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const lengthSq = dx * dx + dy * dy;

  if (lengthSq === 0) {
    // Line segment is a point
    const dist = Math.hypot(point.x - lineStart.x, point.y - lineStart.y);
    return { distance: dist, closestPoint: lineStart };
  }

  // Calculate projection parameter t
  const t = Math.max(
    0,
    Math.min(1, ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lengthSq)
  );

  // Closest point on line segment
  const closestPoint = {
    x: lineStart.x + t * dx,
    y: lineStart.y + t * dy,
  };

  const distance = Math.hypot(point.x - closestPoint.x, point.y - closestPoint.y);
  return { distance, closestPoint };
}

/**
 * Calculate distance from point to bezier curve segment (simplified)
 * For now, we'll approximate bezier curves as line segments
 */
export function distanceToBezierSegment(
  point: Point,
  bezierPoints: Point[]
): { distance: number; closestPoint: Point } {
  // Simplified: treat bezier as series of line segments
  let minDistance = Infinity;
  let closestPoint = bezierPoints[0];

  for (let i = 0; i < bezierPoints.length - 1; i++) {
    const result = distanceToLineSegment(
      point,
      bezierPoints[i],
      bezierPoints[i + 1]
    );
    if (result.distance < minDistance) {
      minDistance = result.distance;
      closestPoint = result.closestPoint;
    }
  }

  return { distance: minDistance, closestPoint };
}

/**
 * Get edge segments for a rectangle shape
 */
function getRectangleEdgeSegments(
  x: number,
  y: number,
  width: number,
  height: number
): EdgeSegment[] {
  const segments: EdgeSegment[] = [];

  // Top edge
  segments.push({
    index: 0,
    type: 'n',
    points: [
      { x, y },
      { x: x + width, y },
    ],
    direction: { x: 1, y: 0 },
    normal: { x: 0, y: -1 },
    bounds: { minX: x, minY: y, maxX: x + width, maxY: y },
  });

  // Right edge
  segments.push({
    index: 1,
    type: 'e',
    points: [
      { x: x + width, y },
      { x: x + width, y: y + height },
    ],
    direction: { x: 0, y: 1 },
    normal: { x: 1, y: 0 },
    bounds: { minX: x + width, minY: y, maxX: x + width, maxY: y + height },
  });

  // Bottom edge
  segments.push({
    index: 2,
    type: 's',
    points: [
      { x: x + width, y: y + height },
      { x, y: y + height },
    ],
    direction: { x: -1, y: 0 },
    normal: { x: 0, y: 1 },
    bounds: { minX: x, minY: y + height, maxX: x + width, maxY: y + height },
  });

  // Left edge
  segments.push({
    index: 3,
    type: 'w',
    points: [
      { x, y: y + height },
      { x, y },
    ],
    direction: { x: 0, y: -1 },
    normal: { x: -1, y: 0 },
    bounds: { minX: x, minY: y, maxX: x, maxY: y + height },
  });

  return segments;
}

/**
 * Get edge segments for a circle/ellipse shape
 * Approximated as 8 line segments for hit detection
 */
function getCircleEdgeSegments(
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number
): EdgeSegment[] {
  const segments: EdgeSegment[] = [];
  const segmentsCount = 16; // More segments for smoother detection
  const angleStep = (Math.PI * 2) / segmentsCount;

  for (let i = 0; i < segmentsCount; i++) {
    const angle1 = i * angleStep;
    const angle2 = (i + 1) * angleStep;

    const x1 = centerX + radiusX * Math.cos(angle1);
    const y1 = centerY + radiusY * Math.sin(angle1);
    const x2 = centerX + radiusX * Math.cos(angle2);
    const y2 = centerY + radiusY * Math.sin(angle2);

    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.hypot(dx, dy);
    const direction = length > 0 ? { x: dx / length, y: dy / length } : { x: 1, y: 0 };
    const normal = { x: -dy / length, y: dx / length };

    segments.push({
      index: i,
      type: 'custom',
      points: [{ x: x1, y: y1 }, { x: x2, y: y2 }],
      direction,
      normal,
      bounds: {
        minX: Math.min(x1, x2),
        minY: Math.min(y1, y2),
        maxX: Math.max(x1, x2),
        maxY: Math.max(y1, y2),
      },
    });
  }

  return segments;
}

/**
 * Get edge segments for a triangle shape
 */
function getTriangleEdgeSegments(width: number, height: number): EdgeSegment[] {
  const segments: EdgeSegment[] = [];

  // Top to bottom-right
  segments.push({
    index: 0,
    type: 'custom',
    points: [
      { x: width / 2, y: 0 },
      { x: width, y: height },
    ],
    direction: {
      x: (width - width / 2) / Math.hypot(width - width / 2, height),
      y: height / Math.hypot(width - width / 2, height),
    },
    normal: {
      x: -height / Math.hypot(width / 2, height),
      y: width / 2 / Math.hypot(width / 2, height),
    },
    bounds: {
      minX: width / 2,
      minY: 0,
      maxX: width,
      maxY: height,
    },
  });

  // Bottom-right to bottom-left
  segments.push({
    index: 1,
    type: 'custom',
    points: [
      { x: width, y: height },
      { x: 0, y: height },
    ],
    direction: { x: -1, y: 0 },
    normal: { x: 0, y: 1 },
    bounds: {
      minX: 0,
      minY: height,
      maxX: width,
      maxY: height,
    },
  });

  // Bottom-left to top
  segments.push({
    index: 2,
    type: 'custom',
    points: [
      { x: 0, y: height },
      { x: width / 2, y: 0 },
    ],
    direction: {
      x: (width / 2) / Math.hypot(width / 2, height),
      y: -height / Math.hypot(width / 2, height),
    },
    normal: {
      x: height / Math.hypot(width / 2, height),
      y: width / 2 / Math.hypot(width / 2, height),
    },
    bounds: {
      minX: 0,
      minY: 0,
      maxX: width / 2,
      maxY: height,
    },
  });

  return segments;
}

/**
 * Get edge segments for a star shape
 */
function getStarEdgeSegments(width: number, height: number): EdgeSegment[] {
  const segments: EdgeSegment[] = [];
  const centerX = width / 2;
  const centerY = height / 2;
  const outerRadius = Math.max(width, height) / 2;
  const innerRadius = outerRadius * 0.4;
  const points = 5;

  const starPoints: Point[] = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    starPoints.push({
      x: centerX + Math.cos(angle - Math.PI / 2) * radius,
      y: centerY + Math.sin(angle - Math.PI / 2) * radius,
    });
  }

  // Create segments from points
  for (let i = 0; i < starPoints.length; i++) {
    const p1 = starPoints[i];
    const p2 = starPoints[(i + 1) % starPoints.length];

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const length = Math.hypot(dx, dy);
    const direction = length > 0 ? { x: dx / length, y: dy / length } : { x: 1, y: 0 };
    const normal = { x: -dy / length, y: dx / length };

    segments.push({
      index: i,
      type: 'custom',
      points: [p1, p2],
      direction,
      normal,
      bounds: {
        minX: Math.min(p1.x, p2.x),
        minY: Math.min(p1.y, p2.y),
        maxX: Math.max(p1.x, p2.x),
        maxY: Math.max(p1.y, p2.y),
      },
    });
  }

  return segments;
}

/**
 * Get edge segments for a polygon shape
 */
function getPolygonEdgeSegments(width: number, height: number): EdgeSegment[] {
  const segments: EdgeSegment[] = [];
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.max(width, height) / 2;
  const sides = 6; // Default hexagon

  const polygonPoints: Point[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i * Math.PI * 2) / sides - Math.PI / 2;
    polygonPoints.push({
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    });
  }

  // Create segments from points
  for (let i = 0; i < polygonPoints.length; i++) {
    const p1 = polygonPoints[i];
    const p2 = polygonPoints[(i + 1) % polygonPoints.length];

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const length = Math.hypot(dx, dy);
    const direction = length > 0 ? { x: dx / length, y: dy / length } : { x: 1, y: 0 };
    const normal = { x: -dy / length, y: dx / length };

    segments.push({
      index: i,
      type: 'custom',
      points: [p1, p2],
      direction,
      normal,
      bounds: {
        minX: Math.min(p1.x, p2.x),
        minY: Math.min(p1.y, p2.y),
        maxX: Math.max(p1.x, p2.x),
        maxY: Math.max(p1.y, p2.y),
      },
    });
  }

  return segments;
}

/**
 * Get edge segments for an arrow shape
 */
function getArrowEdgeSegments(width: number, height: number): EdgeSegment[] {
  const segments: EdgeSegment[] = [];

  // Left edge
  segments.push({
    index: 0,
    type: 'w',
    points: [
      { x: 0, y: height / 2 },
      { x: width * 0.7, y: height / 2 },
    ],
    direction: { x: 1, y: 0 },
    normal: { x: -1, y: 0 },
    bounds: {
      minX: 0,
      minY: height / 2,
      maxX: width * 0.7,
      maxY: height / 2,
    },
  });

  // Top arrow edge
  segments.push({
    index: 1,
    type: 'custom',
    points: [
      { x: width * 0.7, y: height / 2 },
      { x: width * 0.7, y: height * 0.3 },
      { x: width, y: height / 2 },
    ],
    direction: {
      x: (width - width * 0.7) / Math.hypot(width - width * 0.7, height / 2 - height * 0.3),
      y: (height / 2 - height * 0.3) / Math.hypot(width - width * 0.7, height / 2 - height * 0.3),
    },
    normal: {
      x: -(height / 2 - height * 0.3) / Math.hypot(width - width * 0.7, height / 2 - height * 0.3),
      y: (width - width * 0.7) / Math.hypot(width - width * 0.7, height / 2 - height * 0.3),
    },
    bounds: {
      minX: width * 0.7,
      minY: height * 0.3,
      maxX: width,
      maxY: height / 2,
    },
  });

  // Right edge (top to bottom)
  segments.push({
    index: 2,
    type: 'e',
    points: [
      { x: width, y: height / 2 },
      { x: width * 0.7, y: height * 0.7 },
    ],
    direction: {
      x: (width * 0.7 - width) / Math.hypot(width * 0.7 - width, height * 0.7 - height / 2),
      y: (height * 0.7 - height / 2) / Math.hypot(width * 0.7 - width, height * 0.7 - height / 2),
    },
    normal: {
      x: -(height * 0.7 - height / 2) / Math.hypot(width * 0.7 - width, height * 0.7 - height / 2),
      y: (width * 0.7 - width) / Math.hypot(width * 0.7 - width, height * 0.7 - height / 2),
    },
    bounds: {
      minX: width * 0.7,
      minY: height / 2,
      maxX: width,
      maxY: height * 0.7,
    },
  });

  // Bottom arrow edge
  segments.push({
    index: 3,
    type: 'custom',
    points: [
      { x: width * 0.7, y: height * 0.7 },
      { x: width * 0.7, y: height / 2 },
    ],
    direction: { x: 0, y: -1 },
    normal: { x: 1, y: 0 },
    bounds: {
      minX: width * 0.7,
      minY: height / 2,
      maxX: width * 0.7,
      maxY: height * 0.7,
    },
  });

  return segments;
}

/**
 * Get edge segments for a line shape
 */
function getLineEdgeSegments(width: number, height: number): EdgeSegment[] {
  const segments: EdgeSegment[] = [];

  segments.push({
    index: 0,
    type: 'custom',
    points: [
      { x: 0, y: height / 2 },
      { x: width, y: height / 2 },
    ],
    direction: { x: 1, y: 0 },
    normal: { x: 0, y: -1 },
    bounds: {
      minX: 0,
      minY: height / 2,
      maxX: width,
      maxY: height / 2,
    },
  });

  return segments;
}

/**
 * Get edge segments for a heart shape (simplified - approximate as polygon)
 */
function getHeartEdgeSegments(width: number, height: number): EdgeSegment[] {
  const segments: EdgeSegment[] = [];
  const x = 0;
  const y = 0;
  const w = width;
  const h = height;

  // Approximate heart with key points
  const topCenterX = x + w / 2;
  const topCenterY = y + h / 5;
  const bottomX = x + w / 2;
  const bottomY = y + h;
  const leftTopX = x;
  const leftTopY = y;
  const leftMidX = x;
  const leftMidY = y + h / 3;
  const rightTopX = x + w;
  const rightTopY = y;
  const rightMidX = x + w;
  const rightMidY = y + h / 3;

  // Create segments approximating the heart path
  const heartPoints: Point[] = [
    { x: topCenterX, y: topCenterY },
    { x: leftTopX, y: leftTopY },
    { x: leftMidX, y: leftMidY },
    { x: bottomX, y: bottomY },
    { x: rightMidX, y: rightMidY },
    { x: rightTopX, y: rightTopY },
  ];

  for (let i = 0; i < heartPoints.length; i++) {
    const p1 = heartPoints[i];
    const p2 = heartPoints[(i + 1) % heartPoints.length];

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const length = Math.hypot(dx, dy);
    const direction = length > 0 ? { x: dx / length, y: dy / length } : { x: 1, y: 0 };
    const normal = { x: -dy / length, y: dx / length };

    segments.push({
      index: i,
      type: 'custom',
      points: [p1, p2],
      direction,
      normal,
      bounds: {
        minX: Math.min(p1.x, p2.x),
        minY: Math.min(p1.y, p2.y),
        maxX: Math.max(p1.x, p2.x),
        maxY: Math.max(p1.y, p2.y),
      },
    });
  }

  return segments;
}

/**
 * Get edge segments for a gear shape (simplified)
 */
function getGearEdgeSegments(width: number, height: number): EdgeSegment[] {
  const segments: EdgeSegment[] = [];
  const centerX = width / 2;
  const centerY = height / 2;
  const outerRadius = Math.min(width, height) / 2;
  const innerRadius = outerRadius * 0.7;
  const teeth = 8;
  const angleStep = (Math.PI * 2) / teeth;

  // Generate gear outline points
  const gearPoints: Point[] = [];
  for (let i = 0; i < teeth; i++) {
    const angle = angleStep * i;
    const nextAngle = angleStep * (i + 1);

    // Inner point
    gearPoints.push({
      x: centerX + innerRadius * Math.cos(angle),
      y: centerY + innerRadius * Math.sin(angle),
    });

    // Outer tooth point 1
    const toothAngle1 = angle + angleStep * 0.4;
    gearPoints.push({
      x: centerX + outerRadius * Math.cos(toothAngle1),
      y: centerY + outerRadius * Math.sin(toothAngle1),
    });

    // Outer tooth point 2
    const toothAngle2 = angle + angleStep * 0.6;
    gearPoints.push({
      x: centerX + outerRadius * Math.cos(toothAngle2),
      y: centerY + outerRadius * Math.sin(toothAngle2),
    });
  }

  // Create segments from points
  for (let i = 0; i < gearPoints.length; i++) {
    const p1 = gearPoints[i];
    const p2 = gearPoints[(i + 1) % gearPoints.length];

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const length = Math.hypot(dx, dy);
    const direction = length > 0 ? { x: dx / length, y: dy / length } : { x: 1, y: 0 };
    const normal = { x: -dy / length, y: dx / length };

    segments.push({
      index: i,
      type: 'custom',
      points: [p1, p2],
      direction,
      normal,
      bounds: {
        minX: Math.min(p1.x, p2.x),
        minY: Math.min(p1.y, p2.y),
        maxX: Math.max(p1.x, p2.x),
        maxY: Math.max(p1.y, p2.y),
      },
    });
  }

  return segments;
}

/**
 * Get all edge segments for a shape
 */
export function getShapeEdgeSegments(
  shape: ShapeObj,
  zoom: number
): EdgeSegment[] {
  const documentDpi = 300; // Should match the DPI used in EditorCanvas
  const x = shape.x * documentDpi;
  const y = shape.y * documentDpi;
  const width = shape.width * documentDpi;
  const height = shape.height * documentDpi;

  switch (shape.shape) {
    case 'rectangle':
      return getRectangleEdgeSegments(x, y, width, height);

    case 'circle':
    case 'ellipse': {
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      const radiusX = width / 2;
      const radiusY = height / 2;
      return getCircleEdgeSegments(centerX, centerY, radiusX, radiusY);
    }

    case 'triangle': {
      const segments = getTriangleEdgeSegments(width, height);
      return segments.map((seg) => {
        const translatedPoints = seg.points.map((p) => ({
          x: x + p.x,
          y: y + p.y,
        }));
        return {
          ...seg,
          points: translatedPoints,
          bounds: {
            minX: Math.min(...translatedPoints.map((p) => p.x)),
            minY: Math.min(...translatedPoints.map((p) => p.y)),
            maxX: Math.max(...translatedPoints.map((p) => p.x)),
            maxY: Math.max(...translatedPoints.map((p) => p.y)),
          },
        };
      });
    }

    case 'star': {
      const segments = getStarEdgeSegments(width, height);
      return segments.map((seg) => {
        const translatedPoints = seg.points.map((p) => ({
          x: x + p.x,
          y: y + p.y,
        }));
        return {
          ...seg,
          points: translatedPoints,
          bounds: {
            minX: Math.min(...translatedPoints.map((p) => p.x)),
            minY: Math.min(...translatedPoints.map((p) => p.y)),
            maxX: Math.max(...translatedPoints.map((p) => p.x)),
            maxY: Math.max(...translatedPoints.map((p) => p.y)),
          },
        };
      });
    }

    case 'polygon': {
      const segments = getPolygonEdgeSegments(width, height);
      return segments.map((seg) => {
        const translatedPoints = seg.points.map((p) => ({
          x: x + p.x,
          y: y + p.y,
        }));
        return {
          ...seg,
          points: translatedPoints,
          bounds: {
            minX: Math.min(...translatedPoints.map((p) => p.x)),
            minY: Math.min(...translatedPoints.map((p) => p.y)),
            maxX: Math.max(...translatedPoints.map((p) => p.x)),
            maxY: Math.max(...translatedPoints.map((p) => p.y)),
          },
        };
      });
    }

    case 'arrow': {
      const segments = getArrowEdgeSegments(width, height);
      return segments.map((seg) => {
        const translatedPoints = seg.points.map((p) => ({
          x: x + p.x,
          y: y + p.y,
        }));
        return {
          ...seg,
          points: translatedPoints,
          bounds: {
            minX: Math.min(...translatedPoints.map((p) => p.x)),
            minY: Math.min(...translatedPoints.map((p) => p.y)),
            maxX: Math.max(...translatedPoints.map((p) => p.x)),
            maxY: Math.max(...translatedPoints.map((p) => p.y)),
          },
        };
      });
    }

    case 'line': {
      const segments = getLineEdgeSegments(width, height);
      return segments.map((seg) => {
        const translatedPoints = seg.points.map((p) => ({
          x: x + p.x,
          y: y + p.y,
        }));
        return {
          ...seg,
          points: translatedPoints,
          bounds: {
            minX: Math.min(...translatedPoints.map((p) => p.x)),
            minY: Math.min(...translatedPoints.map((p) => p.y)),
            maxX: Math.max(...translatedPoints.map((p) => p.x)),
            maxY: Math.max(...translatedPoints.map((p) => p.y)),
          },
        };
      });
    }

    case 'heart': {
      const segments = getHeartEdgeSegments(width, height);
      return segments.map((seg) => {
        const translatedPoints = seg.points.map((p) => ({
          x: x + p.x,
          y: y + p.y,
        }));
        return {
          ...seg,
          points: translatedPoints,
          bounds: {
            minX: Math.min(...translatedPoints.map((p) => p.x)),
            minY: Math.min(...translatedPoints.map((p) => p.y)),
            maxX: Math.max(...translatedPoints.map((p) => p.x)),
            maxY: Math.max(...translatedPoints.map((p) => p.y)),
          },
        };
      });
    }

    case 'gear': {
      const segments = getGearEdgeSegments(width, height);
      return segments.map((seg) => {
        const translatedPoints = seg.points.map((p) => ({
          x: x + p.x,
          y: y + p.y,
        }));
        return {
          ...seg,
          points: translatedPoints,
          bounds: {
            minX: Math.min(...translatedPoints.map((p) => p.x)),
            minY: Math.min(...translatedPoints.map((p) => p.y)),
            maxX: Math.max(...translatedPoints.map((p) => p.x)),
            maxY: Math.max(...translatedPoints.map((p) => p.y)),
          },
        };
      });
    }

    default:
      // Fallback to rectangle
      return getRectangleEdgeSegments(x, y, width, height);
  }
}

/**
 * Calculate the inner margin where resize interactions should be disabled.
 */
export function calculateResizeInteriorMargin(
  width: number,
  height: number,
  borderTolerance: number
): number {
  if (width <= 0 || height <= 0) {
    return 0;
  }
  const limitingDimension = Math.min(width, height);
  if (limitingDimension <= 0) {
    return 0;
  }
  const candidateMargin = limitingDimension / 4;
  return Math.max(0, Math.min(borderTolerance, candidateMargin));
}

/**
 * Determine if a point lies within the non-resizable interior region.
 */
export function isPointWithinResizeInterior(
  pointX: number,
  pointY: number,
  objX: number,
  objY: number,
  objWidth: number,
  objHeight: number,
  borderTolerance: number
): boolean {
  const interiorMargin = calculateResizeInteriorMargin(
    objWidth,
    objHeight,
    borderTolerance
  );

  if (interiorMargin <= 0) {
    return false;
  }

  return (
    pointX > objX + interiorMargin &&
    pointX < objX + objWidth - interiorMargin &&
    pointY > objY + interiorMargin &&
    pointY < objY + objHeight - interiorMargin
  );
}

/**
 * Find the closest edge segment to a point
 */
export function getClosestEdgeSegment(
  x: number,
  y: number,
  shape: ShapeObj,
  zoom: number,
  tolerance: number = 12
): EdgeSegment | null {
  const documentDpi = 300;
  const shapeX = shape.x * documentDpi;
  const shapeY = shape.y * documentDpi;
  const shapeWidth = shape.width * documentDpi;
  const shapeHeight = shape.height * documentDpi;
  const segments = getShapeEdgeSegments(shape, zoom);
  const baseHitPx = tolerance;
  const borderTolerance = baseHitPx / zoom;
  const interiorMargin = calculateResizeInteriorMargin(
    shapeWidth,
    shapeHeight,
    borderTolerance
  );
  const isInsideInterior = isPointWithinResizeInterior(
    x,
    y,
    shapeX,
    shapeY,
    shapeWidth,
    shapeHeight,
    borderTolerance
  );

  let closestSegment: EdgeSegment | null = null;
  let minDistance = Infinity;

  const point: Point = { x, y };

  // Check ALL segments without restrictive bounds filtering
  // This ensures the entire boundary is responsive
  for (const segment of segments) {
    // Always calculate distance - don't skip based on bounds
    // The distance calculation will handle checking if we're close enough
    if (segment.points.length >= 2) {
      // Calculate distance to the full segment
      const result = distanceToLineSegment(
        point,
        segment.points[0],
        segment.points[segment.points.length - 1]
      );

      // Check if within tolerance
      if (result.distance < borderTolerance && result.distance < minDistance) {
        minDistance = result.distance;
        closestSegment = segment;
      }
    }

    // Also check sub-segments if there are multiple points
    if (segment.points.length > 2) {
      for (let i = 0; i < segment.points.length - 1; i++) {
        const result = distanceToLineSegment(
          point,
          segment.points[i],
          segment.points[i + 1]
        );
        if (result.distance < borderTolerance && result.distance < minDistance) {
          minDistance = result.distance;
          closestSegment = segment;
        }
      }
    }
  }

  if (!closestSegment || minDistance > borderTolerance) {
    return null;
  }

  if (isInsideInterior && minDistance >= borderTolerance) {
    return null;
  }

  return closestSegment;
}

