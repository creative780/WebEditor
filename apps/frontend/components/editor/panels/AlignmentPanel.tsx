'use client';

import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyEnd,
  MoreHorizontal,
  MoreVertical,
  Square
} from 'lucide-react';
import { useEditorStore, useSelectedObjects } from '../../../state/useEditorStore';

export function AlignmentPanel() {
  const { alignObjects, distributeObjects, alignToCanvas } = useEditorStore();
  const selectedObjects = useSelectedObjects();

  const hasSelection = selectedObjects.length > 0;
  const hasMultipleSelection = selectedObjects.length > 1;
  const hasMultipleForDistribution = selectedObjects.length > 2;

  return (
    <div className="panel">
      <div className="panel-header">
        <h3 className="font-semibold text-sm">ALIGNMENT</h3>
      </div>

      <div className="panel-content">
        {/* Object Alignment */}
        {hasMultipleSelection && (
          <div className="mb-6">
            <div className="text-xs font-semibold text-gray-600 mb-3">Align Objects</div>
            
            {/* Horizontal Alignment */}
            <div className="flex gap-1 mb-2">
              <button
                onClick={() => alignObjects('left')}
                className="btn btn-ghost flex-1 h-8 flex items-center justify-center"
                title="Align Left"
                disabled={!hasMultipleSelection}
              >
                <AlignLeft className="icon-sm" />
              </button>
              <button
                onClick={() => alignObjects('center')}
                className="btn btn-ghost flex-1 h-8 flex items-center justify-center"
                title="Align Center"
                disabled={!hasMultipleSelection}
              >
                <AlignCenter className="icon-sm" />
              </button>
              <button
                onClick={() => alignObjects('right')}
                className="btn btn-ghost flex-1 h-8 flex items-center justify-center"
                title="Align Right"
                disabled={!hasMultipleSelection}
              >
                <AlignRight className="icon-sm" />
              </button>
            </div>

            {/* Vertical Alignment */}
            <div className="flex gap-1">
              <button
                onClick={() => alignObjects('top')}
                className="btn btn-ghost flex-1 h-8 flex items-center justify-center"
                title="Align Top"
                disabled={!hasMultipleSelection}
              >
                <AlignVerticalJustifyStart className="icon-sm" />
              </button>
              <button
                onClick={() => alignObjects('middle')}
                className="btn btn-ghost flex-1 h-8 flex items-center justify-center"
                title="Align Middle"
                disabled={!hasMultipleSelection}
              >
                <AlignVerticalJustifyCenter className="icon-sm" />
              </button>
              <button
                onClick={() => alignObjects('bottom')}
                className="btn btn-ghost flex-1 h-8 flex items-center justify-center"
                title="Align Bottom"
                disabled={!hasMultipleSelection}
              >
                <AlignVerticalJustifyEnd className="icon-sm" />
              </button>
            </div>
          </div>
        )}

        {/* Distribution */}
        {hasMultipleForDistribution && (
          <div className="mb-6">
            <div className="text-xs font-semibold text-gray-600 mb-3">Distribute</div>
            
            <div className="flex gap-1">
              <button
                onClick={() => distributeObjects('horizontal')}
                className="btn btn-ghost flex-1 h-8 flex items-center justify-center"
                title="Distribute Horizontally"
                disabled={!hasMultipleForDistribution}
              >
                <MoreHorizontal className="icon-sm" />
              </button>
              <button
                onClick={() => distributeObjects('vertical')}
                className="btn btn-ghost flex-1 h-8 flex items-center justify-center"
                title="Distribute Vertically"
                disabled={!hasMultipleForDistribution}
              >
                <MoreVertical className="icon-sm" />
              </button>
            </div>
          </div>
        )}

        {/* Canvas Alignment */}
        {hasSelection && (
          <div>
            <div className="text-xs font-semibold text-gray-600 mb-3">Align to Canvas</div>
            
            {/* Horizontal Canvas Alignment */}
            <div className="flex gap-1 mb-2">
              <button
                onClick={() => alignToCanvas('left')}
                className="btn btn-ghost flex-1 h-8 flex items-center justify-center"
                title="Align to Left Edge"
                disabled={!hasSelection}
              >
                <Square className="icon-sm" />
                <AlignLeft className="icon-sm" />
              </button>
              <button
                onClick={() => alignToCanvas('center')}
                className="btn btn-ghost flex-1 h-8 flex items-center justify-center"
                title="Align to Center"
                disabled={!hasSelection}
              >
                <Square className="icon-sm" />
                <AlignCenter className="icon-sm" />
              </button>
              <button
                onClick={() => alignToCanvas('right')}
                className="btn btn-ghost flex-1 h-8 flex items-center justify-center"
                title="Align to Right Edge"
                disabled={!hasSelection}
              >
                <Square className="icon-sm" />
                <AlignRight className="icon-sm" />
              </button>
            </div>

            {/* Vertical Canvas Alignment */}
            <div className="flex gap-1">
              <button
                onClick={() => alignToCanvas('top')}
                className="btn btn-ghost flex-1 h-8 flex items-center justify-center"
                title="Align to Top Edge"
                disabled={!hasSelection}
              >
                <Square className="icon-sm" />
                <AlignVerticalJustifyStart className="icon-sm" />
              </button>
              <button
                onClick={() => alignToCanvas('middle')}
                className="btn btn-ghost flex-1 h-8 flex items-center justify-center"
                title="Align to Middle"
                disabled={!hasSelection}
              >
                <Square className="icon-sm" />
                <AlignVerticalJustifyCenter className="icon-sm" />
              </button>
              <button
                onClick={() => alignToCanvas('bottom')}
                className="btn btn-ghost flex-1 h-8 flex items-center justify-center"
                title="Align to Bottom Edge"
                disabled={!hasSelection}
              >
                <Square className="icon-sm" />
                <AlignVerticalJustifyEnd className="icon-sm" />
              </button>
            </div>
          </div>
        )}

        {/* Help Text */}
        {!hasSelection && (
          <div className="text-xs text-gray-400 text-center py-4">
            Select objects to align
          </div>
        )}
        
        {hasSelection && !hasMultipleSelection && (
          <div className="text-xs text-gray-400 text-center py-2">
            Select multiple objects to align them
          </div>
        )}
        
        {hasSelection && hasMultipleSelection && !hasMultipleForDistribution && (
          <div className="text-xs text-gray-400 text-center py-2">
            Select 3+ objects to distribute them
          </div>
        )}
      </div>
    </div>
  );
}
