'use client';

import { Pipette, AlertTriangle, CheckCircle } from 'lucide-react';
import { ColorInput } from './ColorInput';
import { CMYKColor } from '../../../../../lib/colorManagement';

interface CMYKControlsProps {
  cmykValues: CMYKColor;
  currentHex: string;
  onCmykChange: (channel: 'c' | 'm' | 'y' | 'k', value: number) => void;
  tic: number;
}

export function CMYKControls({
  cmykValues,
  currentHex,
  onCmykChange,
  tic,
}: CMYKControlsProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-[#6F1414]/10 rounded-xl">
          <Pipette className="w-6 h-6 text-[#6F1414]" size={24} />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900">CMYK Values</h3>
          <p className="text-xs text-gray-500">Adjust printing color values</p>
        </div>
        <div className="ml-auto px-3 py-2 bg-gradient-to-r from-[#6F1414]/10 to-[#8F1818]/10 rounded-xl">
          <span className="text-xs font-semibold text-[#6F1414]">0-100%</span>
        </div>
      </div>

      <div className="space-y-4">
        {[
          { key: 'c', label: 'Cyan', color: '#00FFFF' },
          { key: 'm', label: 'Magenta', color: '#FF00FF' },
          { key: 'y', label: 'Yellow', color: '#FFFF00' },
          { key: 'k', label: 'Key/Black', color: '#000000' },
        ].map(({ key, label, color }) => (
          <ColorInput
            key={key}
            value={cmykValues[key as keyof typeof cmykValues]}
            onChange={(value) =>
              onCmykChange(key as 'c' | 'm' | 'y' | 'k', value)
            }
            min={0}
            max={100}
            label={label}
            color={color}
            currentColor={currentHex}
            unit="%"
          />
        ))}
      </div>

      {/* Total Ink Coverage Indicator */}
      <div
        className={`mt-4 p-3 rounded-lg transition-all duration-300 ${
          tic > 300
            ? 'bg-gradient-to-r from-red-50 to-red-100 border border-red-200'
            : tic > 260
              ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200'
              : 'bg-gradient-to-r from-green-50 to-green-100 border border-green-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {tic > 300 ? (
              <AlertTriangle className="w-4 h-4 text-red-600" size={16} />
            ) : (
              <CheckCircle className="w-4 h-4 text-green-600" size={16} />
            )}
            <span className="text-xs font-medium text-gray-700">
              Total Ink Coverage
            </span>
          </div>
          <span
            className={`text-sm font-bold ${
              tic > 300
                ? 'text-red-600'
                : tic > 260
                  ? 'text-yellow-600'
                  : 'text-green-600'
            }`}
          >
            {tic}%
          </span>
        </div>
        {tic > 300 && (
          <p className="text-xs text-red-600 mt-2">
            ⚠️ Exceeds recommended limit. May cause printing issues.
          </p>
        )}
        {tic > 260 && tic <= 300 && (
          <p className="text-xs text-yellow-600 mt-2">
            ⚡ Approaching limit. Consider reducing values.
          </p>
        )}
      </div>
    </div>
  );
}

