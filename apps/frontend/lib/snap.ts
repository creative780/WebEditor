/**
 * Snapping utilities for precise design alignment
 * Handles grid, guides, and object edge snapping
 */

export interface SnapPoint {
  x: number;
  y: number;
  type: 'grid' | 'guide' | 'object' | 'center';
  tolerance: number;
}

export interface SnapResult {
  x: number;
  y: number;
  snapped: boolean;
  snapPoints: SnapPoint[];
}

export interface GridConfig {
  enabled: boolean;
  size: number;
  subdivisions: number;
  color: string;
  opacity: number;
  tolerance: number;
}

export interface GuideConfig {
  enabled: boolean;
  tolerance: number;
  color: string;
}

export interface SnapConfig {
  enabled: boolean;
  tolerance: number;
  grid: GridConfig;
  guides: GuideConfig;
  objects: {
    enabled: boolean;
    tolerance: number;
    edges: boolean;
    centers: boolean;
  };
}

const DEFAULT_SNAP_CONFIG: SnapConfig = {
  enabled: true,
  tolerance: 4,
  grid: {
    enabled: true,
    size: 8,
    subdivisions: 4,
    color: '#e5e7eb',
    opacity: 0.5,
    tolerance: 4,
  },
  guides: {
    enabled: true,
    tolerance: 4,
    color: '#3b82f6',
  },
  objects: {
    enabled: true,
    tolerance: 4,
    edges: true,
    centers: true,
  },
};

/**
 * Calculate snap points for grid
 */
export function getGridSnapPoints(
  x: number,
  y: number,
  config: GridConfig,
  zoom: number = 1
): SnapPoint[] {
  if (!config.enabled) return [];

  const points: SnapPoint[] = [];
  const gridSize = config.size * zoom;
  const subdivisionSize = gridSize / config.subdivisions;

  // Main grid points
  const gridX = Math.round(x / gridSize) * gridSize;
  const gridY = Math.round(y / gridSize) * gridSize;

  points.push({
    x: gridX,
    y: gridY,
    type: 'grid',
    tolerance: config.size * zoom,
  });

  // Subdivision points
  for (let i = 1; i < config.subdivisions; i++) {
    const subX = gridX + (i * subdivisionSize);
    const subY = gridY + (i * subdivisionSize);

    if (Math.abs(x - subX) <= config.tolerance) {
      points.push({
        x: subX,
        y,
        type: 'grid',
        tolerance: config.tolerance,
      });
    }

    if (Math.abs(y - subY) <= config.tolerance) {
      points.push({
        x,
        y: subY,
        type: 'grid',
        tolerance: config.tolerance,
      });
    }
  }

  return points;
}

/**
 * Calculate snap points for guides
 */
export function getGuideSnapPoints(
  x: number,
  y: number,
  guides: { x: number[]; y: number[] },
  config: GuideConfig,
  zoom: number = 1
): SnapPoint[] {
  if (!config.enabled) return [];

  const points: SnapPoint[] = [];

  // Vertical guides (x-axis)
  guides.x.forEach(guideX => {
    const scaledX = guideX * zoom;
    if (Math.abs(x - scaledX) <= config.tolerance) {
      points.push({
        x: scaledX,
        y,
        type: 'guide',
        tolerance: config.tolerance,
      });
    }
  });

  // Horizontal guides (y-axis)
  guides.y.forEach(guideY => {
    const scaledY = guideY * zoom;
    if (Math.abs(y - scaledY) <= config.tolerance) {
      points.push({
        x,
        y: scaledY,
        type: 'guide',
        tolerance: config.tolerance,
      });
    }
  });

  return points;
}

/**
 * Calculate snap points for object edges and centers
 */
