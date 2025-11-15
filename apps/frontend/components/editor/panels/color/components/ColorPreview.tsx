'use client';

import { Eye, EyeOff, Palette } from 'lucide-react';
import { RGBColor, CMYKColor } from '../../../../../lib/colorManagement';

interface ColorPreviewProps {
  currentHex: string;
  rgbValues: RGBColor;
  cmykValues: CMYKColor;
  activeTab: 'cmyk' | 'rgb' | 'pantone';
  selectedPantone?: { code: string } | null;
  showColorInfo: boolean;
  onToggleColorInfo: () => void;
  colorAnalysis: {
    hue: number;
    saturation: number;
    lightness: number;
    temperature: string;
    brightness: string;
  };
  luminance: number;
  contrastRatio: string;
  selectedObjectsCount: number;
}

export function ColorPreview({
  currentHex,
  rgbValues,
  cmykValues,
  activeTab,
  selectedPantone,
  showColorInfo,
  onToggleColorInfo,
  colorAnalysis,
  luminance,
  contrastRatio,
  selectedObjectsCount,
}: ColorPreviewProps) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-[#6F1414]" size={16} />
          <span className="text-xs font-semibold text-gray-700">
            Live Preview
          </span>
          <div
            className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
            title="Live updating"
          />
        </div>
        <button
          onClick={onToggleColorInfo}
          className="text-gray-400 hover:text-[#6F1414] transition-colors"
          aria-label={showColorInfo ? 'Hide color info' : 'Show color info'}
        >
          {showColorInfo ? (
            <EyeOff className="w-3.5 h-3.5" size={14} />
          ) : (
            <Eye className="w-3.5 h-3.5" size={14} />
          )}
        </button>
      </div>

      <div className="flex gap-3">
        <div
          className="w-24 h-24 rounded-xl shadow-inner border-2 border-white transition-all duration-200 hover:scale-105 relative overflow-hidden"
          style={{
            backgroundColor: currentHex,
            boxShadow: `0 4px 20px ${currentHex}40, inset 0 2px 4px rgba(0,0,0,0.1)`,
          }}
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
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">HEX</span>
              <span className="text-xs font-mono font-bold text-gray-700 transition-colors duration-200">
                {currentHex.toUpperCase()}
              </span>
            </div>
            {activeTab === 'cmyk' && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">CMYK</span>
                <span className="text-xs font-mono text-gray-700 transition-colors duration-200">
                  {cmykValues.c}·{cmykValues.m}·{cmykValues.y}·
                  {cmykValues.k}
                </span>
              </div>
            )}
            {activeTab === 'rgb' && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">RGB</span>
                <span className="text-xs font-mono text-gray-700 transition-colors duration-200">
                  {rgbValues.r}·{rgbValues.g}·{rgbValues.b}
                </span>
              </div>
            )}
            {selectedPantone && activeTab === 'pantone' && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Pantone</span>
                <span className="text-xs font-mono text-gray-700 transition-colors duration-200">
                  {selectedPantone.code}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {showColorInfo && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-gray-600">
              <span className="font-medium">Luminance:</span> {luminance}%
            </div>
            <div className="text-gray-600">
              <span className="font-medium">Contrast:</span> {contrastRatio}
            </div>
            <div className="text-gray-600">
              <span className="font-medium">Hue:</span> {colorAnalysis.hue}°
            </div>
            <div className="text-gray-600">
              <span className="font-medium">Saturation:</span>{' '}
              {colorAnalysis.saturation}%
            </div>
            <div className="text-gray-600">
              <span className="font-medium">Temperature:</span>{' '}
              {colorAnalysis.temperature}
            </div>
            <div className="text-gray-600">
              <span className="font-medium">Brightness:</span>{' '}
              {colorAnalysis.brightness}
            </div>
          </div>
          <div className="text-xs text-gray-600 pt-2 border-t border-gray-100">
            <span className="font-medium">Selected Objects:</span>{' '}
            {selectedObjectsCount}
          </div>
        </div>
      )}
    </div>
  );
}

