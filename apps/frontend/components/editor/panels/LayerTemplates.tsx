'use client';

import { useState } from 'react';
import { Save, Download, FileText, Star } from 'lucide-react';
import { useEditorStore, useSelectedObjects } from '../../../state/useEditorStore';

interface LayerTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  objects: any[];
}

const PRESET_TEMPLATES: LayerTemplate[] = [
  {
    id: 'business-card-front',
    name: 'Business Card Front',
    description: 'Standard business card layout',
    icon: '💼',
    objects: [],
  },
  {
    id: 'social-media-post',
    name: 'Social Media Post',
    description: 'Instagram/Facebook post layout',
    icon: '📱',
    objects: [],
  },
  {
    id: 'flyer-header',
    name: 'Flyer Header',
    description: 'Promotional flyer header',
    icon: '📄',
    objects: [],
  },
];

export function LayerTemplates() {
  const { objects, addObject } = useEditorStore();
  const selectedObjects = useSelectedObjects();
  const [customTemplates, setCustomTemplates] = useState<LayerTemplate[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');

  const handleSaveAsTemplate = () => {
    if (!templateName) return;

    const newTemplate: LayerTemplate = {
      id: `template-${Date.now()}`,
      name: templateName,
      description: templateDescription,
      icon: '⭐',
      objects: selectedObjects.map(obj => ({ ...obj })),
    };

    setCustomTemplates([...customTemplates, newTemplate]);
    setShowSaveDialog(false);
    setTemplateName('');
    setTemplateDescription('');
  };

  const handleApplyTemplate = (template: LayerTemplate) => {
    // Apply template objects to current design
    template.objects.forEach((obj) => {
      const newObj = {
        ...obj,
        id: `${obj.type}-${Date.now()}-${Math.random()}`,
        zIndex: Date.now() + Math.random(),
      };
      addObject(newObj);
    });
  };

  return (
    <div className="layer-templates p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Layer Templates</h3>

        {/* Save selected as template */}
        {selectedObjects.length > 0 && (
          <button
            className="btn btn-primary w-full text-sm mb-4"
            onClick={() => setShowSaveDialog(true)}
          >
            <Save size={16} className="mr-2" />
            Save Selection as Template
          </button>
        )}

        {/* Save dialog */}
        {showSaveDialog && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Template Name</label>
              <input
                type="text"
                className="input w-full text-sm"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="My Template"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="input w-full text-sm"
                rows={2}
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Template description..."
              />
            </div>

            <div className="flex gap-2">
              <button
                className="btn btn-primary flex-1 text-xs"
                onClick={handleSaveAsTemplate}
              >
                Save
              </button>
              <button
                className="btn btn-ghost flex-1 text-xs"
                onClick={() => setShowSaveDialog(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Custom templates */}
        {customTemplates.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-medium text-gray-600 mb-2">
              My Templates ({customTemplates.length})
            </div>
            <div className="space-y-2">
              {customTemplates.map((template) => (
                <div
                  key={template.id}
                  className="p-3 bg-white border border-gray-300 rounded-lg hover:border-blue-500 cursor-pointer transition-all"
                  onClick={() => handleApplyTemplate(template)}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-2xl">{template.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{template.name}</div>
                      <div className="text-xs text-gray-500 truncate">{template.description}</div>
                      <div className="text-xs text-gray-400 mt-1">{template.objects.length} layers</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preset templates */}
        <div>
          <div className="text-xs font-medium text-gray-600 mb-2">Preset Templates</div>
          <div className="space-y-2">
            {PRESET_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className="p-3 bg-white border border-gray-300 rounded-lg hover:border-blue-500 cursor-pointer transition-all"
                onClick={() => handleApplyTemplate(template)}
              >
                <div className="flex items-start gap-2">
                  <span className="text-2xl">{template.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{template.name}</div>
                    <div className="text-xs text-gray-500 truncate">{template.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

