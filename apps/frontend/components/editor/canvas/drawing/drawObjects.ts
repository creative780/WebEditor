/**
 * Object drawing orchestrator - draws all objects on canvas
 */

import { useEditorStore } from '../../../../state/useEditorStore';
import { drawTextObject, type TextDrawingParams } from './drawText';
import { drawShapeObject, type ShapeDrawingParams } from './drawShape';
import { drawPathObject, type PathDrawingParams } from './drawPath';

export interface ObjectsDrawingParams {
  isTextEditing: boolean;
  editingTextId: string | null;
  hoveredHandle: string | null;
  isDraggingObject: boolean;
  documentDpi: number;
}

/**
 * Draw all objects on canvas with transformations and effects
 */
export function drawObjects(
  ctx: CanvasRenderingContext2D,
  offsetX: number,
  offsetY: number,
  zoom: number,
  params: ObjectsDrawingParams
): void {
  const { isTextEditing, editingTextId, hoveredHandle, isDraggingObject, documentDpi } = params;
  const objects = useEditorStore.getState().objects;
  const selection = useEditorStore.getState().selection;

  objects.forEach((obj) => {
    ctx.save();

    // Convert document units to pixels - objects are now in artboard coordinate space
    const x = obj.x * documentDpi;
    const y = obj.y * documentDpi;
    const width = obj.width * documentDpi;
    const height = obj.height * documentDpi;

    // Apply rotation
    if (obj.rotation !== 0) {
      ctx.translate(x + width / 2, y + height / 2);
      ctx.rotate((obj.rotation * Math.PI) / 180);
      ctx.translate(-width / 2, -height / 2);
    } else {
      ctx.translate(x, y);
    }

    // Apply opacity
    ctx.globalAlpha = obj.opacity;

    // Apply blend mode
    if (obj.blendMode && obj.blendMode !== 'normal') {
      ctx.globalCompositeOperation =
        obj.blendMode as GlobalCompositeOperation;
    }

    // Apply layer effects (drop shadow, outer glow)
    if (obj.effects?.dropShadow && !isDraggingObject) {
      const shadow = obj.effects.dropShadow;
      ctx.shadowColor = `${shadow.color}${Math.round(shadow.opacity * 255)
        .toString(16)
        .padStart(2, '0')}`;
      ctx.shadowBlur = shadow.blur;
      ctx.shadowOffsetX = shadow.offsetX;
      ctx.shadowOffsetY = shadow.offsetY;
    } else if (obj.effects?.outerGlow && !isDraggingObject) {
      const glow = obj.effects.outerGlow;
      ctx.shadowColor = `${glow.color}${Math.round(glow.opacity * 255)
        .toString(16)
        .padStart(2, '0')}`;
      ctx.shadowBlur = glow.blur;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    } else if (isDraggingObject && selection.includes(obj.id)) {
      // Add subtle shadow/shadow effect when dragging
      ctx.shadowColor = 'rgba(0, 122, 255, 0.3)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    } else {
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    // Draw based on object type
    const isSelected = selection.includes(obj.id);
    const textParams: TextDrawingParams = {
      isEditing: isTextEditing,
      editingTextId,
      hoveredHandle,
      isDraggingObject,
    };
    const shapeParams: ShapeDrawingParams = {
      hoveredHandle,
      isDraggingObject,
    };
    const pathParams: PathDrawingParams = {
      hoveredHandle,
      isDraggingObject,
      documentDpi,
    };

    if (obj.type === 'text') {
      drawTextObject(ctx, obj, width, height, isSelected, zoom, textParams);
    } else if (obj.type === 'shape') {
      drawShapeObject(ctx, obj, width, height, isSelected, zoom, shapeParams);
    } else if (obj.type === 'path') {
      drawPathObject(ctx, obj, width, height, isSelected, zoom, pathParams);
    }

    // Reset composite operation to normal
    ctx.globalCompositeOperation = 'source-over';

    ctx.restore();
  });
}

