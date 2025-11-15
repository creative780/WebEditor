/**
 * API Client for Design Operations
 * Handles communication with backend API and format conversion
 */

import { TextObj, ImageObj, ShapeObj, PathObj, useEditorStore } from '../../state/useEditorStore';
import { DocumentConfig } from '../../state/useEditorStore';

// API Base URL configuration
// Use relative URLs to leverage Next.js rewrites (proxy to Express backend on port 3001)
// Next.js rewrites will proxy /api/* to http://localhost:3001/api/*
const API_BASE_URL = '';

// Backend format interfaces
interface BackendDesign {
  id: string;
  user_id: string;
  name: string;
  width: number;
  height: number;
  unit: 'in' | 'cm' | 'mm' | 'px' | 'pt';
  dpi: number;
  bleed: number;
  color_mode: 'rgb' | 'cmyk' | 'pantone';
}

interface BackendDesignObject {
  id: string;
  design_id: string;
  type: 'text' | 'shape' | 'image' | 'path';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  z_index: number;
  locked: boolean;
  visible: boolean;
  name?: string;
  properties: any;
}

interface BackendDesignResponse {
  design: BackendDesign;
  objects: BackendDesignObject[];
}

interface CreateDesignInput {
  name: string;
  width: number;
  height: number;
  unit?: 'in' | 'cm' | 'mm' | 'px' | 'pt';
  dpi?: number;
  bleed?: number;
  color_mode?: 'rgb' | 'cmyk' | 'pantone';
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log('[API] Request:', options.method || 'GET', url);
  if (options.body) {
    console.log('[API] Body preview:', String(options.body).substring(0, 300));
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    console.log('[API] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const text = await response.text();
      console.error('[API] Error response:', text.substring(0, 500));
      
      let errorMessage = response.statusText;
      try {
        const errorData = JSON.parse(text);
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        // If response is not JSON, use status text
      }
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      throw error;
    }

    const data = await response.json();
    console.log('[API] Success:', endpoint);
    return data;
  } catch (error) {
    console.error('[API] Request failed:', endpoint, error);
    if (error instanceof Error) {
      if ((error as any).status) {
        throw error;
      }
      // Network error
      const networkError = new Error(`Network error: ${error.message}`);
      (networkError as any).status = 0;
      throw networkError;
    }
    throw error;
  }
}

function frontendToBackend(obj: TextObj | ImageObj | ShapeObj | PathObj): any {
  const base = {
    type: obj.type,
    x: obj.x,
    y: obj.y,
    width: obj.width,
    height: obj.height,
    rotation: obj.rotation || 0,
    opacity: obj.opacity !== undefined ? obj.opacity : 1,
    locked: obj.locked || false,
    visible: obj.visible !== false,
    name: obj.name,
    properties: {} as any,
  };

  if (obj.type === 'text') {
    base.properties = {
      text: obj.text,
      fontFamily: obj.fontFamily,
      fontSize: obj.fontSize,
      fontWeight: obj.fontWeight,
      fontStyle: obj.fontStyle,
      textAlign: obj.textAlign,
      verticalAlign: obj.verticalAlign,
      lineHeight: obj.lineHeight,
      letterSpacing: obj.letterSpacing,
      color: obj.color,
      textFill: obj.textFill,
      backgroundColor: obj.backgroundColor,
      padding: obj.padding,
      border: obj.border,
      textDecoration: obj.textDecoration,
      textTransform: obj.textTransform,
      textShadow: obj.textShadow,
      textStroke: obj.textStroke,
      textStrokeWidth: obj.textStrokeWidth,
      listType: obj.listType,
      listStyle: obj.listStyle,
      hyphenate: obj.hyphenate,
      wrapMode: obj.wrapMode,
      pathData: obj.pathData,
      pathOffset: obj.pathOffset,
      pathReverse: obj.pathReverse,
    };
  } else if (obj.type === 'shape') {
    base.properties = {
      shape: obj.shape,
      fill: obj.fill,
      stroke: obj.stroke,
      borderRadius: obj.borderRadius,
      points: obj.points,
    };
  } else if (obj.type === 'path') {
    base.properties = {
      pathData: obj.pathData,
      fill: obj.fill,
      stroke: obj.stroke,
    };
  } else if (obj.type === 'image') {
    base.properties = {
      src: obj.src,
      originalWidth: obj.originalWidth,
      originalHeight: obj.originalHeight,
      originalDPI: obj.originalDPI,
      filename: obj.filename,
      crop: obj.crop,
      filters: obj.filters,
    };
  }

  if (obj.groupId) {
    base.properties.groupId = obj.groupId;
  }
  if (obj.blendMode) {
    base.properties.blendMode = obj.blendMode;
  }
  if (obj.effects) {
    base.properties.effects = obj.effects;
  }

  return base;
}

