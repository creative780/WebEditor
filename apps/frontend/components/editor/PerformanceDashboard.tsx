'use client';

import { useState, useEffect } from 'react';
import { Activity, TrendingUp, TrendingDown, Zap, Cpu, Memory, AlertTriangle } from 'lucide-react';
import { performanceMonitor, PerformanceMetrics } from '../../lib/performanceMonitor';

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [benchmarking, setBenchmarking] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const current = performanceMonitor.getCurrentMetrics();
      const perfSummary = performanceMonitor.getPerformanceSummary();
      setMetrics(current);
      setSummary(perfSummary);
    }, 500); // Update every 500ms

    return () => clearInterval(interval);
  }, []);

  const handleStartBenchmark = () => {
    performanceMonitor.startBenchmarking();
    setBenchmarking(true);
  };

  const handleStopBenchmark = () => {
    const results = performanceMonitor.stopBenchmarking();
    setBenchmarking(false);
    console.log('Benchmark Results:', results);
    alert(`Benchmark completed in ${(results.duration / 1000).toFixed(2)}s. Check console for details.`);
  };

  if (!metrics || !summary) {
    return (
      <div className="p-4 text-center text-gray-500">
        <Activity className="w-8 h-8 animate-spin mx-auto mb-2" />
        <p>Loading performance data...</p>
      </div>
    );
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'text-green-600';
      case 'B':
        return 'text-blue-600';
      case 'C':
        return 'text-yellow-600';
      case 'D':
        return 'text-orange-600';
      default:
        return 'text-red-600';
    }
  };

  return (
    <div className="performance-dashboard p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-red-600" />
          Performance Dashboard
        </h2>
        <div className="flex gap-2">
          {!benchmarking ? (
            <button
              onClick={handleStartBenchmark}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Benchmark
            </button>
          ) : (
            <button
              onClick={handleStopBenchmark}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Stop Benchmark
            </button>
          )}
          <button
            onClick={() => performanceMonitor.reset()}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Performance Grade */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Performance Grade</span>
          <span className={`text-3xl font-bold ${getGradeColor(summary.grade)}`}>
            {summary.grade}
          </span>
        </div>
      </div>

      {/* FPS Metrics */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900">FPS</h3>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <div className="text-xs text-gray-500 mb-1">Current</div>
            <div className="text-lg font-semibold">{summary.fps.current}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Average</div>
            <div className="text-lg font-semibold">{summary.fps.average}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Min</div>
            <div className="text-lg font-semibold text-red-600">{summary.fps.min}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Max</div>
            <div className="text-lg font-semibold text-green-600">{summary.fps.max}</div>
          </div>
        </div>
        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-full rounded-full transition-all ${
              summary.fps.current >= 55 ? 'bg-green-600' :
              summary.fps.current >= 30 ? 'bg-yellow-600' :
              'bg-red-600'
            }`}
            style={{ width: `${(summary.fps.current / 60) * 100}%` }}
          />
        </div>
      </div>

      {/* Render Time Metrics */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Cpu className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-semibold text-gray-900">Render Time</h3>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <div className="text-xs text-gray-500 mb-1">Current</div>
            <div className="text-lg font-semibold">{summary.renderTime.current.toFixed(2)}ms</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Average</div>
            <div className="text-lg font-semibold">{summary.renderTime.average.toFixed(2)}ms</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Min</div>
            <div className="text-lg font-semibold text-green-600">{summary.renderTime.min.toFixed(2)}ms</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Max</div>
            <div className="text-lg font-semibold text-red-600">{summary.renderTime.max.toFixed(2)}ms</div>
          </div>
        </div>
      </div>

      {/* Memory Metrics */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Memory className="w-4 h-4 text-green-600" />
          <h3 className="text-sm font-semibold text-gray-900">Memory</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-xs text-gray-500 mb-1">Current</div>
            <div className="text-lg font-semibold">
              {(summary.memory.current / (1024 * 1024)).toFixed(2)}MB
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Average</div>
            <div className="text-lg font-semibold">
              {(summary.memory.average / (1024 * 1024)).toFixed(2)}MB
            </div>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {summary.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <h3 className="text-sm font-semibold text-yellow-900">Performance Warnings</h3>
          </div>
          <ul className="space-y-1">
            {summary.warnings.map((warning: string, index: number) => (
              <li key={index} className="text-xs text-yellow-800">
                • {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Current Metrics Details */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Current Metrics</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-500">Objects:</span>{' '}
            <span className="font-medium">{metrics.visibleObjectCount}/{metrics.objectCount}</span>
          </div>
          <div>
            <span className="text-gray-500">Canvas:</span>{' '}
            <span className="font-medium">{metrics.canvasSize.width}×{metrics.canvasSize.height}</span>
          </div>
          <div>
            <span className="text-gray-500">Frame Time:</span>{' '}
            <span className="font-medium">{metrics.frameTime.toFixed(2)}ms</span>
          </div>
          <div>
            <span className="text-gray-500">Memory:</span>{' '}
            <span className="font-medium">{(metrics.memoryUsage / (1024 * 1024)).toFixed(2)}MB</span>
          </div>
        </div>
      </div>
    </div>
  );
}

