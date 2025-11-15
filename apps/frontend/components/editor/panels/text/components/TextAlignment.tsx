'use client';

import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
} from 'lucide-react';

interface TextAlignmentProps {
  textAlign: 'left' | 'center' | 'right' | 'justify';
  verticalAlign: 'top' | 'middle' | 'bottom';
  onTextAlignChange: (align: 'left' | 'center' | 'right' | 'justify') => void;
  onVerticalAlignChange: (align: 'top' | 'middle' | 'bottom') => void;
}

export function TextAlignment({
  textAlign,
  verticalAlign,
  onTextAlignChange,
  onVerticalAlignChange,
}: TextAlignmentProps) {
  return (
    <>
      {/* Horizontal Alignment */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-2">Horizontal Alignment</div>
        <div className="flex gap-1">
          <button
            onClick={() => onTextAlignChange('left')}
            className={`btn btn-ghost flex-1 h-8 ${
              textAlign === 'left' ? 'bg-[#6F1414] text-white' : ''
            }`}
            title="Align Left"
          >
            <AlignLeft className="icon-sm" />
          </button>
          <button
            onClick={() => onTextAlignChange('center')}
            className={`btn btn-ghost flex-1 h-8 ${
              textAlign === 'center' ? 'bg-[#6F1414] text-white' : ''
            }`}
            title="Align Center"
          >
            <AlignCenter className="icon-sm" />
          </button>
          <button
            onClick={() => onTextAlignChange('right')}
            className={`btn btn-ghost flex-1 h-8 ${
              textAlign === 'right' ? 'bg-[#6F1414] text-white' : ''
            }`}
            title="Align Right"
          >
            <AlignRight className="icon-sm" />
          </button>
          <button
            onClick={() => onTextAlignChange('justify')}
            className={`btn btn-ghost flex-1 h-8 ${
              textAlign === 'justify' ? 'bg-[#6F1414] text-white' : ''
            }`}
            title="Justify"
          >
            <AlignJustify className="icon-sm" />
          </button>
        </div>
      </div>

      {/* Vertical Alignment */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-2">Vertical Alignment</div>
        <div className="flex gap-1">
          <button
            onClick={() => onVerticalAlignChange('top')}
            className={`btn btn-ghost flex-1 h-8 ${
              verticalAlign === 'top' ? 'bg-[#6F1414] text-white' : ''
            }`}
            title="Align Top"
          >
            <AlignVerticalJustifyStart className="icon-sm" />
          </button>
          <button
            onClick={() => onVerticalAlignChange('middle')}
            className={`btn btn-ghost flex-1 h-8 ${
              verticalAlign === 'middle' ? 'bg-[#6F1414] text-white' : ''
            }`}
            title="Align Middle"
          >
            <AlignVerticalJustifyCenter className="icon-sm" />
          </button>
          <button
            onClick={() => onVerticalAlignChange('bottom')}
            className={`btn btn-ghost flex-1 h-8 ${
              verticalAlign === 'bottom' ? 'bg-[#6F1414] text-white' : ''
            }`}
            title="Align Bottom"
          >
            <AlignVerticalJustifyEnd className="icon-sm" />
          </button>
        </div>
      </div>
    </>
  );
}

