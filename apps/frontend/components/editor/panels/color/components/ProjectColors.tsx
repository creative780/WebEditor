'use client';

import { Plus, X } from 'lucide-react';

interface ProjectColorsProps {
  projectColors: string[];
  newColor: string;
  onColorClick: (color: string) => void;
  onAddColor: (hex: string) => void;
  onRemoveColor: (color: string) => void;
}

export function ProjectColors({
  projectColors,
  newColor,
  onColorClick,
  onAddColor,
  onRemoveColor,
}: ProjectColorsProps) {
  const handleAddColorClick = () => {
    // Create a hidden color input and trigger it
    const input = document.createElement('input');
    input.type = 'color';
    input.value = newColor;
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
      onAddColor(hex);
      document.body.removeChild(input);
    });
    input.addEventListener('cancel', () => {
      document.body.removeChild(input);
    });
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-700">
          Project Colors
        </span>
        <span className="text-xs text-gray-500">
          {projectColors.length} colors
        </span>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {/* Add Color Button - Always First */}
        <button
          onClick={handleAddColorClick}
          className="group w-full aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-[#6F1414] transition-all duration-200 hover:scale-105 hover:shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center"
          aria-label="Add new color to project"
        >
          <div className="flex flex-col items-center gap-1">
            <Plus
              className="w-5 h-5 text-gray-400 group-hover:text-[#6F1414] transition-colors"
              size={20}
            />
            <span className="text-xs text-gray-500 group-hover:text-[#6F1414] transition-colors font-medium">
              Add
            </span>
          </div>
        </button>

        {/* Existing Project Colors */}
        {projectColors.map((color, index) => (
          <div key={index} className="group relative">
            <button
              className="w-full aspect-square rounded-lg border-2 border-gray-200 hover:border-[#6F1414] transition-all duration-200 hover:scale-110 hover:shadow-lg relative overflow-hidden"
              style={{ backgroundColor: color }}
              onClick={() => onColorClick(color)}
              title={color}
              aria-label={`Select project color ${color}`}
            >
              {/* Subtle shine effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-200 bg-gradient-to-br from-white/30 to-transparent" />
            </button>
            <button
              onClick={() => onRemoveColor(color)}
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center hover:bg-red-600 hover:scale-110"
              aria-label={`Remove color ${color}`}
            >
              <X className="w-2.5 h-2.5" size={10} />
            </button>
          </div>
        ))}

        {/* Empty slots for visual consistency */}
        {Array.from({ length: Math.max(0, 5 - projectColors.length) }).map(
          (_, index) => (
            <div
              key={`empty-${index}`}
              className="w-full aspect-square rounded-lg border-2 border-gray-100 bg-gray-50"
              aria-hidden="true"
            />
          )
        )}
      </div>
    </div>
  );
}