function backendToFrontend(backendObj: BackendDesignObject): TextObj | ImageObj | ShapeObj | PathObj {
  const base = {
    id: backendObj.id,
    type: backendObj.type,
    x: backendObj.x || 0,
    y: backendObj.y || 0,
    width: backendObj.width || 100,
    height: backendObj.height || 100,
    rotation: backendObj.rotation || 0,
    opacity: backendObj.opacity !== undefined ? backendObj.opacity : 1,
    locked: backendObj.locked || false,
    visible: backendObj.visible !== false,
    name: backendObj.name,
    zIndex: backendObj.z_index || 0,
  };

  let props: any = {};
  if (backendObj.properties) {
    if (typeof backendObj.properties === 'string') {
      try {
        props = JSON.parse(backendObj.properties);
      } catch (e) {
        props = {};
      }
    } else {
      props = backendObj.properties;
    }
  }

  const groupId = props.groupId || null;
  delete props.groupId;
  const blendMode = props.blendMode;
  const effects = props.effects;
  delete props.blendMode;
  delete props.effects;

  if (backendObj.type === 'text') {
    return {
      ...base,
      type: 'text',
      text: props.text || '',
      fontFamily: props.fontFamily || 'Inter',
      fontSize: props.fontSize || 16,
      fontWeight: props.fontWeight || 400,
      fontStyle: props.fontStyle || 'normal',
      textAlign: props.textAlign || 'left',
      verticalAlign: props.verticalAlign || 'top',
      lineHeight: props.lineHeight || 1.5,
      letterSpacing: props.letterSpacing || 0,
      color: props.color || '#000000',
      textFill: props.textFill || props.color || '#000000',
      backgroundColor: props.backgroundColor,
      padding: props.padding || { top: 0, right: 0, bottom: 0, left: 0 },
      border: props.border,
      textDecoration: props.textDecoration,
      textTransform: props.textTransform,
      textShadow: props.textShadow,
      textStroke: props.textStroke,
      textStrokeWidth: props.textStrokeWidth,
      listType: props.listType,
      listStyle: props.listStyle,
      hyphenate: props.hyphenate,
      wrapMode: props.wrapMode,
      pathData: props.pathData,
      pathOffset: props.pathOffset,
      pathReverse: props.pathReverse,
      groupId,
      blendMode,
      effects,
    } as TextObj;
  } else if (backendObj.type === 'shape') {
    return {
      ...base,
      type: 'shape',
      shape: props.shape || 'rectangle',
      fill: props.fill,
      stroke: props.stroke,
      borderRadius: props.borderRadius,
      points: props.points,
      groupId,
      blendMode,
      effects,
    } as ShapeObj;
  } else if (backendObj.type === 'path') {
    return {
      ...base,
      type: 'path',
      pathData: props.pathData || '',
      fill: props.fill,
      stroke: props.stroke,
      groupId,
      blendMode,
      effects,
    } as PathObj;
  } else if (backendObj.type === 'image') {
    return {
      ...base,
      type: 'image',
      src: props.src || '',
      originalWidth: props.originalWidth || backendObj.width,
      originalHeight: props.originalHeight || backendObj.height,
      originalDPI: props.originalDPI,
      filename: props.filename,
      crop: props.crop,
      filters: props.filters || {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        hue: 0,
        blur: 0,
      },
      groupId,
      blendMode,
      effects,
    } as ImageObj;
  }

  throw new Error(`Unknown object type: ${backendObj.type}`);
}

export class DesignClient {
  async loadDesign(designId: string): Promise<{
    designId: string;
    document: DocumentConfig;
    objects: (TextObj | ImageObj | ShapeObj | PathObj)[];
    projectColorMode: 'rgb' | 'cmyk' | 'pantone';
  }> {
    console.log('[API] Loading design:', designId);
    try {
      const data = await apiRequest<any>(`/api/designs/${designId}`);
      console.log('[API] Raw response:', JSON.stringify(data).substring(0, 500));
      
      // Backend returns { design, objects } structure
      const design = data.design || data;
      const objectsArray = data.objects || [];
      const objects = objectsArray.map(backendToFrontend);
      console.log('[API] Converted', objects.length, 'objects to frontend format');

      return {
        designId: design.id,
        document: {
          width: design.width,
          height: design.height,
          unit: design.unit,
          bleed: design.bleed,
          dpi: design.dpi,
          pages: 1,
          currentPage: 1,
        },
        objects,
        projectColorMode: design.color_mode,
      };
    } catch (error) {
      console.error('[API] Failed to load design:', error);
      throw error;
    }
  }

