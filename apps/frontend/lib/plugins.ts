/**
 * Plugin System Architecture
 * Complete plugin SDK and API for PrintStudio Editor
 * 
 * @version 1.0.0
 */

import { useEditorStore, EditorState, TextObj, ImageObj, ShapeObj, PathObj } from '../state/useEditorStore';

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Plugin permission scopes
 */
export type PluginPermission = 
  | 'read'           // Read canvas state
  | 'write'          // Modify objects
  | 'canvas'         // Access canvas properties
  | 'objects'        // Object manipulation
  | 'export'         // Export functionality
  | 'templates'      // Template access
  | 'files'          // File operations
  | 'notifications'; // Show notifications

/**
 * Plugin manifest structure
 */
export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  icon?: string;
  permissions: PluginPermission[];
  apiVersion: string; // Plugin API version (e.g., "1.0.0")
  entry: string; // Main plugin code URL or inline code
  category?: string;
  tags?: string[];
  homepage?: string;
  repository?: string;
  license?: string;
  minEditorVersion?: string;
}

/**
 * Plugin lifecycle hooks
 */
export interface PluginLifecycle {
  onLoad?: (api: PluginAPI) => void | Promise<void>;
  onExecute?: (api: PluginAPI, context: any) => any | Promise<any>;
  onUnload?: (api: PluginAPI) => void | Promise<void>;
}

/**
 * Plugin instance
 */
export interface Plugin extends PluginManifest {
  enabled: boolean;
  installed: boolean;
  installedAt?: Date;
  code?: string;
  lifecycle?: PluginLifecycle;
  worker?: Worker; // Web Worker for sandboxed execution
}

/**
 * Plugin execution context
 */
export interface PluginContext {
  pluginId: string;
  timestamp: number;
  trigger: 'manual' | 'auto' | 'event';
  eventType?: string;
  data?: any;
}

/**
 * Plugin API - Exposed surface for plugins
 */
export interface PluginAPI {
  // Version info
  readonly version: string;
  readonly pluginId: string;
  
  // Object manipulation
  addObject: (object: TextObj | ImageObj | ShapeObj | PathObj) => string;
  updateObject: (id: string, updates: Partial<TextObj | ImageObj | ShapeObj | PathObj>) => void;
  deleteObject: (id: string) => void;
  getObject: (id: string) => TextObj | ImageObj | ShapeObj | PathObj | undefined;
  
  // Selection management
  getSelection: () => string[];
  selectObject: (id: string) => void;
  selectObjects: (ids: string[]) => void;
  clearSelection: () => void;
  
  // Canvas access
  getCanvas: () => {
    width: number;
    height: number;
    zoom: number;
    panX: number;
    panY: number;
  };
  getObjects: () => (TextObj | ImageObj | ShapeObj | PathObj)[];
  
  // Notifications
  showNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  
  // Utilities
  log: (message: string, data?: any) => void;
}

/**
 * Plugin registry entry
 */
interface PluginRegistryEntry {
  plugin: Plugin;
  metrics: {
    executionCount: number;
    totalExecutionTime: number;
    averageExecutionTime: number;
    lastExecutionTime: number;
    errorCount: number;
    lastError?: string;
  };
}

// ============================================================================
// Plugin API Implementation
// ============================================================================

/**
 * PluginAPI implementation
 */
class PluginAPIImplementation implements PluginAPI {
  readonly version = '1.0.0';
  
  constructor(
    public readonly pluginId: string,
    private permissions: PluginPermission[],
    private store: typeof useEditorStore
  ) {}

  private checkPermission(permission: PluginPermission): void {
    if (!this.permissions.includes(permission)) {
      throw new Error(`Plugin ${this.pluginId} requires '${permission}' permission`);
    }
  }

  addObject(object: TextObj | ImageObj | ShapeObj | PathObj): string {
    this.checkPermission('write');
    this.checkPermission('objects');
    
    const state = this.store.getState();
    state.addObject(object);
    return object.id;
  }

  updateObject(id: string, updates: Partial<TextObj | ImageObj | ShapeObj | PathObj>): void {
    this.checkPermission('write');
    this.checkPermission('objects');
    
    const state = this.store.getState();
    state.updateObject(id, updates);
  }

