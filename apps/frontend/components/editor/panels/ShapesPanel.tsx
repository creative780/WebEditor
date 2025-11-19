'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { Search, Square, Circle, Triangle, ArrowRight, Star, Minus, Pentagon, MessageSquare, Heart, Settings, Hexagon, Octagon } from 'lucide-react';
import { useEditorStore, useSelectedObjects } from '../../../state/useEditorStore';
import {
  generatePolygonPoints,
  generateStarPoints,
  generateArrowPath,
  generateCalloutPath,
  generateHeartPath,
  generateGearPath,
  pointsToPath,
  ArrowStyle,
  CalloutStyle,
} from '../../../lib/shapes';
import {
  performBooleanOperation,
  getAvailableOperations,
  BooleanOperation,
} from '../../../lib/booleanOperations';

// Move shapes array outside component to prevent recreation on every render
const SHAPES = [
  { id: 'rectangle', name: 'Rectangle', icon: Square, shortcut: 'R', category: 'basic' },
  { id: 'circle', name: 'Circle', icon: Circle, shortcut: 'O', category: 'basic' },
  { id: 'triangle', name: 'Triangle', icon: Triangle, shortcut: 'T', category: 'basic' },
  { id: 'line', name: 'Line', icon: Minus, shortcut: 'L', category: 'basic' },
  { id: 'polygon', name: 'Polygon', icon: Hexagon, shortcut: 'P', category: 'advanced' },
  { id: 'star', name: 'Star', icon: Star, shortcut: 'S', category: 'advanced' },
  { id: 'arrow', name: 'Arrow', icon: ArrowRight, shortcut: 'A', category: 'advanced' },
  { id: 'callout', name: 'Callout', icon: MessageSquare, shortcut: 'C', category: 'advanced' },
  { id: 'heart', name: 'Heart', icon: Heart, shortcut: 'H', category: 'special' },
  { id: 'gear', name: 'Gear', icon: Settings, shortcut: 'G', category: 'special' },
];

