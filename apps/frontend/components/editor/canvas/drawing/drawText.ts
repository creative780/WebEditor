/**
 * Text object drawing functions
 */

import { wrapText, toRoman } from './textUtils';
import { calculateSelectionPadding } from '../utils/hitDetection';
import { drawTransformHandles } from './drawTransformHandles';

export interface TextDrawingParams {
  isEditing: boolean;
  editingTextId: string | null;
  hoveredHandle: string | null;
  isDraggingObject: boolean;
}

/**
 * Draw text on path
 */
function drawTextOnPath(
  ctx: CanvasRenderingContext2D,
  obj: any,
  lines: string[],
  width: number,
  height: number,
  zoom: number,
  isPlaceholder: boolean
): void {
  try {
    // Create SVG path element for text on path
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const path = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path'
    );
    path.setAttribute('d', obj.pathData);

    const textPath = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'textPath'
    );
    textPath.setAttribute('href', '#path');
    textPath.textContent = lines.join(' ');

    const text = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'text'
    );
    text.appendChild(textPath);

    svg.appendChild(path);
    svg.appendChild(text);

    // For now, draw text along a simple curved path
    // This is a simplified implementation - in a full implementation,
    // you would need more complex path calculation
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;

    const textToDraw = lines.join(' ');
    const chars = textToDraw.split('');
    const angleStep = (Math.PI * 2) / Math.max(chars.length, 1);

    chars.forEach((char, index) => {
      const angle = angleStep * index + (obj.pathOffset || 0) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle + Math.PI / 2);

      if (isPlaceholder) {
        ctx.fillStyle = 'rgba(111, 20, 20, 0.4)';
      } else {
        ctx.fillStyle = obj.textFill || obj.color || '#000000';
      }

      ctx.fillText(char, 0, 0);
      ctx.restore();
    });
  } catch (error) {
    // Fallback to regular text if path rendering fails
    const lineHeight = obj.fontSize * (obj.lineHeight || 1.2) * zoom;
    lines.forEach((line: string, index: number) => {
      const y = index * lineHeight;
      if (isPlaceholder) {
        ctx.fillStyle = 'rgba(111, 20, 20, 0.4)';
      } else {
        ctx.fillStyle = obj.textFill || obj.color || '#000000';
      }
      ctx.fillText(line, 0, y);
    });
  }
}

/**
 * Draw text object with all features (wrapping, lists, transforms, etc.)
 */
