'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info, 
  Download, 
  Eye, 
  Settings,
  Palette
} from 'lucide-react';
import { useEditorStore } from '../../../state/useEditorStore';
import { printQualityValidator, PrintQualityReport, PrintIssue } from '../../../lib/printQuality';
import { colorManager } from '../../../lib/colorManagement';

export function PrintQualityPanel() {
  const { objects, document } = useEditorStore();
  const [qualityReport, setQualityReport] = useState<PrintQualityReport | null>(null);
  const [activeTab, setActiveTab] = useState<'quality' | 'color' | 'export'>('quality');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Create DocumentSpecs from DocumentConfig
  const documentSpecs = {
    ...document,
    colorMode: 'RGB' as 'CMYK' | 'RGB',
    colorProfile: 'sRGB',
    unit: (document.unit === 'cm' || document.unit === 'ft') ? 'mm' : document.unit as 'px' | 'mm' | 'in'
  };

  // Analyze document quality
  const analyzeQuality = async () => {
    setIsAnalyzing(true);
    try {
      const report = printQualityValidator.validateDocument(documentSpecs, objects);
      setQualityReport(report);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Run analysis when objects change
  useEffect(() => {
    if (objects.length > 0) {
      analyzeQuality();
    }
  }, [objects, document]);

  const getIssueIcon = (type: 'error' | 'warning' | 'info') => {
    switch (type) {
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info': return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-50';
    if (score >= 75) return 'bg-blue-50';
    if (score >= 50) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">PRINT QUALITY</h3>
          <div className="flex gap-1">
            <button
              className={`btn btn-ghost text-xs ${activeTab === 'quality' ? 'bg-gray-200' : ''}`}
              onClick={() => setActiveTab('quality')}
            >
              Quality
            </button>
            <button
              className={`btn btn-ghost text-xs ${activeTab === 'color' ? 'bg-gray-200' : ''}`}
              onClick={() => setActiveTab('color')}
            >
              Color
            </button>
            <button
              className={`btn btn-ghost text-xs ${activeTab === 'export' ? 'bg-gray-200' : ''}`}
              onClick={() => setActiveTab('export')}
            >
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="panel-content">
        <div className="space-y-4">
          {/* Analyze Button */}
          <button
            className="btn btn-primary w-full"
            onClick={analyzeQuality}
            disabled={isAnalyzing || objects.length === 0}
          >
            {isAnalyzing ? 'Analyzing...' : 'Run Quality Check'}
          </button>

          {/* Quality Tab */}
          {activeTab === 'quality' && qualityReport && (
            <div className="space-y-4">
              {/* Overall Score */}
              <div className={`p-4 rounded-lg ${getScoreBg(qualityReport.score)}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm">Overall Quality Score</h4>
                  <span className={`text-2xl font-bold ${getScoreColor(qualityReport.score)}`}>
                    {qualityReport.score}
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  Based on {qualityReport.issues.length} quality checks
                </div>
              </div>

              {/* Issues */}
              {qualityReport.issues.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Issues Found</h4>
                  <div className="space-y-2">
                    {qualityReport.issues.map((issue, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded">
                        <div className="flex items-start gap-2">
                          {getIssueIcon(issue.type)}
                          <div className="flex-1">
                            <div className="text-xs font-medium">{issue.title}</div>
                            <div className="text-xs text-gray-600 mt-1">{issue.description}</div>
                            {issue.suggestion && (
                              <div className="text-xs text-blue-600 mt-1">
                                💡 {issue.suggestion}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {qualityReport.issues.length === 0 && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">All quality checks passed!</span>
                  </div>
                  <p className="text-xs text-green-600 mt-2">
                    Your design meets all print quality standards.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Color Tab */}
          {activeTab === 'color' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Color Management</h4>
                <div className="space-y-2">
                  <div className="text-xs text-gray-600">
                    Current Profile: {(document as any).colorMode || 'sRGB'}
                  </div>
                  
                  {/* Color Space Info */}
                  <div className="p-3 bg-blue-50 rounded">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-blue-700">
                        <p className="font-medium mb-1">Color Space</p>
                        <p>RGB color space is suitable for digital displays. For print, consider converting to CMYK.</p>
                      </div>
                    </div>
                  </div>

                  {/* Color Actions */}
                  <div className="space-y-2">
                    <button className="btn btn-ghost w-full text-xs justify-start">
                      <Eye className="w-4 h-4" />
                      Preview in CMYK
                    </button>
                    <button className="btn btn-ghost w-full text-xs justify-start">
                      <Palette className="w-4 h-4" />
                      Check Gamut
                    </button>
                    <button className="btn btn-ghost w-full text-xs justify-start">
                      <Settings className="w-4 h-4" />
                      Color Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Export Tab */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Export Settings</h4>
                <div className="space-y-3">
                  {/* Format Options */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Format</label>
                    <select className="input w-full text-xs">
                      <option>PDF (Print)</option>
                      <option>PNG (High Quality)</option>
                      <option>JPEG (Web)</option>
                      <option>SVG (Vector)</option>
                    </select>
                  </div>

                  {/* Quality Settings */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Quality</label>
                    <select className="input w-full text-xs">
                      <option>Print (300 DPI)</option>
                      <option>High (150 DPI)</option>
                      <option>Medium (72 DPI)</option>
                    </select>
                  </div>

                  {/* Color Mode */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Color Mode</label>
                    <select className="input w-full text-xs">
                      <option>CMYK (Print)</option>
                      <option>RGB (Digital)</option>
                    </select>
                  </div>

                  {/* Bleed */}
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="includeBleed" className="rounded" defaultChecked />
                    <label htmlFor="includeBleed" className="text-xs text-gray-600">
                      Include Bleed Area
                    </label>
                  </div>

                  {/* Export Button */}
                  <button className="btn btn-primary w-full mt-4">
                    <Download className="w-4 h-4" />
                    Export for Print
                  </button>
                </div>
              </div>

              {/* Export Tips */}
              <div className="p-3 bg-blue-50 rounded">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-700">
                    <p className="font-medium mb-1">Export Tips</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Use PDF for professional printing</li>
                      <li>Include bleed for edge-to-edge designs</li>
                      <li>Use CMYK color mode for print</li>
                      <li>Ensure 300 DPI for best quality</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!qualityReport && objects.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <Settings className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-sm text-gray-600">Add objects to check quality</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
