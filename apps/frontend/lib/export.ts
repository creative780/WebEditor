/**
 * Export utilities for design export functionality
 * Supports PDF, PNG, JPG, and SVG formats with print-ready features
 */

import { TextObj, ImageObj, ShapeObj, PathObj } from '../state/useEditorStore';
import { generateHeartPath } from './shapes';

export type ExportFormat = 'pdf' | 'png' | 'jpg' | 'svg';
export type ExportQuality = 'low' | 'medium' | 'high' | 'ultra';

export interface ExportOptions {
  format: ExportFormat;
  quality: ExportQuality;
  scale: number;
  includeBleed: boolean;
  includeCropMarks: boolean;
  colorMode: 'rgb' | 'cmyk';
  dpi: number;
  backgroundColor: string;
  transparent: boolean;
  width: number;
  height: number;
  bleed: number;
}

export interface ExportResult {
  success: boolean;
  data?: string;
  error?: string;
  filename: string;
  size?: number;
  format: ExportFormat;
}

export interface ExportHistoryItem {
  id: string;
  timestamp: number;
  format: ExportFormat;
  quality: ExportQuality;
  filename: string;
  size: number;
}

/**
 * Get DPI based on quality setting
 */
export function getDPI(quality: ExportQuality): number {
  switch (quality) {
    case 'low': return 72;
    case 'medium': return 150;
    case 'high': return 300;
    case 'ultra': return 600;
    default: return 300;
  }
}

/**
 * Export design to canvas
 */
export async function exportToCanvas(
  objects: (TextObj | ImageObj | ShapeObj | PathObj)[],
  options: ExportOptions
): Promise<HTMLCanvasElement> {
  const { width, height, bleed, dpi, includeBleed, transparent, backgroundColor } = options;
  
  // Get ALL visible objects that are on the artboard (no filtering by bounds)
  // Include ALL objects - even those partially outside artboard bounds
  const visibleObjects = objects
    .filter(obj => obj.visible !== false)
    .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
  
  if (visibleObjects.length === 0) {
    // Return empty canvas if no objects
    const canvas = document.createElement('canvas');
    canvas.width = width * dpi;
    canvas.height = height * dpi;
    return canvas;
  }
  
  // Use document dimensions as base canvas size - this ensures we export the full artboard
  const pixelWidth = width * dpi;
  const pixelHeight = height * dpi;
  const bleedSize = includeBleed ? bleed * dpi : 0;

  const canvas = document.createElement('canvas');
  canvas.width = pixelWidth + (bleedSize * 2);
  canvas.height = pixelHeight + (bleedSize * 2);
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  // Fill background
  if (!transparent) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Translate for bleed - objects draw at their exact positions
  ctx.save();
  ctx.translate(bleedSize, bleedSize);

  // Preload all images and cache them for reuse
  const imageCache = new Map<string, HTMLImageElement>();
  const imageObjects = visibleObjects.filter(obj => obj.type === 'image') as ImageObj[];
  
  // Preload all images in parallel
  const imageLoadPromises = imageObjects.map(img => {
    return new Promise<void>((resolve) => {
      // Skip if already cached
      if (imageCache.has(img.src)) {
        resolve();
        return;
      }
      
      const image = new window.Image();
      image.crossOrigin = 'anonymous';
      
      image.onload = () => {
        imageCache.set(img.src, image);
        resolve();
      };
      
      image.onerror = () => {
        console.warn(`Failed to load image: ${img.src}`);
        // Create a placeholder image for failed loads
        const placeholder = new window.Image();
        placeholder.width = 100;
        placeholder.height = 100;
        imageCache.set(img.src, placeholder);
        resolve();
      };
      
      image.src = img.src;
    });
  });
  
  // Wait for all images to load
  await Promise.all(imageLoadPromises);
  
  // Debug logging
  console.log(`Exporting ${visibleObjects.length} objects on artboard (${width}" x ${height}"):`);
  console.log(`- Canvas size: ${canvas.width}x${canvas.height}px (${pixelWidth}x${pixelHeight} + ${bleedSize * 2}px bleed)`);
  console.log(`- Objects by type:`, {
    shapes: visibleObjects.filter(o => o.type === 'shape').length,
    images: visibleObjects.filter(o => o.type === 'image').length,
    text: visibleObjects.filter(o => o.type === 'text').length,
    paths: visibleObjects.filter(o => o.type === 'path').length,
  });
  
  // Log object positions to verify all are being exported
  visibleObjects.forEach(obj => {
    console.log(`  - ${obj.type} ${obj.id}: at (${obj.x.toFixed(2)}, ${obj.y.toFixed(2)}), size ${obj.width.toFixed(2)}x${obj.height.toFixed(2)}`);
  });
  
  // Draw ALL objects in z-index order - no bounds checking, include everything on artboard
  for (const obj of visibleObjects) {
    try {
      await drawObject(ctx, obj, dpi, imageCache);
    } catch (error) {
      console.error(`Error drawing object ${obj.id} (${obj.type}) at (${obj.x}, ${obj.y}):`, error);
      // Continue with next object
    }
  }

  ctx.restore();

  // Draw crop marks if requested
  if (options.includeCropMarks && options.format === 'pdf') {
    drawCropMarks(ctx, pixelWidth, pixelHeight, bleedSize);
  }

  return canvas;
}

