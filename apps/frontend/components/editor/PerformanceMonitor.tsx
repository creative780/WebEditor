'use client';

import { useState, useEffect } from 'react';
import { Activity, X, TrendingUp, TrendingDown, Zap, Database } from 'lucide-react';
import { performanceMonitor } from '../../lib/performanceMonitor';
import { memoryManager } from '../../lib/memoryManager';
import { canvasCache } from '../../lib/canvasCache';

export function PerformanceMonitor() {
  const [isOpen, setIsOpen] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [memoryInfo, setMemoryInfo] = useState<any>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getCurrentMetrics());
      setMemoryInfo(memoryManager.getMemoryInfo());
      setCacheStats(canvasCache.getStats());
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button
        className="fixed bottom-4 right-4 bg-gray-900 text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-all z-50"
        onClick={() => setIsOpen(true)}
        title="Performance Monitor"
      >
        <Activity size={20} />
      </button>
    );
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-500';
      case 'B': return 'text-blue-500';
      case 'C': return 'text-yellow-500';
      case 'D': return 'text-orange-500';
      case 'F': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getFpsColor = (fps: number) => {
    if (fps >= 55) return 'text-green-500';
    if (fps >= 45) return 'text-blue-500';
    if (fps >= 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getMemoryColor = (percentage: number) => {
    if (percentage < 70) return 'text-green-500';
    if (percentage < 85) return 'text-yellow-500';
    return 'text-red-500';
  };

  const grade = performanceMonitor.getPerformanceGrade();

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-2xl w-80 z-50 border border-gray-300">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-gray-700" />
          <span className="font-semibold text-sm text-gray-700">Performance Monitor</span>
        </div>
        <button
          className="text-gray-500 hover:text-gray-700"
          onClick={() => setIsOpen(false)}
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {/* Overall Grade */}
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-600 mb-1">Performance Grade</div>
          <div className={`text-4xl font-bold ${getGradeColor(grade)}`}>
            {grade}
          </div>
        </div>

        {/* FPS */}
        {metrics && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-gray-600" />
                <span className="text-xs font-medium text-gray-700">FPS</span>
              </div>
              <span className={`text-lg font-bold ${getFpsColor(metrics.fps)}`}>
                {metrics.fps}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Frame Time</span>
              <span className="font-medium">{metrics.frameTime.toFixed(2)}ms</span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Render Time</span>
              <span className="font-medium">{metrics.renderTime.toFixed(2)}ms</span>
            </div>
          </div>
        )}

        {/* Memory */}
        {memoryInfo && (
          <div className="space-y-2 border-t border-gray-200 pt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database size={14} className="text-gray-600" />
                <span className="text-xs font-medium text-gray-700">Memory</span>
              </div>
              <span className={`text-sm font-bold ${getMemoryColor(memoryInfo.percentageUsed)}`}>
                {memoryInfo.percentageUsed.toFixed(1)}%
              </span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Used</span>
              <span className="font-medium">
                {(memoryInfo.usedJSHeapSize / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Limit</span>
              <span className="font-medium">
                {(memoryInfo.jsHeapSizeLimit / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
            
            {/* Memory bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  memoryInfo.percentageUsed < 70 ? 'bg-green-500' :
                  memoryInfo.percentageUsed < 85 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, memoryInfo.percentageUsed)}%` }}
              />
            </div>
          </div>
        )}

        {/* Objects */}
        {metrics && (
          <div className="space-y-2 border-t border-gray-200 pt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Objects</span>
              <span className="font-medium">
                {metrics.visibleObjectCount} / {metrics.objectCount}
              </span>
            </div>
            
            {metrics.objectCount > metrics.visibleObjectCount && (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <TrendingUp size={12} />
                <span>
                  {((1 - metrics.visibleObjectCount / metrics.objectCount) * 100).toFixed(0)}% culled
                </span>
              </div>
            )}
          </div>
        )}

        {/* Cache Stats */}
        {cacheStats && (
          <div className="space-y-2 border-t border-gray-200 pt-3">
            <div className="text-xs font-medium text-gray-700 mb-2">Canvas Cache</div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Size</span>
              <span className="font-medium">
                {cacheStats.size} / {cacheStats.maxSize}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Hit Rate</span>
              <span className="font-medium text-green-600">{cacheStats.hitRate}</span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Memory</span>
              <span className="font-medium">{canvasCache.getFormattedCacheSize()}</span>
            </div>
          </div>
        )}

        {/* Warnings */}
        {performanceMonitor.isPerformanceDegraded() && (
          <div className="border-t border-gray-200 pt-3">
            <div className="text-xs font-medium text-red-600 mb-2">⚠️ Warnings</div>
            <div className="space-y-1">
              {performanceMonitor.getWarnings().map((warning, i) => (
                <div key={i} className="text-xs text-red-600 flex items-center gap-1">
                  <TrendingDown size={12} />
                  <span>{warning}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="border-t border-gray-200 pt-3 space-y-2">
          <button
            className="btn btn-ghost w-full text-xs"
            onClick={() => {
              canvasCache.clear();
              performanceMonitor.reset();
            }}
          >
            Clear Cache & Reset
          </button>
          
          <button
            className="btn btn-ghost w-full text-xs"
            onClick={() => {
              memoryManager.triggerCleanup();
            }}
          >
            Trigger Memory Cleanup
          </button>
        </div>
      </div>
    </div>
  );
}

