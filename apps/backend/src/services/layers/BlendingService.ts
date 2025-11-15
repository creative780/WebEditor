/**
 * Layer Blending Service
 * Handles blend modes and layer effects
 */

export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion';

export interface LayerEffect {
  type: 'drop-shadow' | 'inner-shadow' | 'outer-glow' | 'inner-glow' | 'bevel' | 'emboss';
  enabled: boolean;
  properties: Record<string, any>;
}

export interface DropShadowEffect {
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
}

export interface GlowEffect {
  blur: number;
  spread: number;
  color: string;
  opacity: number;
}

export interface BevelEffect {
  depth: number;
  size: number;
  angle: number;
  highlightColor: string;
  shadowColor: string;
  highlightOpacity: number;
  shadowOpacity: number;
}

export class BlendingService {
  /**
   * Apply blend mode to layer
   */
  applyBlendMode(layerId: string, blendMode: BlendMode): Record<string, any> {
    return {
      blendMode,
      timestamp: Date.now(),
    };
  }

  /**
   * Create drop shadow effect
   */
  createDropShadow(params: Partial<DropShadowEffect>): LayerEffect {
    const defaults: DropShadowEffect = {
      offsetX: 0,
      offsetY: 4,
      blur: 8,
      spread: 0,
      color: '#000000',
      opacity: 0.25,
    };

    return {
      type: 'drop-shadow',
      enabled: true,
      properties: { ...defaults, ...params },
    };
  }

  /**
   * Create outer glow effect
   */
  createOuterGlow(params: Partial<GlowEffect>): LayerEffect {
    const defaults: GlowEffect = {
      blur: 10,
      spread: 0,
      color: '#FFFFFF',
      opacity: 0.75,
    };

    return {
      type: 'outer-glow',
      enabled: true,
      properties: { ...defaults, ...params },
    };
  }

  /**
   * Create inner glow effect
   */
  createInnerGlow(params: Partial<GlowEffect>): LayerEffect {
    const defaults: GlowEffect = {
      blur: 10,
      spread: 0,
      color: '#FFFFFF',
      opacity: 0.75,
    };

    return {
      type: 'inner-glow',
      enabled: true,
      properties: { ...defaults, ...params },
    };
  }

  /**
   * Create bevel/emboss effect
   */
  createBevel(params: Partial<BevelEffect>): LayerEffect {
    const defaults: BevelEffect = {
      depth: 5,
      size: 5,
      angle: 135,
      highlightColor: '#FFFFFF',
      shadowColor: '#000000',
      highlightOpacity: 0.75,
      shadowOpacity: 0.75,
    };

    return {
      type: 'bevel',
      enabled: true,
      properties: { ...defaults, ...params },
    };
  }

  /**
   * Combine multiple effects
   */
  combineEffects(effects: LayerEffect[]): Record<string, any> {
    return {
      effects: effects.filter(e => e.enabled),
      timestamp: Date.now(),
    };
  }

  /**
   * Calculate composite effect bounds
   * (for determining render area)
   */
  calculateEffectBounds(
    objectBounds: { x: number; y: number; width: number; height: number },
    effects: LayerEffect[]
  ): { x: number; y: number; width: number; height: number } {
    let minX = objectBounds.x;
    let minY = objectBounds.y;
    let maxX = objectBounds.x + objectBounds.width;
    let maxY = objectBounds.y + objectBounds.height;

    effects.forEach(effect => {
      if (!effect.enabled) return;

      switch (effect.type) {
        case 'drop-shadow': {
          const props = effect.properties as DropShadowEffect;
          const shadowBlur = props.blur + props.spread;
          minX = Math.min(minX, objectBounds.x + props.offsetX - shadowBlur);
          minY = Math.min(minY, objectBounds.y + props.offsetY - shadowBlur);
          maxX = Math.max(maxX, objectBounds.x + objectBounds.width + props.offsetX + shadowBlur);
          maxY = Math.max(maxY, objectBounds.y + objectBounds.height + props.offsetY + shadowBlur);
          break;
        }

        case 'outer-glow': {
          const props = effect.properties as GlowEffect;
          const glowSize = props.blur + props.spread;
          minX = Math.min(minX, objectBounds.x - glowSize);
          minY = Math.min(minY, objectBounds.y - glowSize);
          maxX = Math.max(maxX, objectBounds.x + objectBounds.width + glowSize);
          maxY = Math.max(maxY, objectBounds.y + objectBounds.height + glowSize);
          break;
        }

        case 'bevel': {
          const props = effect.properties as BevelEffect;
          const bevelSize = props.size;
          minX = Math.min(minX, objectBounds.x - bevelSize);
          minY = Math.min(minY, objectBounds.y - bevelSize);
          maxX = Math.max(maxX, objectBounds.x + objectBounds.width + bevelSize);
          maxY = Math.max(maxY, objectBounds.y + objectBounds.height + bevelSize);
          break;
        }
      }
    });

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  /**
   * Validate blend mode
   */
  isValidBlendMode(mode: string): mode is BlendMode {
    const validModes: BlendMode[] = [
      'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
      'color-dodge', 'color-burn', 'hard-light', 'soft-light',
      'difference', 'exclusion',
    ];
    return validModes.includes(mode as BlendMode);
  }

  /**
   * Get effect performance impact
   * (for optimization decisions)
   */
  getEffectPerformanceCost(effect: LayerEffect): 'low' | 'medium' | 'high' {
    switch (effect.type) {
      case 'drop-shadow':
      case 'inner-shadow':
        return 'low';
      case 'outer-glow':
      case 'inner-glow':
        return 'medium';
      case 'bevel':
      case 'emboss':
        return 'high';
      default:
        return 'low';
    }
  }
}

export const blendingService = new BlendingService();

