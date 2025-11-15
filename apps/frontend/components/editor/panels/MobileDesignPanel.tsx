'use client';

import { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut,
  Hand,
  MousePointer,
  Touchpad,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useEditorStore } from '../../../state/useEditorStore';

export interface DeviceProfile {
  id: string;
  name: string;
  type: 'mobile' | 'tablet' | 'desktop';
  width: number;
  height: number;
  dpi: number;
  icon: React.ReactNode;
  description: string;
}

export const DEVICE_PROFILES: DeviceProfile[] = [
  {
    id: 'iphone-14',
    name: 'iPhone 14',
    type: 'mobile',
    width: 390,
    height: 844,
    dpi: 460,
    icon: <Smartphone className="w-4 h-4" />,
    description: 'Modern smartphone design'
  },
  {
    id: 'iphone-14-pro',
    name: 'iPhone 14 Pro',
    type: 'mobile',
    width: 393,
    height: 852,
    dpi: 460,
    icon: <Smartphone className="w-4 h-4" />,
    description: 'Premium smartphone with Pro features'
  },
  {
    id: 'samsung-galaxy-s23',
    name: 'Galaxy S23',
    type: 'mobile',
    width: 360,
    height: 780,
    dpi: 425,
    icon: <Smartphone className="w-4 h-4" />,
    description: 'Android flagship device'
  },
  {
    id: 'ipad-air',
    name: 'iPad Air',
    type: 'tablet',
    width: 820,
    height: 1180,
    dpi: 264,
    icon: <Tablet className="w-4 h-4" />,
    description: 'Large tablet for design work'
  },
  {
    id: 'ipad-mini',
    name: 'iPad Mini',
    type: 'tablet',
    width: 744,
    height: 1133,
    dpi: 326,
    icon: <Tablet className="w-4 h-4" />,
    description: 'Compact tablet design'
  },
  {
    id: 'desktop-1920',
    name: 'Desktop 1920×1080',
    type: 'desktop',
    width: 1920,
    height: 1080,
    dpi: 96,
    icon: <Monitor className="w-4 h-4" />,
    description: 'Standard desktop resolution'
  },
  {
    id: 'desktop-2560',
    name: 'Desktop 2560×1440',
    type: 'desktop',
    width: 2560,
    height: 1440,
    dpi: 109,
    icon: <Monitor className="w-4 h-4" />,
    description: 'High-resolution desktop'
  }
];

