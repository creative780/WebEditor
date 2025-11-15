/**
 * Plugin Service - Plugin Management
 * CRUD operations for plugins
 */

export interface Plugin {
  id: string;
  name: string;
  version: string;
  author: string;
  manifest: any;
  approved: boolean;
}

export class PluginService {
  private plugins: Map<string, Plugin> = new Map();

  async createPlugin(data: Omit<Plugin, 'id'>): Promise<Plugin> {
    const id = `plugin_${Date.now()}`;
    const plugin = { ...data, id };
    this.plugins.set(id, plugin);
    return plugin;
  }

  async getPlugin(id: string): Promise<Plugin | null> {
    return this.plugins.get(id) || null;
  }

  async listPlugins(): Promise<Plugin[]> {
    return Array.from(this.plugins.values());
  }

  async updatePlugin(id: string, updates: Partial<Plugin>): Promise<Plugin> {
    const plugin = this.plugins.get(id);
    if (!plugin) throw new Error('Plugin not found');
    const updated = { ...plugin, ...updates };
    this.plugins.set(id, updated);
    return updated;
  }

  async deletePlugin(id: string): Promise<void> {
    this.plugins.delete(id);
  }
}

export const pluginService = new PluginService();

