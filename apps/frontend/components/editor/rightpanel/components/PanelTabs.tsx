'use client';

import {
  Eye,
  CheckCircle,
  Palette,
  Zap,
  Type,
  Shapes,
  Download,
  Users,
} from 'lucide-react';

export type PanelTab =
  | 'preview'
  | 'quality'
  | 'templates'
  | 'alignment'
  | 'background'
  | 'text'
  | 'shapes'
  | 'colortools'
  | 'layers'
  | 'export'
  | 'collaboration';

interface PanelTabsProps {
  activeTab: PanelTab;
  onTabChange: (tab: PanelTab) => void;
}

const tabs: { id: PanelTab; label: string; icon: React.ReactNode }[] = [
  { id: 'preview', label: 'Preview', icon: <Eye className="w-3 h-3" /> },
  { id: 'quality', label: 'Quality', icon: <CheckCircle className="w-3 h-3" /> },
  { id: 'templates', label: 'Templates', icon: <Palette className="w-3 h-3" /> },
  { id: 'alignment', label: 'Align', icon: <Zap className="w-3 h-3" /> },
  { id: 'background', label: 'Background', icon: <Palette className="w-3 h-3" /> },
  { id: 'text', label: 'Text', icon: <Type className="w-3 h-3" /> },
  { id: 'shapes', label: 'Shapes', icon: <Shapes className="w-3 h-3" /> },
  { id: 'colortools', label: 'Colors', icon: <Palette className="w-3 h-3" /> },
  { id: 'layers', label: 'Layers', icon: <Zap className="w-3 h-3" /> },
  { id: 'export', label: 'Export', icon: <Download className="w-3 h-3" /> },
  { id: 'collaboration', label: 'Collab', icon: <Users className="w-3 h-3" /> },
];

export function PanelTabs({ activeTab, onTabChange }: PanelTabsProps) {
  return (
    <div className="border-b border-gray-200 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-500">
      <div className="flex min-w-max">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`flex-shrink-0 min-w-[80px] px-4 py-3 text-xs font-medium transition-all duration-300 ease-in-out ${
              activeTab === tab.id
                ? 'bg-[#6F1414] text-white border-b-2 border-[#6F1414]'
                : 'bg-white text-[#6F1414] hover:bg-gray-50'
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="mx-auto mb-1 flex justify-center">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