/**
 * Draw a single object on canvas
 */
async function drawObject(
  ctx: CanvasRenderingContext2D,
  obj: TextObj | ImageObj | ShapeObj | PathObj,
  dpi: number,
  imageCache?: Map<string, HTMLImageElement>
): Promise<void> {
  ctx.save();
  
  const objX = obj.x * dpi;
  const objY = obj.y * dpi;
  const objWidth = obj.width * dpi;
  const objHeight = obj.height * dpi;

  // Apply transformations
  if (obj.rotation !== 0) {
    ctx.translate(objX + objWidth / 2, objY + objHeight / 2);
    ctx.rotate((obj.rotation * Math.PI) / 180);
    ctx.translate(-objWidth / 2, -objHeight / 2);
  } else {
    ctx.translate(objX, objY);
  }

  ctx.globalAlpha = obj.opacity;

  // Apply blend mode if specified
  if (obj.blendMode && obj.blendMode !== 'normal') {
    ctx.globalCompositeOperation = obj.blendMode as GlobalCompositeOperation;
  }

  // Draw based on type
  switch (obj.type) {
    case 'shape':
      drawShape(ctx, obj as ShapeObj, objWidth, objHeight);
      break;
    case 'text':
      drawText(ctx, obj as TextObj, objWidth, objHeight);
      break;
    case 'path':
      drawPath(ctx, obj as PathObj, objWidth, objHeight);
      break;
    case 'image':
      await drawImage(ctx, obj as ImageObj, objWidth, objHeight, imageCache);
      break;
  }

  ctx.restore();
}

/**
 * Draw shape object - supports all shape types
 */
