/**
 * Shape scaling utilities for edge-based resizing
 */

import type { ShapeObj } from '../state/useEditorStore';
import type { EdgeSegment, Point } from './shapePathUtils';

interface PivotPoint {
  x: number;
  y: number;
}

/**
 * Calculate pivot point for scaling based on edge segment
 */
function getPivotPoint(shape: ShapeObj, edgeSegment: EdgeSegment): PivotPoint {
  const documentDpi = 300;
  const shapeCenterX = (shape.x + shape.width / 2) * documentDpi;
  const shapeCenterY = (shape.y + shape.height / 2) * documentDpi;

  // For edge segments, use the opposite edge or shape center as pivot
  // This allows the edge to move while maintaining shape structure
  return {
    x: shapeCenterX,
    y: shapeCenterY,
  };
}

/**
 * Scale rectangle shape
 */
export function scaleRectangle(
  shape: ShapeObj,
  scaleX: number,
  scaleY: number,
  pivot: PivotPoint
): Partial<ShapeObj> {
  const documentDpi = 300;
  const currentX = shape.x * documentDpi;
  const currentY = shape.y * documentDpi;
  const currentWidth = shape.width * documentDpi;
  const currentHeight = shape.height * documentDpi;

  // Calculate new dimensions
  const newWidth = currentWidth * scaleX;
  const newHeight = currentHeight * scaleY;

  // Calculate new position relative to pivot
  const newX = pivot.x - newWidth / 2 + (currentX + currentWidth / 2 - pivot.x) * scaleX;
  const newY = pivot.y - newHeight / 2 + (currentY + currentHeight / 2 - pivot.y) * scaleY;

  return {
    x: newX / documentDpi,
    y: newY / documentDpi,
    width: newWidth / documentDpi,
    height: newHeight / documentDpi,
  };
}

/**
 * Scale circle/ellipse shape
 */
export function scaleCircle(
  shape: ShapeObj,
  scaleX: number,
  scaleY: number,
  pivot: PivotPoint
): Partial<ShapeObj> {
  const documentDpi = 300;
  const currentX = shape.x * documentDpi;
  const currentY = shape.y * documentDpi;
  const currentWidth = shape.width * documentDpi;
  const currentHeight = shape.height * documentDpi;

  const newWidth = currentWidth * scaleX;
  const newHeight = currentHeight * scaleY;

  const newX = pivot.x - newWidth / 2 + (currentX + currentWidth / 2 - pivot.x) * scaleX;
  const newY = pivot.y - newHeight / 2 + (currentY + currentHeight / 2 - pivot.y) * scaleY;

  return {
    x: newX / documentDpi,
    y: newY / documentDpi,
    width: newWidth / documentDpi,
    height: newHeight / documentDpi,
  };
}

/**
 * Scale triangle shape based on edge segment
 */
export function scaleTriangle(
  shape: ShapeObj,
  edgeSegment: EdgeSegment,
  scaleFactor: number,
  pivot: PivotPoint
): Partial<ShapeObj> {
  const documentDpi = 300;
  const currentWidth = shape.width * documentDpi;
  const currentHeight = shape.height * documentDpi;

  // For triangles, scale uniformly based on edge direction
  const normal = edgeSegment.normal;
  const scaleX = normal.x !== 0 ? 1 + (scaleFactor - 1) * Math.abs(normal.x) : 1;
  const scaleY = normal.y !== 0 ? 1 + (scaleFactor - 1) * Math.abs(normal.y) : 1;

  const newWidth = currentWidth * scaleX;
  const newHeight = currentHeight * scaleY;

  const shapeCenterX = (shape.x + shape.width / 2) * documentDpi;
  const shapeCenterY = (shape.y + shape.height / 2) * documentDpi;

  const newX = pivot.x - newWidth / 2 + (shapeCenterX - pivot.x) * scaleX;
  const newY = pivot.y - newHeight / 2 + (shapeCenterY - pivot.y) * scaleY;

  return {
    x: newX / documentDpi,
    y: newY / documentDpi,
    width: newWidth / documentDpi,
    height: newHeight / documentDpi,
  };
}

/**
 * Scale star shape based on edge segment
 */
