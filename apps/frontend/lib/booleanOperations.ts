/**
 * Boolean operations for shape combination
 * 
 * Note: This is a simplified implementation for demonstration.
 * For production use, integrate a proper path library like:
 * - paper.js (https://www.npmjs.com/package/paper)
 * - clipper-lib (https://www.npmjs.com/package/clipper-lib)
 * - @flatten-js/boolean-op (https://www.npmjs.com/package/@flatten-js/boolean-op)
 */

import { PathObj, ShapeObj } from '../state/useEditorStore';
import { Point, pointsToPath } from './shapes';

export type BooleanOperation = 'union' | 'subtract' | 'intersect' | 'exclude';

/**
 * Parse SVG path data to extract points
 * This is a simplified parser - in production use a proper SVG path parser
 */
function parsePathToPoints(pathData: string): Point[] {
  const points: Point[] = [];
  const commands = pathData.match(/[MLCQZmlcqz][^MLCQZmlcqz]*/g);
  
  if (!commands) return points;
  
  commands.forEach((command) => {
    const type = command[0].toUpperCase();
    const coords = command.slice(1).trim().split(/[\s,]+/).map(parseFloat);
    
    if (type === 'M' || type === 'L') {
      points.push({ x: coords[0], y: coords[1] });
    } else if (type === 'C') {
      // For cubic bezier, take the end point
      points.push({ x: coords[4], y: coords[5] });
    } else if (type === 'Q') {
      // For quadratic bezier, take the end point
      points.push({ x: coords[2], y: coords[3] });
    }
  });
  
  return points;
}

/**
 * Convert shape to path representation
 */
function shapeToPath(shape: ShapeObj): string {
  const { x, y, width, height, shape: shapeType } = shape;
  
  switch (shapeType) {
    case 'rectangle': {
      const points: Point[] = [
        { x, y },
        { x: x + width, y },
        { x: x + width, y: y + height },
        { x, y: y + height },
      ];
      return pointsToPath(points, true);
    }
    
    case 'circle':
    case 'ellipse': {
      const cx = x + width / 2;
      const cy = y + height / 2;
      const rx = width / 2;
      const ry = height / 2;
      
      // Approximate circle/ellipse with bezier curves
      const k = 0.5522848; // Magic number for circle approximation
      return `
        M ${cx - rx} ${cy}
        C ${cx - rx} ${cy - ry * k}, ${cx - rx * k} ${cy - ry}, ${cx} ${cy - ry}
        C ${cx + rx * k} ${cy - ry}, ${cx + rx} ${cy - ry * k}, ${cx + rx} ${cy}
        C ${cx + rx} ${cy + ry * k}, ${cx + rx * k} ${cy + ry}, ${cx} ${cy + ry}
        C ${cx - rx * k} ${cy + ry}, ${cx - rx} ${cy + ry * k}, ${cx - rx} ${cy}
        Z
      `;
    }
    
    case 'line': {
      return `M ${x} ${y} L ${x + width} ${y + height}`;
    }
    
    case 'polygon':
    case 'star': {
      // If the shape has custom points, use them
      if (shape.points && shape.points.length > 0) {
        return pointsToPath(shape.points, true);
      }
      // Otherwise, fallback to a simple square
      return shapeToPath({ ...shape, shape: 'rectangle' });
    }
    
    default:
      return '';
  }
}

/**
 * Simplified union operation
 * For production, use a proper path library
 */
function unionPaths(path1: Point[], path2: Point[]): Point[] {
  // Simplified: Just return the outline of both shapes
  // In production, use proper boolean path operations
  return [...path1, ...path2];
}

/**
 * Simplified subtraction operation
 * For production, use a proper path library
 */
function subtractPaths(path1: Point[], path2: Point[]): Point[] {
  // Simplified: Just return path1
  // In production, use proper boolean path operations
  return path1.filter(p1 => !path2.some(p2 => 
    Math.abs(p1.x - p2.x) < 0.1 && Math.abs(p1.y - p2.y) < 0.1
  ));
}

/**
 * Simplified intersection operation
 * For production, use a proper path library
 */
function intersectPaths(path1: Point[], path2: Point[]): Point[] {
  // Simplified: Return overlapping points
  // In production, use proper boolean path operations
  return path1.filter(p1 => path2.some(p2 => 
    Math.abs(p1.x - p2.x) < 0.1 && Math.abs(p1.y - p2.y) < 0.1
  ));
}

/**
 * Simplified exclusion operation (XOR)
 * For production, use a proper path library
 */
