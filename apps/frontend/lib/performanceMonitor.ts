/**
 * Performance Monitoring System
 * Tracks FPS, memory usage, render times, and other metrics
 */

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  renderTime: number;
  memoryUsage: number;
  objectCount: number;
  visibleObjectCount: number;
  canvasSize: { width: number; height: number };
  timestamp: number;
  pluginMetrics?: PluginPerformanceMetrics;
}

export interface PluginPerformanceMetrics {
  activePlugins: number;
  totalPluginExecutionTime: number;
  pluginAPICalls: number;
  pluginMemoryUsage: number;
}

export interface PerformanceThresholds {
  minFps: number;
  maxFrameTime: number;
  maxMemoryUsage: number;
  maxRenderTime: number;
}

export const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  minFps: 30,
  maxFrameTime: 33, // ~30 FPS
  maxMemoryUsage: 500 * 1024 * 1024, // 500MB
  maxRenderTime: 16, // 60 FPS target
};

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxHistorySize: number = 60; // Keep last 60 frames
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private fpsUpdateInterval: number = 1000; // Update FPS every second
  private lastFpsUpdate: number = 0;
  private currentFps: number = 60;
  private renderStartTime: number = 0;
  private enabled: boolean = true;

  private thresholds: PerformanceThresholds = DEFAULT_THRESHOLDS;

  // Plugin-specific tracking
  private pluginMetrics: Map<string, {
    executionCount: number;
    totalExecutionTime: number;
    apiCallCount: number;
    memoryDelta: number;
  }> = new Map();
  private pluginAPICallCount: number = 0;
  private totalPluginExecutionTime: number = 0;

  constructor(enabled: boolean = true) {
    this.enabled = enabled;
  }

  /**
   * Start tracking a render frame
   */
  startFrame(): void {
    if (!this.enabled) return;
    this.renderStartTime = performance.now();
  }

  /**
   * End tracking a render frame
   */
  endFrame(objectCount: number, visibleObjectCount: number, canvasWidth: number, canvasHeight: number): void {
    if (!this.enabled) return;

    const now = performance.now();
    const frameTime = now - this.lastFrameTime;
    const renderTime = now - this.renderStartTime;

    // Update frame count
    this.frameCount++;

    // Calculate FPS every second
    if (now - this.lastFpsUpdate >= this.fpsUpdateInterval) {
      this.currentFps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }

    // Get memory usage (if available)
    let memoryUsage = 0;
    if ('memory' in performance && (performance as any).memory) {
      memoryUsage = (performance as any).memory.usedJSHeapSize;
    }

    // Calculate plugin metrics
    const enabledPlugins = Array.from(this.pluginMetrics.keys()).length;
    const pluginMetrics: PluginPerformanceMetrics = {
      activePlugins: enabledPlugins,
      totalPluginExecutionTime: this.totalPluginExecutionTime,
      pluginAPICalls: this.pluginAPICallCount,
      pluginMemoryUsage: Array.from(this.pluginMetrics.values())
        .reduce((sum, m) => sum + m.memoryDelta, 0),
    };

    // Store metrics
    const metric: PerformanceMetrics = {
      fps: this.currentFps,
      frameTime,
      renderTime,
      memoryUsage,
      objectCount,
      visibleObjectCount,
      canvasSize: { width: canvasWidth, height: canvasHeight },
      timestamp: now,
      pluginMetrics,
    };

    this.metrics.push(metric);

    // Limit history size
    if (this.metrics.length > this.maxHistorySize) {
      this.metrics.shift();
    }

    this.lastFrameTime = now;
  }

  /**
   * Get current metrics
   */
  getCurrentMetrics(): PerformanceMetrics | null {
    if (this.metrics.length === 0) return null;
    return this.metrics[this.metrics.length - 1];
  }

  /**
   * Get average metrics over last N frames
   */
  getAverageMetrics(frames: number = 30): PerformanceMetrics | null {
    if (this.metrics.length === 0) return null;

    const recentMetrics = this.metrics.slice(-frames);
    const count = recentMetrics.length;

    return {
      fps: Math.round(recentMetrics.reduce((sum, m) => sum + m.fps, 0) / count),
      frameTime: recentMetrics.reduce((sum, m) => sum + m.frameTime, 0) / count,
      renderTime: recentMetrics.reduce((sum, m) => sum + m.renderTime, 0) / count,
      memoryUsage: recentMetrics.reduce((sum, m) => sum + m.memoryUsage, 0) / count,
      objectCount: recentMetrics[count - 1].objectCount,
      visibleObjectCount: recentMetrics[count - 1].visibleObjectCount,
      canvasSize: recentMetrics[count - 1].canvasSize,
      timestamp: recentMetrics[count - 1].timestamp,
    };
  }

  /**
   * Check if performance is below thresholds
   */
  isPerformanceDegraded(): boolean {
    const metrics = this.getCurrentMetrics();
    if (!metrics) return false;

    return (
      metrics.fps < this.thresholds.minFps ||
      metrics.frameTime > this.thresholds.maxFrameTime ||
      metrics.memoryUsage > this.thresholds.maxMemoryUsage ||
      metrics.renderTime > this.thresholds.maxRenderTime
    );
  }

  /**
   * Get performance warnings
   */
  getWarnings(): string[] {
    const metrics = this.getCurrentMetrics();
    if (!metrics) return [];

    const warnings: string[] = [];

    if (metrics.fps < this.thresholds.minFps) {
      warnings.push(`Low FPS: ${metrics.fps} (target: ${this.thresholds.minFps})`);
    }

    if (metrics.frameTime > this.thresholds.maxFrameTime) {
      warnings.push(`High frame time: ${metrics.frameTime.toFixed(2)}ms`);
    }

    if (metrics.memoryUsage > this.thresholds.maxMemoryUsage) {
      warnings.push(`High memory usage: ${(metrics.memoryUsage / (1024 * 1024)).toFixed(2)}MB`);
    }

    if (metrics.renderTime > this.thresholds.maxRenderTime) {
      warnings.push(`Slow render: ${metrics.renderTime.toFixed(2)}ms`);
    }

    return warnings;
  }

  /**
   * Get performance grade
   */
  getPerformanceGrade(): 'A' | 'B' | 'C' | 'D' | 'F' {
    const metrics = this.getAverageMetrics();
    if (!metrics) return 'A';

    if (metrics.fps >= 55 && metrics.renderTime < 10) return 'A';
    if (metrics.fps >= 45 && metrics.renderTime < 16) return 'B';
    if (metrics.fps >= 30 && metrics.renderTime < 25) return 'C';
    if (metrics.fps >= 20 && metrics.renderTime < 35) return 'D';
    return 'F';
  }

  /**
   * Get formatted metrics for display
   */
  getFormattedMetrics(): string {
    const metrics = this.getCurrentMetrics();
    if (!metrics) return 'No metrics available';

    return `
FPS: ${metrics.fps}
Frame Time: ${metrics.frameTime.toFixed(2)}ms
Render Time: ${metrics.renderTime.toFixed(2)}ms
Memory: ${(metrics.memoryUsage / (1024 * 1024)).toFixed(2)}MB
Objects: ${metrics.visibleObjectCount}/${metrics.objectCount}
Grade: ${this.getPerformanceGrade()}
    `.trim();
  }

  /**
   * Reset metrics
   */
  reset(): void {
    this.metrics = [];
    this.frameCount = 0;
    this.lastFrameTime = 0;
    this.lastFpsUpdate = 0;
    this.currentFps = 60;
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.reset();
    }
  }

  /**
   * Update thresholds
   */
  setThresholds(thresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  /**
   * Export metrics as JSON
   */
  exportMetrics(): string {
    return JSON.stringify(this.metrics, null, 2);
  }

  /**
   * Get metrics history
   */
  getHistory(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Track plugin execution
   */
  trackPluginExecution(pluginId: string, executionTime: number, apiCalls: number = 0, memoryDelta: number = 0): void {
    if (!this.pluginMetrics.has(pluginId)) {
      this.pluginMetrics.set(pluginId, {
        executionCount: 0,
        totalExecutionTime: 0,
        apiCallCount: 0,
        memoryDelta: 0,
      });
    }

    const metrics = this.pluginMetrics.get(pluginId)!;
    metrics.executionCount++;
    metrics.totalExecutionTime += executionTime;
    metrics.apiCallCount += apiCalls;
    metrics.memoryDelta += memoryDelta;

    this.totalPluginExecutionTime += executionTime;
    this.pluginAPICallCount += apiCalls;
  }

  /**
   * Get plugin metrics for a specific plugin
   */
  getPluginMetrics(pluginId: string): {
    executionCount: number;
    averageExecutionTime: number;
    totalExecutionTime: number;
    apiCallCount: number;
    memoryDelta: number;
  } | null {
    const metrics = this.pluginMetrics.get(pluginId);
    if (!metrics) return null;

    return {
      executionCount: metrics.executionCount,
      averageExecutionTime: metrics.executionCount > 0 
        ? metrics.totalExecutionTime / metrics.executionCount 
        : 0,
      totalExecutionTime: metrics.totalExecutionTime,
      apiCallCount: metrics.apiCallCount,
      memoryDelta: metrics.memoryDelta,
    };
  }

  /**
   * Get all plugin metrics
   */
  getAllPluginMetrics(): Map<string, {
    executionCount: number;
    averageExecutionTime: number;
    totalExecutionTime: number;
    apiCallCount: number;
    memoryDelta: number;
  }> {
    const result = new Map();
    for (const [pluginId, metrics] of this.pluginMetrics.entries()) {
      result.set(pluginId, {
        executionCount: metrics.executionCount,
        averageExecutionTime: metrics.executionCount > 0
          ? metrics.totalExecutionTime / metrics.executionCount
          : 0,
        totalExecutionTime: metrics.totalExecutionTime,
        apiCallCount: metrics.apiCallCount,
        memoryDelta: metrics.memoryDelta,
      });
    }
    return result;
  }

  /**
   * Reset plugin metrics
   */
  resetPluginMetrics(pluginId?: string): void {
    if (pluginId) {
      this.pluginMetrics.delete(pluginId);
    } else {
      this.pluginMetrics.clear();
      this.pluginAPICallCount = 0;
      this.totalPluginExecutionTime = 0;
    }
  }

  /**
   * Benchmarking Mode
   */
  private benchmarkingMode: boolean = false;
  private benchmarkStartTime: number = 0;
  private benchmarkResults: Array<{
    name: string;
    duration: number;
    metrics: PerformanceMetrics | null;
  }> = [];

  /**
   * Start benchmarking session
   */
  startBenchmarking(): void {
    this.benchmarkingMode = true;
    this.benchmarkStartTime = performance.now();
    this.benchmarkResults = [];
    this.reset();
  }

  /**
   * Stop benchmarking session
   */
  stopBenchmarking(): { duration: number; results: typeof this.benchmarkResults } {
    this.benchmarkingMode = false;
    const duration = performance.now() - this.benchmarkStartTime;
    return {
      duration,
      results: [...this.benchmarkResults],
    };
  }

  /**
   * Mark a benchmark point
   */
  markBenchmark(name: string): void {
    if (!this.benchmarkingMode) return;

    const currentMetrics = this.getCurrentMetrics();
    this.benchmarkResults.push({
      name,
      duration: performance.now() - this.benchmarkStartTime,
      metrics: currentMetrics,
    });
  }

  /**
   * Check for performance regressions
   */
  checkPerformanceRegression(
    baselineMetrics: PerformanceMetrics,
    currentMetrics: PerformanceMetrics
  ): {
    regressed: boolean;
    issues: string[];
    severity: 'low' | 'medium' | 'high';
  } {
    const issues: string[] = [];
    let severity: 'low' | 'medium' | 'high' = 'low';
    let regressed = false;

    // Check FPS regression
    if (currentMetrics.fps < baselineMetrics.fps * 0.9) {
      const fpsDrop = baselineMetrics.fps - currentMetrics.fps;
      issues.push(`FPS dropped by ${fpsDrop.toFixed(1)} (${baselineMetrics.fps} → ${currentMetrics.fps})`);
      if (fpsDrop > 10) severity = 'high';
      else if (fpsDrop > 5) severity = 'medium';
      regressed = true;
    }

    // Check render time regression
    if (currentMetrics.renderTime > baselineMetrics.renderTime * 1.2) {
      const timeIncrease = currentMetrics.renderTime - baselineMetrics.renderTime;
      issues.push(`Render time increased by ${timeIncrease.toFixed(2)}ms`);
      if (timeIncrease > 10) severity = 'high';
      else if (timeIncrease > 5) severity = 'medium';
      regressed = true;
    }

    // Check memory regression
    if (currentMetrics.memoryUsage > baselineMetrics.memoryUsage * 1.2) {
      const memoryIncrease = currentMetrics.memoryUsage - baselineMetrics.memoryUsage;
      issues.push(`Memory usage increased by ${(memoryIncrease / (1024 * 1024)).toFixed(2)}MB`);
      if (memoryIncrease > 100 * 1024 * 1024) severity = 'high'; // 100MB
      else if (memoryIncrease > 50 * 1024 * 1024) severity = 'medium'; // 50MB
      regressed = true;
    }

    return { regressed, issues, severity };
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    fps: { current: number; average: number; min: number; max: number };
    renderTime: { current: number; average: number; min: number; max: number };
    memory: { current: number; average: number };
    grade: string;
    warnings: string[];
  } {
    const history = this.getHistory();
    if (history.length === 0) {
      return {
        fps: { current: 60, average: 60, min: 60, max: 60 },
        renderTime: { current: 16, average: 16, min: 16, max: 16 },
        memory: { current: 0, average: 0 },
        grade: 'A',
        warnings: [],
      };
    }

    const fpsValues = history.map(m => m.fps);
    const renderTimeValues = history.map(m => m.renderTime);
    const memoryValues = history.map(m => m.memoryUsage);

    const current = history[history.length - 1];
    const fps = {
      current: current.fps,
      average: Math.round(fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length),
      min: Math.min(...fpsValues),
      max: Math.max(...fpsValues),
    };

    const renderTime = {
      current: current.renderTime,
      average: renderTimeValues.reduce((a, b) => a + b, 0) / renderTimeValues.length,
      min: Math.min(...renderTimeValues),
      max: Math.max(...renderTimeValues),
    };

    const memory = {
      current: current.memoryUsage,
      average: memoryValues.reduce((a, b) => a + b, 0) / memoryValues.length,
    };

    const grade = this.getPerformanceGrade();
    const warnings = this.getWarnings();

    return {
      fps,
      renderTime,
      memory,
      grade,
      warnings,
    };
  }
}

// Global instance
export const performanceMonitor = new PerformanceMonitor(true);