export function scaleStar(
  shape: ShapeObj,
  edgeSegment: EdgeSegment,
  scaleFactor: number,
  pivot: PivotPoint
): Partial<ShapeObj> {
  const documentDpi = 300;
  const currentWidth = shape.width * documentDpi;
  const currentHeight = shape.height * documentDpi;

  // Calculate scale based on edge normal direction
  const normal = edgeSegment.normal;
  const scaleX = normal.x !== 0 ? 1 + (scaleFactor - 1) * Math.abs(normal.x) : 1;
  const scaleY = normal.y !== 0 ? 1 + (scaleFactor - 1) * Math.abs(normal.y) : 1;

  const newWidth = currentWidth * scaleX;
  const newHeight = currentHeight * scaleY;

  const shapeCenterX = (shape.x + shape.width / 2) * documentDpi;
  const shapeCenterY = (shape.y + shape.height / 2) * documentDpi;

  const newX = pivot.x - newWidth / 2 + (shapeCenterX - pivot.x) * scaleX;
  const newY = pivot.y - newHeight / 2 + (shapeCenterY - pivot.y) * scaleY;

  return {
    x: newX / documentDpi,
    y: newY / documentDpi,
    width: newWidth / documentDpi,
    height: newHeight / documentDpi,
  };
}

/**
 * Scale polygon shape based on edge segment
 */
export function scalePolygon(
  shape: ShapeObj,
  edgeSegment: EdgeSegment,
  scaleFactor: number,
  pivot: PivotPoint
): Partial<ShapeObj> {
  const documentDpi = 300;
  const currentWidth = shape.width * documentDpi;
  const currentHeight = shape.height * documentDpi;

  const normal = edgeSegment.normal;
  const scaleX = normal.x !== 0 ? 1 + (scaleFactor - 1) * Math.abs(normal.x) : 1;
  const scaleY = normal.y !== 0 ? 1 + (scaleFactor - 1) * Math.abs(normal.y) : 1;

  const newWidth = currentWidth * scaleX;
  const newHeight = currentHeight * scaleY;

  const shapeCenterX = (shape.x + shape.width / 2) * documentDpi;
  const shapeCenterY = (shape.y + shape.height / 2) * documentDpi;

  const newX = pivot.x - newWidth / 2 + (shapeCenterX - pivot.x) * scaleX;
  const newY = pivot.y - newHeight / 2 + (shapeCenterY - pivot.y) * scaleY;

  return {
    x: newX / documentDpi,
    y: newY / documentDpi,
    width: newWidth / documentDpi,
    height: newHeight / documentDpi,
  };
}

/**
 * Scale arrow shape based on edge segment
 */
export function scaleArrow(
  shape: ShapeObj,
  edgeSegment: EdgeSegment,
  scaleFactor: number,
  pivot: PivotPoint
): Partial<ShapeObj> {
  const documentDpi = 300;
  const currentWidth = shape.width * documentDpi;
  const currentHeight = shape.height * documentDpi;

  const normal = edgeSegment.normal;
  const scaleX = normal.x !== 0 ? 1 + (scaleFactor - 1) * Math.abs(normal.x) : 1;
  const scaleY = normal.y !== 0 ? 1 + (scaleFactor - 1) * Math.abs(normal.y) : 1;

  const newWidth = currentWidth * scaleX;
  const newHeight = currentHeight * scaleY;

  const shapeCenterX = (shape.x + shape.width / 2) * documentDpi;
  const shapeCenterY = (shape.y + shape.height / 2) * documentDpi;

  const newX = pivot.x - newWidth / 2 + (shapeCenterX - pivot.x) * scaleX;
  const newY = pivot.y - newHeight / 2 + (shapeCenterY - pivot.y) * scaleY;

  return {
    x: newX / documentDpi,
    y: newY / documentDpi,
    width: newWidth / documentDpi,
    height: newHeight / documentDpi,
  };
}

/**
 * Scale heart shape based on edge segment
 */
export function scaleHeart(
  shape: ShapeObj,
  edgeSegment: EdgeSegment,
  scaleFactor: number,
  pivot: PivotPoint
): Partial<ShapeObj> {
  const documentDpi = 300;
  const currentWidth = shape.width * documentDpi;
  const currentHeight = shape.height * documentDpi;

  const normal = edgeSegment.normal;
  const scaleX = normal.x !== 0 ? 1 + (scaleFactor - 1) * Math.abs(normal.x) : 1;
  const scaleY = normal.y !== 0 ? 1 + (scaleFactor - 1) * Math.abs(normal.y) : 1;

  const newWidth = currentWidth * scaleX;
  const newHeight = currentHeight * scaleY;

  const shapeCenterX = (shape.x + shape.width / 2) * documentDpi;
  const shapeCenterY = (shape.y + shape.height / 2) * documentDpi;

  const newX = pivot.x - newWidth / 2 + (shapeCenterX - pivot.x) * scaleX;
  const newY = pivot.y - newHeight / 2 + (shapeCenterY - pivot.y) * scaleY;

  return {
    x: newX / documentDpi,
    y: newY / documentDpi,
    width: newWidth / documentDpi,
    height: newHeight / documentDpi,
  };
}

/**
 * Scale gear shape based on edge segment
 */
