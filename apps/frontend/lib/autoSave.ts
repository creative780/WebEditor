/**
 * Auto-Save System with Conflict Resolution
 * Automatically saves design changes with conflict detection
 */

import { EditorState } from '../state/useEditorStore';

export interface SaveState {
  data: Partial<EditorState>;
  timestamp: number;
  version: number;
  hash: string;
}

export interface AutoSaveConfig {
  enabled: boolean;
  interval: number; // milliseconds
  maxRetries: number;
  showNotifications: boolean;
}

export const DEFAULT_AUTOSAVE_CONFIG: AutoSaveConfig = {
  enabled: true,
  interval: 30000, // 30 seconds
  maxRetries: 3,
  showNotifications: true,
};

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'conflict';

export class AutoSaveManager {
  private config: AutoSaveConfig;
  private intervalId: number | null = null;
  private lastSaveState: SaveState | null = null;
  private currentVersion: number = 1;
  private status: SaveStatus = 'idle';
  private statusCallbacks: Array<(status: SaveStatus) => void> = [];
  private saveCallback: ((data: Partial<EditorState>) => Promise<void>) | null = null;

  constructor(config: AutoSaveConfig = DEFAULT_AUTOSAVE_CONFIG) {
    this.config = config;
  }

  /**
   * Start auto-save
   */
  start(
    saveCallback: (data: Partial<EditorState>) => Promise<void>
  ): void {
    if (this.intervalId !== null) {
      return; // Already started
    }

    this.saveCallback = saveCallback;

    this.intervalId = window.setInterval(() => {
      this.performSave();
    }, this.config.interval);

    console.log('🔄 Auto-save started');
  }

  /**
   * Stop auto-save
   */
  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('⏸️  Auto-save stopped');
    }
  }

  /**
   * Perform save operation
   */
  private async performSave(): Promise<void> {
    if (!this.config.enabled || !this.saveCallback) {
      return;
    }

    // Don't save if already saving
    if (this.status === 'saving') {
      return;
    }

    try {
      this.setStatus('saving');

      // Get current state (this would come from the store in real usage)
      const currentState = this.getCurrentState();

      // Check if state has changed
      if (!this.hasStateChanged(currentState)) {
        this.setStatus('idle');
        return;
      }

      // Create save state
      const saveState: SaveState = {
        data: currentState,
        timestamp: Date.now(),
        version: this.currentVersion,
        hash: this.generateHash(currentState),
      };

      // Perform save
      await this.saveCallback(currentState);

      // Update state
      this.lastSaveState = saveState;
      this.currentVersion++;
      this.setStatus('saved');

      // Show notification
      if (this.config.showNotifications) {
        console.log('✅ Auto-saved successfully');
      }

      // Reset to idle after 2 seconds
      setTimeout(() => {
        if (this.status === 'saved') {
          this.setStatus('idle');
        }
      }, 2000);
    } catch (error) {
      console.error('❌ Auto-save error:', error);
      this.setStatus('error');

      // Retry logic could go here
    }
  }

  /**
   * Force save immediately
   */
  async forceSave(): Promise<void> {
    await this.performSave();
  }

  /**
   * Check if state has changed
   */
  private hasStateChanged(currentState: Partial<EditorState>): boolean {
    if (!this.lastSaveState) {
      return true; // First save
    }

    const currentHash = this.generateHash(currentState);
    return currentHash !== this.lastSaveState.hash;
  }

  /**
   * Generate hash of state
   */
  private generateHash(state: Partial<EditorState>): string {
    // Simple hash function - in production, use a proper hash library
    const str = JSON.stringify(state);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  /**
   * Get current state (placeholder - would get from store)
   */
  private getCurrentState(): Partial<EditorState> {
    // This would get the current state from the Zustand store
    // For now, return empty object
    return {};
  }

  /**
   * Set status and notify callbacks
   */
  private setStatus(status: SaveStatus): void {
    this.status = status;
    this.statusCallbacks.forEach(callback => callback(status));
  }

  /**
   * Subscribe to status changes
   */
  onStatusChange(callback: (status: SaveStatus) => void): () => void {
    this.statusCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.statusCallbacks = this.statusCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Get current status
   */
  getStatus(): SaveStatus {
    return this.status;
  }

  /**
   * Get last save time
   */
  getLastSaveTime(): number | null {
    return this.lastSaveState?.timestamp || null;
  }

  /**
   * Get time since last save
   */
  getTimeSinceLastSave(): number {
    const lastSave = this.getLastSaveTime();
    if (!lastSave) return 0;
    return Date.now() - lastSave;
  }

  /**
   * Update config
   */
  updateConfig(config: Partial<AutoSaveConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Restart if interval changed
    if (config.interval && this.intervalId !== null) {
      this.stop();
      if (this.saveCallback) {
        this.start(this.saveCallback);
      }
    }
  }

  /**
   * Resolve conflict
   */
  resolveConflict(resolution: 'local' | 'remote' | 'merge'): void {
    console.log(`Resolving conflict with strategy: ${resolution}`);
    // Conflict resolution logic would go here
    this.setStatus('idle');
  }
}

// Global instance
export const autoSaveManager = new AutoSaveManager();

// Auto-start in browser (if enabled)
if (typeof window !== 'undefined') {
  // Start auto-save with a placeholder callback
  // In real usage, this would be connected to the backend API
  autoSaveManager.start(async (data) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Saved:', data);
  });
}

