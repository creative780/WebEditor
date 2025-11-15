'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight, 
  Palette, 
  Monitor,
  Printer,
  Star,
  Info,
  X
} from 'lucide-react';
import { useEditorStore, ColorMode } from '../../state/useEditorStore';

interface ColorModeConversionCardProps {
  currentMode: ColorMode;
  targetMode: ColorMode;
  onConvert: () => void;
  onCancel: () => void;
  currentColorCount?: number;
  selectedObjectsCount?: number;
}

export function ColorModeConversionCard({ 
  currentMode, 
  targetMode, 
  onConvert, 
  onCancel,
  currentColorCount = 0,
  selectedObjectsCount = 0
}: ColorModeConversionCardProps) {
  const [isConverting, setIsConverting] = useState(false);
  
  // Live data from store
  const objects = useEditorStore((state) => state.objects);
  const selectedObjects = useEditorStore((state) => state.selection);
  const projectColors = useEditorStore((state) => state.projectColors);
  
  // Live calculations
  const liveObjectCount = useMemo(() => objects.length, [objects]);
  const liveSelectedCount = useMemo(() => selectedObjects.length, [selectedObjects]);
  const liveProjectColorCount = useMemo(() => projectColors.length, [projectColors]);
  
  // Update live data every 100ms for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render by updating a dummy state
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleConvert = async () => {
    setIsConverting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate conversion
      onConvert();
    } finally {
      setIsConverting(false);
    }
  };

  const getModeInfo = (mode: ColorMode) => {
    switch (mode) {
      case 'rgb':
        return {
          name: 'RGB',
          description: 'Digital Display',
          icon: Monitor,
          color: '#3B82F6',
          benefits: ['Perfect for web', 'Wide color gamut', 'Screen accurate'],
          details: {
            colorSpace: 'sRGB',
            channels: 'Red, Green, Blue',
            range: '0-255 per channel',
            useCase: 'Web, digital displays, mobile apps'
          }
        };
      case 'cmyk':
        return {
          name: 'CMYK',
          description: 'Print Production',
          icon: Printer,
          color: '#EF4444',
          benefits: ['Print accurate', 'Professional quality', 'Industry standard'],
          details: {
            colorSpace: 'CMYK',
            channels: 'Cyan, Magenta, Yellow, Key (Black)',
            range: '0-100% per channel',
            useCase: 'Professional printing, magazines, brochures'
          }
        };
      case 'pantone':
        return {
          name: 'Pantone®',
          description: 'Brand Colors',
          icon: Star,
          color: '#8B5CF6',
          benefits: ['Brand consistency', 'Exact color matching', 'Global standards'],
          details: {
            colorSpace: 'Pantone Matching System',
            channels: 'Spot colors with unique codes',
            range: 'Pantone color library',
            useCase: 'Brand identity, corporate materials, packaging'
          }
        };
    }
  };

  const currentInfo = getModeInfo(currentMode);
  const targetInfo = getModeInfo(targetMode);
  const CurrentIcon = currentInfo.icon;
  const TargetIcon = targetInfo.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 popup-no-scrollbar">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full popup-no-scrollbar">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#6F1414] to-[#8F1818] p-4 rounded-t-xl text-white relative">
          <button
            onClick={onCancel}
            className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="text-lg font-bold">Color Mode Conversion</h2>
          </div>
          <p className="text-white/90 text-xs">
            {currentInfo.name} → {targetInfo.name}
          </p>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Live Project Status */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-3 h-3 text-blue-600" />
              <span className="text-xs font-semibold text-blue-800">Live Project Status</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-blue-600 font-medium">Mode:</span>
                <div className="flex items-center gap-1 mt-1">
                  <CurrentIcon className="w-2.5 h-2.5" style={{ color: currentInfo.color }} />
                  <span className="text-blue-700">{currentInfo.name}</span>
                </div>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Objects:</span>
                <div className="text-blue-700 mt-1">{liveObjectCount}</div>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Selected:</span>
                <div className="text-blue-700 mt-1">{liveSelectedCount}</div>
              </div>
            </div>
          </div>

          {/* Current vs Target Mode */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-center text-xs font-semibold text-gray-700 mb-2">Conversion Details</div>
            <div className="flex items-center justify-between">
              <div className="flex-1 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <CurrentIcon className="w-4 h-4" style={{ color: currentInfo.color }} />
                  <span className="text-xs font-semibold text-gray-700">{currentInfo.name}</span>
                </div>
                <div className="text-xs text-gray-500">{currentInfo.description}</div>
              </div>
              
              <div className="flex items-center gap-1 mx-2">
                <ArrowRight className="w-3 h-3 text-gray-400" />
              </div>
              
              <div className="flex-1 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TargetIcon className="w-4 h-4" style={{ color: targetInfo.color }} />
                  <span className="text-xs font-semibold text-gray-700">{targetInfo.name}</span>
                </div>
                <div className="text-xs text-gray-500">{targetInfo.description}</div>
              </div>
            </div>
          </div>

          {/* Live Impact */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Info className="w-3 h-3 text-yellow-600 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-yellow-800 mb-1">
                  Live Conversion Impact
                </div>
                <div className="text-xs text-yellow-700 space-y-0.5">
                  <div>• {liveObjectCount} objects will be converted</div>
                  <div>• {liveProjectColorCount} project colors affected</div>
                  <div>• Colors may shift between color spaces</div>
                  <div>• {currentInfo.name} → {targetInfo.name} conversion</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 pt-0 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleConvert}
            disabled={isConverting}
            className="flex-1 px-3 py-2 text-xs font-medium text-white bg-[#6F1414] hover:bg-[#8F1818] rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
          >
            {isConverting ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <Palette className="w-3 h-3" />
                Convert
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