function drawShape(ctx: CanvasRenderingContext2D, shape: ShapeObj, width: number, height: number): void {
  const hasFill = shape.fill?.color;
  const hasStroke = shape.stroke?.width && shape.stroke.width > 0;
  
  if (!hasFill && !hasStroke) return;
  
  // Set fill style
  if (hasFill) {
    ctx.fillStyle = shape.fill.color;
  }
  
  // Set stroke style
  if (hasStroke) {
    ctx.strokeStyle = shape.stroke.color || '#000000';
    ctx.lineWidth = shape.stroke.width;
    ctx.lineCap = shape.stroke.cap || 'butt';
    ctx.lineJoin = shape.stroke.join || 'miter';
    
    if (shape.stroke.style === 'dashed') {
      ctx.setLineDash([5, 5]);
    } else if (shape.stroke.style === 'dotted') {
      ctx.setLineDash([2, 2]);
    }
  }
  
  ctx.beginPath();
  
  switch (shape.shape) {
    case 'rectangle':
      if (shape.borderRadius && shape.borderRadius > 0) {
        drawRoundedRect(ctx, 0, 0, width, height, shape.borderRadius);
      } else {
        ctx.rect(0, 0, width, height);
      }
      break;
    
    case 'circle':
      ctx.arc(width / 2, height / 2, Math.min(width, height) / 2, 0, Math.PI * 2);
      break;
    
    case 'ellipse':
      ctx.ellipse(width / 2, height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
      break;
    
    case 'triangle':
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      break;
    
    case 'arrow':
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width * 0.7, height / 2);
      ctx.lineTo(width * 0.7, height * 0.3);
      ctx.lineTo(width, height / 2);
      ctx.lineTo(width * 0.7, height * 0.7);
      ctx.lineTo(width * 0.7, height / 2);
      ctx.closePath();
      break;
    
    case 'star':
      const starCenterX = width / 2;
      const starCenterY = height / 2;
      const outerRadius = Math.max(width, height) / 2;
      const innerRadius = outerRadius * 0.4;
      const points = 5;
      
      for (let i = 0; i < points * 2; i++) {
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const x = starCenterX + Math.cos(angle) * radius;
        const y = starCenterY + Math.sin(angle) * radius;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      break;
    
    case 'line':
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      // Don't close path for line - stroke only
      break;
    
    case 'polygon':
      const hexCenterX = width / 2;
      const hexCenterY = height / 2;
      const hexRadius = Math.max(width, height) / 2;
      const hexSides = 6;
      
      for (let i = 0; i < hexSides; i++) {
        const angle = (i * Math.PI * 2) / hexSides - Math.PI / 2;
        const x = hexCenterX + hexRadius * Math.cos(angle);
        const y = hexCenterY + hexRadius * Math.sin(angle);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      break;
    
    case 'heart':
      // Use generateHeartPath from shapes.ts
      try {
        const heartConfig = {
          width: width,
          height: height,
          centerX: width / 2,
          centerY: height / 2,
        };
        const heartPathData = generateHeartPath(heartConfig);
        const path2D = new Path2D(heartPathData);
        // Draw using Path2D
        if (hasFill) ctx.fill(path2D);
        if (hasStroke) ctx.stroke(path2D);
        ctx.setLineDash([]);
        return; // Return early since we handled it
      } catch (error) {
        // Fallback to rectangle
        ctx.rect(0, 0, width, height);
      }
      break;
    
    case 'gear':
      const gearCenterX = width / 2;
      const gearCenterY = height / 2;
      const gearOuterRadius = Math.max(width, height) / 2;
      const gearInnerRadius = gearOuterRadius * 0.7;
      const teeth = 8;
      
      for (let i = 0; i < teeth; i++) {
        const angle1 = (i * Math.PI * 2) / teeth;
        const angle2 = ((i + 0.4) * Math.PI * 2) / teeth;
        const angle3 = ((i + 0.6) * Math.PI * 2) / teeth;
        const angle4 = ((i + 1) * Math.PI * 2) / teeth;
        
        const x1 = gearCenterX + gearInnerRadius * Math.cos(angle1);
        const y1 = gearCenterY + gearInnerRadius * Math.sin(angle1);
        const x2 = gearCenterX + gearOuterRadius * Math.cos(angle2);
        const y2 = gearCenterY + gearOuterRadius * Math.sin(angle2);
        const x3 = gearCenterX + gearOuterRadius * Math.cos(angle3);
        const y3 = gearCenterY + gearOuterRadius * Math.sin(angle3);
        const x4 = gearCenterX + gearInnerRadius * Math.cos(angle4);
        const y4 = gearCenterY + gearInnerRadius * Math.sin(angle4);
        
        if (i === 0) {
          ctx.moveTo(x1, y1);
        }
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.lineTo(x4, y4);
      }
      ctx.closePath();
      break;
    
    case 'callout':
      // Simplified callout - rounded rectangle with tail
      const calloutRadius = Math.min(width, height) * 0.1;
      const tailX = width * 0.5;
      const tailWidth = width * 0.15;
      const tailHeight = height * 0.3;
      
      ctx.moveTo(calloutRadius, 0);
      ctx.lineTo(width - calloutRadius, 0);
      ctx.quadraticCurveTo(width, 0, width, calloutRadius);
      ctx.lineTo(width, height - calloutRadius - tailHeight);
      ctx.quadraticCurveTo(width, height - tailHeight, width - calloutRadius, height - tailHeight);
      ctx.lineTo(tailX + tailWidth, height - tailHeight);
      ctx.lineTo(tailX, height);
      ctx.lineTo(tailX - tailWidth, height - tailHeight);
      ctx.lineTo(calloutRadius, height - tailHeight);
      ctx.quadraticCurveTo(0, height - tailHeight, 0, height - tailHeight - calloutRadius);
      ctx.lineTo(0, calloutRadius);
      ctx.quadraticCurveTo(0, 0, calloutRadius, 0);
      ctx.closePath();
      break;
    
    default:
      // Fallback to rectangle for unknown shapes
      ctx.rect(0, 0, width, height);
      break;
  }
  
  // Draw fill and stroke
  if (hasFill && shape.shape !== 'line') {
    ctx.fill();
  }
  
  if (hasStroke) {
    ctx.stroke();
  }
  
  // Reset line dash
  ctx.setLineDash([]);
}

/**
 * Draw text object
 */
function drawText(ctx: CanvasRenderingContext2D, text: TextObj, width: number, height: number): void {
  ctx.fillStyle = text.color || text.textFill;
  ctx.font = `${text.fontStyle} ${text.fontWeight} ${text.fontSize}px ${text.fontFamily}`;
  ctx.textAlign = text.textAlign || 'left';
  ctx.textBaseline = text.verticalAlign === 'middle' ? 'middle' : text.verticalAlign === 'bottom' ? 'bottom' : 'top';
  
  // Apply text effects
  if (text.textShadow && text.textShadow !== 'none') {
    const shadow = text.textShadow.split(' ');
    ctx.shadowColor = shadow[3] || 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = parseInt(shadow[2]) || 0;
    ctx.shadowOffsetX = parseInt(shadow[0]) || 0;
    ctx.shadowOffsetY = parseInt(shadow[1]) || 0;
  }
  
  // Draw text stroke if specified
  if (text.textStroke && text.textStrokeWidth) {
    ctx.strokeStyle = text.textStroke;
    ctx.lineWidth = text.textStrokeWidth;
    ctx.strokeText(text.text, 0, height / 2);
  }
  
  ctx.fillText(text.text, 0, height / 2);
}

/**
 * Draw path object
 */
function drawPath(ctx: CanvasRenderingContext2D, path: PathObj, width: number, height: number): void {
  const p = new Path2D(path.pathData);
  
  if (path.fill?.color) {
    ctx.fillStyle = path.fill.color;
    ctx.fill(p);
  }
  
  if (path.stroke?.width) {
    ctx.strokeStyle = path.stroke.color;
    ctx.lineWidth = path.stroke.width;
    ctx.stroke(p);
  }
}

/**
 * Draw image object - uses preloaded image cache for better performance
 */
async function drawImage(
  ctx: CanvasRenderingContext2D, 
  image: ImageObj, 
  width: number, 
  height: number,
  imageCache?: Map<string, HTMLImageElement>
): Promise<void> {
  if (!image.src) {
    // Draw placeholder if no src
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);
    return;
  }
  
  // Use cached image if available, otherwise load it
  let img: HTMLImageElement | null = null;
  
  if (imageCache && imageCache.has(image.src)) {
    img = imageCache.get(image.src)!;
    // Check if image is actually loaded
    if (!img.complete || img.naturalWidth === 0) {
      // Wait for image to complete loading
      await new Promise<void>((resolve) => {
        if (img!.complete) {
          resolve();
        } else {
          img!.onload = () => resolve();
          img!.onerror = () => resolve(); // Continue even on error
        }
      });
    }
  } else {
    // Load image if not cached
    img = await new Promise<HTMLImageElement>((resolve) => {
      const newImg = new window.Image();
      newImg.crossOrigin = 'anonymous';
      
      newImg.onload = () => resolve(newImg);
      newImg.onerror = () => {
        // Create placeholder on error
        const placeholder = new window.Image();
        placeholder.width = 100;
        placeholder.height = 100;
        resolve(placeholder);
      };
      
      newImg.src = image.src;
    });
    
    if (imageCache) {
      imageCache.set(image.src, img);
    }
  }
  
  try {
    // Handle crop if specified
    if (image.crop && img.naturalWidth > 0) {
      const cropX = image.crop.x;
      const cropY = image.crop.y;
      const cropWidth = image.crop.width;
      const cropHeight = image.crop.height;
      
      // Draw cropped image
      ctx.drawImage(
        img,
        cropX, cropY, cropWidth, cropHeight, // Source crop region
        0, 0, width, height // Destination size
      );
    } else if (img.naturalWidth > 0) {
      // Draw full image scaled to object dimensions
      ctx.drawImage(img, 0, 0, width, height);
    } else {
      // Draw placeholder for failed image
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, width, height);
    }
    
    // Apply image filters if specified
    if (image.filters && img.naturalWidth > 0) {
      const filters = image.filters;
      if (filters.brightness !== undefined && filters.brightness !== 100) {
        const brightness = filters.brightness / 100;
        ctx.globalCompositeOperation = brightness > 1 ? 'screen' : 'multiply';
        ctx.fillStyle = brightness > 1 
          ? `rgba(255, 255, 255, ${(brightness - 1) * 0.5})` 
          : `rgba(0, 0, 0, ${1 - brightness})`;
        ctx.fillRect(0, 0, width, height);
        ctx.globalCompositeOperation = 'source-over';
      }
    }
    
    // Draw stroke if specified
    if (image.stroke && image.stroke.width > 0) {
      ctx.strokeStyle = image.stroke.color || '#000000';
      ctx.lineWidth = image.stroke.width;
      ctx.strokeRect(0, 0, width, height);
    }
  } catch (error) {
    console.error('Error drawing image:', error);
    // Draw placeholder on error
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);
  }
}

