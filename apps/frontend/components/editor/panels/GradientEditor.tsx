'use client';

import { useState, useCallback } from 'react';
import { Plus, Trash2, Move } from 'lucide-react';

export interface GradientStop {
  position: number; // 0-1
  color: string;
  id: string;
}

export interface GradientConfig {
  type: 'linear' | 'radial' | 'conic';
  angle: number;
  stops: GradientStop[];
}

interface GradientEditorProps {
  gradient: GradientConfig;
  onChange: (gradient: GradientConfig) => void;
}

export function GradientEditor({ gradient, onChange }: GradientEditorProps) {
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [isDraggingStop, setIsDraggingStop] = useState(false);

  const handleAddStop = useCallback(() => {
    // Add stop at midpoint between selected and next stop, or at 0.5
    const position = selectedStopId
      ? (() => {
          const selectedIndex = gradient.stops.findIndex(s => s.id === selectedStopId);
          if (selectedIndex < gradient.stops.length - 1) {
            return (gradient.stops[selectedIndex].position + gradient.stops[selectedIndex + 1].position) / 2;
          }
          return 0.5;
        })()
      : 0.5;

    const newStop: GradientStop = {
      id: `stop-${Date.now()}`,
      position,
      color: '#888888',
    };

    const newStops = [...gradient.stops, newStop].sort((a, b) => a.position - b.position);
    onChange({ ...gradient, stops: newStops });
    setSelectedStopId(newStop.id);
  }, [gradient, selectedStopId, onChange]);

  const handleRemoveStop = useCallback((stopId: string) => {
    if (gradient.stops.length <= 2) return; // Minimum 2 stops

    const newStops = gradient.stops.filter(s => s.id !== stopId);
    onChange({ ...gradient, stops: newStops });
    setSelectedStopId(null);
  }, [gradient, onChange]);

  const handleStopColorChange = useCallback((stopId: string, color: string) => {
    const newStops = gradient.stops.map(s =>
      s.id === stopId ? { ...s, color } : s
    );
    onChange({ ...gradient, stops: newStops });
  }, [gradient, onChange]);

  const handleStopPositionChange = useCallback((stopId: string, position: number) => {
    const clampedPosition = Math.max(0, Math.min(1, position));
    const newStops = gradient.stops.map(s =>
      s.id === stopId ? { ...s, position: clampedPosition } : s
    ).sort((a, b) => a.position - b.position);
    onChange({ ...gradient, stops: newStops });
  }, [gradient, onChange]);

  const handleTypeChange = useCallback((type: 'linear' | 'radial' | 'conic') => {
    onChange({ ...gradient, type });
  }, [gradient, onChange]);

  const handleAngleChange = useCallback((angle: number) => {
    onChange({ ...gradient, angle });
  }, [gradient, onChange]);

  // Generate CSS gradient for preview
  const gradientCSS = (() => {
    const stopStrings = gradient.stops
      .map(stop => `${stop.color} ${stop.position * 100}%`)
      .join(', ');

    switch (gradient.type) {
      case 'linear':
        return `linear-gradient(${gradient.angle}deg, ${stopStrings})`;
      case 'radial':
        return `radial-gradient(circle, ${stopStrings})`;
      case 'conic':
        return `conic-gradient(from ${gradient.angle}deg, ${stopStrings})`;
    }
  })();

  return (
    <div className="gradient-editor space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Gradient Editor</h3>
        
        {/* Preview */}
        <div
          className="w-full h-24 rounded-lg border-2 border-gray-300 mb-4"
          style={{ background: gradientCSS }}
        />

        {/* Type selector */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-2">Gradient Type</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              className={`px-3 py-2 text-xs rounded transition-colors ${
                gradient.type === 'linear'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              onClick={() => handleTypeChange('linear')}
            >
              Linear
            </button>
            <button
              className={`px-3 py-2 text-xs rounded transition-colors ${
                gradient.type === 'radial'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              onClick={() => handleTypeChange('radial')}
            >
              Radial
            </button>
            <button
              className={`px-3 py-2 text-xs rounded transition-colors ${
                gradient.type === 'conic'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              onClick={() => handleTypeChange('conic')}
            >
              Conic
            </button>
          </div>
        </div>

        {/* Angle control (for linear and conic) */}
        {(gradient.type === 'linear' || gradient.type === 'conic') && (
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Angle: {gradient.angle}°
            </label>
            <input
              type="range"
              min="0"
              max="360"
              value={gradient.angle}
              onChange={(e) => handleAngleChange(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        )}

        {/* Gradient bar with stops */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-2">Color Stops</label>
          <div
            className="relative w-full h-8 rounded border border-gray-300"
            style={{ background: gradientCSS }}
          >
            {gradient.stops.map((stop) => (
              <div
                key={stop.id}
                className={`absolute top-0 w-4 h-8 border-2 cursor-pointer transition-all ${
                  selectedStopId === stop.id
                    ? 'border-blue-500 scale-110'
                    : 'border-white hover:border-blue-300'
                }`}
                style={{
                  left: `calc(${stop.position * 100}% - 8px)`,
                  backgroundColor: stop.color,
                }}
                onClick={() => setSelectedStopId(stop.id)}
              />
            ))}
          </div>
        </div>

        {/* Selected stop controls */}
        {selectedStopId && (() => {
          const selectedStop = gradient.stops.find(s => s.id === selectedStopId);
          if (!selectedStop) return null;

          return (
            <div className="p-3 bg-gray-50 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700">Edit Stop</span>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleRemoveStop(selectedStopId)}
                  disabled={gradient.stops.length <= 2}
                  title="Remove stop"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Color</label>
                <input
                  type="color"
                  value={selectedStop.color}
                  onChange={(e) => handleStopColorChange(selectedStopId, e.target.value)}
                  className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Position: {Math.round(selectedStop.position * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedStop.position * 100}
                  onChange={(e) => handleStopPositionChange(selectedStopId, parseInt(e.target.value) / 100)}
                  className="w-full"
                />
              </div>
            </div>
          );
        })()}

        {/* Add stop button */}
        <button
          className="btn btn-primary w-full text-sm mt-2"
          onClick={handleAddStop}
        >
          <Plus size={16} className="mr-2" />
          Add Color Stop
        </button>

        {/* Stop list */}
        <div className="mt-4 space-y-1">
          <div className="text-xs font-medium text-gray-600 mb-2">
            {gradient.stops.length} Color Stops
          </div>
          {gradient.stops.map((stop, index) => (
            <div
              key={stop.id}
              className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                selectedStopId === stop.id
                  ? 'bg-blue-50 border border-blue-300'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
              onClick={() => setSelectedStopId(stop.id)}
            >
              <div
                className="w-6 h-6 rounded border border-gray-300"
                style={{ backgroundColor: stop.color }}
              />
              <div className="flex-1 text-xs">
                <div className="font-medium">Stop {index + 1}</div>
                <div className="text-gray-500">{Math.round(stop.position * 100)}%</div>
              </div>
              <div className="text-xs text-gray-500">{stop.color}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

