'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, Sparkles, Download } from 'lucide-react';

interface PaletteGeneratorProps {
  onPaletteGenerated: (colors: string[]) => void;
  onColorSelect?: (color: string) => void;
}

export function PaletteGenerator({ onPaletteGenerated, onColorSelect }: PaletteGeneratorProps) {
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract dominant colors from image
  const extractColorsFromImage = useCallback(async (imageFile: File) => {
    setIsProcessing(true);

    try {
      // Create image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(imageFile);

      // Load image
      const img = new Image();
      const imgUrl = URL.createObjectURL(imageFile);

      img.onload = () => {
        // Create canvas for color extraction
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Resize image for faster processing
        const maxSize = 200;
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        // Draw image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        // Simplified color extraction using k-means clustering
        const colors: { r: number; g: number; b: number; count: number }[] = [];
        const colorMap = new Map<string, number>();

        // Sample pixels (every 4th pixel for speed)
        for (let i = 0; i < pixels.length; i += 16) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const a = pixels[i + 3];

          // Skip transparent pixels
          if (a < 128) continue;

          // Round to reduce color variations
          const roundedR = Math.round(r / 32) * 32;
          const roundedG = Math.round(g / 32) * 32;
          const roundedB = Math.round(b / 32) * 32;

          const key = `${roundedR},${roundedG},${roundedB}`;
          colorMap.set(key, (colorMap.get(key) || 0) + 1);
        }

        // Convert map to array and sort by frequency
        const sortedColors = Array.from(colorMap.entries())
          .map(([key, count]) => {
            const [r, g, b] = key.split(',').map(Number);
            return { r, g, b, count };
          })
          .sort((a, b) => b.count - a.count);

        // Get top 6 colors
        const topColors = sortedColors.slice(0, 6);

        // Convert to hex
        const hexColors = topColors.map(({ r, g, b }) => {
          const toHex = (n: number) => n.toString(16).padStart(2, '0');
          return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        });

        setExtractedColors(hexColors);
        onPaletteGenerated(hexColors);

        // Cleanup
        URL.revokeObjectURL(imgUrl);
        setIsProcessing(false);
      };

      img.src = imgUrl;
    } catch (error) {
      console.error('Error extracting colors:', error);
      setIsProcessing(false);
    }
  }, [onPaletteGenerated]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      extractColorsFromImage(file);
    }
  }, [extractColorsFromImage]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Generate random palette
  const generateRandomPalette = useCallback(() => {
    const colors: string[] = [];
    for (let i = 0; i < 5; i++) {
      const hue = Math.floor(Math.random() * 360);
      const saturation = 50 + Math.floor(Math.random() * 50);
      const lightness = 40 + Math.floor(Math.random() * 40);
      
      const color = hslToHex(hue, saturation, lightness);
      colors.push(color);
    }
    
    setExtractedColors(colors);
    onPaletteGenerated(colors);
  }, [onPaletteGenerated]);

  const hslToHex = (h: number, s: number, l: number): string => {
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
  };

  return (
    <div className="palette-generator space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-700">Palette Generator</h3>
        </div>

        {/* Upload image */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="space-y-2">
          <button
            className="btn btn-primary w-full text-sm"
            onClick={handleUploadClick}
            disabled={isProcessing}
          >
            <Upload size={16} className="mr-2" />
            {isProcessing ? 'Processing...' : 'Upload Image'}
          </button>

          <button
            className="btn btn-ghost w-full text-sm"
            onClick={generateRandomPalette}
          >
            <Sparkles size={16} className="mr-2" />
            Generate Random Palette
          </button>
        </div>

        {/* Image preview */}
        {imagePreview && (
          <div className="mt-4">
            <img
              src={imagePreview}
              alt="Uploaded"
              className="w-full h-32 object-cover rounded-lg border border-gray-300"
            />
          </div>
        )}

        {/* Extracted colors */}
        {extractedColors.length > 0 && (
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Extracted Colors ({extractedColors.length})
            </label>
            <div className="grid grid-cols-3 gap-2">
              {extractedColors.map((color, index) => (
                <button
                  key={index}
                  className="group relative h-16 rounded-lg border-2 border-gray-300 hover:border-blue-500 transition-all hover:scale-105 cursor-pointer"
                  style={{ backgroundColor: color }}
                  onClick={() => onColorSelect?.(color)}
                  title={`${color} - Click to use`}
                >
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-end justify-center pb-1">
                    <span className="text-xs text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 px-1 rounded">
                      {color}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Usage hint */}
            <div className="mt-2 text-xs text-gray-500 text-center">
              Click any color to apply it to selected object
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