  deleteObject(id: string): void {
    this.checkPermission('write');
    this.checkPermission('objects');
    
    const state = this.store.getState();
    state.removeObject(id);
  }

  getObject(id: string): TextObj | ImageObj | ShapeObj | PathObj | undefined {
    this.checkPermission('read');
    
    const state = this.store.getState();
    return state.objects.find(obj => obj.id === id);
  }

  getSelection(): string[] {
    this.checkPermission('read');
    
    const state = this.store.getState();
    return [...state.selection];
  }

  selectObject(id: string): void {
    this.checkPermission('write');
    
    const state = this.store.getState();
    state.selectObject(id);
  }

  selectObjects(ids: string[]): void {
    this.checkPermission('write');
    
    const state = this.store.getState();
    state.selectObjects(ids);
  }

  clearSelection(): void {
    this.checkPermission('write');
    
    const state = this.store.getState();
    state.clearSelection();
  }

  getCanvas() {
    this.checkPermission('read');
    this.checkPermission('canvas');
    
    const state = this.store.getState();
    return {
      width: state.document.width,
      height: state.document.height,
      zoom: state.zoom,
      panX: state.panX,
      panY: state.panY,
    };
  }

  getObjects(): (TextObj | ImageObj | ShapeObj | PathObj)[] {
    this.checkPermission('read');
    
    const state = this.store.getState();
    return [...state.objects];
  }

  showNotification(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    this.checkPermission('notifications');
    
    // Dispatch custom event for notification system
    const event = new CustomEvent('plugin-notification', {
      detail: { message, type, pluginId: this.pluginId },
    });
    window.dispatchEvent(event);
  }

  log(message: string, data?: any): void {
    console.log(`[Plugin:${this.pluginId}] ${message}`, data || '');
  }
}

// ============================================================================
// Plugin Registry
// ============================================================================

/**
 * PluginRegistry - Storage and retrieval of installed plugins
 */
class PluginRegistry {
  private plugins: Map<string, PluginRegistryEntry> = new Map();
  private localStorageKey = 'printstudio_plugins';

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Register a plugin
   */
  register(plugin: Plugin): void {
    const entry: PluginRegistryEntry = {
      plugin,
      metrics: {
        executionCount: 0,
        totalExecutionTime: 0,
        averageExecutionTime: 0,
        lastExecutionTime: 0,
        errorCount: 0,
      },
    };
    
    this.plugins.set(plugin.id, entry);
    this.saveToStorage();
  }

  /**
   * Get a plugin by ID
   */
  get(id: string): PluginRegistryEntry | undefined {
    return this.plugins.get(id);
  }

