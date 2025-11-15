/**
 * Object Virtualization System
 * Only renders objects visible in the current viewport
 * Improves performance for designs with hundreds/thousands of objects
 */

import { Obj } from '../state/useEditorStore';

export interface Viewport {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
}

export interface VirtualizationConfig {
  enabled: boolean;
  bufferZone: number; // Extra area around viewport to pre-render (in pixels)
  maxObjectsToRender: number; // Maximum objects to render at once
}

export const DEFAULT_VIRTUALIZATION_CONFIG: VirtualizationConfig = {
  enabled: true,
  bufferZone: 200, // 200px buffer zone
  maxObjectsToRender: 1000, // Render up to 1000 objects
};

/**
 * Check if an object is visible in the viewport
 */
export function isObjectVisible(
  obj: Obj,
  viewport: Viewport,
  buffer: number = 0
): boolean {
  // Calculate object bounds
  const objLeft = obj.x;
  const objTop = obj.y;
  const objRight = obj.x + obj.width;
  const objBottom = obj.y + obj.height;

  // Calculate viewport bounds with buffer
  const viewLeft = viewport.x - buffer;
  const viewTop = viewport.y - buffer;
  const viewRight = viewport.x + viewport.width + buffer;
  const viewBottom = viewport.y + viewport.height + buffer;

  // Check if object intersects with viewport
  return !(
    objRight < viewLeft ||
    objLeft > viewRight ||
    objBottom < viewTop ||
    objTop > viewBottom
  );
}

/**
 * Filter objects to only those visible in viewport
 */
export function getVisibleObjects(
  objects: Obj[],
  viewport: Viewport,
  config: VirtualizationConfig = DEFAULT_VIRTUALIZATION_CONFIG
): Obj[] {
  if (!config.enabled) {
    return objects;
  }

  // Filter visible objects
  const visibleObjects = objects.filter(obj => 
    isObjectVisible(obj, viewport, config.bufferZone)
  );

  // Limit to max objects
  if (visibleObjects.length > config.maxObjectsToRender) {
    // Sort by z-index and return top objects
    return visibleObjects
      .sort((a, b) => a.zIndex - b.zIndex)
      .slice(0, config.maxObjectsToRender);
  }

  return visibleObjects;
}

/**
 * Calculate optimal buffer zone based on zoom level
 */
export function calculateOptimalBufferZone(zoom: number): number {
  // Smaller buffer for higher zoom (more detail)
  // Larger buffer for lower zoom (more objects visible)
  if (zoom > 2) return 100;
  if (zoom > 1) return 200;
  if (zoom > 0.5) return 300;
  return 400;
}

/**
 * Group nearby objects for batch rendering
 */
export function groupObjectsForRendering(
  objects: Obj[],
  viewport: Viewport,
  gridSize: number = 500
): Map<string, Obj[]> {
  const groups = new Map<string, Obj[]>();

  objects.forEach(obj => {
    // Calculate grid cell
    const gridX = Math.floor(obj.x / gridSize);
    const gridY = Math.floor(obj.y / gridSize);
    const key = `${gridX},${gridY}`;

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key)!.push(obj);
  });

  return groups;
}

/**
 * Performance metrics for virtualization
 */
export class VirtualizationMetrics {
  totalObjects: number = 0;
  visibleObjects: number = 0;
  culledObjects: number = 0;
  renderTime: number = 0;

  update(total: number, visible: number, renderTime: number) {
    this.totalObjects = total;
    this.visibleObjects = visible;
    this.culledObjects = total - visible;
    this.renderTime = renderTime;
  }

  getCullingRatio(): number {
    if (this.totalObjects === 0) return 0;
    return (this.culledObjects / this.totalObjects) * 100;
  }

  getPerformanceGain(): string {
    const ratio = this.getCullingRatio();
    if (ratio > 80) return 'Excellent';
    if (ratio > 60) return 'Good';
    if (ratio > 40) return 'Fair';
    return 'Low';
  }
}

export const virtualizationMetrics = new VirtualizationMetrics();

