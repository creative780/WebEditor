'use client';

interface LayerSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function LayerSearch({ value, onChange }: LayerSearchProps) {
  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder="Search layers..."
        className="input w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

