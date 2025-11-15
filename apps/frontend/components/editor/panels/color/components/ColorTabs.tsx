'use client';

import { Copy, RotateCcw, Keyboard } from 'lucide-react';

interface ColorTabsProps {
  activeTab: 'cmyk' | 'rgb' | 'pantone';
  onTabChange: (tab: 'cmyk' | 'rgb' | 'pantone') => void;
  projectColorMode: 'cmyk' | 'rgb' | 'pantone';
  onCopy: () => void;
  onReset: () => void;
  onToggleShortcuts: () => void;
}

export function ColorTabs({
  activeTab,
  onTabChange,
  projectColorMode,
  onCopy,
  onReset,
  onToggleShortcuts,
}: ColorTabsProps) {
  const handleTabChange = (newTab: 'cmyk' | 'rgb' | 'pantone') => {
    if (newTab !== projectColorMode) {
      // This will be handled by parent component
      onTabChange(newTab);
    } else {
      onTabChange(newTab);
    }
  };

  return (
    <div className="border-b border-gray-100 bg-gradient-to-r from-white to-gray-50 flex-shrink-0 z-20">
      <div className="flex p-2">
        {['cmyk', 'rgb', 'pantone'].map((tab) => (
          <button
            key={tab}
            className={`flex-1 px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-all duration-300 rounded-lg mx-0.5 ${
              activeTab === tab
                ? 'bg-[#6F1414] text-white shadow-lg transform scale-105'
                : 'text-gray-600 hover:bg-gray-100 hover:text-[#6F1414]'
            }`}
            onClick={() => handleTabChange(tab as 'cmyk' | 'rgb' | 'pantone')}
            aria-label={`Switch to ${tab} color mode`}
          >
            {tab === 'pantone' ? 'Pantone®' : tab}
          </button>
        ))}
      </div>

      {/* Fixed Action buttons - Non-scrollable */}
      <div className="flex items-center justify-between px-4 pb-2 bg-gradient-to-r from-white to-gray-50">
        <div className="flex items-center gap-2">
          <button
            onClick={onCopy}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-[#6F1414] transition-colors"
            title="Copy color (Ctrl+C)"
          >
            <Copy className="w-3 h-3" size={12} />
            Copy
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-[#6F1414] transition-colors"
            title="Reset to default (Ctrl+R)"
          >
            <RotateCcw className="w-3 h-3" size={12} />
            Reset
          </button>
        </div>
        <button
          onClick={onToggleShortcuts}
          className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-[#6F1414] transition-colors"
          title="Show keyboard shortcuts (Ctrl+H)"
        >
          <Keyboard className="w-3 h-3" size={12} />
          Shortcuts
        </button>
      </div>
    </div>
  );
}

