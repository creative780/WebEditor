/**
 * Plugin System Tests
 * Unit tests for plugin architecture, security, and execution
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { pluginManager, PluginManifest } from '../lib/plugins';
import { pluginValidator, permissionManager, rateLimiter } from '../lib/pluginSecurity';

describe('Plugin System', () => {
  beforeEach(() => {
    // Reset plugin manager state
    const plugins = pluginManager.getPlugins();
    plugins.forEach(plugin => {
      pluginManager.uninstall(plugin.id);
    });
  });

  describe('Plugin Validator', () => {
    it('should validate plugin manifest', () => {
      const manifest: Partial<PluginManifest> = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        author: 'Test Author',
        description: 'A test plugin',
        permissions: ['read', 'write'],
        apiVersion: '1.0.0',
      };

      const result = pluginValidator.validateManifest(manifest);
      expect(result.valid).toBe(true);
      expect(result.issues.length).toBe(0);
    });

    it('should reject manifest with missing fields', () => {
      const manifest: Partial<PluginManifest> = {
        id: 'test-plugin',
        // Missing required fields
      };

      const result = pluginValidator.validateManifest(manifest);
      expect(result.valid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('should reject dangerous code patterns', () => {
      const dangerousCode = 'eval("console.log(\'hack\')");';
      const result = pluginValidator.validateCode(dangerousCode);
      expect(result.valid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('should accept safe code', () => {
      const safeCode = 'const x = 1 + 2; console.log(x);';
      const result = pluginValidator.validateCode(safeCode);
      expect(result.valid).toBe(true);
    });
  });

  describe('Permission Manager', () => {
    it('should check permissions correctly', () => {
      const permissions = ['read', 'write', 'objects'];
      
      expect(permissionManager.hasPermission(permissions, 'read')).toBe(true);
      expect(permissionManager.hasPermission(permissions, 'export')).toBe(false);
    });

    it('should validate permission requests', () => {
      const current = ['read', 'write'];
      const requested = ['read', 'write', 'export'];
      
      const result = permissionManager.validatePermissionRequest(current, requested);
      expect(result.valid).toBe(false);
      expect(result.missing).toContain('export');
    });
  });

  describe('Rate Limiter', () => {
    it('should allow requests within limit', () => {
      const pluginId = 'test-plugin';
      rateLimiter.reset(pluginId);
      
      for (let i = 0; i < 50; i++) {
        expect(rateLimiter.isAllowed(pluginId)).toBe(true);
      }
    });

    it('should block requests exceeding limit', () => {
      const pluginId = 'test-plugin';
      rateLimiter.reset(pluginId);
      
      // Exceed limit
      for (let i = 0; i < 110; i++) {
        rateLimiter.isAllowed(pluginId);
      }
      
      expect(rateLimiter.isAllowed(pluginId)).toBe(false);
    });
  });

  describe('Plugin Manager', () => {
    it('should install plugin', async () => {
      const manifest: PluginManifest = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        author: 'Test Author',
        description: 'A test plugin',
        permissions: ['read'],
        apiVersion: '1.0.0',
        entry: 'test.js',
      };

      const plugin = await pluginManager.install(manifest);
      expect(plugin).toBeDefined();
      expect(plugin.id).toBe('test-plugin');
      expect(plugin.installed).toBe(true);
      expect(plugin.enabled).toBe(true);
    });

    it('should uninstall plugin', async () => {
      const manifest: PluginManifest = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        author: 'Test Author',
        description: 'A test plugin',
        permissions: ['read'],
        apiVersion: '1.0.0',
        entry: 'test.js',
      };

      await pluginManager.install(manifest);
      await pluginManager.uninstall('test-plugin');
      
      const plugin = pluginManager.getPlugin('test-plugin');
      expect(plugin).toBeUndefined();
    });

    it('should enable/disable plugin', async () => {
      const manifest: PluginManifest = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        author: 'Test Author',
        description: 'A test plugin',
        permissions: ['read'],
        apiVersion: '1.0.0',
        entry: 'test.js',
      };

      await pluginManager.install(manifest);
      
      pluginManager.disable('test-plugin');
      let plugin = pluginManager.getPlugin('test-plugin');
      expect(plugin?.enabled).toBe(false);
      
      pluginManager.enable('test-plugin');
      plugin = pluginManager.getPlugin('test-plugin');
      expect(plugin?.enabled).toBe(true);
    });
  });
});

