/**
 * Canvas background drawing functions
 */

export interface CanvasBackground {
  type: 'transparent' | 'grid' | 'dots' | 'checkerboard' | 'solid';
  color: string;
  opacity: number;
  gridSize: number;
}

/**
 * Draw canvas background based on type
 */
export function drawCanvasBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  background: CanvasBackground
): void {
  ctx.save();

  switch (background.type) {
    case 'transparent':
      // Draw checkerboard pattern for transparency
      drawCheckerboardPattern(ctx, width, height, background);
      break;
    case 'grid':
      drawGridPattern(ctx, width, height, background);
      break;
    case 'dots':
      drawDotsPattern(ctx, width, height, background);
      break;
    case 'checkerboard':
      drawCheckerboardPattern(ctx, width, height, background);
      break;
    case 'solid':
    default:
      drawSolidBackground(ctx, width, height, background);
      break;
  }

  ctx.restore();
}

/**
 * Draw solid background
 */
function drawSolidBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  background: CanvasBackground
): void {
  ctx.fillStyle = background.color;
  ctx.globalAlpha = background.opacity;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Draw grid pattern
 */
function drawGridPattern(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  background: CanvasBackground
): void {
  // Fill with background color
  ctx.fillStyle = background.color;
  ctx.globalAlpha = background.opacity;
  ctx.fillRect(0, 0, width, height);

  // Draw grid lines
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.lineWidth = 1;
  ctx.globalAlpha = 1;

  const gridSize = background.gridSize;

  // Draw vertical lines
  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Draw horizontal lines
  for (let y = 0; y <= height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

/**
 * Draw dots pattern
 */
function drawDotsPattern(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  background: CanvasBackground
): void {
  // Fill with background color
  ctx.fillStyle = background.color;
  ctx.globalAlpha = background.opacity;
  ctx.fillRect(0, 0, width, height);

  // Draw dots
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.globalAlpha = 1;

  const gridSize = background.gridSize;
  const dotSize = 2;

  for (let x = gridSize; x < width; x += gridSize) {
    for (let y = gridSize; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.arc(x, y, dotSize, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
}

/**
 * Draw checkerboard pattern
 */
function drawCheckerboardPattern(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  background: CanvasBackground
): void {
  const gridSize = background.gridSize;
  const lightColor = background.color;
  const darkColor = 'rgba(0, 0, 0, 0.05)';

  ctx.globalAlpha = background.opacity;

  for (let x = 0; x < width; x += gridSize) {
    for (let y = 0; y < height; y += gridSize) {
      const isEven = Math.floor(x / gridSize) + Math.floor(y / gridSize);
      ctx.fillStyle = isEven % 2 === 0 ? lightColor : darkColor;
      ctx.fillRect(x, y, gridSize, gridSize);
    }
  }
}

