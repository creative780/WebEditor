'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Move,
  Brush,
  Palette,
  Layers,
  Shapes,
  Type,
  Layout,
  Eye,
  Upload,
  Crop,
  Square,
  Circle,
  Triangle,
  ArrowRight,
  Star,
  Minus,
  Plus,
  Smartphone,
  BarChart3,
  Package,
} from 'lucide-react';
import { useEditorStore } from '../../state/useEditorStore';
import { LayersPanel } from './panels/LayersPanel';
import { ColorPanel } from './panels/ColorPanel';
import { ShapesPanel } from './panels/ShapesPanel';
import { TemplatesPanel } from './panels/TemplatesPanel';
import { UploadsPanel } from './panels/UploadsPanel';
import { GradientPanel } from './panels/GradientPanel';
import { MobileDesignPanel } from './panels/MobileDesignPanel';
import { PluginManager } from './PluginManager';
import { ModalWrapper } from './ModalWrapper';

export function LeftRail() {
  const {
    activeTool,
    activePanel,
    setActiveTool,
    setActivePanel,
    addObject,
  } = useEditorStore();

  const [hoveredTool, setHoveredTool] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setActivePanel(null);
      }
    };

    if (activePanel) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activePanel, setActivePanel]);

  const tools = [
    {
      id: 'move',
      icon: Move,
      label: 'MOVE',
      shortcut: 'V',
    },
    {
      id: 'brush',
      icon: Brush,
      label: 'BRUSH',
      shortcut: 'B',
    },
    {
      id: 'color',
      icon: Palette,
      label: 'COLOR',
      shortcut: 'K',
    },
    {
      id: 'layers',
      icon: Layers,
      label: 'LAYERS',
      shortcut: 'L',
    },
    {
      id: 'gradient',
      icon: Palette,
      label: 'GRADIENT',
      shortcut: 'G',
    },
    {
      id: 'shapes',
      icon: Shapes,
      label: 'SHAPES',
      shortcut: 'S',
    },
    {
      id: 'templates',
      icon: Layout,
      label: 'TEMPLATES',
      shortcut: 'T',
    },
    {
      id: 'text',
      icon: Type,
      label: 'TEXT',
      shortcut: 'T',
    },
    {
      id: 'upload',
      icon: Upload,
      label: 'UPLOAD',
      shortcut: 'U',
    },
    {
      id: 'crop',
      icon: Crop,
      label: 'CROP',
      shortcut: 'C',
    },
    {
      id: 'mobile',
      icon: Smartphone,
      label: 'MOBILE',
      shortcut: 'M',
    },
    {
      id: 'plugins',
      icon: Package,
      label: 'PLUGINS',
      shortcut: 'P',
    },
  ];

  const handleToolClick = (toolId: string) => {
    if (toolId === 'layers' || toolId === 'color' || toolId === 'gradient' || toolId === 'shapes' || toolId === 'templates' || toolId === 'upload' || toolId === 'mobile' || toolId === 'plugins') {
      // Toggle panel - if already active, close it
      if (activePanel === toolId) {
        setActivePanel(null);
      } else {
        setActivePanel(toolId);
      }
    } else {
      setActiveTool(toolId);
    }
  };

  return (
    <div className="editor-left-rail">
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isActive = activeTool === tool.id || activePanel === tool.id;
        const isHovered = hoveredTool === tool.id;

        return (
          <div
            key={tool.id}
            className="relative"
            onMouseEnter={() => setHoveredTool(tool.id)}
            onMouseLeave={() => setHoveredTool(null)}
          >
            <button
              className={`btn btn-ghost w-12 h-12 p-0 rounded-lg ${
                isActive ? 'bg-red-50 text-red-700 shadow-md' : 'hover:bg-gray-50 text-red-700'
              }`}
              onClick={() => handleToolClick(tool.id)}
              title={`${tool.label} (${tool.shortcut})`}
            >
              <Icon className="icon text-red-700" />
            </button>

            {/* Tooltip */}
            {isHovered && (
              <div className="absolute left-16 top-1/2 transform -translate-y-1/2 z-50">
                <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-lg backdrop-blur-sm">
                  {tool.label}
                  <div className="text-gray-400 text-xs mt-0.5">
                    {tool.shortcut}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Panel Overlay */}
      {activePanel && (
        <div className="relative">
          <div 
            ref={panelRef}
            className="editor-left-panel-overlay animate-in slide-in-from-left-4 fade-in duration-300 ease-out left-rail-panel"
          >
            {activePanel === 'layers' && <LayersPanel />}
            {activePanel === 'color' && <ColorPanel />}
            {activePanel === 'shapes' && <ShapesPanel />}
            {activePanel === 'templates' && <TemplatesPanel />}
            {activePanel === 'upload' && <UploadsPanel />}
            {activePanel === 'gradient' && <GradientPanel />}
            {activePanel === 'mobile' && <MobileDesignPanel />}
            {activePanel === 'plugins' && <PluginManager />}
          </div>
          
        </div>
      )}
    </div>
  );
}
