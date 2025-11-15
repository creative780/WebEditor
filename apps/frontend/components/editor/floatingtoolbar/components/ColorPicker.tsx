'use client';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  onInput?: (color: string) => void;
  title: string;
  className?: string;
}

export function ColorPicker({
  color,
  onChange,
  onInput,
  title,
  className = 'floating-color-input',
}: ColorPickerProps) {
  return (
    <div className="floating-color-picker">
      <input
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        onInput={(e) => {
          if (onInput) {
            const target = e.target as HTMLInputElement;
            requestAnimationFrame(() => {
              onInput(target.value);
            });
          }
        }}
        className={className}
        style={{
          cursor: 'pointer',
          touchAction: 'none',
          willChange: 'auto',
        }}
        title={title}
      />
    </div>
  );
}

