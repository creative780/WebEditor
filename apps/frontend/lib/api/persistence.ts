/**
 * Persistence Layer - Auto-saves to backend without UI changes
 */

import { designClient } from './designClient';
import { useEditorStore } from '../../state/useEditorStore';
import { TextObj, ImageObj, ShapeObj, PathObj } from '../../state/useEditorStore';
import { DocumentConfig } from '../../state/useEditorStore';

const DEBOUNCE_DELAY = 300;
const AUTO_SAVE_INTERVAL = 5000;

class PersistenceManager {
  private designId: string | null = null;
  private pendingUpdates: Map<string, NodeJS.Timeout> = new Map();
  private autoSaveInterval: NodeJS.Timeout | null = null;
  private lastDocumentSave: Partial<DocumentConfig> | null = null;
  private isInitializing: boolean = false;
  private previousObjects: Map<string, TextObj | ImageObj | ShapeObj | PathObj> = new Map();
  private documentSaveTimeout: NodeJS.Timeout | null = null;
  private idMapping: Map<string, string> = new Map(); // Maps old temp IDs to backend UUIDs during creation

  initialize(designId: string) {
    console.log('[Persistence] Initializing with designId:', designId);
    this.designId = designId;
    this.isInitializing = true;
    this.startAutoSave();
    this.setupStoreSubscriptions();
  }

  markInitializationComplete() {
    const currentObjects = useEditorStore.getState().objects;
    this.previousObjects = new Map(currentObjects.map(obj => [obj.id, obj]));
    this.isInitializing = false;
  }

  cleanup() {
    this.designId = null;
    this.pendingUpdates.forEach(clearTimeout);
    this.pendingUpdates.clear();
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
    if (this.documentSaveTimeout) {
      clearTimeout(this.documentSaveTimeout);
      this.documentSaveTimeout = null;
    }
  }

  async createObject(obj: TextObj | ImageObj | ShapeObj | PathObj): Promise<void> {
    if (!this.designId) {
      console.warn('[Persistence] No designId, cannot create object');
      return;
    }
    console.log('[Persistence] Creating object:', obj.id, obj.type);
    try {
      const backendId = await designClient.createObject(this.designId, obj);
      console.log('[Persistence] Object created with backend ID:', backendId);
      
      // Update the object's ID to match the backend UUID
      // This is critical for reload persistence - backend generates UUID, frontend uses temporary ID
      if (backendId !== obj.id) {
        console.log('[Persistence] Updating object ID from', obj.id, 'to', backendId);
        const store = useEditorStore.getState();
        const updatedObj = { ...obj, id: backendId };
        
        // Map old ID to new ID to prevent subscription from trying to delete the old ID
        this.idMapping.set(obj.id, backendId);
        
        // Update previousObjects map FIRST to prevent subscription from re-creating
        this.previousObjects.delete(obj.id);
        this.previousObjects.set(backendId, updatedObj);
        
        // Remove old object and add with new ID
        store.removeObject(obj.id);
        store.addObject(updatedObj);
        
        // Clean up mapping after a short delay
        setTimeout(() => this.idMapping.delete(obj.id), 1000);
      } else {
        // ID matches, just update previousObjects to mark as tracked
        this.previousObjects.set(obj.id, obj);
      }
    } catch (error) {
      console.error('Failed to create object:', error);
      useEditorStore.getState().removeObject(obj.id);
      throw error;
    }
  }

