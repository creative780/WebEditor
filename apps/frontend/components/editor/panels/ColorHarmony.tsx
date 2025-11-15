'use client';

import { useState, useCallback } from 'react';
import { Palette } from 'lucide-react';

type HarmonyScheme = 'complementary' | 'analogous' | 'triadic' | 'tetradic' | 'monochromatic';

interface ColorHarmonyProps {
  baseColor: string;
  onColorSelect: (color: string) => void;
}

export function ColorHarmony({ baseColor, onColorSelect }: ColorHarmonyProps) {
  const [activeScheme, setActiveScheme] = useState<HarmonyScheme>('complementary');

  // RGB to HSL conversion
  const hexToHsl = useCallback((hex: string): { h: number; s: number; l: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { h: 0, s: 0, l: 0 };

    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;

    if (max === min) {
      return { h: 0, s: 0, l: l * 100 };
    }

    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    let h = 0;
    if (max === r) {
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    } else if (max === g) {
      h = ((b - r) / d + 2) / 6;
    } else {
      h = ((r - g) / d + 4) / 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }, []);

  // HSL to HEX conversion
  const hslToHex = useCallback((h: number, s: number, l: number): string => {
    h = h / 360;
    s = s / 100;
    l = l / 100;

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    const toHex = (n: number) => {
      const hex = Math.round(n * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }, []);

  // Generate harmony colors
  const getHarmonyColors = useCallback((scheme: HarmonyScheme): string[] => {
    const hsl = hexToHsl(baseColor);
    const colors: string[] = [baseColor];

    switch (scheme) {
      case 'complementary':
        // Opposite on color wheel (180 degrees)
        colors.push(hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l));
        break;

      case 'analogous':
        // Adjacent colors (30 degrees apart)
        colors.push(hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l));
        colors.push(hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l));
        break;

      case 'triadic':
        // Evenly spaced (120 degrees)
        colors.push(hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l));
        colors.push(hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l));
        break;

      case 'tetradic':
        // Rectangle (90, 180, 270 degrees)
        colors.push(hslToHex((hsl.h + 90) % 360, hsl.s, hsl.l));
        colors.push(hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l));
        colors.push(hslToHex((hsl.h + 270) % 360, hsl.s, hsl.l));
        break;

      case 'monochromatic':
        // Same hue, different lightness
        colors.push(hslToHex(hsl.h, hsl.s, Math.min(100, hsl.l + 20)));
        colors.push(hslToHex(hsl.h, hsl.s, Math.max(0, hsl.l - 20)));
        colors.push(hslToHex(hsl.h, Math.max(0, hsl.s - 20), hsl.l));
        colors.push(hslToHex(hsl.h, Math.min(100, hsl.s + 20), hsl.l));
        break;
    }

    return colors;
  }, [baseColor, hexToHsl, hslToHex]);

  const harmonyColors = getHarmonyColors(activeScheme);

  return (
    <div className="color-harmony space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Palette size={16} className="text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-700">Color Harmony</h3>
        </div>

        {/* Scheme selector */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-2">Harmony Scheme</label>
          <select
            value={activeScheme}
            onChange={(e) => setActiveScheme(e.target.value as HarmonyScheme)}
            className="input w-full text-sm"
          >
            <option value="complementary">Complementary</option>
            <option value="analogous">Analogous</option>
            <option value="triadic">Triadic</option>
            <option value="tetradic">Tetradic</option>
            <option value="monochromatic">Monochromatic</option>
          </select>
        </div>

        {/* Color swatches */}
        <div className="grid grid-cols-3 gap-2">
          {harmonyColors.map((color, index) => (
            <button
              key={index}
              className="group relative h-16 rounded-lg border-2 border-gray-300 hover:border-blue-500 transition-all hover:scale-105 cursor-pointer"
              style={{ backgroundColor: color }}
              onClick={() => onColorSelect(color)}
              title={`${color} - Click to use`}
            >
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-end justify-center pb-1">
                <span className="text-xs text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  {color}
                </span>
              </div>
              {index === 0 && (
                <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                  Base
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Scheme description */}
        <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-gray-700">
          {activeScheme === 'complementary' && '🎨 Opposite colors on the color wheel for high contrast'}
          {activeScheme === 'analogous' && '🎨 Adjacent colors for harmonious combinations'}
          {activeScheme === 'triadic' && '🎨 Three evenly spaced colors for balanced palettes'}
          {activeScheme === 'tetradic' && '🎨 Four colors forming a rectangle for rich combinations'}
          {activeScheme === 'monochromatic' && '🎨 Variations of the same hue for subtle designs'}
        </div>
      </div>
    </div>
  );
}

