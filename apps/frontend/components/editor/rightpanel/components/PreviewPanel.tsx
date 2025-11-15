'use client';

import {
  Eye,
  Monitor,
  Smartphone,
  RotateCcw,
  Brush,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { DocumentConfig } from '../../../../state/useEditorStore';

interface PreviewPanelProps {
  document: DocumentConfig;
  currentSide: 'front' | 'back';
  onSideChange: (side: 'front' | 'back') => void;
  onPageClick: (page: number) => void;
  onOrientationChange: (orientation: 'landscape' | 'portrait') => void;
  isEditingSize: boolean;
  tempWidth: number;
  tempHeight: number;
  tempBleed: number;
  tempDpi: number;
  onSizeChange: () => void;
  onCancelEdit: () => void;
  onUnitChange: (unit: 'px' | 'mm' | 'in' | 'cm' | 'ft') => void;
  onWidthChange: (width: number) => void;
  onHeightChange: (height: number) => void;
  onBleedChange: (bleed: number) => void;
  onDpiChange: (dpi: number) => void;
  onStartEditingSize: () => void;
  isBrushCardOpen: boolean;
  onBrushClick: () => void;
  brushCardRef: React.RefObject<HTMLDivElement>;
  projectColorMode: 'rgb' | 'cmyk' | 'pantone';
  needsColorModeConversion: boolean;
}

export function PreviewPanel({
  document,
  currentSide,
  onSideChange,
  onPageClick,
  onOrientationChange,
  isEditingSize,
  tempWidth,
  tempHeight,
  tempBleed,
  tempDpi,
  onSizeChange,
  onCancelEdit,
  onUnitChange,
  onWidthChange,
  onHeightChange,
  onBleedChange,
  onDpiChange,
  onStartEditingSize,
  isBrushCardOpen,
  onBrushClick,
  brushCardRef,
  projectColorMode,
  needsColorModeConversion,
}: PreviewPanelProps) {
  const isLandscape = document.width > document.height;

  return (
    <div className="h-full overflow-y-auto hover:overflow-y-scroll pr-3 pb-32 relative">
      {/* Preview Canvas */}
      <div className="bg-white border-2 border-[#6F1414] rounded-lg aspect-[3.5/2] mb-4 flex items-center justify-center shadow-sm mx-2 mt-2">
        <div className="text-center text-[#6F1414]">
          <div className="w-16 h-16 bg-[#6F1414] bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Eye className="icon text-[#6F1414]" />
          </div>
          <p className="text-sm font-medium">Preview</p>
          <p className="text-xs text-[#6F1414] text-opacity-70">
            {document.width} × {document.height} {document.unit}
          </p>
        </div>
      </div>

      {/* Artboard Orientation Toggle */}
      <div className="flex gap-1 mb-4 mx-2">
        <button
          className={`btn flex-1 text-sm font-medium transition-all duration-300 ease-in-out ${
            isLandscape
              ? 'bg-[#6F1414] text-white border-[#6F1414] shadow-md'
              : 'bg-white text-[#6F1414] border-[#6F1414] hover:bg-[#6F1414] hover:text-white hover:shadow-md'
          }`}
          onClick={() => onOrientationChange('landscape')}
          title="Landscape Orientation"
        >
          <Monitor className="w-4 h-4 mr-1" />
          Landscape
        </button>
        <button
          className={`btn flex-1 text-sm font-medium transition-all duration-300 ease-in-out ${
            !isLandscape
              ? 'bg-[#6F1414] text-white border-[#6F1414] shadow-md'
              : 'bg-white text-[#6F1414] border-[#6F1414] hover:bg-[#6F1414] hover:text-white hover:shadow-md'
          }`}
          onClick={() => onOrientationChange('portrait')}
          title="Portrait Orientation"
        >
          <Smartphone className="w-4 h-4 mr-1" />
          Portrait
        </button>
      </div>

      {/* Front/Back Toggle */}
      <div className="flex gap-1 mb-4 mx-2">
        <button
          className={`btn flex-1 text-sm font-medium transition-all duration-300 ease-in-out ${
            currentSide === 'front'
              ? 'bg-[#6F1414] text-white border-[#6F1414] shadow-md'
              : 'bg-white text-[#6F1414] border-[#6F1414] hover:bg-[#6F1414] hover:text-white hover:shadow-md'
          }`}
          onClick={() => onSideChange('front')}
        >
          FRONT SIDE
        </button>
        <button
          className={`btn flex-1 text-sm font-medium transition-all duration-300 ease-in-out ${
            currentSide === 'back'
              ? 'bg-[#6F1414] text-white border-[#6F1414] shadow-md'
              : 'bg-white text-[#6F1414] border-[#6F1414] hover:bg-[#6F1414] hover:text-white hover:shadow-md'
          }`}
          onClick={() => onSideChange('back')}
        >
          BACK SIDE
        </button>
      </div>

      {/* Page Indicators */}
      <div className="flex items-center justify-center gap-2 mx-2">
        {Array.from({ length: document.pages }, (_, i) => (
          <button
            key={i}
            className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ease-in-out ${
              document.currentPage === i + 1
                ? 'bg-[#6F1414] border-[#6F1414] shadow-md scale-110'
                : 'bg-white border-[#6F1414] hover:bg-[#6F1414] hover:bg-opacity-20 hover:scale-105'
            }`}
            onClick={() => onPageClick(i + 1)}
            title={`Page ${i + 1}`}
          />
        ))}
      </div>

      {/* Page Info */}
      <div className="mt-4 text-center text-xs text-[#6F1414] font-medium mx-2">
        Page {document.currentPage} of {document.pages}
      </div>

      {/* Color Mode Status */}
      <div className="mt-4 mx-2">
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
          <span className="text-xs text-gray-600">Color Mode:</span>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                projectColorMode === 'rgb'
                  ? 'bg-blue-500'
                  : projectColorMode === 'cmyk'
                    ? 'bg-red-500'
                    : 'bg-purple-500'
              }`}
            />
            <span className="text-xs font-medium text-gray-700 uppercase">
              {projectColorMode}
            </span>
          </div>
        </div>
        {needsColorModeConversion && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3 h-3 text-yellow-600" />
              <span className="text-xs text-yellow-700">Conversion required</span>
            </div>
          </div>
        )}
      </div>

      {/* Document Info - Editable */}
      <div className="mt-6 space-y-3 mx-2">
        <div className="text-xs text-[#6F1414]">
          <div className="flex justify-between items-center py-2 border-b border-[#6F1414] border-opacity-20">
            <span className="font-medium">Size:</span>
            {isEditingSize ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  className="input w-16 h-6 text-xs text-center"
                  value={tempWidth}
                  onChange={(e) => onWidthChange(parseFloat(e.target.value) || 0)}
                  step="0.1"
                />
                <span className="text-xs">×</span>
                <input
                  type="number"
                  className="input w-16 h-6 text-xs text-center"
                  value={tempHeight}
                  onChange={(e) => onHeightChange(parseFloat(e.target.value) || 0)}
                  step="0.1"
                />
                <select
                  className="input h-6 text-xs"
                  value={document.unit}
                  onChange={(e) =>
                    onUnitChange(e.target.value as 'px' | 'mm' | 'in' | 'cm' | 'ft')
                  }
                >
                  <option value="px">px</option>
                  <option value="mm">mm</option>
                  <option value="cm">cm</option>
                  <option value="in">in</option>
                  <option value="ft">ft</option>
                </select>
              </div>
            ) : (
              <span
                className="cursor-pointer hover:text-[#6F1414] hover:underline"
                onClick={onStartEditingSize}
              >
                {document.width} × {document.height} {document.unit}
              </span>
            )}
          </div>

          <div className="flex justify-between items-center py-2 border-b border-[#6F1414] border-opacity-20">
            <span className="font-medium">Bleed:</span>
            {isEditingSize ? (
              <input
                type="number"
                className="input w-20 h-6 text-xs text-center"
                value={tempBleed}
                onChange={(e) => onBleedChange(parseFloat(e.target.value) || 0)}
                step="0.01"
              />
            ) : (
              <span
                className="cursor-pointer hover:text-[#6F1414] hover:underline"
                onClick={onStartEditingSize}
              >
                {document.bleed} {document.unit}
              </span>
            )}
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="font-medium">DPI:</span>
            {isEditingSize ? (
              <input
                type="number"
                className="input w-20 h-6 text-xs text-center"
                value={tempDpi}
                onChange={(e) => onDpiChange(parseInt(e.target.value) || 300)}
                min="72"
                max="600"
              />
            ) : (
              <span
                className="cursor-pointer hover:text-[#6F1414] hover:underline"
                onClick={onStartEditingSize}
              >
                {document.dpi}
              </span>
            )}
          </div>
        </div>

        {/* Edit Controls */}
        {isEditingSize && (
          <div className="flex gap-2 mt-3">
            <button className="btn btn-primary text-xs flex-1" onClick={onSizeChange}>
              <Save className="icon-xs mr-1" />
              Apply
            </button>
            <button className="btn btn-ghost text-xs flex-1" onClick={onCancelEdit}>
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 space-y-2 mx-2">
        <button className="btn w-full text-sm bg-white text-[#6F1414] border-[#6F1414] hover:bg-[#6F1414] hover:text-white transition-all duration-300 ease-in-out hover:shadow-md">
          <RotateCcw className="icon-sm mr-2" />
          Reset View
        </button>

        {/* Brush Tool Button */}
        <button
          className={`btn w-full text-sm transition-all duration-300 ease-in-out hover:shadow-md ${
            isBrushCardOpen
              ? 'bg-[#6F1414] text-white border-[#6F1414] shadow-md'
              : 'bg-white text-[#6F1414] border-[#6F1414] hover:bg-[#6F1414] hover:text-white'
          }`}
          onClick={onBrushClick}
        >
          <Brush className="icon-sm mr-2" />
          Brush Tool
        </button>
      </div>

      {/* Brush Card */}
      {isBrushCardOpen && (
        <div
          ref={brushCardRef}
          className="absolute right-full top-0 mr-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-in slide-in-from-right-4 fade-in duration-300 ease-out"
          style={{ borderRadius: '0 0 12px 0' }}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#6F1414]">
                Brush Settings
              </h3>
              <button
                className="text-gray-400 hover:text-[#6F1414] transition-colors"
                onClick={() => onBrushClick()}
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Brush Size */}
              <div>
                <label className="block text-xs font-medium text-[#6F1414] mb-2">
                  Brush Size
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="50"
                    defaultValue="10"
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-xs text-[#6F1414] w-8 text-center">
                    10px
                  </span>
                </div>
              </div>

              {/* Brush Opacity */}
              <div>
                <label className="block text-xs font-medium text-[#6F1414] mb-2">
                  Opacity
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="100"
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-xs text-[#6F1414] w-8 text-center">
                    100%
                  </span>
                </div>
              </div>

              {/* Brush Types */}
              <div>
                <label className="block text-xs font-medium text-[#6F1414] mb-2">
                  Brush Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button className="btn text-xs py-2 bg-white text-[#6F1414] border-[#6F1414] hover:bg-[#6F1414] hover:text-white">
                    Round
                  </button>
                  <button className="btn text-xs py-2 bg-white text-[#6F1414] border-[#6F1414] hover:bg-[#6F1414] hover:text-white">
                    Square
                  </button>
                  <button className="btn text-xs py-2 bg-white text-[#6F1414] border-[#6F1414] hover:bg-[#6F1414] hover:text-white">
                    Soft
                  </button>
                  <button className="btn text-xs py-2 bg-white text-[#6F1414] border-[#6F1414] hover:bg-[#6F1414] hover:text-white">
                    Hard
                  </button>
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-xs font-medium text-[#6F1414] mb-2">
                  Brush Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    defaultValue="#6F1414"
                    className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    defaultValue="#6F1414"
                    className="input flex-1 text-xs"
                    placeholder="#6F1414"
                  />
                </div>
              </div>

              {/* Quick Colors */}
              <div>
                <label className="block text-xs font-medium text-[#6F1414] mb-2">
                  Quick Colors
                </label>
                <div className="flex gap-1">
                  {[
                    '#6F1414',
                    '#000000',
                    '#FFFFFF',
                    '#FF0000',
                    '#00FF00',
                    '#0000FF',
                    '#FFFF00',
                    '#FF00FF',
                  ].map((color) => (
                    <button
                      key={color}
                      className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