export function MobileDesignPanel() {
  const { document, setDocumentSize, setDPI } = useEditorStore();
  const [selectedDevice, setSelectedDevice] = useState<DeviceProfile>(DEVICE_PROFILES[0]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [touchMode, setTouchMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isOnline, setIsOnline] = useState(true);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Apply device profile
  const applyDeviceProfile = (device: DeviceProfile) => {
    const width = orientation === 'landscape' ? device.height : device.width;
    const height = orientation === 'landscape' ? device.width : device.height;
    
    setDocumentSize(width, height, 'px');
    setDPI(device.dpi);
    setSelectedDevice(device);
  };

  // Toggle orientation
  const toggleOrientation = () => {
    const newOrientation = orientation === 'portrait' ? 'landscape' : 'portrait';
    setOrientation(newOrientation);
    
    const width = newOrientation === 'landscape' ? selectedDevice.height : selectedDevice.width;
    const height = newOrientation === 'landscape' ? selectedDevice.width : selectedDevice.height;
    
    setDocumentSize(width, height, 'px');
  };

  // Zoom controls
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 25));
  };

  const handleZoomReset = () => {
    setZoomLevel(100);
  };

  // Touch mode toggle
  const toggleTouchMode = () => {
    setTouchMode(!touchMode);
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">MOBILE DESIGN</h3>
          <div className="flex items-center gap-1">
            {isOnline ? (
              <Wifi className="w-3 h-3 text-green-500" />
            ) : (
              <WifiOff className="w-3 h-3 text-red-500" />
            )}
            <button
              className={`btn btn-ghost text-xs ${touchMode ? 'bg-gray-200' : ''}`}
              onClick={toggleTouchMode}
              title="Toggle touch mode"
            >
              {touchMode ? <Hand className="w-3 h-3" /> : <MousePointer className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>

      <div className="panel-content">
        {/* Device Selection */}
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-600 mb-2 block">Device Profile</label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {DEVICE_PROFILES.map((device) => (
              <button
                key={device.id}
                className={`w-full p-2 text-left border rounded transition-all ${
                  selectedDevice.id === device.id
                    ? 'border-[#6F1414] bg-[#6F1414] bg-opacity-10'
                    : 'border-gray-200 hover:border-[#6F1414] hover:bg-gray-50'
                }`}
                onClick={() => applyDeviceProfile(device)}
              >
                <div className="flex items-center gap-2">
                  {device.icon}
                  <div className="flex-1">
                    <div className="text-xs font-medium">{device.name}</div>
                    <div className="text-xs text-gray-600">{device.description}</div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {device.width}×{device.height}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Orientation Control */}
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-600 mb-2 block">Orientation</label>
          <div className="flex gap-1">
            <button
              className={`btn flex-1 text-xs ${
                orientation === 'portrait' ? 'bg-[#6F1414] text-white' : 'bg-white text-[#6F1414]'
              }`}
              onClick={() => setOrientation('portrait')}
            >
              Portrait
            </button>
            <button
              className={`btn flex-1 text-xs ${
                orientation === 'landscape' ? 'bg-[#6F1414] text-white' : 'bg-white text-[#6F1414]'
              }`}
              onClick={() => setOrientation('landscape')}
            >
              Landscape
            </button>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-600 mb-2 block">Zoom Level</label>
          <div className="flex items-center gap-2">
            <button
              className="btn btn-ghost text-xs"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 25}
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <div className="flex-1 text-center">
              <span className="text-xs font-medium">{zoomLevel}%</span>
            </div>
            <button
              className="btn btn-ghost text-xs"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 300}
            >
              <ZoomIn className="w-3 h-3" />
            </button>
            <button
              className="btn btn-ghost text-xs"
              onClick={handleZoomReset}
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Preview Mode */}
        <div className="mb-4">
          <button
            className={`btn w-full text-xs ${
              isPreviewMode ? 'bg-[#6F1414] text-white' : 'bg-white text-[#6F1414]'
            }`}
            onClick={() => setIsPreviewMode(!isPreviewMode)}
          >
            {isPreviewMode ? 'Exit Preview' : 'Enter Preview Mode'}
          </button>
        </div>

        {/* Device Info */}
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <div className="text-xs font-medium text-gray-700 mb-2">Current Device</div>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Device:</span>
              <span>{selectedDevice.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Resolution:</span>
              <span>{document.width} × {document.height}px</span>
            </div>
            <div className="flex justify-between">
              <span>DPI:</span>
              <span>{document.dpi}</span>
            </div>
            <div className="flex justify-between">
              <span>Orientation:</span>
              <span className="capitalize">{orientation}</span>
            </div>
            <div className="flex justify-between">
              <span>Zoom:</span>
              <span>{zoomLevel}%</span>
            </div>
          </div>
        </div>

        {/* Touch Gestures */}
        {touchMode && (
          <div className="mb-4 p-3 bg-blue-50 rounded">
            <div className="text-xs font-medium text-blue-700 mb-2">Touch Gestures</div>
            <div className="space-y-1 text-xs text-blue-600">
              <div>• Pinch to zoom in/out</div>
              <div>• Two-finger drag to pan</div>
              <div>• Single tap to select</div>
              <div>• Long press for context menu</div>
            </div>
          </div>
        )}

        {/* Responsive Breakpoints */}
        <div className="mb-4">
          <div className="text-xs font-medium text-gray-600 mb-2">Responsive Breakpoints</div>
          <div className="space-y-1">
            {[
              { name: 'Mobile', width: '320px - 768px', color: 'bg-blue-500' },
              { name: 'Tablet', width: '768px - 1024px', color: 'bg-green-500' },
              { name: 'Desktop', width: '1024px+', color: 'bg-purple-500' }
            ].map((breakpoint, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div className={`w-3 h-3 rounded ${breakpoint.color}`} />
                <span className="flex-1">{breakpoint.name}</span>
                <span className="text-gray-500">{breakpoint.width}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="p-3 bg-gray-50 rounded">
          <div className="text-xs font-medium text-gray-700 mb-2">Performance</div>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Connection:</span>
              <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Touch Mode:</span>
              <span className={touchMode ? 'text-blue-600' : 'text-gray-600'}>
                {touchMode ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Preview Mode:</span>
              <span className={isPreviewMode ? 'text-green-600' : 'text-gray-600'}>
                {isPreviewMode ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
