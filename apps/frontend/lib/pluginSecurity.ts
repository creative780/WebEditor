/**
 * Plugin Security System
 * Code validation, sandboxing, permissions, and audit logging
 * 
 * @version 1.0.0
 */

import { PluginManifest, PluginPermission } from './plugins';

// ============================================================================
// Code Validation
// ============================================================================

/**
 * Dangerous patterns that should be rejected
 */
const DANGEROUS_PATTERNS = [
  // Direct eval usage
  /\beval\s*\(/,
  /\beval\(/,
  // Function constructor
  /\bFunction\s*\(/,
  // Direct DOM manipulation
  /document\.(write|writeln|open|close)/,
  /window\.(location|parent|top|frames)/,
  // localStorage/sessionStorage access (plugins shouldn't have direct access)
  /\blocalStorage\s*[.=]/,
  /\bsessionStorage\s*[.=]/,
  // XSS vectors
  /\binnerHTML\s*=/,
  /\bouterHTML\s*=/,
  /\binsertAdjacentHTML\s*\(/,
  // Network requests (should use API)
  /\bfetch\s*\(/,
  /\bXMLHttpRequest/,
  // File system access
  /\bFileReader/,
  /\bFileWriter/,
  // WebSocket (should use API)
  /\bWebSocket\s*\(/,
];

/**
 * PluginValidator - Code scanning and validation
 */
export class PluginValidator {
  /**
   * Validate plugin code
   */
  validateCode(code: string): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check for dangerous patterns
    for (const pattern of DANGEROUS_PATTERNS) {
      if (pattern.test(code)) {
        issues.push(`Dangerous pattern detected: ${pattern.source}`);
      }
    }

    // Check code length (prevent extremely large plugins)
    if (code.length > 1024 * 1024) { // 1MB limit
      issues.push('Plugin code exceeds maximum size (1MB)');
    }

    // Check for common security issues
    if (this.hasDirectAPIAccess(code)) {
      issues.push('Direct API access detected - use PluginAPI instead');
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Validate plugin manifest
   */
  validateManifest(manifest: Partial<PluginManifest>): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Required fields
    if (!manifest.id) issues.push('Missing required field: id');
    if (!manifest.name) issues.push('Missing required field: name');
    if (!manifest.version) issues.push('Missing required field: version');
    if (!manifest.author) issues.push('Missing required field: author');
    if (!manifest.description) issues.push('Missing required field: description');
    if (!manifest.permissions || !Array.isArray(manifest.permissions)) {
      issues.push('Missing or invalid permissions array');
    }
    if (!manifest.apiVersion) issues.push('Missing required field: apiVersion');

    // Validate permissions
    if (manifest.permissions) {
      const validPermissions: PluginPermission[] = [
        'read', 'write', 'canvas', 'objects', 'export', 'templates', 'files', 'notifications',
      ];
      for (const perm of manifest.permissions) {
        if (!validPermissions.includes(perm as PluginPermission)) {
          issues.push(`Invalid permission: ${perm}`);
        }
      }
    }

    // Validate version format (semantic versioning)
    if (manifest.version && !/^\d+\.\d+\.\d+/.test(manifest.version)) {
      issues.push('Invalid version format (expected semantic versioning)');
    }

    // Validate API version compatibility
    if (manifest.apiVersion && manifest.apiVersion !== '1.0.0') {
      issues.push(`Unsupported API version: ${manifest.apiVersion} (supported: 1.0.0)`);
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Check if code has direct API access patterns
   */
  private hasDirectAPIAccess(code: string): boolean {
    // Check for patterns that suggest direct API calls bypassing PluginAPI
    const directAPIPatterns = [
      /useEditorStore/,
      /zustand/,
      /\.getState\(\)/,
    ];
    
    return directAPIPatterns.some(pattern => pattern.test(code));
  }
}

// ============================================================================
// Permission Manager
// ============================================================================

/**
 * PermissionManager - Scope checking and permission management
 */
export class PermissionManager {
  /**
   * Check if plugin has required permission
   */
  hasPermission(
    pluginPermissions: PluginPermission[],
    required: PluginPermission
  ): boolean {
    return pluginPermissions.includes(required);
  }

  /**
   * Check if plugin has all required permissions
   */
  hasAllPermissions(
    pluginPermissions: PluginPermission[],
    required: PluginPermission[]
  ): boolean {
    return required.every(perm => pluginPermissions.includes(perm));
  }

  /**
   * Check if plugin has any of the required permissions
   */
  hasAnyPermission(
    pluginPermissions: PluginPermission[],
    required: PluginPermission[]
  ): boolean {
    return required.some(perm => pluginPermissions.includes(perm));
  }

  /**
   * Validate permission request
   */
  validatePermissionRequest(
    currentPermissions: PluginPermission[],
    requestedPermissions: PluginPermission[]
  ): { valid: boolean; missing: PluginPermission[] } {
    const missing = requestedPermissions.filter(
      perm => !currentPermissions.includes(perm)
    );

    return {
      valid: missing.length === 0,
      missing,
    };
  }

  /**
   * Get permission description
   */
  getPermissionDescription(permission: PluginPermission): string {
    const descriptions: Record<PluginPermission, string> = {
      read: 'Read canvas state and objects',
      write: 'Modify objects and canvas',
      canvas: 'Access canvas properties (size, zoom, pan)',
      objects: 'Create, update, and delete objects',
      export: 'Export designs to various formats',
      templates: 'Access and apply templates',
      files: 'Read and write files',
      notifications: 'Show notifications to users',
    };

    return descriptions[permission] || 'Unknown permission';
  }
}

// ============================================================================
// Plugin Sandbox
// ============================================================================

/**
 * PluginSandbox - Web Worker isolation for plugin execution
 */
export class PluginSandbox {
  private workers: Map<string, Worker> = new Map();

  /**
   * Create isolated execution environment for plugin
   */
  async createSandbox(pluginId: string): Promise<Worker> {
    // Create Web Worker for sandboxed execution
    const workerCode = `
      // Plugin Sandbox Worker
      let pluginCode = null;
      let pluginAPI = null;

      self.onmessage = function(e) {
        const { type, action, pluginId, code, apiMethods, context } = e.data;

        switch (type) {
          case 'init':
            pluginCode = code;
            pluginAPI = createAPIProxy(apiMethods, pluginId);
            self.postMessage({ success: true, type: 'init' });
            break;

          case 'execute':
            try {
              if (!pluginCode) {
                throw new Error('Plugin not initialized');
              }

              // Execute plugin code in isolated context
              const executePlugin = new Function('api', 'context', pluginCode);
              const result = executePlugin(pluginAPI, context || {});
              
              self.postMessage({ 
                success: true, 
                type: 'execute',
                result 
              });
            } catch (error) {
              self.postMessage({ 
                success: false, 
                type: 'execute',
                error: error.message 
              });
            }
            break;

          case 'terminate':
            self.close();
            break;
        }
      };

      function createAPIProxy(apiMethods, pluginId) {
        // Create proxy that forwards calls to main thread
        const proxy = {};
        
        for (const method of apiMethods) {
          proxy[method] = function(...args) {
            return new Promise((resolve, reject) => {
              const messageId = Math.random().toString(36);
              
              const listener = (e) => {
                if (e.data.type === 'api-response' && e.data.messageId === messageId) {
                  self.removeEventListener('message', listener);
                  if (e.data.success) {
                    resolve(e.data.result);
                  } else {
                    reject(new Error(e.data.error));
                  }
                }
              };
              
              self.addEventListener('message', listener);
              
              self.postMessage({
                type: 'api-call',
                messageId,
                pluginId,
                method,
                args
              });
            });
          };
        }
        
        return proxy;
      }
    `;

    const workerBlob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(workerBlob);
    const worker = new Worker(workerUrl);

    this.workers.set(pluginId, worker);

    // Handle worker messages
    worker.onmessage = (e) => {
      // Messages are handled by the plugin manager
      // This is just for tracking
      console.log(`[Sandbox:${pluginId}]`, e.data);
    };

    worker.onerror = (error) => {
      console.error(`[Sandbox:${pluginId}] Error:`, error);
    };

    return worker;
  }

  /**
   * Execute code in sandbox
   */
  async execute(
    pluginId: string,
    code: string,
    apiMethods: string[],
    context: any
  ): Promise<any> {
    const worker = this.workers.get(pluginId);
    if (!worker) {
      throw new Error(`Sandbox not created for plugin ${pluginId}`);
    }

    return new Promise((resolve, reject) => {
      const messageListener = (e: MessageEvent) => {
        if (e.data.type === 'execute') {
          worker.removeEventListener('message', messageListener);
          if (e.data.success) {
            resolve(e.data.result);
          } else {
            reject(new Error(e.data.error));
          }
        }
      };

      worker.addEventListener('message', messageListener);

      // Initialize first
      worker.postMessage({
        type: 'init',
        pluginId,
        code,
        apiMethods,
      });

      // Execute after a brief delay to ensure init is processed
      setTimeout(() => {
        worker.postMessage({
          type: 'execute',
          pluginId,
          context,
        });
      }, 10);
    });
  }

  /**
   * Terminate sandbox
   */
  terminate(pluginId: string): void {
    const worker = this.workers.get(pluginId);
    if (worker) {
      worker.postMessage({ type: 'terminate' });
      worker.terminate();
      this.workers.delete(pluginId);
    }
  }

  /**
   * Cleanup all workers
   */
  cleanup(): void {
    for (const [pluginId, worker] of this.workers.entries()) {
      worker.terminate();
      this.workers.delete(pluginId);
    }
  }
}

// ============================================================================
// Audit Logging
// ============================================================================

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  id: string;
  timestamp: number;
  pluginId: string;
  action: 'install' | 'uninstall' | 'enable' | 'disable' | 'execute' | 'error' | 'permission_denied';
  details?: any;
  userId?: string;
}

/**
 * AuditLogger - Track all plugin actions for security review
 */
export class AuditLogger {
  private logs: AuditLogEntry[] = [];
  private maxLogSize = 1000; // Keep last 1000 entries
  private localStorageKey = 'printstudio_plugin_audit_logs';

  constructor() {
    this.loadLogs();
  }

  /**
   * Log an action
   */
  log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
    const logEntry: AuditLogEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    this.logs.push(logEntry);

    // Trim logs if too large
    if (this.logs.length > this.maxLogSize) {
      this.logs = this.logs.slice(-this.maxLogSize);
    }

    this.saveLogs();
  }

  /**
   * Get logs for a plugin
   */
  getPluginLogs(pluginId: string): AuditLogEntry[] {
    return this.logs.filter(entry => entry.pluginId === pluginId);
  }

  /**
   * Get recent logs
   */
  getRecentLogs(limit: number = 50): AuditLogEntry[] {
    return this.logs.slice(-limit);
  }

  /**
   * Get logs by action type
   */
  getLogsByAction(action: AuditLogEntry['action']): AuditLogEntry[] {
    return this.logs.filter(entry => entry.action === action);
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    this.logs = [];
    this.saveLogs();
  }

  /**
   * Export logs
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Load logs from localStorage
   */
  private loadLogs(): void {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(this.localStorageKey);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    }
  }

  /**
   * Save logs to localStorage
   */
  private saveLogs(): void {
    if (typeof window === 'undefined') return;
    try {
      // Only keep recent logs in localStorage (last 100 entries)
      const recentLogs = this.logs.slice(-100);
      localStorage.setItem(this.localStorageKey, JSON.stringify(recentLogs));
    } catch (error) {
      console.error('Failed to save audit logs:', error);
    }
  }
}

// ============================================================================
// Rate Limiting
// ============================================================================

/**
 * RateLimiter - Throttle plugin API calls
 */
export class RateLimiter {
  private requestCounts: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Check if request is allowed
   */
  isAllowed(pluginId: string): boolean {
    const now = Date.now();
    const requests = this.requestCounts.get(pluginId) || [];

    // Remove requests outside the time window
    const recentRequests = requests.filter(timestamp => now - timestamp < this.windowMs);
    this.requestCounts.set(pluginId, recentRequests);

    // Check if limit exceeded
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    // Record this request
    recentRequests.push(now);
    this.requestCounts.set(pluginId, recentRequests);

    return true;
  }

  /**
   * Reset rate limit for plugin
   */
  reset(pluginId: string): void {
    this.requestCounts.delete(pluginId);
  }

  /**
   * Get remaining requests for plugin
   */
  getRemaining(pluginId: string): number {
    const now = Date.now();
    const requests = this.requestCounts.get(pluginId) || [];
    const recentRequests = requests.filter(timestamp => now - timestamp < this.windowMs);
    
    return Math.max(0, this.maxRequests - recentRequests.length);
  }
}

// ============================================================================
// Singleton Instances
// ============================================================================

export const pluginValidator = new PluginValidator();
export const permissionManager = new PermissionManager();
export const pluginSandbox = new PluginSandbox();
export const auditLogger = new AuditLogger();
export const rateLimiter = new RateLimiter(100, 60000); // 100 requests per minute