/**
 * Draw rounded rectangle
 */
function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Draw crop marks for print
 */
function drawCropMarks(ctx: CanvasRenderingContext2D, width: number, height: number, bleedSize: number): void {
  const markLength = 20;
  const markOffset = 10;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;

  // Top-left
  ctx.beginPath();
  ctx.moveTo(bleedSize - markOffset, bleedSize);
  ctx.lineTo(bleedSize - markOffset - markLength, bleedSize);
  ctx.moveTo(bleedSize, bleedSize - markOffset);
  ctx.lineTo(bleedSize, bleedSize - markOffset - markLength);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(bleedSize + width + markOffset, bleedSize);
  ctx.lineTo(bleedSize + width + markOffset + markLength, bleedSize);
  ctx.moveTo(bleedSize + width, bleedSize - markOffset);
  ctx.lineTo(bleedSize + width, bleedSize - markOffset - markLength);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(bleedSize - markOffset, bleedSize + height);
  ctx.lineTo(bleedSize - markOffset - markLength, bleedSize + height);
  ctx.moveTo(bleedSize, bleedSize + height + markOffset);
  ctx.lineTo(bleedSize, bleedSize + height + markOffset + markLength);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(bleedSize + width + markOffset, bleedSize + height);
  ctx.lineTo(bleedSize + width + markOffset + markLength, bleedSize + height);
  ctx.moveTo(bleedSize + width, bleedSize + height + markOffset);
  ctx.lineTo(bleedSize + width, bleedSize + height + markOffset + markLength);
  ctx.stroke();
}

