'use client';

import { useState } from 'react';
import { Plus, Trash2, RotateCcw } from 'lucide-react';
import { useEditorStore, useSelectedObjects } from '../../../state/useEditorStore';

export function GradientPanel() {
  const { applyStyle } = useEditorStore();
  const selectedObjects = useSelectedObjects();
  
  const [gradientType, setGradientType] = useState<'linear' | 'radial' | 'conic'>('linear');
  const [angle, setAngle] = useState(0);
  const [stops, setStops] = useState([
    { position: 0, color: '#3b82f6', opacity: 1 },
    { position: 1, color: '#1d4ed8', opacity: 1 },
  ]);

  const handleGradientTypeChange = (type: 'linear' | 'radial' | 'conic') => {
    setGradientType(type);
    
    selectedObjects.forEach(obj => {
      if (obj.type === 'shape' || obj.type === 'path') {
        applyStyle(obj.id, {
          fill: {
            ...obj.fill,
            type: 'gradient',
            gradient: {
              type,
              // Angle is used for linear and conic gradients, not for radial
              angle: (type === 'linear' || type === 'conic') ? angle : undefined,
              stops,
            },
          },
        });
      }
    });
  };

  const handleAngleChange = (newAngle: number) => {
    setAngle(newAngle);
    
    selectedObjects.forEach(obj => {
      if (obj.type === 'shape' || obj.type === 'path') {
        applyStyle(obj.id, {
          fill: {
            ...obj.fill,
            gradient: {
              type: gradientType,
              // Angle is used for linear and conic gradients, not for radial
              angle: (gradientType === 'linear' || gradientType === 'conic') ? newAngle : undefined,
              stops,
            },
          },
        });
      }
    });
  };

  const handleStopChange = (index: number, property: 'position' | 'color' | 'opacity', value: any) => {
    const newStops = [...stops];
    newStops[index] = { ...newStops[index], [property]: value };
    setStops(newStops);
    
    selectedObjects.forEach(obj => {
      if (obj.type === 'shape' || obj.type === 'path') {
        applyStyle(obj.id, {
          fill: {
            ...obj.fill,
            gradient: {
              type: gradientType,
              // Angle is used for linear and conic gradients, not for radial
              angle: (gradientType === 'linear' || gradientType === 'conic') ? angle : undefined,
              stops: newStops,
            },
          },
        });
      }
    });
  };

  const addStop = () => {
    const newStop = {
      position: 0.5,
      color: '#ffffff',
      opacity: 1,
    };
    const newStops = [...stops, newStop].sort((a, b) => a.position - b.position);
    setStops(newStops);
    
    // Apply the updated stops to selected objects
    selectedObjects.forEach(obj => {
      if (obj.type === 'shape' || obj.type === 'path') {
        applyStyle(obj.id, {
          fill: {
            ...obj.fill,
            gradient: {
              type: gradientType,
              // Angle is used for linear and conic gradients, not for radial
              angle: (gradientType === 'linear' || gradientType === 'conic') ? angle : undefined,
              stops: newStops,
            },
          },
        });
      }
    });
  };

  const removeStop = (index: number) => {
    if (stops.length > 2) {
      const newStops = stops.filter((_, i) => i !== index);
      setStops(newStops);
      
      // Apply the updated stops to selected objects
      selectedObjects.forEach(obj => {
        if (obj.type === 'shape' || obj.type === 'path') {
          applyStyle(obj.id, {
            fill: {
              ...obj.fill,
              gradient: {
                type: gradientType,
                // Angle is used for linear and conic gradients, not for radial
                angle: (gradientType === 'linear' || gradientType === 'conic') ? angle : undefined,
                stops: newStops,
              },
            },
          });
        }
      });
    }
  };

  const resetGradient = () => {
    setGradientType('linear');
    setAngle(0);
    setStops([
      { position: 0, color: '#3b82f6', opacity: 1 },
      { position: 1, color: '#1d4ed8', opacity: 1 },
    ]);
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">GRADIENT</h3>
          <button
            className="btn btn-ghost p-1"
            onClick={resetGradient}
            title="Reset gradient"
          >
            <RotateCcw className="icon-sm" />
          </button>
        </div>
      </div>

      <div className="panel-content">
        {/* Gradient Type */}
        <div className="mb-4">
          <div className="text-xs font-semibold text-gray-600 mb-2">Gradient Type</div>
          <div className="grid grid-cols-3 gap-1">
            <button
              className={`btn btn-ghost text-xs ${gradientType === 'linear' ? 'bg-gray-200' : ''}`}
              onClick={() => handleGradientTypeChange('linear')}
            >
              Linear
            </button>
            <button
              className={`btn btn-ghost text-xs ${gradientType === 'radial' ? 'bg-gray-200' : ''}`}
              onClick={() => handleGradientTypeChange('radial')}
            >
              Radial
            </button>
            <button
              className={`btn btn-ghost text-xs ${gradientType === 'conic' ? 'bg-gray-200' : ''}`}
              onClick={() => handleGradientTypeChange('conic')}
            >
              Conic
            </button>
          </div>
        </div>

        {/* Angle (for linear and conic gradients) */}
        {(gradientType === 'linear' || gradientType === 'conic') && (
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span>Angle</span>
              <span>{angle}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={angle}
              onChange={(e) => handleAngleChange(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        )}

        {/* Gradient Preview */}
        <div className="mb-4">
          <div className="text-xs font-semibold text-gray-600 mb-2">Preview</div>
          <div 
            className="w-full h-16 rounded border border-gray-300"
            style={{
              background: gradientType === 'linear' 
                ? `linear-gradient(${angle}deg, ${stops.map(s => `${s.color} ${s.position * 100}%`).join(', ')})`
                : gradientType === 'radial'
                ? `radial-gradient(circle, ${stops.map(s => `${s.color} ${s.position * 100}%`).join(', ')})`
                : `conic-gradient(from ${angle}deg, ${stops.map(s => `${s.color} ${s.position * 100}%`).join(', ')})`
            }}
          />
        </div>

        {/* Gradient Stops */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="text-xs font-semibold text-gray-600">Color Stops</div>
            <button
              className="btn btn-ghost p-1"
              onClick={addStop}
              title="Add color stop"
            >
              <Plus className="icon-sm" />
            </button>
          </div>

          <div className="space-y-2">
            {stops.map((stop, index) => (
              <div key={index} className="flex items-center gap-2">
                {/* Position */}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={stop.position}
                  onChange={(e) => handleStopChange(index, 'position', parseFloat(e.target.value))}
                  className="flex-1"
                />

                {/* Color */}
                <input
                  type="color"
                  value={stop.color}
                  onChange={(e) => handleStopChange(index, 'color', e.target.value)}
                  className="w-8 h-6 rounded border border-gray-300"
                />

                {/* Opacity */}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={stop.opacity}
                  onChange={(e) => handleStopChange(index, 'opacity', parseFloat(e.target.value))}
                  className="w-16"
                />

                {/* Remove */}
                {stops.length > 2 && (
                  <button
                    className="btn btn-ghost p-1 text-red-600"
                    onClick={() => removeStop(index)}
                    title="Remove color stop"
                  >
                    <Trash2 className="icon-sm" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Preset Gradients */}
        <div className="mb-4">
          <div className="text-xs font-semibold text-gray-600 mb-2">Presets</div>
          <div className="grid grid-cols-2 gap-1">
            <button className="btn btn-ghost h-8 text-xs">
              Blue to Purple
            </button>
            <button className="btn btn-ghost h-8 text-xs">
              Sunset
            </button>
            <button className="btn btn-ghost h-8 text-xs">
              Ocean
            </button>
            <button className="btn btn-ghost h-8 text-xs">
              Fire
            </button>
          </div>
        </div>

        {/* Apply Button */}
        <button className="btn btn-primary w-full text-sm">
          Apply Gradient
        </button>
      </div>
    </div>
  );
}
