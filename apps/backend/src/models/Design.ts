export interface Design {
  id: string;
  user_id: string;
  name: string;
  width: number;
  height: number;
  unit: 'in' | 'cm' | 'mm' | 'px' | 'pt';
  dpi: number;
  bleed: number;
  color_mode: 'rgb' | 'cmyk' | 'pantone';
  version: number;
  thumbnail_url?: string;
  created_at: Date;
  updated_at: Date;
  last_edited_by?: string;
}

export interface CreateDesignInput {
  name: string;
  width: number;
  height: number;
  unit?: 'in' | 'cm' | 'mm' | 'px' | 'pt';
  dpi?: number;
  bleed?: number;
  color_mode?: 'rgb' | 'cmyk' | 'pantone';
}

export interface UpdateDesignInput {
  name?: string;
  width?: number;
  height?: number;
  unit?: 'in' | 'cm' | 'mm' | 'px' | 'pt';
  dpi?: number;
  bleed?: number;
  color_mode?: 'rgb' | 'cmyk' | 'pantone';
}

