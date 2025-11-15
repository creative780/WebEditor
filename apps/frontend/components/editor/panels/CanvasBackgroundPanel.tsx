'use client';

import { 
  Square, 
  Grid3X3, 
  MoreHorizontal, 
  Circle,
  CheckSquare,
  Palette
} from 'lucide-react';
import { useEditorStore } from '../../../state/useEditorStore';

export function CanvasBackgroundPanel() {
  const { canvasBackground, setCanvasBackground } = useEditorStore();

  const backgroundTypes = [
    { id: 'solid', name: 'Solid', icon: Square },
    { id: 'grid', name: 'Grid', icon: Grid3X3 },
    { id: 'dots', name: 'Dots', icon: MoreHorizontal },
    { id: 'checkerboard', name: 'Checkerboard', icon: CheckSquare },
    { id: 'transparent', name: 'Transparent', icon: Circle },
  ];

  const colors = [
    '#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6',
    '#ced4da', '#adb5bd', '#6c757d', '#495057',
    '#343a40', '#212529', '#000000'
  ];

  return (
    <div className="panel">
      <div className="panel-header">
        <h3 className="font-semibold text-sm">CANVAS BACKGROUND</h3>
      </div>

      <div className="panel-content">
        {/* Background Type */}
        <div className="mb-6">
          <div className="text-xs font-semibold text-gray-600 mb-3">Background Type</div>
          <div className="grid grid-cols-2 gap-2">
            {backgroundTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setCanvasBackground({ type: type.id as any })}
                  className={`btn btn-ghost h-12 flex flex-col items-center justify-center gap-1 transition-all duration-150 ${
                    canvasBackground.type === type.id 
                      ? 'bg-[#6F1414] text-white' 
                      : 'hover:scale-105'
                  }`}
                  title={type.name}
                >
                  <Icon className="icon-sm" />
                  <span className="text-xs">{type.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Background Color */}
        {(canvasBackground.type === 'solid' || canvasBackground.type === 'grid' || 
          canvasBackground.type === 'dots' || canvasBackground.type === 'checkerboard') && (
          <div className="mb-6">
            <div className="text-xs font-semibold text-gray-600 mb-3">Background Color</div>
            <div className="grid grid-cols-6 gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setCanvasBackground({ color })}
                  className={`w-8 h-8 rounded border-2 transition-all duration-150 ${
                    canvasBackground.color === color 
                      ? 'border-[#6F1414] scale-110' 
                      : 'border-gray-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <div className="mt-2">
              <input
                type="color"
                value={canvasBackground.color}
                onChange={(e) => setCanvasBackground({ color: e.target.value })}
                className="w-full h-8 rounded border border-gray-300 cursor-pointer"
                title="Custom Color"
              />
            </div>
          </div>
        )}

        {/* Opacity */}
        {(canvasBackground.type === 'solid' || canvasBackground.type === 'grid' || 
          canvasBackground.type === 'dots' || canvasBackground.type === 'checkerboard') && (
          <div className="mb-6">
            <div className="text-xs font-semibold text-gray-600 mb-2">Opacity</div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={canvasBackground.opacity}
              onChange={(e) => setCanvasBackground({ opacity: parseFloat(e.target.value) })}
              className="w-full"
            />
            <div className="text-xs text-gray-400 text-center mt-1">
              {Math.round(canvasBackground.opacity * 100)}%
            </div>
          </div>
        )}

        {/* Grid Size */}
        {(canvasBackground.type === 'grid' || canvasBackground.type === 'dots' || 
          canvasBackground.type === 'checkerboard' || canvasBackground.type === 'transparent') && (
          <div className="mb-6">
            <div className="text-xs font-semibold text-gray-600 mb-2">Grid Size</div>
            <input
              type="range"
              min="10"
              max="50"
              step="5"
              value={canvasBackground.gridSize}
              onChange={(e) => setCanvasBackground({ gridSize: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="text-xs text-gray-400 text-center mt-1">
              {canvasBackground.gridSize}px
            </div>
          </div>
        )}

        {/* Preview */}
        <div className="mb-4">
          <div className="text-xs font-semibold text-gray-600 mb-2">Preview</div>
          <div className="w-full h-16 border border-gray-300 rounded bg-gray-50 flex items-center justify-center">
            <span className="text-xs text-gray-500">Background preview</span>
          </div>
        </div>
      </div>
    </div>
  );
}
