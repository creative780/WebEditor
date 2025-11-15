/**
 * Helper drawing functions
 */

/**
 * Draw text drag preview
 */
export function drawTextDragPreview(
  ctx: CanvasRenderingContext2D,
  offsetX: number,
  offsetY: number,
  zoom: number,
  documentDpi: number,
  textDragStart: { x: number; y: number },
  textDragEnd: { x: number; y: number }
): void {
  ctx.save();

  const startX =
    Math.min(textDragStart.x, textDragEnd.x) * documentDpi * zoom + offsetX;
  const startY =
    Math.min(textDragStart.y, textDragEnd.y) * documentDpi * zoom + offsetY;
  const endX =
    Math.max(textDragStart.x, textDragEnd.x) * documentDpi * zoom + offsetX;
  const endY =
    Math.max(textDragStart.y, textDragEnd.y) * documentDpi * zoom + offsetY;

  const width = endX - startX;
  const height = endY - startY;

  // Draw dashed border for text box preview
  ctx.strokeStyle = '#6F1414';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.strokeRect(startX, startY, width, height);
  ctx.setLineDash([]);

  // Draw semi-transparent fill
  ctx.fillStyle = 'rgba(111, 20, 20, 0.1)';
  ctx.fillRect(startX, startY, width, height);

  // Draw "Text" label in center
  ctx.fillStyle = '#6F1414';
  ctx.font = `${16 * zoom}px Inter`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Text', startX + width / 2, startY + height / 2);

  ctx.restore();
}

/**
 * Draw text tool indicator
 */
export function drawTextToolIndicator(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number
): void {
  ctx.save();

  // Draw a subtle text cursor icon in the top-right corner
  const iconSize = 20;
  const margin = 10;
  const x = canvasWidth - iconSize - margin;
  const y = margin;

  // Background circle
  ctx.fillStyle = 'rgba(111, 20, 20, 0.8)';
  ctx.beginPath();
  ctx.arc(x + iconSize / 2, y + iconSize / 2, iconSize / 2, 0, Math.PI * 2);
  ctx.fill();

  // Text cursor icon
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 6, y + 4);
  ctx.lineTo(x + 6, y + 16);
  ctx.moveTo(x + 4, y + 6);
  ctx.lineTo(x + 8, y + 6);
  ctx.moveTo(x + 4, y + 14);
  ctx.lineTo(x + 8, y + 14);
  ctx.stroke();

  ctx.restore();
}

