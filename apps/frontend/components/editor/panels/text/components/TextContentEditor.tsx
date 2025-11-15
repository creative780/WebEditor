'use client';

interface TextContentEditorProps {
  value: string;
  onChange: (text: string) => void;
}

export function TextContentEditor({ value, onChange }: TextContentEditorProps) {
  return (
    <div className="mb-4">
      <label className="block text-xs text-gray-500 mb-1">Text Content</label>
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="input w-full text-sm min-h-[80px] resize-y"
        placeholder="Enter your text here..."
      />
    </div>
  );
}

