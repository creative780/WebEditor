'use client';

import { useState, useEffect } from 'react';
import { useEditorStore, useSelectedObjects } from '../../state/useEditorStore';
import { convertUnit, formatUnitValue } from '../../lib/units';

export function Inspector() {
  const { applyTransform, unit, applyStyle } = useEditorStore();
  const selectedObjects = useSelectedObjects();

  // Get the first selected object
  const selectedObject = selectedObjects[0];
  
  // Use values directly from selected object, with fallbacks
  const position = selectedObject 
    ? { x: selectedObject.x, y: selectedObject.y }
    : { x: 0, y: 0 };
    
  const size = selectedObject 
    ? { width: selectedObject.width, height: selectedObject.height }
    : { width: 0, height: 0 };
    
  const rotation = selectedObject?.rotation || 0;

  const handlePositionChange = (axis: 'x' | 'y', value: number) => {
    const newPosition = { ...position, [axis]: value };
    
    selectedObjects.forEach(obj => {
      applyTransform(obj.id, {
        x: newPosition.x,
        y: newPosition.y,
      });
    });
  };

  const handleSizeChange = (axis: 'width' | 'height', value: number) => {
    const newSize = { ...size, [axis]: value };
    
    selectedObjects.forEach(obj => {
      applyTransform(obj.id, {
        width: newSize.width,
        height: newSize.height,
      });
    });
  };

  const handleRotationChange = (value: number) => {
    selectedObjects.forEach(obj => {
      applyTransform(obj.id, { rotation: value });
    });
  };

  if (selectedObjects.length === 0) {
    return null; // Don't render anything when no objects are selected
  }

  return (
    <div className="editor-right-panel-inspector bg-white border-t border-[#6F1414] border-opacity-20">
      <div className="p-5">
        <h3 className="font-semibold text-sm mb-4 text-[#6F1414]">Inspector</h3>
        
        {/* Position */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[#6F1414] mb-1">
              Position
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-[#6F1414] text-opacity-70 mb-1">X</label>
                <input
                  type="number"
                  className="input w-full"
                  value={formatUnitValue(position.x, unit).replace(unit, '')}
                  onChange={(e) => handlePositionChange('x', parseFloat(e.target.value) || 0)}
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-xs text-[#6F1414] text-opacity-70 mb-1">Y</label>
                <input
                  type="number"
                  className="input w-full"
                  value={formatUnitValue(position.y, unit).replace(unit, '')}
                  onChange={(e) => handlePositionChange('y', parseFloat(e.target.value) || 0)}
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Size */}
          <div>
            <label className="block text-xs font-medium text-[#6F1414] mb-1">
              Size
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-[#6F1414] text-opacity-70 mb-1">Width</label>
                <input
                  type="number"
                  className="input w-full"
                  value={formatUnitValue(size.width, unit).replace(unit, '')}
                  onChange={(e) => handleSizeChange('width', parseFloat(e.target.value) || 0)}
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-xs text-[#6F1414] text-opacity-70 mb-1">Height</label>
                <input
                  type="number"
                  className="input w-full"
                  value={formatUnitValue(size.height, unit).replace(unit, '')}
                  onChange={(e) => handleSizeChange('height', parseFloat(e.target.value) || 0)}
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Rotation */}
          <div>
            <label className="block text-xs font-medium text-[#6F1414] mb-1">
              Rotation
            </label>
            <input
              type="number"
              className="input w-full"
              value={rotation}
              onChange={(e) => handleRotationChange(parseFloat(e.target.value) || 0)}
              step="1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}