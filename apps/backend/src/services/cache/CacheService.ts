/**
 * Multi-Level Caching Service
 * Redis caching with automatic invalidation
 */

import { createClient, RedisClientType } from 'redis';

export interface CacheConfig {
  defaultTTL: number; // seconds
  enableCompression: boolean;
  keyPrefix: string;
}

export class CacheService {
  private redis: RedisClientType;
  private config: CacheConfig;

  constructor(redisUrl: string, config: Partial<CacheConfig> = {}) {
    this.redis = createClient({ url: redisUrl });
    this.config = {
      defaultTTL: 300, // 5 minutes
      enableCompression: false,
      keyPrefix: 'printstudio:',
      ...config,
    };
  }

  async connect(): Promise<void> {
    await this.redis.connect();
  }

  /**
   * Get from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const fullKey = this.getFullKey(key);
      const value = await this.redis.get(fullKey);
      
      if (!value) return null;

      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set in cache
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const fullKey = this.getFullKey(key);
      const serialized = JSON.stringify(value);
      const ttlSeconds = ttl || this.config.defaultTTL;

      await this.redis.setEx(fullKey, ttlSeconds, serialized);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Delete from cache
   */
  async delete(key: string): Promise<void> {
    try {
      const fullKey = this.getFullKey(key);
      await this.redis.del(fullKey);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * Delete by pattern
   */
  async deletePattern(pattern: string): Promise<void> {
    try {
      const fullPattern = this.getFullKey(pattern);
      const keys = await this.redis.keys(fullPattern);
      
      if (keys.length > 0) {
        await this.redis.del(keys);
      }
    } catch (error) {
      console.error('Cache delete pattern error:', error);
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      await this.redis.flushDb();
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<Record<string, any>> {
    try {
      const info = await this.redis.info('stats');
      const memory = await this.redis.info('memory');
      
      return {
        info,
        memory,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return {};
    }
  }

  /**
   * Cache design data
   */
  async cacheDesign(designId: string, designData: any, ttl: number = 300): Promise<void> {
    await this.set(`design:${designId}`, designData, ttl);
  }

  /**
   * Get cached design
   */
  async getCachedDesign(designId: string): Promise<any> {
    return await this.get(`design:${designId}`);
  }

  /**
   * Invalidate design cache
   */
  async invalidateDesign(designId: string): Promise<void> {
    await this.delete(`design:${designId}`);
    await this.deletePattern(`design:${designId}:*`);
  }

  /**
   * Cache thumbnail
   */
  async cacheThumbnail(objectId: string, thumbnailUrl: string, ttl: number = 3600): Promise<void> {
    await this.set(`thumbnail:${objectId}`, thumbnailUrl, ttl);
  }

  /**
   * Get cached thumbnail
   */
  async getCachedThumbnail(objectId: string): Promise<string | null> {
    return await this.get(`thumbnail:${objectId}`);
  }

  /**
   * Cache template data
   */
  async cacheTemplate(templateId: string, templateData: any, ttl: number = 600): Promise<void> {
    await this.set(`template:${templateId}`, templateData, ttl);
  }

  /**
   * Warm cache for popular designs
   */
  async warmCache(designIds: string[]): Promise<void> {
    console.log(`Warming cache for ${designIds.length} designs`);
    // Implementation would fetch and cache designs
  }

  private getFullKey(key: string): string {
    return `${this.config.keyPrefix}${key}`;
  }

  async disconnect(): Promise<void> {
    await this.redis.quit();
  }
}

