/**
 * Shape utility functions for generating and manipulating shapes
 */

export interface Point {
  x: number;
  y: number;
}

export interface ShapeConfig {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

/**
 * Generate points for a regular polygon
 * @param sides Number of sides
 * @param config Shape configuration
 * @returns Array of points
 */
export function generatePolygonPoints(
  sides: number,
  config: ShapeConfig
): Point[] {
  const points: Point[] = [];
  const radius = Math.min(config.width, config.height) / 2;
  const angleStep = (Math.PI * 2) / sides;
  const startAngle = -Math.PI / 2; // Start from top

  for (let i = 0; i < sides; i++) {
    const angle = startAngle + angleStep * i;
    points.push({
      x: config.centerX + radius * Math.cos(angle),
      y: config.centerY + radius * Math.sin(angle),
    });
  }

  return points;
}

/**
 * Generate points for a star shape
 * @param points Number of points on the star
 * @param innerRadius Inner radius ratio (0-1)
 * @param config Shape configuration
 * @returns Array of points
 */
export function generateStarPoints(
  points: number,
  innerRadius: number,
  config: ShapeConfig
): Point[] {
  const starPoints: Point[] = [];
  const outerRadius = Math.min(config.width, config.height) / 2;
  const innerRad = outerRadius * innerRadius;
  const angleStep = Math.PI / points;
  const startAngle = -Math.PI / 2;

  for (let i = 0; i < points * 2; i++) {
    const angle = startAngle + angleStep * i;
    const radius = i % 2 === 0 ? outerRadius : innerRad;
    starPoints.push({
      x: config.centerX + radius * Math.cos(angle),
      y: config.centerY + radius * Math.sin(angle),
    });
  }

  return starPoints;
}

/**
 * Arrow styles
 */
export type ArrowStyle = 'simple' | 'double' | 'curved' | 'block';

/**
 * Generate path data for an arrow
 * @param style Arrow style
 * @param config Shape configuration
 * @returns SVG path data
 */
export function generateArrowPath(
  style: ArrowStyle,
  config: ShapeConfig
): string {
  const { width, height, centerX, centerY } = config;
  const startX = centerX - width / 2;
  const endX = centerX + width / 2;
  const midY = centerY;
  const arrowWidth = height * 0.3;
  const headWidth = height;
  const headLength = Math.min(width * 0.3, height);

  switch (style) {
    case 'simple':
      // Simple arrow: line with triangular head
      return `
        M ${startX} ${midY}
        L ${endX - headLength} ${midY}
        L ${endX - headLength} ${midY - headWidth / 2}
        L ${endX} ${midY}
        L ${endX - headLength} ${midY + headWidth / 2}
        L ${endX - headLength} ${midY}
        Z
      `;

    case 'double':
      // Double-headed arrow
      return `
        M ${startX} ${midY}
        L ${startX + headLength} ${midY - headWidth / 2}
        L ${startX + headLength} ${midY - arrowWidth / 2}
        L ${endX - headLength} ${midY - arrowWidth / 2}
        L ${endX - headLength} ${midY - headWidth / 2}
        L ${endX} ${midY}
        L ${endX - headLength} ${midY + headWidth / 2}
        L ${endX - headLength} ${midY + arrowWidth / 2}
        L ${startX + headLength} ${midY + arrowWidth / 2}
        L ${startX + headLength} ${midY + headWidth / 2}
        Z
      `;

    case 'curved':
      // Curved arrow
      const controlY = midY - height * 0.5;
      return `
        M ${startX} ${midY}
        Q ${centerX} ${controlY} ${endX - headLength} ${midY}
        L ${endX - headLength} ${midY - headWidth / 2}
        L ${endX} ${midY}
        L ${endX - headLength} ${midY + headWidth / 2}
        L ${endX - headLength} ${midY}
        Z
      `;

    case 'block':
      // Block arrow (thick arrow)
      return `
        M ${startX} ${midY - arrowWidth / 2}
        L ${endX - headLength} ${midY - arrowWidth / 2}
        L ${endX - headLength} ${midY - headWidth / 2}
        L ${endX} ${midY}
        L ${endX - headLength} ${midY + headWidth / 2}
        L ${endX - headLength} ${midY + arrowWidth / 2}
        L ${startX} ${midY + arrowWidth / 2}
        Z
      `;

    default:
      return generateArrowPath('simple', config);
  }
}

/**
 * Callout styles
 */
export type CalloutStyle = 'rounded' | 'sharp' | 'cloud' | 'speech';

/**
 * Generate path data for a callout/annotation
 * @param style Callout style
 * @param config Shape configuration
 * @param tailPosition Position of the tail (0-1, relative to bottom)
 * @returns SVG path data
 */
export function generateCalloutPath(
  style: CalloutStyle,
  config: ShapeConfig,
  tailPosition: number = 0.5
): string {
  const { width, height, centerX, centerY } = config;
  const left = centerX - width / 2;
  const right = centerX + width / 2;
  const top = centerY - height / 2;
  const bottom = centerY + height / 2;
  const tailHeight = height * 0.3;
  const tailWidth = width * 0.15;
  const tailX = left + width * tailPosition;

  switch (style) {
    case 'rounded':
      const radius = Math.min(width, height) * 0.1;
      return `
        M ${left + radius} ${top}
        L ${right - radius} ${top}
        Q ${right} ${top} ${right} ${top + radius}
        L ${right} ${bottom - radius}
        Q ${right} ${bottom} ${right - radius} ${bottom}
        L ${tailX + tailWidth} ${bottom}
        L ${tailX} ${bottom + tailHeight}
        L ${tailX - tailWidth} ${bottom}
        L ${left + radius} ${bottom}
        Q ${left} ${bottom} ${left} ${bottom - radius}
        L ${left} ${top + radius}
        Q ${left} ${top} ${left + radius} ${top}
        Z
      `;

    case 'sharp':
      return `
        M ${left} ${top}
        L ${right} ${top}
        L ${right} ${bottom}
        L ${tailX + tailWidth} ${bottom}
        L ${tailX} ${bottom + tailHeight}
        L ${tailX - tailWidth} ${bottom}
        L ${left} ${bottom}
        Z
      `;

    case 'cloud':
      // Cloud-like callout with multiple rounded bubbles
      const bubbles = 8;
      const bubbleRadius = Math.min(width, height) * 0.15;
      let path = '';
      for (let i = 0; i <= bubbles; i++) {
        const angle = (i / bubbles) * Math.PI * 2 - Math.PI / 2;
        const x = centerX + (width / 2 - bubbleRadius) * Math.cos(angle);
        const y = centerY + (height / 2 - bubbleRadius) * Math.sin(angle);
        if (i === 0) {
          path += `M ${x + bubbleRadius} ${y}`;
        }
        path += ` Q ${x + bubbleRadius * 1.5} ${y} ${
          centerX + (width / 2 - bubbleRadius) * Math.cos(angle + Math.PI / bubbles / 2)
        } ${
          centerY + (height / 2 - bubbleRadius) * Math.sin(angle + Math.PI / bubbles / 2)
        }`;
      }
      // Add tail
      path += `
        L ${tailX + tailWidth} ${bottom}
        L ${tailX} ${bottom + tailHeight}
        L ${tailX - tailWidth} ${bottom}
        Z
      `;
      return path;

    case 'speech':
      // Speech bubble style
      const cornerRadius = Math.min(width, height) * 0.15;
      return `
        M ${left + cornerRadius} ${top}
        L ${right - cornerRadius} ${top}
        Q ${right} ${top} ${right} ${top + cornerRadius}
        L ${right} ${bottom - cornerRadius}
        Q ${right} ${bottom} ${right - cornerRadius} ${bottom}
        L ${tailX + tailWidth * 2} ${bottom}
        L ${tailX} ${bottom + tailHeight}
        L ${tailX - tailWidth} ${bottom}
        L ${left + cornerRadius} ${bottom}
        Q ${left} ${bottom} ${left} ${bottom - cornerRadius}
        L ${left} ${top + cornerRadius}
        Q ${left} ${top} ${left + cornerRadius} ${top}
        Z
      `;

    default:
      return generateCalloutPath('rounded', config, tailPosition);
  }
}

/**
 * Generate path data for a smooth, classic heart shape
 * Uses smooth bezier curves to create a clean, vector-quality heart
 */
export function generateHeartPath(config: ShapeConfig): string {
  const { width, height, centerX, centerY } = config;
  
  // Normalize coordinates to start from (0,0) at shape's top-left
  // Then center within the shape bounds
  const x = centerX - width / 2;
  const y = centerY - height / 2;
  const w = width;
  const h = height;
  
  // Smooth heart path using bezier curves
  // Start from top center (notch), curve down left, form left lobe, curve to bottom point,
  // curve up right, form right lobe, back to top center
  const topCenterX = x + w / 2;
  const topCenterY = y + h / 5;
  const bottomX = x + w / 2;
  const bottomY = y + h;
  
  // Left lobe
  const leftTopX = x;
  const leftTopY = y;
  const leftMidX = x;
  const leftMidY = y + h / 3;
  
  // Right lobe  
  const rightTopX = x + w;
  const rightTopY = y;
  const rightMidX = x + w;
  const rightMidY = y + h / 3;
  
  // Smooth heart path: top center -> left top -> left mid -> bottom -> right mid -> right top -> top center
  return `M ${topCenterX} ${topCenterY} C ${topCenterX} ${y}, ${leftTopX} ${y}, ${leftTopX} ${leftMidY} C ${leftTopX} ${y + (2 * h) / 3}, ${bottomX} ${bottomY}, ${bottomX} ${bottomY} C ${bottomX} ${bottomY}, ${rightTopX} ${y + (2 * h) / 3}, ${rightTopX} ${rightMidY} C ${rightTopX} ${y}, ${topCenterX} ${y}, ${topCenterX} ${topCenterY} Z`;
}

/**
 * Generate path data for a gear shape
 */
export function generateGearPath(
  teeth: number,
  config: ShapeConfig
): string {
  const { width, height, centerX, centerY } = config;
  const outerRadius = Math.min(width, height) / 2;
  const innerRadius = outerRadius * 0.7;
  const toothHeight = outerRadius * 0.2;
  const toothWidth = (Math.PI * 2 * innerRadius) / (teeth * 4);

  let path = '';
  const angleStep = (Math.PI * 2) / teeth;

  for (let i = 0; i < teeth; i++) {
    const angle = angleStep * i;
    const nextAngle = angleStep * (i + 1);
    
    // Inner arc
    const innerX1 = centerX + innerRadius * Math.cos(angle);
    const innerY1 = centerY + innerRadius * Math.sin(angle);
    
    // Tooth
    const toothAngle1 = angle + angleStep * 0.4;
    const toothAngle2 = angle + angleStep * 0.6;
    const toothX1 = centerX + outerRadius * Math.cos(toothAngle1);
    const toothY1 = centerY + outerRadius * Math.sin(toothAngle1);
    const toothX2 = centerX + outerRadius * Math.cos(toothAngle2);
    const toothY2 = centerY + outerRadius * Math.sin(toothAngle2);
    
    if (i === 0) {
      path += `M ${innerX1} ${innerY1}`;
    }
    
    path += `
      L ${toothX1} ${toothY1}
      L ${toothX2} ${toothY2}
      L ${centerX + innerRadius * Math.cos(nextAngle)} ${centerY + innerRadius * Math.sin(nextAngle)}
    `;
  }
  
  path += ' Z';
  return path;
}

/**
 * Combine two shapes using boolean operations
 * Note: This is a placeholder for complex path operations
 * In production, use a library like paper.js or clipper-lib
 */
export type BooleanOperation = 'union' | 'subtract' | 'intersect' | 'exclude';

export function combineShapes(
  shape1: string,
  shape2: string,
  operation: BooleanOperation
): string {
  // Placeholder implementation
  // In production, use a library like paper.js or clipper-lib for proper path boolean operations
  console.warn('Boolean operations require a path library like paper.js or clipper-lib');
  
  switch (operation) {
    case 'union':
      return `${shape1} ${shape2}`; // Simplified
    case 'subtract':
      return shape1; // Simplified
    case 'intersect':
      return shape1; // Simplified
    case 'exclude':
      return `${shape1} ${shape2}`; // Simplified
    default:
      return shape1;
  }
}

/**
 * Convert points to SVG path data
 */
export function pointsToPath(points: Point[], closed: boolean = true): string {
  if (points.length === 0) return '';
  
  let path = `M ${points[0].x} ${points[0].y}`;
  
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`;
  }
  
  if (closed) {
    path += ' Z';
  }
  
  return path;
}

/**
 * Generate bezier curve path from control points
 */
export interface BezierPoint {
  x: number;
  y: number;
  cp1?: Point; // Control point 1
  cp2?: Point; // Control point 2
}

export function bezierToPath(points: BezierPoint[], closed: boolean = true): string {
  if (points.length === 0) return '';
  
  let path = `M ${points[0].x} ${points[0].y}`;
  
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    
    if (prev.cp2 && curr.cp1) {
      // Cubic bezier curve
      path += ` C ${prev.cp2.x} ${prev.cp2.y}, ${curr.cp1.x} ${curr.cp1.y}, ${curr.x} ${curr.y}`;
    } else if (prev.cp2 || curr.cp1) {
      // Quadratic bezier curve
      const cp = prev.cp2 || curr.cp1!;
      path += ` Q ${cp.x} ${cp.y}, ${curr.x} ${curr.y}`;
    } else {
      // Straight line
      path += ` L ${curr.x} ${curr.y}`;
    }
  }
  
  if (closed) {
    const last = points[points.length - 1];
    const first = points[0];
    if (last.cp2 && first.cp1) {
      path += ` C ${last.cp2.x} ${last.cp2.y}, ${first.cp1.x} ${first.cp1.y}, ${first.x} ${first.y}`;
    }
    path += ' Z';
  }
  
  return path;
}

/**
 * Smooth a polygon by converting corners to bezier curves
 */
export function smoothPolygon(points: Point[], smoothness: number = 0.3): BezierPoint[] {
  if (points.length < 3) return points.map(p => ({ ...p }));
  
  const bezierPoints: BezierPoint[] = [];
  
  for (let i = 0; i < points.length; i++) {
    const prev = points[(i - 1 + points.length) % points.length];
    const curr = points[i];
    const next = points[(i + 1) % points.length];
    
    // Calculate control points for smooth curves
    const cp1 = {
      x: curr.x + (prev.x - next.x) * smoothness,
      y: curr.y + (prev.y - next.y) * smoothness,
    };
    
    const cp2 = {
      x: curr.x + (next.x - prev.x) * smoothness,
      y: curr.y + (next.y - prev.y) * smoothness,
    };
    
    bezierPoints.push({
      x: curr.x,
      y: curr.y,
      cp1,
      cp2,
    });
  }
  
  return bezierPoints;
}

/**
 * Calculate bounding box of a set of points
 */
export function getBoundingBox(points: Point[]): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  if (points.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

