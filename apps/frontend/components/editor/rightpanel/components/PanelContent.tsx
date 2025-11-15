'use client';

import { PanelTab } from './PanelTabs';
import { PrintQualityPanel } from '../../panels/PrintQualityPanel';
import { TemplatesPanel } from '../../panels/TemplatesPanel';
import { AlignmentPanel } from '../../panels/AlignmentPanel';
import { CanvasBackgroundPanel } from '../../panels/CanvasBackgroundPanel';
import { TextPanel } from '../../panels/TextPanel';
import { ShapesPanel } from '../../panels/ShapesPanel';
import { GradientEditor, GradientConfig } from '../../panels/GradientEditor';
import { ColorHarmony } from '../../panels/ColorHarmony';
import { PaletteGenerator } from '../../panels/PaletteGenerator';
import { LayersPanel } from '../../panels/LayersPanel';
import { LayerEffects } from '../../panels/LayerEffects';
import { LayerTemplates } from '../../panels/LayerTemplates';
import { ExportPanel } from '../../panels/ExportPanel';
import { CollaborationPanel } from '../../panels/CollaborationPanel';

interface PanelContentProps {
  activeTab: PanelTab;
  gradient: GradientConfig;
  onGradientChange: (gradient: GradientConfig) => void;
  onColorSelect: (color: string) => void;
}

export function PanelContent({
  activeTab,
  gradient,
  onGradientChange,
  onColorSelect,
}: PanelContentProps) {
  const renderContent = () => {
    switch (activeTab) {
      case 'quality':
        return <PrintQualityPanel />;
      case 'templates':
        return <TemplatesPanel />;
      case 'alignment':
        return <AlignmentPanel />;
      case 'background':
        return <CanvasBackgroundPanel />;
      case 'text':
        return <TextPanel />;
      case 'shapes':
        return <ShapesPanel />;
      case 'colortools':
        return (
          <div className="p-4 space-y-6">
            <GradientEditor gradient={gradient} onChange={onGradientChange} />
            <ColorHarmony
              baseColor={gradient.stops[0]?.color || '#6F1414'}
              onColorSelect={onColorSelect}
            />
            <PaletteGenerator
              onPaletteGenerated={(colors) => {
                console.log('Generated palette:', colors);
              }}
              onColorSelect={onColorSelect}
            />
          </div>
        );
      case 'layers':
        return (
          <div className="space-y-4">
            <LayersPanel />
            <div className="border-t border-gray-200 pt-4">
              <LayerEffects />
            </div>
            <div className="border-t border-gray-200 pt-4">
              <LayerTemplates />
            </div>
          </div>
        );
      case 'export':
        return <ExportPanel />;
      case 'collaboration':
        return <CollaborationPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 min-h-0">
      <div className="h-full overflow-y-auto hover:overflow-y-scroll pr-3 pb-32">
        {renderContent()}
      </div>
    </div>
  );
}

