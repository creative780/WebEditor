'use client';

import { useState } from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { useEditorStore, useSelectedObjects } from '../../../state/useEditorStore';

export function LayerEffects() {
  const selectedObjects = useSelectedObjects();
  const { setEffects, setBlendMode } = useEditorStore();
  const selectedObject = selectedObjects[0];

  const [dropShadow, setDropShadow] = useState(selectedObject?.effects?.dropShadow || {
    offsetX: 4,
    offsetY: 4,
    blur: 8,
    color: '#000000',
    opacity: 0.5,
  });

  const [innerGlow, setInnerGlow] = useState(selectedObject?.effects?.innerGlow || {
    blur: 10,
    color: '#FFFFFF',
    opacity: 0.5,
  });

  const [outerGlow, setOuterGlow] = useState(selectedObject?.effects?.outerGlow || {
    blur: 15,
    color: '#0000FF',
    opacity: 0.7,
  });

  if (!selectedObject) {
    return (
      <div className="p-4 text-sm text-gray-500 text-center">
        Select an object to apply effects
      </div>
    );
  }

  const handleDropShadowChange = (updates: Partial<typeof dropShadow>) => {
    const newShadow = { ...dropShadow, ...updates };
    setDropShadow(newShadow);
    setEffects(selectedObject.id, {
      ...selectedObject.effects,
      dropShadow: newShadow,
    });
  };

  const handleInnerGlowChange = (updates: Partial<typeof innerGlow>) => {
    const newGlow = { ...innerGlow, ...updates };
    setInnerGlow(newGlow);
    setEffects(selectedObject.id, {
      ...selectedObject.effects,
      innerGlow: newGlow,
    });
  };

  const handleOuterGlowChange = (updates: Partial<typeof outerGlow>) => {
    const newGlow = { ...outerGlow, ...updates };
    setOuterGlow(newGlow);
    setEffects(selectedObject.id, {
      ...selectedObject.effects,
      outerGlow: newGlow,
    });
  };

  const handleRemoveEffect = (effectType: 'dropShadow' | 'innerGlow' | 'outerGlow') => {
    const newEffects = { ...selectedObject.effects };
    delete newEffects[effectType];
    setEffects(selectedObject.id, newEffects);
  };

  return (
    <div className="layer-effects p-4 space-y-6">
      <h3 className="text-sm font-semibold text-gray-700">Layer Effects</h3>

      {/* Blend Mode */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">Blend Mode</label>
        <select
          value={selectedObject.blendMode || 'normal'}
          onChange={(e) => setBlendMode(selectedObject.id, e.target.value as any)}
          className="input w-full text-sm"
        >
          <option value="normal">Normal</option>
          <option value="multiply">Multiply</option>
          <option value="screen">Screen</option>
          <option value="overlay">Overlay</option>
          <option value="darken">Darken</option>
          <option value="lighten">Lighten</option>
          <option value="color-dodge">Color Dodge</option>
          <option value="color-burn">Color Burn</option>
        </select>
      </div>

      {/* Drop Shadow */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon size={14} className="text-gray-600" />
            <label className="text-xs font-medium text-gray-700">Drop Shadow</label>
          </div>
          {selectedObject.effects?.dropShadow && (
            <button
              className="text-xs text-red-500 hover:text-red-700"
              onClick={() => handleRemoveEffect('dropShadow')}
            >
              Remove
            </button>
          )}
        </div>

        <div className="space-y-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">X Offset</label>
            <input
              type="range"
              min="-20"
              max="20"
              value={dropShadow.offsetX}
              onChange={(e) => handleDropShadowChange({ offsetX: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="text-xs text-gray-400 text-center">{dropShadow.offsetX}px</div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Y Offset</label>
            <input
              type="range"
              min="-20"
              max="20"
              value={dropShadow.offsetY}
              onChange={(e) => handleDropShadowChange({ offsetY: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="text-xs text-gray-400 text-center">{dropShadow.offsetY}px</div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Blur</label>
            <input
              type="range"
              min="0"
              max="30"
              value={dropShadow.blur}
              onChange={(e) => handleDropShadowChange({ blur: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="text-xs text-gray-400 text-center">{dropShadow.blur}px</div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Color</label>
            <input
              type="color"
              value={dropShadow.color}
              onChange={(e) => handleDropShadowChange({ color: e.target.value })}
              className="w-full h-10 rounded border border-gray-300"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Opacity</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={dropShadow.opacity}
              onChange={(e) => handleDropShadowChange({ opacity: parseFloat(e.target.value) })}
              className="w-full"
            />
            <div className="text-xs text-gray-400 text-center">{Math.round(dropShadow.opacity * 100)}%</div>
          </div>
        </div>
      </div>

      {/* Inner Glow */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-gray-600" />
            <label className="text-xs font-medium text-gray-700">Inner Glow</label>
          </div>
          {selectedObject.effects?.innerGlow && (
            <button
              className="text-xs text-red-500 hover:text-red-700"
              onClick={() => handleRemoveEffect('innerGlow')}
            >
              Remove
            </button>
          )}
        </div>

        <div className="space-y-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Blur</label>
            <input
              type="range"
              min="0"
              max="30"
              value={innerGlow.blur}
              onChange={(e) => handleInnerGlowChange({ blur: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="text-xs text-gray-400 text-center">{innerGlow.blur}px</div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Color</label>
            <input
              type="color"
              value={innerGlow.color}
              onChange={(e) => handleInnerGlowChange({ color: e.target.value })}
              className="w-full h-10 rounded border border-gray-300"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Opacity</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={innerGlow.opacity}
              onChange={(e) => handleInnerGlowChange({ opacity: parseFloat(e.target.value) })}
              className="w-full"
            />
            <div className="text-xs text-gray-400 text-center">{Math.round(innerGlow.opacity * 100)}%</div>
          </div>
        </div>
      </div>

      {/* Outer Glow */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun size={14} className="text-gray-600" />
            <label className="text-xs font-medium text-gray-700">Outer Glow</label>
          </div>
          {selectedObject.effects?.outerGlow && (
            <button
              className="text-xs text-red-500 hover:text-red-700"
              onClick={() => handleRemoveEffect('outerGlow')}
            >
              Remove
            </button>
          )}
        </div>

        <div className="space-y-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Blur</label>
            <input
              type="range"
              min="0"
              max="50"
              value={outerGlow.blur}
              onChange={(e) => handleOuterGlowChange({ blur: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="text-xs text-gray-400 text-center">{outerGlow.blur}px</div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Color</label>
            <input
              type="color"
              value={outerGlow.color}
              onChange={(e) => handleOuterGlowChange({ color: e.target.value })}
              className="w-full h-10 rounded border border-gray-300"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Opacity</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={outerGlow.opacity}
              onChange={(e) => handleOuterGlowChange({ opacity: parseFloat(e.target.value) })}
              className="w-full"
            />
            <div className="text-xs text-gray-400 text-center">{Math.round(outerGlow.opacity * 100)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}

