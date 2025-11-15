/**
 * Canvas Caching System
 * Caches rendered objects to avoid re-rendering unchanged content
 */

import { Obj } from '../state/useEditorStore';

export interface CacheEntry {
  canvas: HTMLCanvasElement;
  timestamp: number;
  objectId: string;
  objectState: string; // JSON hash of object properties
}

export interface CacheConfig {
  enabled: boolean;
  maxCacheSize: number; // Maximum number of cached objects
  maxCacheAge: number; // Maximum age in milliseconds
  clearOnTransform: boolean; // Clear cache when object is being transformed
}

export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  enabled: true,
  maxCacheSize: 100,
  maxCacheAge: 60000, // 1 minute
  clearOnTransform: true,
};

export class CanvasCache {
  private cache: Map<string, CacheEntry> = new Map();
  private config: CacheConfig;
  private hits: number = 0;
  private misses: number = 0;

  constructor(config: CacheConfig = DEFAULT_CACHE_CONFIG) {
    this.config = config;
  }

  /**
   * Generate a hash of object state for cache key
   */
  private generateObjectHash(obj: Obj): string {
    // Include all properties that affect rendering
    return JSON.stringify({
      type: obj.type,
      x: Math.round(obj.x),
      y: Math.round(obj.y),
      width: Math.round(obj.width),
      height: Math.round(obj.height),
      rotation: obj.rotation,
      opacity: obj.opacity,
      visible: obj.visible,
      // Add type-specific properties
      ...(obj.type === 'text' && {
        text: (obj as any).text,
        fontSize: (obj as any).fontSize,
        fontFamily: (obj as any).fontFamily,
        color: (obj as any).color,
      }),
      ...(obj.type === 'shape' && {
        shapeType: (obj as any).shapeType,
        fill: (obj as any).fill,
        stroke: (obj as any).stroke,
      }),
      // Add effects and blend mode
      blendMode: obj.blendMode,
      effects: obj.effects,
    });
  }

  /**
   * Check if object is cached and up-to-date
   */
  has(obj: Obj): boolean {
    if (!this.config.enabled) return false;

    const entry = this.cache.get(obj.id);
    if (!entry) return false;

    // Check if cache is expired
    const age = Date.now() - entry.timestamp;
    if (age > this.config.maxCacheAge) {
      this.cache.delete(obj.id);
      return false;
    }

    // Check if object state has changed
    const currentHash = this.generateObjectHash(obj);
    if (entry.objectState !== currentHash) {
      this.cache.delete(obj.id);
      return false;
    }

    return true;
  }

  /**
   * Get cached canvas for object
   */
  get(obj: Obj): HTMLCanvasElement | null {
    if (!this.config.enabled) return null;

    if (this.has(obj)) {
      this.hits++;
      return this.cache.get(obj.id)!.canvas;
    }

    this.misses++;
    return null;
  }

  /**
   * Cache rendered object
   */
  set(obj: Obj, canvas: HTMLCanvasElement): void {
    if (!this.config.enabled) return;

    // Enforce cache size limit
    if (this.cache.size >= this.config.maxCacheSize) {
      // Remove oldest entry
      const oldestKey = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
      this.cache.delete(oldestKey);
    }

    // Create cache entry
    const entry: CacheEntry = {
      canvas: this.cloneCanvas(canvas),
      timestamp: Date.now(),
      objectId: obj.id,
      objectState: this.generateObjectHash(obj),
    };

    this.cache.set(obj.id, entry);
  }

  /**
   * Clone canvas element
   */
  private cloneCanvas(sourceCanvas: HTMLCanvasElement): HTMLCanvasElement {
    const clone = document.createElement('canvas');
    clone.width = sourceCanvas.width;
    clone.height = sourceCanvas.height;
    const ctx = clone.getContext('2d');
    if (ctx) {
      ctx.drawImage(sourceCanvas, 0, 0);
    }
    return clone;
  }

  /**
   * Invalidate cache for specific object
   */
  invalidate(objectId: string): void {
    this.cache.delete(objectId);
  }

  /**
   * Invalidate cache for multiple objects
   */
  invalidateMany(objectIds: string[]): void {
    objectIds.forEach(id => this.cache.delete(id));
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Clear expired cache entries
   */
  clearExpired(): void {
    const now = Date.now();
    const expired: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > this.config.maxCacheAge) {
        expired.push(key);
      }
    });

    expired.forEach(key => this.cache.delete(key));
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? (this.hits / totalRequests) * 100 : 0;

    return {
      size: this.cache.size,
      maxSize: this.config.maxCacheSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: hitRate.toFixed(2) + '%',
      totalRequests,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Clear cache if disabled
    if (!this.config.enabled) {
      this.clear();
    }
  }

  /**
   * Get cache size in bytes (approximate)
   */
  getCacheSizeBytes(): number {
    let totalSize = 0;
    this.cache.forEach(entry => {
      // Approximate: width * height * 4 bytes per pixel (RGBA)
      totalSize += entry.canvas.width * entry.canvas.height * 4;
    });
    return totalSize;
  }

  /**
   * Get formatted cache size
   */
  getFormattedCacheSize(): string {
    const bytes = this.getCacheSizeBytes();
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}

// Global instance
export const canvasCache = new CanvasCache();