export function drawTextObject(
  ctx: CanvasRenderingContext2D,
  obj: any,
  width: number,
  height: number,
  isSelected: boolean,
  zoom: number,
  params: TextDrawingParams
): void {
  const { isEditing, editingTextId, hoveredHandle, isDraggingObject } = params;
  const isCurrentlyEditing = isEditing && editingTextId === obj.id;
  const isPlaceholder = obj.text === 'Type here...';

  // Set text properties with enhanced support
  if (isPlaceholder && !isCurrentlyEditing) {
    // Placeholder text styling
    ctx.fillStyle = 'rgba(111, 20, 20, 0.4)';
    ctx.font = `${obj.fontStyle || 'normal'} ${obj.fontWeight || 400} ${obj.fontSize * zoom}px ${obj.fontFamily || 'Inter'}`;
  } else {
    ctx.fillStyle = obj.textFill || obj.color || '#000000';
    ctx.font = `${obj.fontStyle || 'normal'} ${obj.fontWeight || 400} ${obj.fontSize * zoom}px ${obj.fontFamily || 'Inter'}`;
  }

  ctx.textAlign = obj.textAlign || 'left';
  ctx.textBaseline = 'top';

  // Apply text shadow if defined (not for placeholder)
  if (!isPlaceholder && obj.textShadow && obj.textShadow !== 'none') {
    ctx.shadowColor = obj.textShadow.includes('rgba')
      ? obj.textShadow.match(/rgba?\([^)]+\)/)?.[0] || 'rgba(0,0,0,0.3)'
      : 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = parseInt(obj.textShadow.match(/\d+/)?.[0] || '2');
    ctx.shadowOffsetX = parseInt(obj.textShadow.match(/\d+/)?.[1] || '2');
    ctx.shadowOffsetY = parseInt(obj.textShadow.match(/\d+/)?.[2] || '2');
  } else {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  // Apply text stroke if defined (not for placeholder)
  if (!isPlaceholder && obj.textStroke && obj.textStroke !== 'none') {
    ctx.strokeStyle = obj.textStroke;
    ctx.lineWidth = obj.textStrokeWidth || 1;
  }

  // Draw text background if selected or editing
  if (isSelected || isCurrentlyEditing) {
    ctx.fillStyle = 'rgba(111, 20, 20, 0.1)';
    ctx.fillRect(0, 0, width, height);
    // Reset fill style based on whether it's placeholder or not
    if (isPlaceholder && !isCurrentlyEditing) {
      ctx.fillStyle = 'rgba(111, 20, 20, 0.4)';
    } else {
      ctx.fillStyle = obj.textFill || obj.color || '#000000';
    }
  }

  // Draw text with enhanced properties including lists and text on path
  const originalLines = obj.text.split('\n');
  const lineHeight = obj.fontSize * (obj.lineHeight || 1.2) * zoom;
  const letterSpacing = (obj.letterSpacing || 0) * zoom;

  // Calculate available width (accounting for padding and alignment)
  const padding = obj.padding || { top: 0, right: 0, bottom: 0, left: 0 };
  const availableWidth = width - padding.left - padding.right;

  // Wrap all lines to fit within available width
  const wrappedLines: string[] = [];
  originalLines.forEach((line) => {
    if (
      obj.wrapMode === 'area' ||
      !obj.wrapMode ||
      obj.wrapMode === undefined
    ) {
      // Apply word wrapping for area mode or default
      const wrapped = wrapText(ctx, line, availableWidth, letterSpacing);
      wrappedLines.push(...wrapped);
    } else if (obj.wrapMode === 'none') {
      // For 'none' mode, keep original line (no wrapping, may overflow)
      wrappedLines.push(line);
    } else {
      // For path mode, keep original line (handled separately)
      wrappedLines.push(line);
    }
  });

  // Handle text on path
  if (obj.wrapMode === 'path' && obj.pathData) {
    drawTextOnPath(
      ctx,
      obj,
      originalLines,
      width,
      height,
      zoom,
      isPlaceholder
    );
  } else {
    // Handle regular text rendering with lists and wrapping
    wrappedLines.forEach((line: string, index: number) => {
      const y = index * lineHeight;

      // Apply list formatting
      let displayLine = line;
      let indentOffset = 0;

      if (obj.listType && obj.listType !== 'none') {
        const listStyle = obj.listStyle || {};
        const indentSize = (listStyle.indentSize || 20) * zoom;

        // Add list marker
        let marker = '';
        switch (obj.listType) {
          case 'bullet':
            marker = listStyle.bulletChar || '•';
            break;
          case 'number':
            marker = `${index + 1}${listStyle.numberFormat?.includes('.') ? '.' : listStyle.numberFormat?.includes(')') ? ')' : '.'}`;
            break;
          case 'letter':
            marker = `${String.fromCharCode(97 + index)}${listStyle.numberFormat?.includes('.') ? '.' : listStyle.numberFormat?.includes(')') ? ')' : '.'}`;
            break;
          case 'roman':
            marker = `${toRoman(index + 1)}${listStyle.numberFormat?.includes('.') ? '.' : listStyle.numberFormat?.includes(')') ? ')' : '.'}`;
            break;
        }

        displayLine = `${marker} ${line}`;
        indentOffset = indentSize;
      }

      // Apply text transform
      let transformedLine = displayLine;
      switch (obj.textTransform) {
        case 'uppercase':
          transformedLine = displayLine.toUpperCase();
          break;
        case 'lowercase':
          transformedLine = displayLine.toLowerCase();
          break;
        case 'capitalize':
          transformedLine = displayLine.replace(/\b\w/g, (l) =>
            l.toUpperCase()
          );
          break;
        default:
          transformedLine = displayLine;
      }

      // Calculate x position based on alignment and indentation
      let startX = indentOffset + padding.left;

      // Adjust for text alignment
      if (obj.textAlign === 'center') {
        const textWidth =
          letterSpacing > 0
            ? transformedLine
                .split('')
                .reduce(
                  (sum, char, i, arr) =>
                    sum +
                    ctx.measureText(char).width +
                    (i < arr.length - 1 ? letterSpacing : 0),
                  0
                )
            : ctx.measureText(transformedLine).width;
        startX = width / 2 - textWidth / 2;
      } else if (obj.textAlign === 'right') {
        const textWidth =
          letterSpacing > 0
            ? transformedLine
                .split('')
                .reduce(
                  (sum, char, i, arr) =>
                    sum +
                    ctx.measureText(char).width +
                    (i < arr.length - 1 ? letterSpacing : 0),
                  0
                )
            : ctx.measureText(transformedLine).width;
        startX = width - textWidth - padding.right;
      } else {
        // left alignment (default)
        startX = indentOffset + padding.left;
      }

      // Clamp text to visible area
      const maxX = width - padding.right;

      if (letterSpacing > 0) {
        let x = startX;
        for (let i = 0; i < transformedLine.length; i++) {
          const char = transformedLine[i];
          if (x < maxX && x >= padding.left) {
            ctx.fillText(char, x, y);
          }
          x += ctx.measureText(char).width + letterSpacing;
          if (x > maxX) break; // Stop if we've exceeded bounds
        }
      } else {
        // Clip text to bounds
        ctx.save();
        ctx.beginPath();
        ctx.rect(padding.left, 0, availableWidth, height);
        ctx.clip();
        ctx.fillText(transformedLine, startX, y);
        ctx.restore();
      }

      // Draw stroke if defined (not for placeholder)
      if (!isPlaceholder && obj.textStroke && obj.textStroke !== 'none') {
        if (letterSpacing > 0) {
          let x = startX;
          for (let i = 0; i < transformedLine.length; i++) {
            const char = transformedLine[i];
            if (x < maxX && x >= padding.left) {
              ctx.strokeText(char, x, y);
            }
            x += ctx.measureText(char).width + letterSpacing;
            if (x > maxX) break;
          }
        } else {
          ctx.save();
          ctx.beginPath();
          ctx.rect(padding.left, 0, availableWidth, height);
          ctx.clip();
          ctx.strokeText(transformedLine, startX, y);
          ctx.restore();
        }
      }
    });
  }

  // Draw cursor if editing
  if (isCurrentlyEditing) {
    const lastLine = wrappedLines[wrappedLines.length - 1] || '';
    let cursorX = padding.left;

    if (letterSpacing > 0) {
      for (let i = 0; i < lastLine.length; i++) {
        cursorX += ctx.measureText(lastLine[i]).width + letterSpacing;
      }
    } else {
      cursorX = padding.left + ctx.measureText(lastLine).width;
    }

    const cursorY = (wrappedLines.length - 1) * lineHeight;

    // Blinking cursor effect
    const time = Date.now();
    const blinkRate = 500; // milliseconds
    const isVisible = Math.floor(time / blinkRate) % 2 === 0;

    if (isVisible) {
      ctx.fillStyle = obj.textFill || obj.color || '#000000';
      ctx.fillRect(cursorX, cursorY, 1, lineHeight);
    }
  }

  // Draw selection border and transform handles (hide during dragging)
  if (isSelected && !isDraggingObject) {
    // Enhanced professional padding with generous margin
    const { paddingX: focusPadding } = calculateSelectionPadding(obj, zoom);

    // Expand bounding box evenly around shape
    const selX = -focusPadding;
    const selY = -focusPadding;
    const selW = width + focusPadding * 2;
    const selH = height + focusPadding * 2;

    ctx.save();
    ctx.translate(selX, selY);

    // Enhanced professional border with subtle effects
    ctx.strokeStyle = 'rgba(0, 122, 255, 0.85)';
    ctx.lineWidth = 2; // Slightly thicker for better visibility
    ctx.setLineDash([]);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeRect(0, 0, selW, selH);

    // Handles placed symmetrically around border
    drawTransformHandles(ctx, width, height, zoom, hoveredHandle, {
      paddingX: focusPadding,
      paddingY: focusPadding,
    });

    ctx.restore();
  }

  // Reset shadow and stroke properties
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.strokeStyle = 'transparent';
  ctx.lineWidth = 0;
}

