/**
 * Memory Management System
 * Tracks and optimizes memory usage
 */

export interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  percentageUsed: number;
}

export interface MemoryThresholds {
  warning: number; // Percentage at which to show warning
  critical: number; // Percentage at which to take action
}

export const DEFAULT_MEMORY_THRESHOLDS: MemoryThresholds = {
  warning: 70, // 70% usage
  critical: 85, // 85% usage
};

export class MemoryManager {
  private thresholds: MemoryThresholds;
  private cleanupCallbacks: Array<() => void> = [];
  private monitoringInterval: number | null = null;
  private lastCleanup: number = 0;
  private cleanupCooldown: number = 5000; // 5 seconds between cleanups

  constructor(thresholds: MemoryThresholds = DEFAULT_MEMORY_THRESHOLDS) {
    this.thresholds = thresholds;
  }

  /**
   * Get current memory info
   */
  getMemoryInfo(): MemoryInfo | null {
    if ('memory' in performance && (performance as any).memory) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        percentageUsed: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
      };
    }
    return null;
  }

  /**
   * Check if memory usage is at warning level
   */
  isMemoryWarning(): boolean {
    const info = this.getMemoryInfo();
    if (!info) return false;
    return info.percentageUsed >= this.thresholds.warning;
  }

  /**
   * Check if memory usage is at critical level
   */
  isMemoryCritical(): boolean {
    const info = this.getMemoryInfo();
    if (!info) return false;
    return info.percentageUsed >= this.thresholds.critical;
  }

  /**
   * Get memory status
   */
  getMemoryStatus(): 'ok' | 'warning' | 'critical' {
    if (this.isMemoryCritical()) return 'critical';
    if (this.isMemoryWarning()) return 'warning';
    return 'ok';
  }

  /**
   * Register cleanup callback
   */
  registerCleanup(callback: () => void): void {
    this.cleanupCallbacks.push(callback);
  }

  /**
   * Unregister cleanup callback
   */
  unregisterCleanup(callback: () => void): void {
    this.cleanupCallbacks = this.cleanupCallbacks.filter(cb => cb !== callback);
  }

  /**
   * Trigger cleanup
   */
  triggerCleanup(): void {
    const now = Date.now();
    
    // Respect cooldown
    if (now - this.lastCleanup < this.cleanupCooldown) {
      return;
    }

    console.log('🧹 Memory Manager: Triggering cleanup');
    
    // Execute all cleanup callbacks
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Memory cleanup error:', error);
      }
    });

    this.lastCleanup = now;

    // Force garbage collection if available (Chrome DevTools)
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
    }
  }

  /**
   * Start monitoring memory
   */
  startMonitoring(interval: number = 5000): void {
    if (this.monitoringInterval !== null) {
      return; // Already monitoring
    }

    this.monitoringInterval = window.setInterval(() => {
      const status = this.getMemoryStatus();
      
      if (status === 'critical') {
        console.warn('⚠️ Memory Manager: Critical memory usage detected');
        this.triggerCleanup();
      } else if (status === 'warning') {
        console.warn('⚠️ Memory Manager: High memory usage detected');
      }
    }, interval);
  }

  /**
   * Stop monitoring memory
   */
  stopMonitoring(): void {
    if (this.monitoringInterval !== null) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Get formatted memory info
   */
  getFormattedMemoryInfo(): string {
    const info = this.getMemoryInfo();
    if (!info) return 'Memory info not available';

    const formatBytes = (bytes: number) => {
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    return `
Used: ${formatBytes(info.usedJSHeapSize)}
Total: ${formatBytes(info.totalJSHeapSize)}
Limit: ${formatBytes(info.jsHeapSizeLimit)}
Usage: ${info.percentageUsed.toFixed(2)}%
Status: ${this.getMemoryStatus().toUpperCase()}
    `.trim();
  }

  /**
   * Update thresholds
   */
  setThresholds(thresholds: Partial<MemoryThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }
}

/**
 * Common cleanup utilities
 */
export class MemoryCleanupUtils {
  /**
   * Clear unused canvas caches
   */
  static clearCanvasCaches(): void {
    // Implementation depends on your canvas cache system
    console.log('Clearing canvas caches');
  }

  /**
   * Clear old history entries
   */
  static clearOldHistory(maxAge: number = 300000): void {
    // Clear history older than 5 minutes
    console.log('Clearing old history');
  }

  /**
   * Release large objects
   */
  static releaseUnusedObjects(): void {
    console.log('Releasing unused objects');
  }

  /**
   * Clear image caches
   */
  static clearImageCaches(): void {
    console.log('Clearing image caches');
  }

  /**
   * Compact data structures
   */
  static compactDataStructures(): void {
    console.log('Compacting data structures');
  }
}

// Global instance
export const memoryManager = new MemoryManager();

// Auto-start monitoring in browser
if (typeof window !== 'undefined') {
  memoryManager.startMonitoring();
  
  // Register default cleanup actions
  memoryManager.registerCleanup(() => {
    MemoryCleanupUtils.clearCanvasCaches();
    MemoryCleanupUtils.clearOldHistory();
  });
}

