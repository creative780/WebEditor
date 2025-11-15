'use client';

import { useState, useEffect } from 'react';
import { Save, Download, Share2, Settings, ArrowLeft, ChevronDown } from 'lucide-react';
import { useEditorStore } from '../../state/useEditorStore';
import { useRouter } from 'next/navigation';

export function Topbar() {
  const { document, setDocumentUnit } = useEditorStore();
  const router = useRouter();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('Business Card Design');
  const [isMetricsOpen, setIsMetricsOpen] = useState(false);

  const metricsOptions = [
    { value: 'px', label: 'Pixel' },
    { value: 'mm', label: 'Millimeter' },
    { value: 'cm', label: 'Centimeter' },
    { value: 'in', label: 'Inch' },
    { value: 'ft', label: 'Foot' }
  ];

  const handleMetricsChange = (unit: string) => {
    setDocumentUnit(unit as 'px' | 'mm' | 'cm' | 'in' | 'ft');
    setIsMetricsOpen(false);
  };

  const handleBackClick = () => {
    router.push('/');
  };

  const handleTitleClick = () => {
    setIsEditingTitle(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempTitle(e.target.value);
  };

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    // Here you would typically save the title to your store/backend
    // For now, we'll just update the local state
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
      setTempTitle('Business Card Design'); // Reset to original
    }
  };

  return (
    <div className="editor-topbar">
      <div className="topbar-content">
        <div className="topbar-left">
          <button 
            className="topbar-back-btn" 
            onClick={handleBackClick}
            title="Back to Homepage"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="topbar-project-info">
            {isEditingTitle ? (
              <input
                type="text"
                value={tempTitle}
                onChange={handleTitleChange}
                onBlur={handleTitleSubmit}
                onKeyDown={handleTitleKeyDown}
                className="topbar-title-input"
                autoFocus
              />
            ) : (
              <h1 
                className="topbar-title editable" 
                onClick={handleTitleClick}
                title="Click to edit project name"
              >
                {tempTitle}
              </h1>
            )}
            <div className="topbar-info">
              <span className="topbar-dimensions">
                {document.width} × {document.height} {document.unit}
              </span>
              <span className="topbar-separator">•</span>
              <span className="topbar-dpi">{document.dpi} DPI</span>
            </div>
          </div>
        </div>
        
        <div className="topbar-center">
          <div className="topbar-status">
            <div className="status-indicator"></div>
            <span className="status-text">Saved</span>
          </div>
        </div>
        
        <div className="topbar-right">
          <div className="topbar-actions">
            <button className="topbar-btn-icon" title="Save">
              <Save className="w-5 h-5 text-white" />
            </button>
            <button className="topbar-btn-icon" title="Download">
              <Download className="w-5 h-5 text-white" />
            </button>
            <button className="topbar-btn-icon" title="Share">
              <Share2 className="w-5 h-5 text-white" />
            </button>
            <button className="topbar-btn-icon" title="Settings">
              <Settings className="w-5 h-5 text-white" />
            </button>
          </div>
          
          {/* Metrics Button - Right end of top bar */}
          <div className="metrics-dropdown">
            <button 
              className="topbar-btn-icon metrics-btn" 
              onClick={() => setIsMetricsOpen(!isMetricsOpen)}
              title="Change Units"
            >
              <span className="metrics-text">{document.unit.toUpperCase()}</span>
              <ChevronDown className="w-4 h-4 text-white ml-1" />
            </button>
            
            {isMetricsOpen && (
              <div className="metrics-dropdown-menu">
                {metricsOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`metrics-option ${document.unit === option.value ? 'active' : ''}`}
                    onClick={() => handleMetricsChange(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}