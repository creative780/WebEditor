'use client';

import { useState, useCallback } from 'react';
import { useEditorStore } from '../../../state/useEditorStore';
import { 
  Download, FileText, Image as ImageIcon, Code, Settings, 
  CheckCircle2, AlertCircle, Clock, Trash2 
} from 'lucide-react';
import {
  ExportFormat, ExportQuality, ExportOptions,
  exportToPNG, exportToJPG, exportToSVG, exportToPDF,
  downloadExport, getDPI, getExportHistory, clearExportHistory, saveToHistory
} from '../../../lib/export';

export function ExportPanel() {
  // Get ALL objects from store - ensure we export entire canvas, not just selected
  const objects = useEditorStore((state) => state.objects);
  const doc = useEditorStore((state) => state.document);
  const projectColorMode = useEditorStore((state) => state.projectColorMode);
  
  const [settings, setSettings] = useState<Omit<ExportOptions, 'width' | 'height' | 'bleed'>>({
    format: 'png' as ExportFormat,
    quality: 'high' as ExportQuality,
    scale: 1,
    includeBleed: true,
    includeCropMarks: true,
    colorMode: projectColorMode as 'rgb' | 'cmyk',
    dpi: 300,
    backgroundColor: '#ffffff',
    transparent: false,
  });
  
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [exportMessage, setExportMessage] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState(getExportHistory());

  const formatOptions = [
    { value: 'pdf', label: 'PDF', icon: FileText, description: 'Print-ready PDF' },
    { value: 'png', label: 'PNG', icon: ImageIcon, description: 'High-quality raster' },
    { value: 'jpg', label: 'JPG', icon: ImageIcon, description: 'Compressed image' },
    { value: 'svg', label: 'SVG', icon: Code, description: 'Vector graphic' },
  ];

  const qualityOptions = [
    { value: 'low', label: 'Low (72 DPI)', description: 'Web preview' },
    { value: 'medium', label: 'Medium (150 DPI)', description: 'Screen display' },
    { value: 'high', label: 'High (300 DPI)', description: 'Professional print' },
    { value: 'ultra', label: 'Ultra (600 DPI)', description: 'Large format' },
  ];

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    setExportStatus('idle');
    setExportMessage('');

    try {
      // Ensure we're exporting ALL objects from the canvas, not just selected ones
      // Get fresh objects from store to avoid any stale state
      const allObjects = useEditorStore.getState().objects;
      
      // Filter only visible objects (export should respect visibility)
      const objectsToExport = allObjects.filter(obj => obj.visible !== false);
      
      if (objectsToExport.length === 0) {
        throw new Error('No objects to export');
      }

      const options: ExportOptions = {
        ...settings,
        width: doc.width,
        height: doc.height,
        bleed: doc.bleed,
        dpi: getDPI(settings.quality),
      };

      let result;
      switch (settings.format) {
        case 'png':
          result = await exportToPNG(objectsToExport, options);
          break;
        case 'jpg':
          result = await exportToJPG(objectsToExport, options);
          break;
        case 'svg':
          result = await exportToSVG(objectsToExport, options);
          break;
        case 'pdf':
          result = await exportToPDF(objectsToExport, options);
          break;
        default:
          throw new Error('Unsupported format');
      }

      if (result.success) {
        downloadExport(result);
        saveToHistory(result);
        setHistory(getExportHistory());
        setExportStatus('success');
        setExportMessage(`Successfully exported as ${settings.format.toUpperCase()}`);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus('error');
      setExportMessage('Failed to export. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [settings, doc]);

  const handleClearHistory = useCallback(() => {
    clearExportHistory();
    setHistory([]);
  }, []);

  return (
    <div className="h-full bg-white overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Export Design</h2>
          <Settings className="w-5 h-5 text-gray-400" />
        </div>

        {/* Export Status */}
        {exportStatus !== 'idle' && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
            exportStatus === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {exportStatus === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="text-sm">{exportMessage}</span>
          </div>
        )}

        {/* Format Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Export Format
          </label>
          <div className="grid grid-cols-2 gap-2">
            {formatOptions.map((format) => {
              const Icon = format.icon;
              const isSelected = settings.format === format.value;
              return (
                <button
                  key={format.value}
                  onClick={() => setSettings({ ...settings, format: format.value as ExportFormat })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                    <span className={`font-medium text-sm ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                      {format.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{format.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quality Settings */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Export Quality
          </label>
          <div className="space-y-2">
            {qualityOptions.map((quality) => {
              const isSelected = settings.quality === quality.value;
              return (
                <button
                  key={quality.value}
                  onClick={() => setSettings({ ...settings, quality: quality.value as ExportQuality, dpi: getDPI(quality.value as ExportQuality) })}
                  className={`w-full p-3 rounded-lg border transition-all text-left ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className={`font-medium text-sm ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                        {quality.label}
                      </p>
                      <p className="text-xs text-gray-500">{quality.description}</p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Print Options for PDF */}
        {settings.format === 'pdf' && (
          <div className="mb-6 space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Print Options</h3>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.includeBleed}
                onChange={(e) => setSettings({ ...settings, includeBleed: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">Include Bleed</p>
                <p className="text-xs text-gray-500">Add {doc.bleed}" bleed area</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.includeCropMarks}
                onChange={(e) => setSettings({ ...settings, includeCropMarks: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">Crop Marks</p>
                <p className="text-xs text-gray-500">Add cutting guidelines</p>
              </div>
            </label>
          </div>
        )}

        {/* Background Options */}
        {(settings.format === 'png' || settings.format === 'svg') && (
          <div className="mb-6 space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Background</h3>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.transparent}
                onChange={(e) => setSettings({ ...settings, transparent: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">Transparent</p>
                <p className="text-xs text-gray-500">Remove background</p>
              </div>
            </label>

            {!settings.transparent && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <input
                  type="color"
                  value={settings.backgroundColor}
                  onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                  className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                />
              </div>
            )}
          </div>
        )}

        {/* Export Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Details</h3>
          <div className="space-y-1 text-xs text-gray-600">
            <p>Size: {doc.width}" × {doc.height}"</p>
            <p>Resolution: {getDPI(settings.quality)} DPI</p>
            <p>Objects: {objects.length}</p>
            <p>Color: {settings.colorMode.toUpperCase()}</p>
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={isExporting || objects.length === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
        >
          {isExporting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Export {settings.format.toUpperCase()}
            </>
          )}
        </button>

        {/* History Toggle */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Export History</span>
          </div>
          <span className="text-xs text-gray-500">{history.length} exports</span>
        </button>

        {/* History List */}
        {showHistory && history.length > 0 && (
          <div className="mt-4 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">Recent Exports</h3>
              <button
                onClick={handleClearHistory}
                className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {history.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                  <div>
                    <p className="font-medium text-gray-900">{item.filename}</p>
                    <p className="text-gray-500">{new Date(item.timestamp).toLocaleString()}</p>
                  </div>
                  <span className="text-gray-600 font-medium">{item.format.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {objects.length === 0 && (
          <p className="text-sm text-gray-500 text-center mt-3">
            Add objects to export
          </p>
        )}
      </div>
    </div>
  );
}

