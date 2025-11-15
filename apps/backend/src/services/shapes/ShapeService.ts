interface Point {
  x: number;
  y: number;
}

interface ShapeConfig {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

export class ShapeService {
  // Generate polygon points
  generatePolygonPoints(sides: number, config: ShapeConfig): Point[] {
    const points: Point[] = [];
    const radius = Math.min(config.width, config.height) / 2;
    const angleStep = (Math.PI * 2) / sides;
    const startAngle = -Math.PI / 2;

    for (let i = 0; i < sides; i++) {
      const angle = startAngle + angleStep * i;
      points.push({
        x: config.centerX + radius * Math.cos(angle),
        y: config.centerY + radius * Math.sin(angle),
      });
    }

    return points;
  }

  // Generate star points
  generateStarPoints(points: number, innerRadius: number, config: ShapeConfig): Point[] {
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

  // Generate arrow path
  generateArrowPath(style: 'simple' | 'double' | 'curved' | 'block', config: ShapeConfig): string {
    const { width, height, centerX, centerY } = config;
    const startX = centerX - width / 2;
    const endX = centerX + width / 2;
    const midY = centerY;
    const arrowWidth = height * 0.3;
    const headWidth = height;
    const headLength = Math.min(width * 0.3, height);

    switch (style) {
      case 'simple':
        return `M ${startX} ${midY} L ${endX - headLength} ${midY} L ${endX - headLength} ${midY - headWidth / 2} L ${endX} ${midY} L ${endX - headLength} ${midY + headWidth / 2} L ${endX - headLength} ${midY} Z`;

      case 'double':
        return `M ${startX} ${midY} L ${startX + headLength} ${midY - headWidth / 2} L ${startX + headLength} ${midY - arrowWidth / 2} L ${endX - headLength} ${midY - arrowWidth / 2} L ${endX - headLength} ${midY - headWidth / 2} L ${endX} ${midY} L ${endX - headLength} ${midY + headWidth / 2} L ${endX - headLength} ${midY + arrowWidth / 2} L ${startX + headLength} ${midY + arrowWidth / 2} L ${startX + headLength} ${midY + headWidth / 2} Z`;

      case 'curved':
        const controlY = midY - height * 0.5;
        return `M ${startX} ${midY} Q ${centerX} ${controlY} ${endX - headLength} ${midY} L ${endX - headLength} ${midY - headWidth / 2} L ${endX} ${midY} L ${endX - headLength} ${midY + headWidth / 2} L ${endX - headLength} ${midY} Z`;

      case 'block':
        return `M ${startX} ${midY - arrowWidth / 2} L ${endX - headLength} ${midY - arrowWidth / 2} L ${endX - headLength} ${midY - headWidth / 2} L ${endX} ${midY} L ${endX - headLength} ${midY + headWidth / 2} L ${endX - headLength} ${midY + arrowWidth / 2} L ${startX} ${midY + arrowWidth / 2} Z`;

      default:
        return this.generateArrowPath('simple', config);
    }
  }

  // Generate callout path
  generateCalloutPath(
    style: 'rounded' | 'sharp' | 'cloud' | 'speech',
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
        return `M ${left + radius} ${top} L ${right - radius} ${top} Q ${right} ${top} ${right} ${top + radius} L ${right} ${bottom - radius} Q ${right} ${bottom} ${right - radius} ${bottom} L ${tailX + tailWidth} ${bottom} L ${tailX} ${bottom + tailHeight} L ${tailX - tailWidth} ${bottom} L ${left + radius} ${bottom} Q ${left} ${bottom} ${left} ${bottom - radius} L ${left} ${top + radius} Q ${left} ${top} ${left + radius} ${top} Z`;

      case 'sharp':
        return `M ${left} ${top} L ${right} ${top} L ${right} ${bottom} L ${tailX + tailWidth} ${bottom} L ${tailX} ${bottom + tailHeight} L ${tailX - tailWidth} ${bottom} L ${left} ${bottom} Z`;

      case 'cloud':
      case 'speech':
        const cornerRadius = Math.min(width, height) * 0.15;
        return `M ${left + cornerRadius} ${top} L ${right - cornerRadius} ${top} Q ${right} ${top} ${right} ${top + cornerRadius} L ${right} ${bottom - cornerRadius} Q ${right} ${bottom} ${right - cornerRadius} ${bottom} L ${tailX + tailWidth * 2} ${bottom} L ${tailX} ${bottom + tailHeight} L ${tailX - tailWidth} ${bottom} L ${left + cornerRadius} ${bottom} Q ${left} ${bottom} ${left} ${bottom - cornerRadius} L ${left} ${top + cornerRadius} Q ${left} ${top} ${left + cornerRadius} ${top} Z`;

      default:
        return this.generateCalloutPath('rounded', config, tailPosition);
    }
  }

  // Generate heart path
  generateHeartPath(config: ShapeConfig): string {
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

  // Generate gear path
  generateGearPath(teeth: number, config: ShapeConfig): string {
    const { width, height, centerX, centerY } = config;
    const outerRadius = Math.min(width, height) / 2;
    const innerRadius = outerRadius * 0.7;
    const angleStep = (Math.PI * 2) / teeth;

    let path = '';

    for (let i = 0; i < teeth; i++) {
      const angle = angleStep * i;
      const nextAngle = angleStep * (i + 1);

      const innerX1 = centerX + innerRadius * Math.cos(angle);
      const innerY1 = centerY + innerRadius * Math.sin(angle);

      const toothAngle1 = angle + angleStep * 0.4;
      const toothAngle2 = angle + angleStep * 0.6;
      const toothX1 = centerX + outerRadius * Math.cos(toothAngle1);
      const toothY1 = centerY + outerRadius * Math.sin(toothAngle1);
      const toothX2 = centerX + outerRadius * Math.cos(toothAngle2);
      const toothY2 = centerY + outerRadius * Math.sin(toothAngle2);

      if (i === 0) {
        path += `M ${innerX1} ${innerY1}`;
      }

      path += ` L ${toothX1} ${toothY1} L ${toothX2} ${toothY2} L ${centerX + innerRadius * Math.cos(nextAngle)} ${centerY + innerRadius * Math.sin(nextAngle)}`;
    }

    path += ' Z';
    return path;
  }

  // Convert points to SVG path
  pointsToPath(points: Point[], closed: boolean = true): string {
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

  // Simplify path
  simplifyPath(pathData: string, tolerance: number = 1): string {
    // Simplified implementation
    // In production, use proper path simplification algorithms
    return pathData;
  }

  // Smooth path
  smoothPath(pathData: string, smoothness: number = 0.3): string {
    // Simplified implementation
    // In production, use bezier curve smoothing
    return pathData;
  }
}

export default new ShapeService();

