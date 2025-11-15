'use client';

interface TextColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function TextColorPicker({ value, onChange }: TextColorPickerProps) {
  const colorValue = value || '#000000';

  return (
    <div className="mb-4">
      <label className="block text-xs text-gray-500 mb-1">Text Color</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={colorValue}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
          title="Text Color"
        />
        <input
          type="text"
          value={colorValue}
          onChange={(e) => {
            if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
              onChange(e.target.value);
            }
          }}
          className="flex-1 input text-sm font-mono"
          placeholder="#000000"
          maxLength={7}
        />
      </div>
    </div>
  );
}

