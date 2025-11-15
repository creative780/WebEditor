'use client';

import { useSelectedObjects } from '../../../../state/useEditorStore';
import { formatUnitValue } from '../../../../lib/units';

interface InspectorProps {
  unit: 'px' | 'mm' | 'in' | 'cm' | 'ft';
  onPositionChange: (axis: 'x' | 'y', value: number) => void;
  onSizeChange: (axis: 'width' | 'height', value: number) => void;
  onRotationChange: (value: number) => void;
}
console.log(' Hi from Inspector');
export function Inspector({
  unit,
  onPositionChange,
  onSizeChange,
  onRotationChange,
}: InspectorProps) {
  const selectedObjects = useSelectedObjects();

  if (selectedObjects.length === 0) return null;

  const selectedObject = selectedObjects[0];
  const position = { x: selectedObject.x, y: selectedObject.y };
  const size = { width: selectedObject.width, height: selectedObject.height };
  const rotation = selectedObject.rotation || 0;

  return (
    <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
      <h3 className="font-semibold text-sm mb-3 text-[#6F1414]">Inspector</h3>

      {/* Position */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-[#6F1414] mb-1">
          Position
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-[#6F1414] text-opacity-70 mb-1">
              X
            </label>
            <input
              type="number"
              className="input w-full text-xs"
              value={formatUnitValue(position.x, unit).replace(unit, '')}
              onChange={(e) =>
                onPositionChange('x', parseFloat(e.target.value) || 0)
              }
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-xs text-[#6F1414] text-opacity-70 mb-1">
              Y
            </label>
            <input
              type="number"
              className="input w-full text-xs"
              value={formatUnitValue(position.y, unit).replace(unit, '')}
              onChange={(e) =>
                onPositionChange('y', parseFloat(e.target.value) || 0)
              }
              step="0.01"
            />
          </div>
        </div>
      </div>

      {/* Size */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-[#6F1414] mb-1">
          Size
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-[#6F1414] text-opacity-70 mb-1">
              Width
            </label>
            <input
              type="number"
              className="input w-full text-xs"
              value={formatUnitValue(size.width, unit).replace(unit, '')}
              onChange={(e) =>
                onSizeChange('width', parseFloat(e.target.value) || 0)
              }
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-xs text-[#6F1414] text-opacity-70 mb-1">
              Height
            </label>
            <input
              type="number"
              className="input w-full text-xs"
              value={formatUnitValue(size.height, unit).replace(unit, '')}
              onChange={(e) =>
                onSizeChange('height', parseFloat(e.target.value) || 0)
              }
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
          className="input w-full text-xs"
          value={rotation}
          onChange={(e) => onRotationChange(parseFloat(e.target.value) || 0)}
          step="1"
          placeholder="degrees"
        />
      </div>
    </div>
  );
}