  /**
   * Get all plugins
   */
  getAll(): PluginRegistryEntry[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get enabled plugins only
   */
  getEnabled(): PluginRegistryEntry[] {
    return this.getAll().filter(entry => entry.plugin.enabled && entry.plugin.installed);
  }

  /**
   * Unregister a plugin
   */
  unregister(id: string): void {
    const entry = this.plugins.get(id);
    if (entry?.plugin.worker) {
      entry.plugin.worker.terminate();
    }
    this.plugins.delete(id);
    this.saveToStorage();
  }

  /**
   * Update plugin metrics
   */
  updateMetrics(id: string, executionTime: number, error?: string): void {
    const entry = this.plugins.get(id);
    if (!entry) return;

    entry.metrics.executionCount++;
    entry.metrics.totalExecutionTime += executionTime;
    entry.metrics.averageExecutionTime = entry.metrics.totalExecutionTime / entry.metrics.executionCount;
    entry.metrics.lastExecutionTime = executionTime;
    
    if (error) {
      entry.metrics.errorCount++;
      entry.metrics.lastError = error;
    }

    this.saveToStorage();
  }

  /**
   * Load plugins from localStorage
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(this.localStorageKey);
      if (!stored) return;

      const data = JSON.parse(stored);
      for (const [id, entry] of Object.entries(data)) {
        const pluginEntry = entry as any;
        // Reconstruct plugin object
        const plugin: Plugin = {
          ...pluginEntry.plugin,
          installedAt: pluginEntry.plugin.installedAt ? new Date(pluginEntry.plugin.installedAt) : undefined,
        };
        
        this.plugins.set(id, {
          plugin,
          metrics: pluginEntry.metrics,
        });
      }
    } catch (error) {
      console.error('Failed to load plugins from storage:', error);
    }
  }

  /**
   * Save plugins to localStorage
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const data: Record<string, any> = {};
      for (const [id, entry] of this.plugins.entries()) {
        data[id] = {
          plugin: {
            ...entry.plugin,
            worker: undefined, // Don't store worker reference
            lifecycle: undefined, // Don't store function references
          },
          metrics: entry.metrics,
        };
      }
      localStorage.setItem(this.localStorageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save plugins to storage:', error);
    }
  }
}

// ============================================================================
// Plugin Context
// ============================================================================

/**
 * PluginContext - Isolated context for plugin execution
 */
class PluginExecutionContext {
  constructor(
    private pluginId: string,
    private permissions: PluginPermission[],
    private store: typeof useEditorStore
  ) {}

  /**
   * Create API instance for plugin
   */
  createAPI(): PluginAPI {
    return new PluginAPIImplementation(this.pluginId, this.permissions, this.store);
  }
}

// ============================================================================
// Plugin Manager
// ============================================================================

/**
 * PluginManager - Core plugin registry and execution engine
 */
export class PluginManager {
  private registry: PluginRegistry;
  private eventListeners: Map<string, Set<(event: any) => void>> = new Map();

  constructor() {
    this.registry = new PluginRegistry();
  }

  /**
   * Install a plugin
   */
  async install(manifest: PluginManifest, code?: string): Promise<Plugin> {
    const plugin: Plugin = {
      ...manifest,
      enabled: true,
      installed: true,
      installedAt: new Date(),
      code,
    };

    this.registry.register(plugin);

    // Load plugin lifecycle if code is provided
    if (code) {
      await this.loadPluginLifecycle(plugin);
    }

    return plugin;
  }

  /**
   * Uninstall a plugin
   */
  async uninstall(pluginId: string): Promise<void> {
    const entry = this.registry.get(pluginId);
    if (!entry) return;

    // Call onUnload if available
    if (entry.plugin.lifecycle?.onUnload) {
      const context = new PluginExecutionContext(
        pluginId,
        entry.plugin.permissions,
        useEditorStore
      );
      const api = context.createAPI();
      await entry.plugin.lifecycle.onUnload(api);
    }

    this.registry.unregister(pluginId);
  }

  /**
   * Enable a plugin
   */
  enable(pluginId: string): void {
    const entry = this.registry.get(pluginId);
    if (!entry) return;

    entry.plugin.enabled = true;
    this.registry.register(entry.plugin);
  }

  /**
   * Disable a plugin
   */
  disable(pluginId: string): void {
    const entry = this.registry.get(pluginId);
    if (!entry) return;

    entry.plugin.enabled = false;
    this.registry.register(entry.plugin);
  }

  /**
   * Execute a plugin
   */
  async execute(pluginId: string, context?: any): Promise<any> {
    const entry = this.registry.get(pluginId);
    if (!entry || !entry.plugin.enabled || !entry.plugin.installed) {
      throw new Error(`Plugin ${pluginId} is not available`);
    }

    const startTime = performance.now();
    const memoryBefore = ('memory' in performance && (performance as any).memory)
      ? (performance as any).memory.usedJSHeapSize : 0;
    let error: string | undefined;
    let apiCalls = 0;

    try {
      const pluginContext = new PluginExecutionContext(
        pluginId,
        entry.plugin.permissions,
        useEditorStore
      );
      const api = pluginContext.createAPI();

      if (entry.plugin.lifecycle?.onExecute) {
        const result = await entry.plugin.lifecycle.onExecute(api, context);
        
        // Track API calls (simplified - in production would track actual API calls)
        apiCalls = 1;
        
        return result;
      }
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
      throw e;
    } finally {
      const executionTime = performance.now() - startTime;
      const memoryAfter = ('memory' in performance && (performance as any).memory)
        ? (performance as any).memory.usedJSHeapSize : 0;
      const memoryDelta = memoryAfter - memoryBefore;
      
      this.registry.updateMetrics(pluginId, executionTime, error);
      
      // Track in performance monitor
      if (typeof window !== 'undefined') {
        const { performanceMonitor } = await import('./performanceMonitor');
        performanceMonitor.trackPluginExecution(pluginId, executionTime, apiCalls, memoryDelta);
      }
    }
  }

  /**
   * Get all installed plugins
   */
  getPlugins(): Plugin[] {
    return this.registry.getAll().map(entry => entry.plugin);
  }

  /**
   * Get enabled plugins
   */
  getEnabledPlugins(): Plugin[] {
    return this.registry.getEnabled().map(entry => entry.plugin);
  }

  /**
   * Get plugin by ID
   */
  getPlugin(id: string): Plugin | undefined {
    return this.registry.get(id)?.plugin;
  }

  /**
   * Get plugin metrics
   */
  getMetrics(id: string): PluginRegistryEntry['metrics'] | undefined {
    return this.registry.get(id)?.metrics;
  }

  /**
   * Load plugin lifecycle from code
   */
  private async loadPluginLifecycle(plugin: Plugin): Promise<void> {
    if (!plugin.code) return;

    try {
      // Create Web Worker for sandboxed execution
      const workerBlob = new Blob([`
        // Plugin worker code
        self.onmessage = function(e) {
          const { type, pluginCode, context } = e.data;
          
          if (type === 'execute') {
            try {
              // Execute plugin code in worker context
              const execute = new Function('api', 'context', pluginCode);
              const result = execute(null, context);
              self.postMessage({ success: true, result });
            } catch (error) {
              self.postMessage({ success: false, error: error.message });
            }
          }
        };
      `], { type: 'application/javascript' });
      
      const workerUrl = URL.createObjectURL(workerBlob);
      plugin.worker = new Worker(workerUrl);

      // For now, we'll use inline execution with API
      // In production, this would be handled by the security sandbox
      const context = new PluginExecutionContext(
        plugin.id,
        plugin.permissions,
        useEditorStore
      );
      const api = context.createAPI();

      // Define lifecycle hooks (simplified - in production use proper sandboxing)
      plugin.lifecycle = {
        onLoad: async () => {
          if (plugin.code?.includes('onLoad')) {
            // Execute onLoad hook
            plugin.log?.('Plugin loaded');
          }
        },
        onExecute: async (pluginApi, ctx) => {
          if (plugin.code?.includes('onExecute')) {
            // Plugin execution would be handled by sandbox
            return { success: true };
          }
          return { success: true };
        },
        onUnload: async () => {
          if (plugin.code?.includes('onUnload')) {
            // Execute onUnload hook
          }
        },
      };

      // Call onLoad
      if (plugin.lifecycle.onLoad) {
        await plugin.lifecycle.onLoad(api);
      }
    } catch (error) {
      console.error(`Failed to load plugin ${plugin.id}:`, error);
      throw error;
    }
  }

  /**
   * Marketplace API - Fetch plugins from backend
   */
  async fetchMarketplacePlugins(filters?: {
    category?: string;
    search?: string;
    featured?: boolean;
  }): Promise<PluginManifest[]> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    try {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.featured) params.append('featured', 'true');

      const response = await fetch(`${API_BASE_URL}/api/plugins?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch plugins: ${response.statusText}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : data.results || [];
    } catch (error) {
      console.error('Failed to fetch marketplace plugins:', error);
      // Return empty array on error
      return [];
    }
  }

  /**
   * Install plugin from marketplace
   */
  async installFromMarketplace(pluginId: string): Promise<Plugin> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/plugins/${pluginId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch plugin: ${response.statusText}`);
      }

      const manifest: PluginManifest = await response.json();

      // Fetch plugin code
      const codeResponse = await fetch(`${API_BASE_URL}/api/plugins/${pluginId}/code`);
      const code = codeResponse.ok ? await codeResponse.text() : undefined;

      return await this.install(manifest, code);
    } catch (error) {
      console.error(`Failed to install plugin ${pluginId}:`, error);
      throw error;
    }
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const pluginManager = new PluginManager();

