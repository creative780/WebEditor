'use client';

import { useState } from 'react';
import { Upload, Image, Trash2, Eye, Download } from 'lucide-react';
import { useEditorStore } from '../../../state/useEditorStore';

export function UploadsPanel() {
  const { addObject } = useEditorStore();
  const [uploads, setUploads] = useState([
    {
      id: 'upload-1',
      name: 'sample-image.jpg',
      type: 'image',
      size: '2.4 MB',
      dimensions: '1920 × 1080',
      thumbnail: '/api/placeholder/100/100',
      dpi: 300,
    },
    {
      id: 'upload-2',
      name: 'logo.png',
      type: 'image',
      size: '156 KB',
      dimensions: '500 × 500',
      thumbnail: '/api/placeholder/100/100',
      dpi: 300,
    },
  ]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newUpload = {
          id: `upload-${Date.now()}`,
          name: file.name,
          type: 'image',
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          dimensions: 'Unknown',
          thumbnail: e.target?.result as string,
          dpi: 300,
        };

        setUploads(prev => [...prev, newUpload]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUseImage = (upload: any) => {
    const newImage = {
      id: `image-${Date.now()}`,
      type: 'image' as const,
      src: upload.thumbnail,
      x: 1,
      y: 1,
      width: 2,
      height: 1.5,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      name: upload.name,
      zIndex: Date.now(),
      originalWidth: 500,
      originalHeight: 500,
      originalDPI: upload.dpi,
      filename: upload.name,
    };

    addObject(newImage);
  };

  const handleDeleteUpload = (id: string) => {
    setUploads(prev => prev.filter(upload => upload.id !== id));
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">UPLOADS</h3>
          <span className="text-xs text-gray-500">{uploads.length}</span>
        </div>
      </div>

      <div className="panel-content">
        {/* Upload Button */}
        <div className="mb-4">
          <label className="btn btn-primary w-full cursor-pointer">
            <Upload className="icon-sm mr-2" />
            Upload New File
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {/* Uploads Grid */}
        <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
          {uploads.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-8">
              <Upload className="icon mx-auto mb-2 text-gray-400" />
              <div>No files uploaded yet</div>
              <div className="text-xs mt-1">Drag and drop files here or click upload</div>
            </div>
          ) : (
            uploads.map((upload) => (
              <div
                key={upload.id}
                className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors"
              >
                <div className="flex gap-3">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                    <Image className="icon text-gray-400" />
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{upload.name}</div>
                    <div className="text-xs text-gray-500">
                      {upload.size} • {upload.dimensions}
                    </div>
                    <div className="text-xs text-gray-500">
                      {upload.dpi} DPI
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1">
                    <button
                      className="btn btn-ghost p-1"
                      onClick={() => handleUseImage(upload)}
                      title="Use in design"
                    >
                      <Eye className="icon-sm" />
                    </button>
                    <button
                      className="btn btn-ghost p-1"
                      onClick={() => handleDeleteUpload(upload.id)}
                      title="Delete file"
                    >
                      <Trash2 className="icon-sm text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Checkbox for selection */}
                <div className="mt-2">
                  <label className="flex items-center text-xs">
                    <input type="checkbox" className="mr-2" />
                    Select for batch operations
                  </label>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Batch Actions */}
        {uploads.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex gap-2">
              <button className="btn btn-ghost text-xs flex-1">
                <Download className="icon-sm mr-1" />
                Download All
              </button>
              <button className="btn btn-ghost text-xs flex-1">
                <Trash2 className="icon-sm mr-1" />
                Delete Selected
              </button>
            </div>
          </div>
        )}

        {/* File Info */}
        <div className="mt-6 text-xs text-gray-500">
          <div>Supported formats: JPG, PNG, SVG, PDF</div>
          <div>Max file size: 50 MB</div>
          <div>Recommended DPI: 300+ for print</div>
        </div>
      </div>
    </div>
  );
}