export function ShapesPanel() {
  const { addObject, applyStyle, removeObject } = useEditorStore();
  const selectedObjects = useSelectedObjects();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Debounced style application for smooth live updates
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Handle boolean operations
  const handleBooleanOperation = useCallback((operation: BooleanOperation) => {
    if (selectedObjects.length < 2) return;
    
    // Get shapes/paths from selected objects
    const shapes = selectedObjects.filter(obj => obj.type === 'shape' || obj.type === 'path') as any[];
    if (shapes.length < 2) return;
    
    // Perform operation on first two shapes
    const [shape1, shape2] = shapes;
    try {
      const result = performBooleanOperation(shape1, shape2, operation);
      
      // Add the result
      addObject(result);
      
      // Optionally remove the original shapes
      // Uncomment these lines if you want to remove the original shapes
      // removeObject(shape1.id);
      // removeObject(shape2.id);
      
      // Select the new shape
      useEditorStore.getState().selectObject(result.id);
    } catch (error) {
      console.error('Boolean operation failed:', error);
    }
  }, [selectedObjects, addObject, removeObject]);
  
  const debouncedApplyStyle = useCallback((id: string, style: any) => {
    // Apply immediately for instant feedback
    applyStyle(id, style);
    
    // Clear previous timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    // Debounce for performance (not needed since we want live updates)
    // This is just for cleanup if needed
    debounceTimeout.current = setTimeout(() => {
      // Any cleanup logic can go here
    }, 16); // 60fps
  }, [applyStyle]);

  // Memoize filtered shapes to prevent unnecessary recalculations
  const filteredShapes = useMemo(() => 
    SHAPES.filter(shape =>
      shape.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [searchTerm]
  );

  // Memoize shape creation function to prevent recreation on every render
  const handleAddShape = useCallback((shapeType: string) => {
    // Get current document dimensions for better positioning
    const documentWidth = useEditorStore.getState().document.width;
    const documentHeight = useEditorStore.getState().document.height;
    
    // Default dimensions
    const defaultWidth = 2;
    const defaultHeight = 1.5;
    
    // Calculate center position
    const centerX = documentWidth / 2;
    const centerY = documentHeight / 2;
    
    // Create basic shape object
    const newShape = {
      id: `shape-${Date.now()}`,
      type: 'shape' as const,
      shape: shapeType as any,
      x: centerX - defaultWidth / 2,
      y: centerY - defaultHeight / 2,
      width: shapeType === 'circle' ? defaultHeight : defaultWidth,
      height: shapeType === 'circle' ? defaultHeight : (shapeType === 'line' ? 0.1 : defaultHeight),
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      name: SHAPES.find(s => s.id === shapeType)?.name || 'Shape',
      zIndex: Date.now(),
      fill: {
        type: 'solid' as const,
        color: '#6F1414',
      },
      stroke: {
        width: 1,
        color: '#5A1010',
        style: 'solid' as const,
        cap: 'butt' as const,
        join: 'miter' as const,
      },
      borderRadius: shapeType === 'rectangle' ? 4 : 0,
    };

    addObject(newShape);
    useEditorStore.getState().selectObject(newShape.id);
  }, [addObject]);

  // Get the first selected shape or path for property editing
  const selectedShape = selectedObjects.find(obj => obj.type === 'shape') as any;
  const selectedPath = selectedObjects.find(obj => obj.type === 'path') as any;
  const selectedObject = selectedShape || selectedPath;
  
  // Category filter
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const categories = [
    { id: 'all', name: 'All' },
    { id: 'basic', name: 'Basic' },
    { id: 'advanced', name: 'Advanced' },
    { id: 'special', name: 'Special' },
  ];
  
  const filteredShapesByCategory = useMemo(() => {
    let filtered = filteredShapes;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(shape => shape.category === selectedCategory);
    }
    return filtered;
  }, [filteredShapes, selectedCategory]);

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">SHAPES</h3>
        </div>
      </div>

      <div className="panel-content">
        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 icon-sm text-gray-400" />
            <input
              type="text"
              placeholder="Search shapes..."
              className="input w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-4 flex gap-1">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Shapes Grid */}
        <div className="grid grid-cols-2 gap-2">
          {filteredShapesByCategory.map((shape) => {
            const Icon = shape.icon;
            return (
              <button
                key={shape.id}
                className="btn btn-ghost h-16 flex flex-col items-center justify-center gap-1 transition-all duration-150 hover:scale-105"
                onClick={() => handleAddShape(shape.id)}
                title={`${shape.name} (${shape.shortcut})`}
              >
                <Icon className="icon" />
                <span className="text-xs">{shape.name}</span>
              </button>
            );
          })}
        </div>

        {/* Shape Properties */}
        {selectedObject && (
          <div className="mt-6">
            <div className="text-xs font-semibold text-gray-600 mb-2">
              {selectedObject.type === 'shape' ? 'Shape Properties' : 'Path Properties'}
            </div>
            <div className="space-y-3">
              {/* Basic Shape Properties */}
              {selectedShape && selectedShape.shape === 'rectangle' && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Corner Radius</label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={selectedShape.borderRadius || 0}
                    onChange={(e) => debouncedApplyStyle(selectedShape.id, { borderRadius: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-400 text-center mt-1">
                    {selectedShape.borderRadius || 0}px
                  </div>
                </div>
              )}

              {/* Advanced Shape Properties for Paths */}
              {selectedPath && selectedPath.id.includes('path-') && (
                <div className="space-y-3">
                  {/* Detect shape type from path ID or name */}
                  {selectedPath.name === 'Polygon' && (
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Sides</label>
                      <input
                        type="range"
                        min="3"
                        max="12"
                        defaultValue="6"
                        onChange={(e) => {
                          const sides = parseInt(e.target.value);
                          const config = {
                            width: selectedPath.width,
                            height: selectedPath.height,
                            centerX: selectedPath.width / 2,
                            centerY: selectedPath.height / 2,
                          };
                          const points = generatePolygonPoints(sides, config);
                          const pathData = pointsToPath(points, true);
                          applyStyle(selectedPath.id, { pathData });
                        }}
                        className="w-full"
                      />
                    </div>
                  )}

                  {selectedPath.name === 'Star' && (
                    <>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Points</label>
                        <input
                          type="range"
                          min="3"
                          max="12"
                          defaultValue="5"
                          onChange={(e) => {
                            const points = parseInt(e.target.value);
                            const config = {
                              width: selectedPath.width,
                              height: selectedPath.height,
                              centerX: selectedPath.width / 2,
                              centerY: selectedPath.height / 2,
                            };
                            const starPoints = generateStarPoints(points, 0.5, config);
                            const pathData = pointsToPath(starPoints, true);
                            applyStyle(selectedPath.id, { pathData });
                          }}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Inner Radius</label>
                        <input
                          type="range"
                          min="0.1"
                          max="0.9"
                          step="0.1"
                          defaultValue="0.5"
                          onChange={(e) => {
                            const innerRadius = parseFloat(e.target.value);
                            const config = {
                              width: selectedPath.width,
                              height: selectedPath.height,
                              centerX: selectedPath.width / 2,
                              centerY: selectedPath.height / 2,
                            };
                            const starPoints = generateStarPoints(5, innerRadius, config);
                            const pathData = pointsToPath(starPoints, true);
                            applyStyle(selectedPath.id, { pathData });
                          }}
                          className="w-full"
                        />
                      </div>
                    </>
                  )}

                  {selectedPath.name === 'Arrow' && (
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Arrow Style</label>
                      <select
                        className="input w-full"
                        onChange={(e) => {
                          const style = e.target.value as ArrowStyle;
                          const config = {
                            width: selectedPath.width,
                            height: selectedPath.height,
                            centerX: selectedPath.width / 2,
                            centerY: selectedPath.height / 2,
                          };
                          const pathData = generateArrowPath(style, config);
                          applyStyle(selectedPath.id, { pathData });
                        }}
                      >
                        <option value="simple">Simple</option>
                        <option value="double">Double</option>
                        <option value="curved">Curved</option>
                        <option value="block">Block</option>
                      </select>
                    </div>
                  )}

                  {selectedPath.name === 'Callout' && (
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Callout Style</label>
                      <select
                        className="input w-full"
                        onChange={(e) => {
                          const style = e.target.value as CalloutStyle;
                          const config = {
                            width: selectedPath.width,
                            height: selectedPath.height,
                            centerX: selectedPath.width / 2,
                            centerY: selectedPath.height / 2,
                          };
                          const pathData = generateCalloutPath(style, config, 0.5);
                          applyStyle(selectedPath.id, { pathData });
                        }}
                      >
                        <option value="rounded">Rounded</option>
                        <option value="sharp">Sharp</option>
                        <option value="cloud">Cloud</option>
                        <option value="speech">Speech</option>
                      </select>
                    </div>
                  )}

                  {selectedPath.name === 'Gear' && (
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Teeth</label>
                      <input
                        type="range"
                        min="4"
                        max="20"
                        defaultValue="8"
                        onChange={(e) => {
                          const teeth = parseInt(e.target.value);
                          const config = {
                            width: selectedPath.width,
                            height: selectedPath.height,
                            centerX: selectedPath.width / 2,
                            centerY: selectedPath.height / 2,
                          };
                          const pathData = generateGearPath(teeth, config);
                          applyStyle(selectedPath.id, { pathData });
                        }}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Common Properties for All Shapes */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Stroke Width</label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={selectedObject.stroke?.width || 0}
                  onChange={(e) => debouncedApplyStyle(selectedObject.id, { 
                    stroke: { 
                      ...selectedObject.stroke, 
                      width: parseInt(e.target.value) 
                    }
                  })}
                  className="w-full"
                />
                <div className="text-xs text-gray-400 text-center mt-1">
                  {selectedObject.stroke?.width || 0}px
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Fill Color</label>
                <input
                  type="color"
                  value={selectedObject.fill?.color || '#6F1414'}
                  onChange={(e) => applyStyle(selectedObject.id, { 
                    fill: { 
                      ...selectedObject.fill, 
                      color: e.target.value 
                    } 
                  })}
                  className="w-full h-8 rounded border border-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Stroke Color</label>
                <input
                  type="color"
                  value={selectedObject.stroke?.color || '#5A1010'}
                  onChange={(e) => applyStyle(selectedObject.id, { 
                    stroke: { 
                      ...selectedObject.stroke, 
                      color: e.target.value 
                    } 
                  })}
                  className="w-full h-8 rounded border border-gray-300"
                />
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-6 space-y-2">
          {selectedShape && (
            <button 
              className="btn btn-ghost w-full text-sm"
              onClick={() => {
                // Convert basic shape to path
                console.log('Converting shape to path...');
              }}
            >
              Convert to Path
            </button>
          )}
          {selectedObjects.length >= 2 && (
            <div>
              <div className="text-xs font-semibold text-gray-600 mb-2">Boolean Operations</div>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  className="btn btn-ghost text-xs hover:bg-blue-50"
                  onClick={() => handleBooleanOperation('union')}
                  title="Combine shapes into one"
                >
                  Union
                </button>
                <button 
                  className="btn btn-ghost text-xs hover:bg-red-50"
                  onClick={() => handleBooleanOperation('subtract')}
                  title="Subtract second shape from first"
                >
                  Subtract
                </button>
                <button 
                  className="btn btn-ghost text-xs hover:bg-green-50"
                  onClick={() => handleBooleanOperation('intersect')}
                  title="Keep only overlapping area"
                >
                  Intersect
                </button>
                <button 
                  className="btn btn-ghost text-xs hover:bg-purple-50"
                  onClick={() => handleBooleanOperation('exclude')}
                  title="Keep only non-overlapping areas"
                >
                  Exclude
                </button>
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Note: Boolean operations use a simplified implementation. For production use, consider integrating paper.js or clipper-lib.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
