'use client';

import { Sparkles } from 'lucide-react';
import { ColorInput } from './ColorInput';
import { RGBColor } from '../../../../../lib/colorManagement';

interface RGBControlsProps {
  rgbValues: RGBColor;
  currentHex: string;
  onRgbChange: (channel: 'r' | 'g' | 'b', value: number) => void;
}

export function RGBControls({
  rgbValues,
  currentHex,
  onRgbChange,
}: RGBControlsProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-[#6F1414]/10 rounded-xl">
          <Sparkles className="w-6 h-6 text-[#6F1414]" size={24} />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900">RGB Values</h3>
          <p className="text-xs text-gray-500">Adjust screen color values</p>
        </div>
        <div className="ml-auto px-3 py-2 bg-gradient-to-r from-[#6F1414]/10 to-[#8F1818]/10 rounded-xl">
          <span className="text-xs font-semibold text-[#6F1414]">0-255</span>
        </div>
      </div>

      <div className="space-y-4">
        {[
          { key: 'r', label: 'Red', color: '#FF0000' },
          { key: 'g', label: 'Green', color: '#00FF00' },
          { key: 'b', label: 'Blue', color: '#0000FF' },
        ].map(({ key, label, color }) => (
          <ColorInput
            key={key}
            value={rgbValues[key as keyof typeof rgbValues]}
            onChange={(value) => onRgbChange(key as 'r' | 'g' | 'b', value)}
            min={0}
            max={255}
            label={label}
            color={color}
            currentColor={currentHex}
          />
        ))}
      </div>
    </div>
  );
}

