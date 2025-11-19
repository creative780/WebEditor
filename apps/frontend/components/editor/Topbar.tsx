'use client';

import { useState, useEffect, useCallback } from 'react';
import { Save, Download, Share2, Settings, ArrowLeft, ChevronDown, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useEditorStore } from '../../state/useEditorStore';
import { useRouter, usePathname } from 'next/navigation';
import { designClient } from '../../lib/api/designClient';
import { useCurrentUser } from '../../hooks/useCurrentUser';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function Topbar() {
  const { document, setDocumentUnit, objects, projectColorMode } = useEditorStore();
  const router = useRouter();
  const pathname = usePathname();
  const { getUserId } = useCurrentUser();
  
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('Business Card Design');
  const [isMetricsOpen, setIsMetricsOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [designId, setDesignId] = useState<string | null>(null);

  // Extract designId from URL pathname
  useEffect(() => {
    if (pathname) {
      const match = pathname.match(/\/editor\/([^\/]+)/);
      if (match) {
        setDesignId(match[1]);
      } else {
        // Fallback to localStorage
        const savedDesignId = localStorage.getItem('editor_design_id');
        setDesignId(savedDesignId || 'local-design');
      }
    }
  }, [pathname]);

  // Load design title if available
  useEffect(() => {
    if (designId && designId !== 'local-design') {
      // Try to load design to get the name
      designClient.loadDesign(designId)
        .then((design) => {
          if (design.designName) {
            setTempTitle(design.designName);
            localStorage.setItem('editor_design_title', design.designName);
          }
        })
        .catch(() => {
          // Design doesn't exist yet, use saved title or default
          const savedTitle = localStorage.getItem('editor_design_title');
          if (savedTitle) {
            setTempTitle(savedTitle);
          }
        });
    }
  }, [designId]);

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

  // Save design function
  const handleSave = useCallback(async () => {
    if (!designId) {
      setSaveError('No design ID available');
      setSaveStatus('error');
      return;
    }

    setSaveStatus('saving');
    setSaveError(null);

    try {
      const userId = getUserId();
      let actualDesignId = designId;

      // Check if design exists by trying to load it
      let designExists = false;
      try {
        await designClient.loadDesign(designId);
        designExists = true;
      } catch (error: any) {
        // Design doesn't exist (404 is expected)
        if (error.status !== 404) {
          throw error; // Re-throw if it's a different error
        }
      }

      if (!designExists) {
        // Create new design
        actualDesignId = await designClient.createDesign({
          name: tempTitle || 'Untitled Design',
          width: document.width,
          height: document.height,
          unit: document.unit,
          dpi: document.dpi,
          bleed: document.bleed,
          color_mode: projectColorMode || 'rgb',
        });

        // Update localStorage with new design ID and title
        localStorage.setItem('editor_design_id', actualDesignId);
        localStorage.setItem('editor_design_title', tempTitle || 'Untitled Design');
        setDesignId(actualDesignId);

        // Update URL if needed
        if (actualDesignId !== designId) {
          router.replace(`/editor/${actualDesignId}`);
        }
      } else {
        // Update existing design
        await designClient.updateDesign(designId, {
          name: tempTitle || 'Untitled Design',
          width: document.width,
          height: document.height,
          unit: document.unit,
          dpi: document.dpi,
          bleed: document.bleed,
          color_mode: projectColorMode || 'rgb',
        });

        // Update localStorage with title
        localStorage.setItem('editor_design_title', tempTitle || 'Untitled Design');
      }

      // Save all objects
      // First, get existing objects from backend to know which to update vs create
      let existingObjects: any[] = [];
      try {
        const existingDesign = await designClient.loadDesign(actualDesignId);
        existingObjects = existingDesign.objects || [];
      } catch (error) {
        // If we can't load, assume no objects exist
        console.warn('Could not load existing objects:', error);
      }

      const existingObjectIds = new Set(existingObjects.map(obj => obj.id));
      const currentObjectIds = new Set(objects.map(obj => obj.id));

      // Delete objects that were removed from canvas
      for (const existingObj of existingObjects) {
        if (!currentObjectIds.has(existingObj.id)) {
          try {
            await designClient.deleteObject(actualDesignId, existingObj.id);
          } catch (error) {
            console.error(`Failed to delete object ${existingObj.id}:`, error);
            // Continue with other operations
          }
        }
      }

      // Save each object (create or update)
      for (const obj of objects) {
        try {
          if (existingObjectIds.has(obj.id)) {
            // Update existing object
            await designClient.updateObject(actualDesignId, obj.id, obj);
          } else {
            // Create new object
            await designClient.createObject(actualDesignId, obj);
          }
        } catch (error) {
          console.error(`Failed to save object ${obj.id}:`, error);
          // Continue with other objects even if one fails
        }
      }

      setSaveStatus('saved');
      
      // Reset to idle after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Failed to save design:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save design');
      setSaveStatus('error');
      
      // Reset error after 5 seconds
      setTimeout(() => {
        setSaveStatus('idle');
        setSaveError(null);
      }, 5000);
    }
  }, [designId, objects, document, tempTitle, projectColorMode, getUserId, router]);

  // Keyboard shortcut: Ctrl+S or Cmd+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

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
            <div className={`status-indicator ${saveStatus === 'saving' ? 'saving' : saveStatus === 'saved' ? 'saved' : saveStatus === 'error' ? 'error' : ''}`}></div>
            <span className="status-text">
              {saveStatus === 'saving' && 'Saving...'}
              {saveStatus === 'saved' && 'Saved'}
              {saveStatus === 'error' && (saveError || 'Error')}
              {saveStatus === 'idle' && 'Saved'}
            </span>
          </div>
        </div>
        
        <div className="topbar-right">
          <div className="topbar-actions">
            <button 
              className="topbar-btn-icon" 
              title={saveStatus === 'saving' ? 'Saving...' : 'Save Design'}
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
            >
              {saveStatus === 'saving' ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : saveStatus === 'saved' ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : saveStatus === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-400" />
              ) : (
              <Save className="w-5 h-5 text-white" />
              )}
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