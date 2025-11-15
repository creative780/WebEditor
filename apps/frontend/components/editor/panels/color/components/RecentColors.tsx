'use client';

interface RecentColorsProps {
  recentColors: string[];
  onColorClick: (color: string) => void;
  onClear: () => void;
}

export function RecentColors({
  recentColors,
  onColorClick,
  onClear,
}: RecentColorsProps) {
  if (recentColors.length === 0) return null;

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-700">
          Recent Colors
        </span>
        <button
          onClick={onClear}
          className="text-xs text-gray-400 hover:text-[#6F1414] transition-colors"
          aria-label="Clear recent colors"
        >
          Clear
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {recentColors.map((color, index) => (
          <button
            key={index}
            className="flex-shrink-0 w-10 h-10 rounded-lg border-2 border-gray-200 hover:border-[#6F1414] hover:scale-110 transition-all duration-200 shadow-sm"
            style={{ backgroundColor: color }}
            onClick={() => onColorClick(color)}
            title={color}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>
    </div>
  );
}