function excludePaths(path1: Point[], path2: Point[]): Point[] {
  // Simplified: Return non-overlapping points
  // In production, use proper boolean path operations
  const intersection = intersectPaths(path1, path2);
  return [
    ...path1.filter(p1 => !intersection.some(p2 => 
      Math.abs(p1.x - p2.x) < 0.1 && Math.abs(p1.y - p2.y) < 0.1
    )),
    ...path2.filter(p1 => !intersection.some(p2 => 
      Math.abs(p1.x - p2.x) < 0.1 && Math.abs(p1.y - p2.y) < 0.1
    )),
  ];
}

/**
 * Perform boolean operation on two shapes
 * 
 * @param shape1 First shape or path
 * @param shape2 Second shape or path
 * @param operation Boolean operation to perform
 * @returns New path object with the result
 */
export function performBooleanOperation(
  shape1: ShapeObj | PathObj,
  shape2: ShapeObj | PathObj,
  operation: BooleanOperation
): PathObj {
  // Convert shapes to path data
  const path1Data = shape1.type === 'path' ? shape1.pathData : shapeToPath(shape1);
  const path2Data = shape2.type === 'path' ? shape2.pathData : shapeToPath(shape2);
  
  // Parse paths to points
  const points1 = parsePathToPoints(path1Data);
  const points2 = parsePathToPoints(path2Data);
  
  // Perform boolean operation
  let resultPoints: Point[];
  switch (operation) {
    case 'union':
      resultPoints = unionPaths(points1, points2);
      break;
    case 'subtract':
      resultPoints = subtractPaths(points1, points2);
      break;
    case 'intersect':
      resultPoints = intersectPaths(points1, points2);
      break;
    case 'exclude':
      resultPoints = excludePaths(points1, points2);
      break;
    default:
      resultPoints = points1;
  }
  
  // Convert result points back to path data
  const resultPathData = pointsToPath(resultPoints, true);
  
  // Calculate bounding box
  const xs = resultPoints.map(p => p.x);
  const ys = resultPoints.map(p => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  
  // Create new path object
  return {
    id: `path-${Date.now()}`,
    type: 'path',
    pathData: resultPathData,
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    name: `${operation} result`,
    zIndex: Date.now(),
    fill: shape1.fill || {
      type: 'solid',
      color: '#6F1414',
    },
    stroke: shape1.stroke || {
      width: 1,
      color: '#5A1010',
      style: 'solid',
      cap: 'butt',
      join: 'miter',
    },
  };
}

/**
 * Check if two shapes are compatible for boolean operations
 */
export function areShapesCompatible(
  shape1: ShapeObj | PathObj,
  shape2: ShapeObj | PathObj
): boolean {
  // Both shapes should be either shapes or paths
  return (
    (shape1.type === 'shape' || shape1.type === 'path') &&
    (shape2.type === 'shape' || shape2.type === 'path')
  );
}

/**
 * Get available boolean operations for selected shapes
 */
export function getAvailableOperations(
  shapes: (ShapeObj | PathObj)[]
): BooleanOperation[] {
  if (shapes.length < 2) return [];
  
  // Check if all shapes are compatible
  const allCompatible = shapes.every((shape, index) => {
    if (index === 0) return true;
    return areShapesCompatible(shapes[0], shape);
  });
  
  if (!allCompatible) return [];
  
  return ['union', 'subtract', 'intersect', 'exclude'];
}

/**
 * Instructions for upgrading to a proper boolean operations library:
 * 
 * 1. Install a library:
 *    npm install paper
 *    or
 *    npm install clipper-lib
 *    or
 *    npm install @flatten-js/boolean-op
 * 
 * 2. Replace the simplified implementations above with proper library calls:
 * 
 *    Using paper.js:
 *    ```typescript
 *    import paper from 'paper';
 *    
 *    function performBooleanOperation(shape1, shape2, operation) {
 *      const path1 = new paper.Path(shape1.pathData);
 *      const path2 = new paper.Path(shape2.pathData);
 *      
 *      let result;
 *      switch (operation) {
 *        case 'union':
 *          result = path1.unite(path2);
 *          break;
 *        case 'subtract':
 *          result = path1.subtract(path2);
 *          break;
 *        case 'intersect':
 *          result = path1.intersect(path2);
 *          break;
 *        case 'exclude':
 *          result = path1.exclude(path2);
 *          break;
 *      }
 *      
 *      return result.pathData;
 *    }
 *    ```
 * 
 * 3. Update the performBooleanOperation function to use the library
 */

