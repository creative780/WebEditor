/**
 * Artboard rendering functions (bleed, trim, background)
 */

export interface ArtboardRenderParams {
  canvasWidth: number;
  canvasHeight: number;
  artboardX: number;
  artboardY: number;
  ARTBOARD_WIDTH: number;
  ARTBOARD_HEIGHT: number;
  BLEED_SIZE: number;
  effectiveZoom: number;
  isDraggingArtboard: boolean;
  canvasBackground: {
    type: string;
    color: string;
    opacity: number;
    gridSize: number;
  };
}

/**
 * Render artboard with bleed and trim areas
 */
export function renderArtboard(
  ctx: CanvasRenderingContext2D,
  params: ArtboardRenderParams
): void {
  const {
    artboardX,
    artboardY,
    ARTBOARD_WIDTH,
    ARTBOARD_HEIGHT,
    BLEED_SIZE,
    effectiveZoom,
    isDraggingArtboard,
    canvasBackground,
  } = params;

  // Apply zoom transformation to the entire artboard (artboard itself zooms)
  // Note: Context is saved by the caller (renderCanvas) before calling this function
  // The artboard will grow/shrink while staying centered in the same position
  const offsetX = Math.round(artboardX);
  const offsetY = Math.round(artboardY);
  
  ctx.translate(
    Math.round(offsetX + ARTBOARD_WIDTH / 2),
    Math.round(offsetY + ARTBOARD_HEIGHT / 2)
  );
  ctx.scale(effectiveZoom, effectiveZoom);
  ctx.translate(
    Math.round(-ARTBOARD_WIDTH / 2),
    Math.round(-ARTBOARD_HEIGHT / 2)
  );

  // Draw bleed area (subtle red) - optimized for smoothness
  ctx.strokeStyle = '#DC2626';
  ctx.fillStyle = 'rgba(220, 38, 38, 0.03)';
  ctx.lineWidth = Math.max(0.5, 1 / effectiveZoom); // Ensure minimum line width for smoothness
  ctx.setLineDash([
    Math.max(2, 4 / effectiveZoom),
    Math.max(2, 4 / effectiveZoom),
  ]); // Ensure minimum dash size
  const bleedX = -BLEED_SIZE;
  const bleedY = -BLEED_SIZE;
  ctx.fillRect(
    bleedX,
    bleedY,
    ARTBOARD_WIDTH + BLEED_SIZE * 2,
    ARTBOARD_HEIGHT + BLEED_SIZE * 2
  );
  ctx.strokeRect(
    bleedX,
    bleedY,
    ARTBOARD_WIDTH + BLEED_SIZE * 2,
    ARTBOARD_HEIGHT + BLEED_SIZE * 2
  );

  // Draw trim area (artboard) - modern styling
  ctx.strokeStyle = '#007AFF';
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = Math.max(2, 3 / effectiveZoom); // Slightly thicker border for better visibility
  ctx.setLineDash([]);

  // Add visual feedback for artboard dragging
  if (isDraggingArtboard) {
    // Enhanced shadow and border during dragging
    ctx.shadowColor = 'rgba(0, 122, 255, 0.3)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
    ctx.strokeStyle = '#007AFF';
    ctx.lineWidth = Math.max(3, 4 / effectiveZoom); // Thicker border when dragging
  } else {
    // Normal shadow for artboard
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.strokeStyle = '#007AFF';
    ctx.lineWidth = Math.max(2, 3 / effectiveZoom);
  }

  ctx.fillRect(0, 0, ARTBOARD_WIDTH, ARTBOARD_HEIGHT);
  ctx.strokeRect(0, 0, ARTBOARD_WIDTH, ARTBOARD_HEIGHT);

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Note: Context is NOT restored here - objects will be drawn in the same transform context
  // The caller (renderCanvas) will restore the context after drawing objects
}

