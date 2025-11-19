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
 * Draw dots pattern - optimized using createPattern for instant rendering
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

  const gridSize = background.gridSize;
  const dotSize = 3.5; // Increased from 2 for better visibility

  // Create a small pattern tile instead of drawing millions of dots
  const patternCanvas = document.createElement('canvas');
  patternCanvas.width = gridSize;
  patternCanvas.height = gridSize;
  const patternCtx = patternCanvas.getContext('2d');
  
  if (patternCtx) {
    // Draw single dot at bottom-right of pattern tile (matching original behavior)
    // Original draws dots starting at (gridSize, gridSize), so dot is at tile edge
    patternCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    patternCtx.beginPath();
    patternCtx.arc(gridSize, gridSize, dotSize, 0, 2 * Math.PI);
    patternCtx.fill();

    // Create repeating pattern from the tile
    const pattern = ctx.createPattern(patternCanvas, 'repeat');
    if (pattern) {
      ctx.globalAlpha = 1;
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, width, height);
    }
  }
}

/**
 * Draw checkerboard pattern - optimized using createPattern for instant rendering
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

  // Create a small pattern tile (2x2 grid) instead of drawing millions of squares
  const patternCanvas = document.createElement('canvas');
  patternCanvas.width = gridSize * 2;
  patternCanvas.height = gridSize * 2;
  const patternCtx = patternCanvas.getContext('2d');
  
  if (patternCtx) {
    // Draw checkerboard pattern in the tile
    patternCtx.fillStyle = lightColor;
    patternCtx.fillRect(0, 0, gridSize, gridSize);
    patternCtx.fillRect(gridSize, gridSize, gridSize, gridSize);
    
    patternCtx.fillStyle = darkColor;
    patternCtx.fillRect(gridSize, 0, gridSize, gridSize);
    patternCtx.fillRect(0, gridSize, gridSize, gridSize);

    // Create repeating pattern from the tile
    const pattern = ctx.createPattern(patternCanvas, 'repeat');
    if (pattern) {
      ctx.globalAlpha = background.opacity;
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, width, height);
    }
  }
}