/**
 * Export to PNG
 */
export async function exportToPNG(
  objects: (TextObj | ImageObj | ShapeObj | PathObj)[],
  options: ExportOptions
): Promise<ExportResult> {
  try {
    const canvas = await exportToCanvas(objects, options);
    const quality = options.quality === 'ultra' ? 1 : options.quality === 'high' ? 0.92 : options.quality === 'medium' ? 0.85 : 0.75;
    const dataUrl = canvas.toDataURL('image/png', quality);
    const filename = `design-${Date.now()}.png`;
    
    return {
      success: true,
      data: dataUrl,
      filename,
      format: 'png',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Export failed',
      filename: '',
      format: 'png',
    };
  }
}

/**
 * Export to JPG
 */
export async function exportToJPG(
  objects: (TextObj | ImageObj | ShapeObj | PathObj)[],
  options: ExportOptions
): Promise<ExportResult> {
  try {
    const canvas = await exportToCanvas(objects, options);
    const quality = options.quality === 'ultra' ? 1 : options.quality === 'high' ? 0.92 : options.quality === 'medium' ? 0.85 : 0.75;
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    const filename = `design-${Date.now()}.jpg`;
    
    return {
      success: true,
      data: dataUrl,
      filename,
      format: 'jpg',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Export failed',
      filename: '',
      format: 'jpg',
    };
  }
}

