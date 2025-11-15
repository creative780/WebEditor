/**
 * Performance Monitoring Service
 * Tracks metrics, latency, and system health
 */

export interface Metric {
  name: string;
  value: number;
  labels?: Record<string, string>;
  timestamp: number;
}

export interface PerformanceMetrics {
  requestCount: number;
  errorCount: number;
  avgResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  activeConnections: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
}

export class MetricsService {
  private metrics: Map<string, Metric[]> = new Map();
  private counters: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();
  private startTime: number = Date.now();

  /**
   * Record a metric
   */
  record(name: string, value: number, labels?: Record<string, string>): void {
    const metric: Metric = {
      name,
      value,
      labels,
      timestamp: Date.now(),
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metrics = this.metrics.get(name)!;
    metrics.push(metric);

    // Keep only last 1000 metrics per name
    if (metrics.length > 1000) {
      metrics.shift();
    }
  }

  /**
   * Increment counter
   */
  increment(name: string, value: number = 1): void {
    const current = this.counters.get(name) || 0;
    this.counters.set(name, current + value);
  }

  /**
   * Record histogram value
   */
  recordHistogram(name: string, value: number): void {
    if (!this.histograms.has(name)) {
      this.histograms.set(name, []);
    }

    const values = this.histograms.get(name)!;
    values.push(value);

    // Keep only last 1000 values
    if (values.length > 1000) {
      values.shift();
    }
  }

  /**
   * Get counter value
   */
  getCounter(name: string): number {
    return this.counters.get(name) || 0;
  }

  /**
   * Get percentile from histogram
   */
  getPercentile(name: string, percentile: number): number {
    const values = this.histograms.get(name);
    if (!values || values.length === 0) return 0;

    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }

  /**
   * Get average from histogram
   */
  getAverage(name: string): number {
    const values = this.histograms.get(name);
    if (!values || values.length === 0) return 0;

    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  }

  /**
   * Track request
   */
  trackRequest(method: string, path: string, statusCode: number, duration: number): void {
    this.increment('http_requests_total', 1);
    this.increment(`http_requests_${statusCode}`, 1);
    this.recordHistogram('http_request_duration_ms', duration);

    if (statusCode >= 400) {
      this.increment('http_errors_total', 1);
    }

    this.record('request', duration, {
      method,
      path,
      status: statusCode.toString(),
    });
  }

  /**
   * Track WebSocket connection
   */
  trackWebSocket(event: 'connect' | 'disconnect', userId?: string): void {
    this.increment(`ws_${event}_total`, 1);
    this.record('websocket', 1, { event, userId });
  }

  /**
   * Track database query
   */
  trackDbQuery(query: string, duration: number, success: boolean): void {
    this.increment('db_queries_total', 1);
    this.recordHistogram('db_query_duration_ms', duration);

    if (!success) {
      this.increment('db_errors_total', 1);
    }

    this.record('db_query', duration, {
      success: success.toString(),
    });
  }

  /**
   * Track cache hit/miss
   */
  trackCacheHit(hit: boolean): void {
    this.increment(hit ? 'cache_hits' : 'cache_misses', 1);
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return {
      requestCount: this.getCounter('http_requests_total'),
      errorCount: this.getCounter('http_errors_total'),
      avgResponseTime: this.getAverage('http_request_duration_ms'),
      p95ResponseTime: this.getPercentile('http_request_duration_ms', 95),
      p99ResponseTime: this.getPercentile('http_request_duration_ms', 99),
      activeConnections: this.getCounter('ws_connect_total') - this.getCounter('ws_disconnect_total'),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
    };
  }

  /**
   * Get system metrics
   */
  getSystemMetrics(): Record<string, any> {
    const uptime = Date.now() - this.startTime;

    return {
      uptime,
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      platform: process.platform,
      nodeVersion: process.version,
    };
  }

  /**
   * Get cache metrics
   */
  getCacheMetrics(): { hitRate: number; hits: number; misses: number } {
    const hits = this.getCounter('cache_hits');
    const misses = this.getCounter('cache_misses');
    const total = hits + misses;
    const hitRate = total > 0 ? (hits / total) * 100 : 0;

    return {
      hitRate,
      hits,
      misses,
    };
  }

  /**
   * Export Prometheus metrics
   */
  exportPrometheus(): string {
    const lines: string[] = [];

    // Counters
    this.counters.forEach((value, name) => {
      lines.push(`${name} ${value}`);
    });

    // Histograms
    this.histograms.forEach((values, name) => {
      const avg = this.getAverage(name);
      const p95 = this.getPercentile(name, 95);
      const p99 = this.getPercentile(name, 99);

      lines.push(`${name}_avg ${avg}`);
      lines.push(`${name}_p95 ${p95}`);
      lines.push(`${name}_p99 ${p99}`);
    });

    return lines.join('\n');
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics.clear();
    this.counters.clear();
    this.histograms.clear();
    this.startTime = Date.now();
  }
}

export const metricsService = new MetricsService();

