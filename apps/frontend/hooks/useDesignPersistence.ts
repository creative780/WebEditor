/**
 * Design persistence hook - stores everything in localStorage
 * Persists shapes and canvas state across page reloads
 */

import { useEffect } from 'react';
import { useEditorStore } from '../state/useEditorStore';

const STORAGE_KEY = 'editor_design_state';
const DESIGN_ID_KEY = 'editor_design_id';

export function useDesignPersistence(designId?: string) {
  const store = useEditorStore();

  // Load saved state from localStorage on mount
  useEffect(() => {
    let mounted = true;

    const loadState = () => {
      try {
        if (typeof window === 'undefined') return;

        // Get saved state from localStorage
        const savedState = localStorage.getItem(STORAGE_KEY);
        const savedDesignId = localStorage.getItem(DESIGN_ID_KEY);

        if (savedState && savedDesignId) {
          console.log('[Persistence] Loading saved state from localStorage');
          const state = JSON.parse(savedState);

          // Restore document settings
          if (state.document) {
            store.setDocumentSize(
              state.document.width || 8.5,
              state.document.height || 11,
              state.document.unit || 'in'
            );
            if (state.document.bleed !== undefined) {
              store.setBleed(state.document.bleed);
            }
            if (state.document.dpi !== undefined) {
              store.setDPI(state.document.dpi);
            }
          }

          // Restore color mode
          if (state.projectColorMode) {
            store.setProjectColorMode(state.projectColorMode);
          }

          // Restore all objects/shapes
          if (state.objects && Array.isArray(state.objects)) {
            console.log('[Persistence] Restoring', state.objects.length, 'objects');
            
            // Clear existing objects first
            const currentObjects = [...store.objects];
            currentObjects.forEach(obj => store.removeObject(obj.id));
            
            // Restore saved objects (if any)
            if (state.objects.length > 0) {
              state.objects.forEach((obj: any) => {
                try {
                  store.addObject(obj);
                } catch (error) {
                  console.error('[Persistence] Failed to restore object:', obj.id, error);
                }
              });
            }
          }
        } else {
          console.log('[Persistence] No saved state found, starting fresh');
        }
      } catch (error) {
        console.error('[Persistence] Failed to load state:', error);
      }
    };

    loadState();

    return () => {
      mounted = false;
    };
  }, []); // Only run once on mount

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saveState = () => {
      try {
        const state = {
          designId: localStorage.getItem(DESIGN_ID_KEY) || designId || 'local-design',
          document: store.document,
          objects: store.objects,
          projectColorMode: store.projectColorMode,
          timestamp: new Date().toISOString(),
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        
        // Also save designId separately for easy access
        if (designId) {
          localStorage.setItem(DESIGN_ID_KEY, designId);
        } else {
          const savedId = localStorage.getItem(DESIGN_ID_KEY);
          if (!savedId) {
            localStorage.setItem(DESIGN_ID_KEY, 'local-design');
          }
        }

        console.log('[Persistence] State saved to localStorage', {
          objectsCount: state.objects.length,
          timestamp: state.timestamp,
        });
      } catch (error) {
        console.error('[Persistence] Failed to save state:', error);
      }
    };

    // Debounce saves to avoid too frequent localStorage writes
    let saveTimeout: NodeJS.Timeout;

    const debouncedSave = () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(saveState, 500); // Save after 500ms of inactivity
    };

    // Subscribe to store changes
    const unsubscribe = useEditorStore.subscribe(
      (state) => ({
        objects: state.objects,
        document: state.document,
        colorMode: state.projectColorMode,
      }),
      () => {
        debouncedSave();
      }
    );

    // Also save on page unload to ensure latest state is saved
    const handleBeforeUnload = () => {
      clearTimeout(saveTimeout);
      saveState();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Initial save
    saveState();

    return () => {
      unsubscribe();
      clearTimeout(saveTimeout);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Final save on cleanup
      saveState();
    };
  }, [designId, store]); // Re-run if designId changes

  // Auto-save periodically (every 5 seconds)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const interval = setInterval(() => {
      try {
        const state = {
          designId: localStorage.getItem(DESIGN_ID_KEY) || designId || 'local-design',
          document: store.document,
          objects: store.objects,
          projectColorMode: store.projectColorMode,
          timestamp: new Date().toISOString(),
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        console.log('[Persistence] Auto-saved state');
      } catch (error) {
        console.error('[Persistence] Auto-save failed:', error);
      }
    }, 5000); // Every 5 seconds

    return () => clearInterval(interval);
  }, [designId]);
}
