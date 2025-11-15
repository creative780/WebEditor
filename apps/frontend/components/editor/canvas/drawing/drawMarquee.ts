/**
 * Marquee selection drawing functions
 */

/**
 * Draw marquee selection rectangle
 */
export function drawMarqueeSelection(
  ctx: CanvasRenderingContext2D,
  start: { x: number; y: number },
  end: { x: number; y: number },
  zoom: number,
  documentDpi: number
): void {
  // Convert document coordinates to canvas coordinates
  const startX = start.x * documentDpi * zoom;
  const startY = start.y * documentDpi * zoom;
  const endX = end.x * documentDpi * zoom;
  const endY = end.y * documentDpi * zoom;

  // Calculate marquee rectangle
  const left = Math.min(startX, endX);
  const top = Math.min(startY, endY);
  const width = Math.abs(endX - startX);
  const height = Math.abs(endY - startY);

  // Draw marquee background (semi-transparent)
  ctx.fillStyle = 'rgba(0, 122, 255, 0.1)';
  ctx.fillRect(left, top, width, height);

  // Draw marquee border - Professional solid style
  ctx.strokeStyle = '#007AFF';
  ctx.lineWidth = 1.5 / zoom;
  ctx.setLineDash([]); // Solid line for professional look
  ctx.strokeRect(left, top, width, height);
}

