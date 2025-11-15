'use client';

import { Star } from 'lucide-react';

interface TrendingColor {
  hex: string;
  name: string;
}

interface TrendingColorsProps {
  trendingColors: TrendingColor[];
  onColorClick: (color: string) => void;
}

export function TrendingColors({
  trendingColors,
  onColorClick,
}: TrendingColorsProps) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <Star className="w-4 h-4 text-[#6F1414]" size={16} />
        <span className="text-xs font-semibold text-gray-700">
          Trending Colors
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {trendingColors.map(({ hex, name }) => (
          <button
            key={hex}
            className="group relative"
            onClick={() => onColorClick(hex)}
            aria-label={`Select trending color ${name}`}
          >
            <div
              className="aspect-square rounded-lg border-2 border-gray-200 hover:border-[#6F1414] transition-all duration-300 hover:scale-110 hover:shadow-lg"
              style={{ backgroundColor: hex }}
            />
            <div className="absolute inset-x-0 -bottom-6 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span className="text-xs bg-gray-900 text-white px-2 py-1 rounded whitespace-nowrap">
                {name}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