  updateObject(objectId: string, updates: Partial<TextObj | ImageObj | ShapeObj | PathObj>): void {
    if (!this.designId) return;

    const existingTimeout = this.pendingUpdates.get(objectId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const timeout = setTimeout(async () => {
      try {
        await designClient.updateObject(this.designId!, objectId, updates);
        this.pendingUpdates.delete(objectId);
      } catch (error) {
        console.error(`Failed to update object ${objectId}:`, error);
      }
    }, DEBOUNCE_DELAY);

    this.pendingUpdates.set(objectId, timeout);
  }

  async deleteObject(objectId: string): Promise<void> {
    if (!this.designId) return;

    const obj = useEditorStore.getState().objects.find(o => o.id === objectId);
    
    useEditorStore.getState().removeObject(objectId);

    try {
      await designClient.deleteObject(this.designId, objectId);
    } catch (error) {
      console.error(`Failed to delete object ${objectId}:`, error);
      if (obj) {
        useEditorStore.getState().addObject(obj);
      }
      throw error;
    }
  }

  saveDocument(document: DocumentConfig, colorMode: 'rgb' | 'cmyk' | 'pantone'): void {
    if (!this.designId || this.isInitializing) return;

    const docChanges = {
      width: document.width,
      height: document.height,
      unit: document.unit,
      dpi: document.dpi,
      bleed: document.bleed,
      color_mode: colorMode,
    };

    if (this.lastDocumentSave) {
      const hasChanges = Object.keys(docChanges).some(
        key => (docChanges as any)[key] !== (this.lastDocumentSave as any)[key]
      );
      if (!hasChanges) return;
    }

    if (this.documentSaveTimeout) {
      clearTimeout(this.documentSaveTimeout);
    }

    this.documentSaveTimeout = setTimeout(async () => {
      try {
        await designClient.updateDesign(this.designId!, docChanges);
        this.lastDocumentSave = docChanges;
      } catch (error) {
        console.error('Failed to save document:', error);
      }
    }, DEBOUNCE_DELAY);
  }

  private setupStoreSubscriptions() {
    useEditorStore.subscribe(
      (state) => ({ document: state.document, colorMode: state.projectColorMode }),
      ({ document, colorMode }) => {
        if (!this.isInitializing) {
          this.saveDocument(document, colorMode);
        }
      },
      { equalityFn: (a, b) => 
        a.document.width === b.document.width &&
        a.document.height === b.document.height &&
        a.document.unit === b.document.unit &&
        a.document.dpi === b.document.dpi &&
        a.document.bleed === b.document.bleed &&
        a.colorMode === b.colorMode
      }
    );

    useEditorStore.subscribe(
      (state) => state.objects,
      (objects) => {
        if (!this.designId || this.isInitializing) return;

        const currentObjects = new Map(objects.map(obj => [obj.id, obj]));

        for (const [id, obj] of currentObjects) {
          if (!this.previousObjects.has(id)) {
            console.log('[Persistence] New object detected:', id, obj.type);
            this.createObject(obj).catch(error => {
              console.error('[Persistence] Failed to persist new object:', error);
            });
          }
        }

        for (const [id] of this.previousObjects) {
          if (!currentObjects.has(id)) {
            // Check if this ID was mapped to a new ID (during object creation)
            const mappedId = this.idMapping.get(id);
            if (mappedId && currentObjects.has(mappedId)) {
              // Object ID was updated, skip deletion
              continue;
            }
            
            this.deleteObject(id).catch(error => {
              console.error('Failed to persist object deletion:', error);
            });
          }
        }

        for (const [id, currentObj] of currentObjects) {
          const previousObj = this.previousObjects.get(id);
          if (previousObj) {
            const hasChanges = JSON.stringify(previousObj) !== JSON.stringify(currentObj);
            if (hasChanges) {
              const updates: Partial<TextObj | ImageObj | ShapeObj | PathObj> = {};
              
              if (currentObj.x !== previousObj.x) updates.x = currentObj.x;
              if (currentObj.y !== previousObj.y) updates.y = currentObj.y;
              if (currentObj.width !== previousObj.width) updates.width = currentObj.width;
              if (currentObj.height !== previousObj.height) updates.height = currentObj.height;
              if (currentObj.rotation !== previousObj.rotation) updates.rotation = currentObj.rotation;
              if (currentObj.opacity !== previousObj.opacity) updates.opacity = currentObj.opacity;
              if (currentObj.locked !== previousObj.locked) updates.locked = currentObj.locked;
              if (currentObj.visible !== previousObj.visible) updates.visible = currentObj.visible;
              if (currentObj.name !== previousObj.name) updates.name = currentObj.name;
              if (currentObj.zIndex !== previousObj.zIndex) updates.zIndex = currentObj.zIndex;
              
              Object.keys(currentObj).forEach(key => {
                if (!['id', 'type', 'x', 'y', 'width', 'height', 'rotation', 'opacity', 'locked', 'visible', 'name', 'zIndex'].includes(key)) {
                  if ((currentObj as any)[key] !== (previousObj as any)[key]) {
                    (updates as any)[key] = (currentObj as any)[key];
                  }
                }
              });
              
              if (Object.keys(updates).length > 0) {
                this.updateObject(id, updates);
              }
            }
          }
        }

        this.previousObjects = new Map(objects.map(obj => [obj.id, obj]));
      }
    );
  }

  private startAutoSave() {
    if (this.autoSaveInterval) return;

    this.autoSaveInterval = setInterval(() => {
      const state = useEditorStore.getState();
      if (this.designId && state.document) {
        this.saveDocument(state.document, state.projectColorMode);
      }
    }, AUTO_SAVE_INTERVAL);
  }

  async flushPendingUpdates(): Promise<void> {
    const updatePromises: Promise<void>[] = [];

    this.pendingUpdates.forEach((timeout, objectId) => {
      clearTimeout(timeout);
      const obj = useEditorStore.getState().objects.find(o => o.id === objectId);
      if (obj && this.designId) {
        updatePromises.push(
          designClient.updateObject(this.designId, objectId, obj).catch(error => {
            console.error(`Failed to flush update for ${objectId}:`, error);
          })
        );
      }
    });

    this.pendingUpdates.clear();

    if (this.documentSaveTimeout) {
      clearTimeout(this.documentSaveTimeout);
      this.documentSaveTimeout = null;
    }

    const state = useEditorStore.getState();
    if (this.designId && state.document) {
      updatePromises.push(
        designClient.updateDesign(this.designId, {
          width: state.document.width,
          height: state.document.height,
          unit: state.document.unit,
          dpi: state.document.dpi,
          bleed: state.document.bleed,
          color_mode: state.projectColorMode,
        }).catch(error => {
          console.error('Failed to flush document save:', error);
        })
      );
    }

    await Promise.all(updatePromises);
  }
}

export const persistenceManager = new PersistenceManager();