export function getObjectSnapPoints(
  x: number,
  y: number,
  objects: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>,
  excludeId: string,
  config: SnapConfig['objects'],
  zoom: number = 1
): SnapPoint[] {
  if (!config.enabled) return [];

  const points: SnapPoint[] = [];

  objects
    .filter(obj => obj.id !== excludeId)
    .forEach(obj => {
      const scaledX = obj.x * zoom;
      const scaledY = obj.y * zoom;
      const scaledWidth = obj.width * zoom;
      const scaledHeight = obj.height * zoom;

      // Object edges
      if (config.edges) {
        const edges = [
          { x: scaledX, y }, // Left edge
          { x: scaledX + scaledWidth, y }, // Right edge
          { x, y: scaledY }, // Top edge
          { x, y: scaledY + scaledHeight }, // Bottom edge
        ];

        edges.forEach(edge => {
          if (
            Math.abs(x - edge.x) <= config.tolerance ||
            Math.abs(y - edge.y) <= config.tolerance
          ) {
            points.push({
              x: edge.x,
              y: edge.y,
              type: 'object',
              tolerance: config.tolerance,
            });
          }
        });
      }

      // Object centers
      if (config.centers) {
        const centerX = scaledX + scaledWidth / 2;
        const centerY = scaledY + scaledHeight / 2;

        if (Math.abs(x - centerX) <= config.tolerance) {
          points.push({
            x: centerX,
            y,
            type: 'object',
            tolerance: config.tolerance,
          });
        }

        if (Math.abs(y - centerY) <= config.tolerance) {
          points.push({
            x,
            y: centerY,
            type: 'object',
            tolerance: config.tolerance,
          });
        }
      }
    });

  return points;
}

/**
 * Find the best snap point for given coordinates
 */
export function findSnapPoint(
  x: number,
  y: number,
  snapPoints: SnapPoint[]
): SnapPoint | null {
  if (snapPoints.length === 0) return null;

  let bestSnap: SnapPoint | null = null;
  let bestDistance = Infinity;

  snapPoints.forEach(point => {
    const distance = Math.sqrt(
      Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2)
    );

    if (distance <= point.tolerance && distance < bestDistance) {
      bestSnap = point;
      bestDistance = distance;
    }
  });

  return bestSnap;
}

/**
 * Apply snapping to coordinates
 */
export function applySnapping(
  x: number,
  y: number,
  config: SnapConfig,
  guides: { x: number[]; y: number[] },
  objects: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>,
  excludeId?: string,
  zoom: number = 1
): SnapResult {
  if (!config.enabled) {
    return { x, y, snapped: false, snapPoints: [] };
  }

  const snapPoints: SnapPoint[] = [];

  // Collect all snap points
  snapPoints.push(...getGridSnapPoints(x, y, config.grid, zoom));
  snapPoints.push(...getGuideSnapPoints(x, y, guides, config.guides, zoom));
  
  if (excludeId) {
    snapPoints.push(...getObjectSnapPoints(x, y, objects, excludeId, config.objects, zoom));
  }

  // Find the best snap point
  const snapPoint = findSnapPoint(x, y, snapPoints);

  if (snapPoint) {
    return {
      x: snapPoint.x,
      y: snapPoint.y,
      snapped: true,
      snapPoints: [snapPoint],
    };
  }

  return { x, y, snapped: false, snapPoints };
}

/**
 * Create a guide from ruler drag
 */
export function createGuideFromRuler(
  position: number,
  axis: 'x' | 'y',
  guides: { x: number[]; y: number[] }
): { x: number[]; y: number[] } {
  const newGuides = { ...guides };

  if (axis === 'x') {
    if (!newGuides.x.includes(position)) {
      newGuides.x.push(position);
      newGuides.x.sort((a, b) => a - b);
    }
  } else {
    if (!newGuides.y.includes(position)) {
      newGuides.y.push(position);
      newGuides.y.sort((a, b) => a - b);
    }
  }

  return newGuides;
}

/**
 * Remove a guide
 */
export function removeGuide(
  position: number,
  axis: 'x' | 'y',
  guides: { x: number[]; y: number[] }
): { x: number[]; y: number[] } {
  const newGuides = { ...guides };

  if (axis === 'x') {
    newGuides.x = newGuides.x.filter(g => g !== position);
  } else {
    newGuides.y = newGuides.y.filter(g => g !== position);
  }

  return newGuides;
}

/**
 * Check if position is near a guide
 */
export function isNearGuide(
  position: number,
  axis: 'x' | 'y',
  guides: { x: number[]; y: number[] },
  tolerance: number = 4
): { near: boolean; guidePosition?: number } {
  const guidePositions = axis === 'x' ? guides.x : guides.y;
  
  for (const guidePos of guidePositions) {
    if (Math.abs(position - guidePos) <= tolerance) {
      return { near: true, guidePosition: guidePos };
    }
  }

  return { near: false };
}

export { DEFAULT_SNAP_CONFIG };