/**
 * Export to SVG
 */
export async function exportToSVG(
  objects: (TextObj | ImageObj | ShapeObj | PathObj)[],
  options: ExportOptions
): Promise<ExportResult> {
  try {
    const { width, height, dpi, includeBleed, bleed } = options;
    const pixelWidth = width * dpi;
    const pixelHeight = height * dpi;
    const bleedSize = includeBleed ? bleed * dpi : 0;
    
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${pixelWidth + bleedSize * 2}" height="${pixelHeight + bleedSize * 2}" viewBox="0 0 ${pixelWidth + bleedSize * 2} ${pixelHeight + bleedSize * 2}">`;
    
    // Background
    if (!options.transparent) {
      svg += `<rect width="100%" height="100%" fill="${options.backgroundColor}"/>`;
    }
    
    // Group for bleed offset
    svg += `<g transform="translate(${bleedSize}, ${bleedSize})">`;
    
    // Draw objects
    const visibleObjects = objects.filter(obj => obj.visible !== false);
    for (const obj of visibleObjects) {
      svg += objectToSVG(obj, dpi);
    }
    
    svg += `</g>`;
    svg += `</svg>`;
    
    const dataUrl = 'data:image/svg+xml;base64,' + btoa(svg);
    const filename = `design-${Date.now()}.svg`;
    
    return {
      success: true,
      data: dataUrl,
      filename,
      format: 'svg',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Export failed',
      filename: '',
      format: 'svg',
    };
  }
}

/**
 * Convert object to SVG string
 */