  async createDesign(input: CreateDesignInput): Promise<string> {
    console.log('[API] Creating new design:', input);
    try {
      const design = await apiRequest<BackendDesign>('/api/designs', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      console.log('[API] Design created with ID:', design.id);
      return design.id;
    } catch (error) {
      console.error('[API] Failed to create design:', error);
      throw error;
    }
  }

  async updateDesign(designId: string, updates: Partial<CreateDesignInput>): Promise<void> {
    await apiRequest(`/api/designs/${designId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async createObject(designId: string, obj: TextObj | ImageObj | ShapeObj | PathObj): Promise<string> {
    console.log('[API] Creating object for design:', designId, 'type:', obj.type);
    const input = frontendToBackend(obj);
    console.log('[API] Sending:', JSON.stringify(input).substring(0, 200));
    try {
      const result = await apiRequest<BackendDesignObject>(
        `/api/designs/${designId}/objects`,
        {
          method: 'POST',
          body: JSON.stringify(input),
        }
      );
      console.log('[API] Object created, backend ID:', result.id);
      return result.id;
    } catch (error) {
      console.error('[API] Failed to create object:', error);
      throw error;
    }
  }

  async updateObject(
    designId: string,
    objectId: string,
    updates: Partial<TextObj | ImageObj | ShapeObj | PathObj>
  ): Promise<void> {
    const backendUpdates: any = {};
    
    // Update position and transform properties
    if (updates.x !== undefined) backendUpdates.x = updates.x;
    if (updates.y !== undefined) backendUpdates.y = updates.y;
    if (updates.width !== undefined) backendUpdates.width = updates.width;
    if (updates.height !== undefined) backendUpdates.height = updates.height;
    if (updates.rotation !== undefined) backendUpdates.rotation = updates.rotation;
    if (updates.opacity !== undefined) backendUpdates.opacity = updates.opacity;
    if (updates.locked !== undefined) backendUpdates.locked = updates.locked;
    if (updates.visible !== undefined) backendUpdates.visible = updates.visible;
    if (updates.name !== undefined) backendUpdates.name = updates.name;

    // Get current object to build complete properties (backend merges JSONB)
    const currentObj = useEditorStore.getState().objects.find(o => o.id === objectId);
    
    if (currentObj) {
      const propsUpdates: any = {};
      
      // Build complete properties from current object state
      if (currentObj.type === 'text') {
        const textObj = currentObj as TextObj;
        propsUpdates.text = textObj.text;
        propsUpdates.fontFamily = textObj.fontFamily;
        propsUpdates.fontSize = textObj.fontSize;
        propsUpdates.fontWeight = textObj.fontWeight;
        propsUpdates.fontStyle = textObj.fontStyle;
        propsUpdates.textAlign = textObj.textAlign;
        propsUpdates.color = textObj.color;
        propsUpdates.lineHeight = textObj.lineHeight;
        propsUpdates.letterSpacing = textObj.letterSpacing;
      } else if (currentObj.type === 'shape') {
        const shapeObj = currentObj as ShapeObj;
        propsUpdates.shape = shapeObj.shape;
        propsUpdates.fill = shapeObj.fill;
        propsUpdates.stroke = shapeObj.stroke;
        propsUpdates.borderRadius = shapeObj.borderRadius;
        propsUpdates.points = shapeObj.points;
      } else if (currentObj.type === 'path') {
        const pathObj = currentObj as PathObj;
        propsUpdates.pathData = pathObj.pathData;
        propsUpdates.fill = pathObj.fill;
        propsUpdates.stroke = pathObj.stroke;
      } else if (currentObj.type === 'image') {
        const imageObj = currentObj as ImageObj;
        propsUpdates.src = imageObj.src;
        propsUpdates.originalWidth = imageObj.originalWidth;
        propsUpdates.originalHeight = imageObj.originalHeight;
        propsUpdates.originalDPI = imageObj.originalDPI;
        propsUpdates.filename = imageObj.filename;
        propsUpdates.crop = imageObj.crop;
        propsUpdates.filters = imageObj.filters;
      }
      
      // Add groupId, blendMode, effects if they exist
      if (currentObj.groupId) propsUpdates.groupId = currentObj.groupId;
      if (currentObj.blendMode) propsUpdates.blendMode = currentObj.blendMode;
      if (currentObj.effects) propsUpdates.effects = currentObj.effects;
      
      backendUpdates.properties = propsUpdates;
    }

    await apiRequest(`/api/designs/${designId}/objects/${objectId}`, {
      method: 'PUT',
      body: JSON.stringify(backendUpdates),
    });
  }

  async deleteObject(designId: string, objectId: string): Promise<void> {
    await apiRequest(`/api/designs/${designId}/objects/${objectId}`, {
      method: 'DELETE',
    });
  }
}

export const designClient = new DesignClient();
