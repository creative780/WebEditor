'use client';

import { Zap } from 'lucide-react';
import { TextObj } from '../../../../../state/useEditorStore';

interface TextPathControlsProps {
  textObj: TextObj;
  onWrapModeChange: (wrapMode: 'none' | 'area' | 'path') => void;
  onPathOffsetChange: (offset: number) => void;
  onPathReverseChange: (reverse: boolean) => void;
}

export function TextPathControls({
  textObj,
  onWrapModeChange,
  onPathOffsetChange,
  onPathReverseChange,
}: TextPathControlsProps) {
  const handlePathToggle = () => {
    const isPathMode = textObj.wrapMode === 'path';
    const newWrapMode = isPathMode ? 'none' : 'path';

    onWrapModeChange(newWrapMode);

    if (newWrapMode === 'path' && !textObj.pathData) {
      // Create a simple curved path as default
      const centerX = textObj.width / 2;
      const centerY = textObj.height / 2;
      const pathData = `M 0,${centerY} Q ${centerX},0 ${textObj.width},${centerY}`;
      // This would need to be handled by parent component
    }
  };

  return (
    <>
      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-2">Text Effects</div>
        <div className="flex gap-1">
          <button
            onClick={handlePathToggle}
            className={`btn btn-ghost flex-1 h-8 ${
              textObj.wrapMode === 'path' ? 'bg-[#6F1414] text-white' : ''
            }`}
            title="Text on Path"
          >
            <Zap className="icon-sm" />
          </button>
        </div>
      </div>

      {/* Path Options */}
      {textObj.wrapMode === 'path' && (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <div className="text-xs text-gray-500 mb-2">Path Options</div>

          <div className="mb-2">
            <label className="block text-xs text-gray-500 mb-1">Path Offset</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={textObj.pathOffset || 0}
              onChange={(e) => onPathOffsetChange(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-gray-400 text-center mt-1">
              {Math.round((textObj.pathOffset || 0) * 100)}%
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pathReverse"
              checked={textObj.pathReverse || false}
              onChange={(e) => onPathReverseChange(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="pathReverse" className="text-xs text-gray-500">
              Reverse Direction
            </label>
          </div>
        </div>
      )}
    </>
  );
}

