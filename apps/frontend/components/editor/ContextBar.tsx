'use client';

import { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useEditorStore, useSelectedObjects } from '../../state/useEditorStore';

export function ContextBar() {
  const { applyStyle } = useEditorStore();
  const selectedObjects = useSelectedObjects();

  // Get the first selected object for styling
  const selectedObject = selectedObjects[0];
  
  // Use values directly from selected object, with fallbacks
  const strokeWidth = selectedObject && (selectedObject.type === 'shape' || selectedObject.type === 'path') 
    ? (selectedObject as any).stroke?.width || 1 
    : 1;
    
  const opacity = selectedObject 
    ? ((selectedObject as any).opacity || 1) * 100 
    : 100;

  const handleStrokeWidthChange = (newWidth: number) => {
    selectedObjects.forEach(obj => {
      if (obj.type === 'shape' || obj.type === 'path') {
        applyStyle(obj.id, {
          stroke: {
            ...(obj as any).stroke,
            width: newWidth,
          },
        });
      }
    });
  };

  const handleOpacityChange = (newOpacity: number) => {
    selectedObjects.forEach(obj => {
      applyStyle(obj.id, { opacity: newOpacity / 100 });
    });
  };

  return (
    <div className="editor-context-bar">
      {/* Color Swatches */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-black border border-gray-300 rounded cursor-pointer" />
        <div className="w-6 h-6 bg-red-500 border border-gray-300 rounded cursor-pointer" />
      </div>

      {/* Stroke Width */}
      {selectedObject && (selectedObject.type === 'shape' || selectedObject.type === 'path') && (
        <div className="flex items-center gap-2">
          <button
            className="btn btn-ghost p-1"
            onClick={() => handleStrokeWidthChange(Math.max(0, strokeWidth - 1))}
          >
            <Minus className="icon-sm" />
          </button>
          
          <input
            type="number"
            className="input w-16 text-center"
            value={strokeWidth}
            onChange={(e) => handleStrokeWidthChange(parseInt(e.target.value) || 0)}
            min="0"
            max="50"
          />
          
          <button
            className="btn btn-ghost p-1"
            onClick={() => handleStrokeWidthChange(strokeWidth + 1)}
          >
            <Plus className="icon-sm" />
          </button>
        </div>
      )}

      {/* Opacity */}
      <div className="flex items-center gap-2">
        <button
          className="btn btn-ghost p-1"
          onClick={() => handleOpacityChange(Math.max(0, opacity - 10))}
        >
          <Minus className="icon-sm" />
        </button>
        
        <input
          type="number"
          className="input w-16 text-center"
          value={opacity}
          onChange={(e) => handleOpacityChange(parseInt(e.target.value) || 100)}
          min="0"
          max="100"
        />
        
        <button
          className="btn btn-ghost p-1"
          onClick={() => handleOpacityChange(Math.min(100, opacity + 10))}
        >
          <Plus className="icon-sm" />
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Selection Info */}
      {selectedObjects.length > 0 && (
        <div className="text-sm text-gray-600">
          {selectedObjects.length} object{selectedObjects.length > 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
}
