'use client';

import { useState, useCallback, useEffect } from 'react';
import { useEditorStore, PathObj } from '../../state/useEditorStore';
import { BezierPoint, bezierToPath, Point } from '../../lib/shapes';

interface PathEditorProps {
  pathId: string;
}

/**
 * PathEditor component for editing bezier curves and custom paths
 * Provides point editing functionality with control points for bezier curves
 */
export function PathEditor({ pathId }: PathEditorProps) {
  const path = useEditorStore((state) => 
    state.objects.find((obj) => obj.id === pathId && obj.type === 'path')
  ) as PathObj | undefined;

  const { updateObject } = useEditorStore();
  
  const [points, setPoints] = useState<BezierPoint[]>([]);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const [editMode, setEditMode] = useState<'points' | 'bezier'>('points');

  // Initialize points from path data
  useEffect(() => {
    if (path?.pathData) {
      // Parse SVG path data to extract points
      // This is a simplified parser - in production use a proper SVG path parser
      const pathCommands = path.pathData.match(/[MLCQZmlcqz][^MLCQZmlcqz]*/g);
      if (pathCommands) {
        const parsedPoints: BezierPoint[] = [];
        
        pathCommands.forEach((command) => {
          const type = command[0];
          const coords = command.slice(1).trim().split(/[\s,]+/).map(parseFloat);
          
          if (type === 'M' || type === 'm') {
            // Move command
            parsedPoints.push({ x: coords[0], y: coords[1] });
          } else if (type === 'L' || type === 'l') {
            // Line command
            parsedPoints.push({ x: coords[0], y: coords[1] });
          } else if (type === 'C' || type === 'c') {
            // Cubic bezier curve
            parsedPoints.push({
              x: coords[4],
              y: coords[5],
              cp1: { x: coords[0], y: coords[1] },
              cp2: { x: coords[2], y: coords[3] },
            });
          } else if (type === 'Q' || type === 'q') {
            // Quadratic bezier curve
            parsedPoints.push({
              x: coords[2],
              y: coords[3],
              cp1: { x: coords[0], y: coords[1] },
            });
          }
        });
        
        setPoints(parsedPoints);
      }
    }
  }, [path?.pathData]);

  // Update path when points change
  const updatePath = useCallback((newPoints: BezierPoint[]) => {
    if (!path) return;
    
    const newPathData = bezierToPath(newPoints, true);
    updateObject(pathId, { pathData: newPathData });
    setPoints(newPoints);
  }, [path, pathId, updateObject]);

  // Add a new point
  const addPoint = useCallback(() => {
    if (points.length === 0) {
      const newPoint: BezierPoint = { x: 50, y: 50 };
      updatePath([newPoint]);
    } else {
      const lastPoint = points[points.length - 1];
      const newPoint: BezierPoint = {
        x: lastPoint.x + 20,
        y: lastPoint.y,
      };
      updatePath([...points, newPoint]);
    }
  }, [points, updatePath]);

  // Remove selected point
  const removePoint = useCallback(() => {
    if (selectedPointIndex !== null && points.length > 3) {
      const newPoints = points.filter((_, index) => index !== selectedPointIndex);
      updatePath(newPoints);
      setSelectedPointIndex(null);
    }
  }, [selectedPointIndex, points, updatePath]);

  // Update a point position
  const updatePoint = useCallback((index: number, updates: Partial<BezierPoint>) => {
    const newPoints = [...points];
    newPoints[index] = { ...newPoints[index], ...updates };
    updatePath(newPoints);
  }, [points, updatePath]);

  // Convert to bezier mode
  const convertToBezier = useCallback(() => {
    if (editMode === 'bezier') return;
    
    const bezierPoints: BezierPoint[] = points.map((point, index) => {
      const prev = points[(index - 1 + points.length) % points.length];
      const next = points[(index + 1) % points.length];
      
      // Calculate smooth control points
      const smoothness = 0.25;
      const cp1 = {
        x: point.x + (prev.x - next.x) * smoothness,
        y: point.y + (prev.y - next.y) * smoothness,
      };
      const cp2 = {
        x: point.x + (next.x - prev.x) * smoothness,
        y: point.y + (next.y - prev.y) * smoothness,
      };
      
      return { ...point, cp1, cp2 };
    });
    
    updatePath(bezierPoints);
    setEditMode('bezier');
  }, [points, updatePath, editMode]);

  // Convert to straight lines
  const convertToStraight = useCallback(() => {
    if (editMode === 'points') return;
    
    const straightPoints: BezierPoint[] = points.map(point => ({
      x: point.x,
      y: point.y,
    }));
    
    updatePath(straightPoints);
    setEditMode('points');
  }, [points, updatePath, editMode]);

  if (!path) {
    return (
      <div className="p-4 text-sm text-gray-500">
        No path selected for editing
      </div>
    );
  }

  return (
    <div className="path-editor p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Path Editor</h3>
        <div className="flex gap-1">
          <button
            className={`px-2 py-1 text-xs rounded ${
              editMode === 'points' ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}
            onClick={convertToStraight}
          >
            Points
          </button>
          <button
            className={`px-2 py-1 text-xs rounded ${
              editMode === 'bezier' ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}
            onClick={convertToBezier}
          >
            Bezier
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-gray-500">
          {points.length} points • {editMode === 'bezier' ? 'Curved' : 'Straight'} lines
        </div>

        {/* Point List */}
        <div className="max-h-60 overflow-y-auto space-y-1">
          {points.map((point, index) => (
            <div
              key={index}
              className={`p-2 rounded cursor-pointer transition-colors ${
                selectedPointIndex === index
                  ? 'bg-blue-100 border border-blue-300'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
              onClick={() => setSelectedPointIndex(index)}
            >
              <div className="flex items-center justify-between">
                <div className="text-xs">
                  Point {index + 1}
                </div>
                <div className="text-xs text-gray-500">
                  ({point.x.toFixed(1)}, {point.y.toFixed(1)})
                </div>
              </div>
              
              {selectedPointIndex === index && (
                <div className="mt-2 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">X</label>
                      <input
                        type="number"
                        value={point.x}
                        onChange={(e) => updatePoint(index, { x: parseFloat(e.target.value) })}
                        className="input w-full text-xs"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Y</label>
                      <input
                        type="number"
                        value={point.y}
                        onChange={(e) => updatePoint(index, { y: parseFloat(e.target.value) })}
                        className="input w-full text-xs"
                        step="0.1"
                      />
                    </div>
                  </div>

                  {editMode === 'bezier' && point.cp1 && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Control Point 1</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <input
                            type="number"
                            value={point.cp1.x}
                            onChange={(e) => updatePoint(index, { 
                              cp1: { ...point.cp1!, x: parseFloat(e.target.value) }
                            })}
                            className="input w-full text-xs"
                            step="0.1"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            value={point.cp1.y}
                            onChange={(e) => updatePoint(index, {
                              cp1: { ...point.cp1!, y: parseFloat(e.target.value) }
                            })}
                            className="input w-full text-xs"
                            step="0.1"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {editMode === 'bezier' && point.cp2 && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Control Point 2</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <input
                            type="number"
                            value={point.cp2.x}
                            onChange={(e) => updatePoint(index, {
                              cp2: { ...point.cp2!, x: parseFloat(e.target.value) }
                            })}
                            className="input w-full text-xs"
                            step="0.1"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            value={point.cp2.y}
                            onChange={(e) => updatePoint(index, {
                              cp2: { ...point.cp2!, y: parseFloat(e.target.value) }
                            })}
                            className="input w-full text-xs"
                            step="0.1"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            className="btn btn-primary text-xs"
            onClick={addPoint}
          >
            Add Point
          </button>
          <button
            className="btn btn-ghost text-xs"
            onClick={removePoint}
            disabled={selectedPointIndex === null || points.length <= 3}
          >
            Remove Point
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-400">
        <p>Tip: Click on a point to edit its coordinates.</p>
        {editMode === 'bezier' && (
          <p className="mt-1">Adjust control points to modify the curve.</p>
        )}
      </div>
    </div>
  );
}

