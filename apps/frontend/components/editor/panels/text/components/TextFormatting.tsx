'use client';

import { Bold, Italic, Underline } from 'lucide-react';

interface TextFormattingProps {
  fontWeight: number;
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline' | 'line-through';
  onFontWeightChange: (weight: number) => void;
  onFontStyleChange: (style: 'normal' | 'italic') => void;
  onTextDecorationChange: (decoration: 'none' | 'underline' | 'line-through') => void;
}

export function TextFormatting({
  fontWeight,
  fontStyle,
  textDecoration,
  onFontWeightChange,
  onFontStyleChange,
  onTextDecorationChange,
}: TextFormattingProps) {
  return (
    <div className="mb-4">
      <div className="text-xs text-gray-500 mb-2">Formatting</div>
      <div className="flex gap-1">
        <button
          onClick={() => onFontWeightChange(fontWeight === 700 ? 400 : 700)}
          className={`btn btn-ghost flex-1 h-8 ${
            fontWeight === 700 ? 'bg-[#6F1414] text-white' : ''
          }`}
          title="Bold"
        >
          <Bold className="icon-sm" />
        </button>
        <button
          onClick={() => onFontStyleChange(fontStyle === 'italic' ? 'normal' : 'italic')}
          className={`btn btn-ghost flex-1 h-8 ${
            fontStyle === 'italic' ? 'bg-[#6F1414] text-white' : ''
          }`}
          title="Italic"
        >
          <Italic className="icon-sm" />
        </button>
        <button
          onClick={() => onTextDecorationChange(textDecoration === 'underline' ? 'none' : 'underline')}
          className={`btn btn-ghost flex-1 h-8 ${
            textDecoration === 'underline' ? 'bg-[#6F1414] text-white' : ''
          }`}
          title="Underline"
        >
          <Underline className="icon-sm" />
        </button>
      </div>

      {/* Font Weight Slider */}
      <div className="mt-3">
        <label className="block text-xs text-gray-500 mb-1">
          Font Weight: {fontWeight || 400}
        </label>
        <input
          type="range"
          min="100"
          max="900"
          step="100"
          value={fontWeight || 400}
          onChange={(e) => onFontWeightChange(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>100</span>
          <span>400</span>
          <span>700</span>
          <span>900</span>
        </div>
      </div>
    </div>
  );
}

