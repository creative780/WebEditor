'use client';

import { Droplets } from 'lucide-react';

interface ColorPickerProps {
  currentHex: string;
  onColorChange: (hex: string) => void;
}

export function ColorPicker({ currentHex, onColorChange }: ColorPickerProps) {
  const handleColorPickerClick = () => {
    // Create a hidden color input and trigger it
    const input = document.createElement('input');
    input.type = 'color';
    input.value = currentHex;
    input.style.position = 'fixed';
    input.style.top = '50%';
    input.style.left = '50%';
    input.style.transform = 'translate(-50%, -50%)';
    input.style.opacity = '0';
    input.style.pointerEvents = 'none';
    input.style.zIndex = '9999';
    document.body.appendChild(input);
    input.click();
    input.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      const hex = target.value;
      onColorChange(hex);
      document.body.removeChild(input);
    });
    input.addEventListener('cancel', () => {
      document.body.removeChild(input);
    });
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <Droplets className="w-4 h-4 text-[#6F1414]" size={16} />
        <span className="text-xs font-semibold text-gray-700">
          Live Color Picker
        </span>
        <div
          className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
          title="Live updating"
        />
      </div>
      <div className="flex items-center gap-3">
        <div
          className="w-16 h-16 rounded-lg shadow-inner border-2 border-white transition-all duration-200 hover:scale-105 relative overflow-hidden cursor-pointer"
          style={{
            backgroundColor: currentHex,
            boxShadow: `0 2px 12px ${currentHex}40, inset 0 1px 2px rgba(0,0,0,0.1)`,
          }}
          onClick={handleColorPickerClick}
          title="Click to pick color"
        >
          {/* Live color animation overlay */}
          <div
            className="absolute inset-0 opacity-20 animate-pulse"
            style={{
              background: `linear-gradient(45deg, ${currentHex}20, ${currentHex}40)`,
            }}
          />
        </div>
        <div className="flex-1">
          <div className="text-xs text-gray-500 mb-1">
            Click to pick any color
          </div>
          <div className="text-xs font-mono text-gray-700">
            {currentHex.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}