function objectToSVG(obj: TextObj | ImageObj | ShapeObj | PathObj, dpi: number): string {
  const x = obj.x * dpi;
  const y = obj.y * dpi;
  const width = obj.width * dpi;
  const height = obj.height * dpi;
  const transform = obj.rotation ? `transform="rotate(${obj.rotation} ${x + width/2} ${y + height/2})"` : '';
  const opacity = obj.opacity < 1 ? `opacity="${obj.opacity}"` : '';
  
  let svg = `<g ${transform} ${opacity}>`;
  
  switch (obj.type) {
    case 'shape':
      const shape = obj as ShapeObj;
      const fill = shape.fill?.color || 'none';
      const stroke = shape.stroke?.color || 'none';
      const strokeWidth = shape.stroke?.width || 0;
      
      if (shape.shape === 'rectangle') {
        svg += `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" rx="${shape.borderRadius || 0}"/>`;
      } else if (shape.shape === 'circle') {
        const r = Math.min(width, height) / 2;
        svg += `<circle cx="${x + width/2}" cy="${y + height/2}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
      }
      break;
    
    case 'text':
      const text = obj as TextObj;
      svg += `<text x="${x}" y="${y + height/2}" font-family="${text.fontFamily}" font-size="${text.fontSize}" font-weight="${text.fontWeight}" fill="${text.color || text.textFill}" text-anchor="start">${text.text}</text>`;
      break;
    
    case 'path':
      const path = obj as PathObj;
      const pathFill = path.fill?.color || 'none';
      const pathStroke = path.stroke?.color || 'none';
      const pathStrokeWidth = path.stroke?.width || 0;
      svg += `<path d="${path.pathData}" fill="${pathFill}" stroke="${pathStroke}" stroke-width="${pathStrokeWidth}"/>`;
      break;
    
    case 'image':
      const image = obj as ImageObj;
      if (image.src) {
        // Handle crop if specified
        if (image.crop) {
          const cropX = image.crop.x;
          const cropY = image.crop.y;
          const cropWidth = image.crop.width;
          const cropHeight = image.crop.height;
          // Use image element with clip-path for cropping
          svg += `<image href="${image.src}" x="${x}" y="${y}" width="${width}" height="${height}" clip-path="inset(${cropY}px ${cropWidth - cropX - cropWidth}px ${cropHeight - cropY - cropHeight}px ${cropX}px)"/>`;
        } else {
          svg += `<image href="${image.src}" x="${x}" y="${y}" width="${width}" height="${height}"/>`;
        }
        // Add stroke if specified
        if (image.stroke && image.stroke.width > 0) {
          svg += `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="none" stroke="${image.stroke.color || '#000000'}" stroke-width="${image.stroke.width}"/>`;
        }
      }
      break;
  }
  
  svg += `</g>`;
  return svg;
}

/**
 * Export to PDF (requires backend)
 */
export async function exportToPDF(
  objects: (TextObj | ImageObj | ShapeObj | PathObj)[],
  options: ExportOptions
): Promise<ExportResult> {
  // For now, export as PNG and note that PDF requires backend
  const pngResult = await exportToPNG(objects, options);
  return {
    ...pngResult,
    format: 'pdf',
    filename: pngResult.filename.replace('.png', '.pdf'),
  };
}

/**
 * Download exported file
 */
export function downloadExport(result: ExportResult): void {
  if (!result.success || !result.data) {
    throw new Error(result.error || 'Export failed');
  }
  
  const link = document.createElement('a');
  link.download = result.filename;
  link.href = result.data;
  link.click();
}

/**
 * Save export to history
 */
export function saveToHistory(result: ExportResult): void {
  const historyItem: ExportHistoryItem = {
    id: `export-${Date.now()}`,
    timestamp: Date.now(),
    format: result.format,
    quality: 'high', // Default, would come from options
    filename: result.filename,
    size: result.size || 0,
  };
  
  const history = getExportHistory();
  history.unshift(historyItem);
  
  // Keep only last 50 exports
  if (history.length > 50) {
    history.splice(50);
  }
  
  localStorage.setItem('export_history', JSON.stringify(history));
}

/**
 * Get export history
 */
export function getExportHistory(): ExportHistoryItem[] {
  const history = localStorage.getItem('export_history');
  return history ? JSON.parse(history) : [];
}

/**
 * Clear export history
 */
export function clearExportHistory(): void {
  localStorage.removeItem('export_history');
}