export function scaleGear(
  shape: ShapeObj,
  edgeSegment: EdgeSegment,
  scaleFactor: number,
  pivot: PivotPoint
): Partial<ShapeObj> {
  const documentDpi = 300;
  const currentWidth = shape.width * documentDpi;
  const currentHeight = shape.height * documentDpi;

  const normal = edgeSegment.normal;
  const scaleX = normal.x !== 0 ? 1 + (scaleFactor - 1) * Math.abs(normal.x) : 1;
  const scaleY = normal.y !== 0 ? 1 + (scaleFactor - 1) * Math.abs(normal.y) : 1;

  const newWidth = currentWidth * scaleX;
  const newHeight = currentHeight * scaleY;

  const shapeCenterX = (shape.x + shape.width / 2) * documentDpi;
  const shapeCenterY = (shape.y + shape.height / 2) * documentDpi;

  const newX = pivot.x - newWidth / 2 + (shapeCenterX - pivot.x) * scaleX;
  const newY = pivot.y - newHeight / 2 + (shapeCenterY - pivot.y) * scaleY;

  return {
    x: newX / documentDpi,
    y: newY / documentDpi,
    width: newWidth / documentDpi,
    height: newHeight / documentDpi,
  };
}

/**
 * Scale line shape based on edge segment
 */
export function scaleLine(
  shape: ShapeObj,
  edgeSegment: EdgeSegment,
  scaleFactor: number,
  pivot: PivotPoint
): Partial<ShapeObj> {
  const documentDpi = 300;
  const currentWidth = shape.width * documentDpi;
  const currentHeight = shape.height * documentDpi;

  const normal = edgeSegment.normal;
  const scaleX = normal.x !== 0 ? 1 + (scaleFactor - 1) * Math.abs(normal.x) : 1;
  const scaleY = normal.y !== 0 ? 1 + (scaleFactor - 1) * Math.abs(normal.y) : 1;

  const newWidth = currentWidth * scaleX;
  const newHeight = currentHeight * scaleY;

  const shapeCenterX = (shape.x + shape.width / 2) * documentDpi;
  const shapeCenterY = (shape.y + shape.height / 2) * documentDpi;

  const newX = pivot.x - newWidth / 2 + (shapeCenterX - pivot.x) * scaleX;
  const newY = pivot.y - newHeight / 2 + (shapeCenterY - pivot.y) * scaleY;

  return {
    x: newX / documentDpi,
    y: newY / documentDpi,
    width: newWidth / documentDpi,
    height: newHeight / documentDpi,
  };
}

/**
 * Main scaling function that routes to shape-specific scalers
 */
export function scaleShape(
  shape: ShapeObj,
  edgeSegment: EdgeSegment,
  scaleFactor: number,
  pivot: PivotPoint
): Partial<ShapeObj> {
  switch (shape.shape) {
    case 'rectangle':
      // For rectangles, use more precise scaling based on edge type
      const normal = edgeSegment.normal;
      const scaleX = normal.x !== 0 ? 1 + (scaleFactor - 1) * Math.abs(normal.x) : 1;
      const scaleY = normal.y !== 0 ? 1 + (scaleFactor - 1) * Math.abs(normal.y) : 1;
      return scaleRectangle(shape, scaleX, scaleY, pivot);

    case 'circle':
    case 'ellipse':
      const normalCircle = edgeSegment.normal;
      const scaleXCircle = normalCircle.x !== 0 ? 1 + (scaleFactor - 1) * Math.abs(normalCircle.x) : 1;
      const scaleYCircle = normalCircle.y !== 0 ? 1 + (scaleFactor - 1) * Math.abs(normalCircle.y) : 1;
      return scaleCircle(shape, scaleXCircle, scaleYCircle, pivot);

    case 'triangle':
      return scaleTriangle(shape, edgeSegment, scaleFactor, pivot);

    case 'star':
      return scaleStar(shape, edgeSegment, scaleFactor, pivot);

    case 'polygon':
      return scalePolygon(shape, edgeSegment, scaleFactor, pivot);

    case 'arrow':
      return scaleArrow(shape, edgeSegment, scaleFactor, pivot);

    case 'line':
      return scaleLine(shape, edgeSegment, scaleFactor, pivot);

    case 'heart':
      return scaleHeart(shape, edgeSegment, scaleFactor, pivot);

    case 'gear':
      return scaleGear(shape, edgeSegment, scaleFactor, pivot);

    default:
      // Fallback to rectangle scaling
      const normalDefault = edgeSegment.normal;
      const scaleXDefault = normalDefault.x !== 0 ? 1 + (scaleFactor - 1) * Math.abs(normalDefault.x) : 1;
      const scaleYDefault = normalDefault.y !== 0 ? 1 + (scaleFactor - 1) * Math.abs(normalDefault.y) : 1;
      return scaleRectangle(shape, scaleXDefault, scaleYDefault, pivot);
  }
}

