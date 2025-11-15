export type ObjectType = 'text' | 'shape' | 'image' | 'path';

export interface DesignObjectBase {
  id: string;
  design_id: string;
  type: ObjectType;
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
  created_at: Date;
  updated_at: Date;
}

export interface TextProperties {
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right' | 'justify';
  color: string;
  lineHeight: number;
  letterSpacing: number;
}

export interface ShapeProperties {
  shape: 'rectangle' | 'circle' | 'ellipse' | 'line' | 'arrow' | 'polygon' | 'star';
  fill?: {
    type: 'solid' | 'gradient';
    color?: string;
  };
  stroke?: {
    width: number;
    color: string;
    style: 'solid' | 'dashed' | 'dotted';
  };
  borderRadius?: number;
  points?: Array<{ x: number; y: number }>;
}

export interface PathProperties {
  pathData: string;
  fill?: ShapeProperties['fill'];
  stroke?: ShapeProperties['stroke'];
}

export interface ImageProperties {
  src: string;
  originalWidth: number;
  originalHeight: number;
}

export type DesignObject = DesignObjectBase & {
  properties: TextProperties | ShapeProperties | PathProperties | ImageProperties;
};

export interface CreateObjectInput {
  type: ObjectType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
  locked?: boolean;
  visible?: boolean;
  name?: string;
  properties: TextProperties | ShapeProperties | PathProperties | ImageProperties;
}

export interface UpdateObjectInput {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  opacity?: number;
  locked?: boolean;
  visible?: boolean;
  name?: string;
  properties?: Partial<TextProperties | ShapeProperties | PathProperties | ImageProperties>;
}

