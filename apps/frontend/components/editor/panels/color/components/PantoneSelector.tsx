'use client';

import { Search, X, CheckCircle } from 'lucide-react';
import { PantoneColor } from '../../../../../lib/colorManagement';

interface PantoneSelectorProps {
  pantoneSearch: string;
  onSearchChange: (value: string) => void;
  filteredPantoneColors: PantoneColor[];
  selectedPantone: PantoneColor | null;
  onSelectPantone: (pantone: PantoneColor) => void;
}

export function PantoneSelector({
  pantoneSearch,
  onSearchChange,
  filteredPantoneColors,
  selectedPantone,
  onSelectPantone,
}: PantoneSelectorProps) {
  return (
    <div className="space-y-4">
      {/* Pantone Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-100">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search Pantone colors..."
            value={pantoneSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#6F1414] focus:ring-2 focus:ring-[#6F1414] focus:ring-opacity-20 transition-all"
            aria-label="Search Pantone colors"
          />
          {pantoneSearch && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Pantone Colors Grid - Modern Cards */}
      <div className="bg-white p-4 rounded-xl border border-gray-100">
        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
          {filteredPantoneColors.map((pantone, index) => (
            <button
              key={`${pantone.code}-${index}`}
              className={`p-3 rounded-lg border-2 transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                selectedPantone?.code === pantone.code
                  ? 'border-[#6F1414] bg-gradient-to-br from-[#6F1414] to-[#8F1818] text-white shadow-lg'
                  : 'border-gray-100 bg-white hover:border-[#6F1414] hover:bg-gray-50'
              }`}
              onClick={() => onSelectPantone(pantone)}
              aria-label={`Select Pantone color ${pantone.code}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg border-2 border-white shadow-sm"
                  style={{ backgroundColor: pantone.hex }}
                  aria-hidden="true"
                />
                <div className="flex-1 text-left">
                  <div
                    className={`text-xs font-bold ${
                      selectedPantone?.code === pantone.code
                        ? 'text-white'
                        : 'text-gray-800'
                    }`}
                  >
                    {pantone.code}
                  </div>
                  <div
                    className={`text-xs ${
                      selectedPantone?.code === pantone.code
                        ? 'text-white opacity-90'
                        : 'text-gray-500'
                    }`}
                  >
                    {pantone.name}
                  </div>
                </div>
                {selectedPantone?.code === pantone.code && (
                  <CheckCircle
                    className="w-4 h-4 text-white"
                    size={16}
                    aria-hidden="true"
                  />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

