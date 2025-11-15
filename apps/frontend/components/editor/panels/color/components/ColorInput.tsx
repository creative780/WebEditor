'use client';

import { memo } from 'react';

interface ColorInputProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  label: string;
  color: string;
  currentColor?: string;
  unit?: string;
}

export const ColorInput = memo(
  ({
    value,
    onChange,
    min,
    max,
    label,
    color,
    currentColor,
    unit = '',
  }: ColorInputProps) => {
    const percentage = ((value - min) / (max - min)) * 100;

    // Calculate channel-specific color based on current value
    const getChannelColor = () => {
      const intensity = percentage / 100;

      switch (label.toLowerCase()) {
        case 'red':
          return `rgb(${Math.round(255 * intensity)}, 0, 0)`;
        case 'green':
          return `rgb(0, ${Math.round(255 * intensity)}, 0)`;
        case 'blue':
          return `rgb(0, 0, ${Math.round(255 * intensity)})`;
        case 'cyan':
          return `rgb(0, ${Math.round(255 * intensity)}, ${Math.round(255 * intensity)})`;
        case 'magenta':
          return `rgb(${Math.round(255 * intensity)}, 0, ${Math.round(255 * intensity)})`;
        case 'yellow':
          return `rgb(${Math.round(255 * intensity)}, ${Math.round(255 * intensity)}, 0)`;
        case 'key/black':
          const blackIntensity = 255 - Math.round(255 * intensity);
          return `rgb(${blackIntensity}, ${blackIntensity}, ${blackIntensity})`;
        default:
          return currentColor || color;
      }
    };

    // Get the base channel color for progress bar and thumb
    const getBaseChannelColor = () => {
      switch (label.toLowerCase()) {
        case 'red':
          return '#FF4444'; // Lighter red
        case 'green':
          return '#44FF44'; // Lighter green
        case 'blue':
          return '#4444FF'; // Lighter blue
        case 'cyan':
          return '#44FFFF'; // Lighter cyan
        case 'magenta':
          return '#FF44FF'; // Lighter magenta
        case 'yellow':
          return '#FFFF44'; // Lighter yellow
        case 'key/black':
          return '#666666'; // Medium gray
        default:
          return '#6F1414'; // Brand color fallback
      }
    };

    const channelColor = getChannelColor();
    const baseChannelColor = getBaseChannelColor();

    return (
      <div className="group">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <span
                className="w-5 h-5 rounded-full border-2 border-white shadow-md transition-all duration-200 ease-out"
                style={{
                  backgroundColor: channelColor,
                  transition: 'background-color 0.15s ease-out',
                }}
              />
              <span className="absolute -inset-1 rounded-full border-2 border-gray-200 opacity-20" />
            </div>
            <span className="text-sm font-bold text-gray-800">{label}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500 font-medium">Value:</span>
              <span className="text-sm font-bold text-gray-800 font-mono min-w-[3ch]">
                {value}
              </span>
            </div>
            {unit && (
              <div className="px-2 py-1 bg-gray-100 rounded-md">
                <span className="text-xs font-medium text-gray-600">
                  {unit}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="relative group">
          {/* Slider Track */}
          <div className="relative h-2.5 bg-gray-200 rounded-full overflow-hidden">
            {/* Progress Fill */}
            <div
              className="absolute top-0 left-0 h-full rounded-full transition-all duration-150 ease-out"
              style={{
                width: `${percentage}%`,
                background: baseChannelColor,
              }}
            />
          </div>

          {/* Custom Slider */}
          <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className={`absolute inset-0 w-full h-2.5 bg-transparent cursor-pointer appearance-none slider-thumb slider-thumb-${label.toLowerCase().replace(/[^a-z]/g, '')}`}
            style={
              {
                WebkitAppearance: 'none',
                appearance: 'none',
                '--thumb-color': baseChannelColor,
              } as React.CSSProperties
            }
            aria-label={`${label} slider`}
          />

          {/* Value Display on Hover */}
          <div
            className="absolute top-0 transform -translate-y-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
            style={{
              left: `${percentage}%`,
              transform: `translateX(-50%) translateY(-100%)`,
            }}
          >
            <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded-md font-mono font-bold whitespace-nowrap">
              {value}
              {unit}
            </div>
            <div className="w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900 mx-auto" />
          </div>
        </div>
      </div>
    );
  }
);

ColorInput.displayName = 'ColorInput';

