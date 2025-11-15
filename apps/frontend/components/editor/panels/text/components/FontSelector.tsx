'use client';

interface FontSelectorProps {
  value: string;
  onChange: (fontFamily: string) => void;
}

export function FontSelector({ value, onChange }: FontSelectorProps) {
  return (
    <div className="mb-4">
      <label className="block text-xs text-gray-500 mb-1">Font Family</label>
      <select
        value={value || 'Inter'}
        onChange={(e) => onChange(e.target.value)}
        className="input w-full text-sm"
      >
        <option value="Inter">Inter</option>
        <option value="Arial">Arial</option>
        <option value="Helvetica">Helvetica</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Georgia">Georgia</option>
        <option value="Verdana">Verdana</option>
        <option value="Courier New">Courier New</option>
        <option value="Roboto">Roboto</option>
        <option value="Open Sans">Open Sans</option>
        <option value="Lato">Lato</option>
        <option value="Montserrat">Montserrat</option>
        <option value="Poppins">Poppins</option>
      </select>
    </div>
  );
}

