/**
 * Keyboard Shortcut Customization System
 * Allows users to customize keyboard shortcuts
 */

export interface KeyboardShortcut {
  id: string;
  name: string;
  description: string;
  category: 'edit' | 'view' | 'object' | 'text' | 'arrange';
  defaultKeys: string[];
  customKeys?: string[];
  action: () => void;
}

export class KeyboardShortcutManager {
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private customShortcuts: Map<string, string[]> = new Map();

  /**
   * Register a shortcut
   */
  register(shortcut: KeyboardShortcut): void {
    this.shortcuts.set(shortcut.id, shortcut);
    
    // Load custom keybinding if exists
    const saved = localStorage.getItem(`shortcut-${shortcut.id}`);
    if (saved) {
      this.customShortcuts.set(shortcut.id, JSON.parse(saved));
    }
  }

  /**
   * Get all shortcuts
   */
  getAll(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values()).map(shortcut => ({
      ...shortcut,
      customKeys: this.customShortcuts.get(shortcut.id) || shortcut.defaultKeys,
    }));
  }

  /**
   * Get shortcuts by category
   */
  getByCategory(category: KeyboardShortcut['category']): KeyboardShortcut[] {
    return this.getAll().filter(s => s.category === category);
  }

  /**
   * Customize shortcut
   */
  customize(id: string, keys: string[]): void {
    this.customShortcuts.set(id, keys);
    localStorage.setItem(`shortcut-${id}`, JSON.stringify(keys));
  }

  /**
   * Reset shortcut to default
   */
  reset(id: string): void {
    this.customShortcuts.delete(id);
    localStorage.removeItem(`shortcut-${id}`);
  }

  /**
   * Reset all shortcuts
   */
  resetAll(): void {
    this.customShortcuts.clear();
    this.shortcuts.forEach((_, id) => {
      localStorage.removeItem(`shortcut-${id}`);
    });
  }

  /**
   * Get active keys for shortcut
   */
  getKeys(id: string): string[] {
    return this.customShortcuts.get(id) || this.shortcuts.get(id)?.defaultKeys || [];
  }

  /**
   * Export shortcuts as JSON
   */
  export(): string {
    const data: Record<string, string[]> = {};
    this.customShortcuts.forEach((keys, id) => {
      data[id] = keys;
    });
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import shortcuts from JSON
   */
  import(json: string): void {
    try {
      const data = JSON.parse(json);
      Object.entries(data).forEach(([id, keys]) => {
        this.customize(id, keys as string[]);
      });
    } catch (error) {
      console.error('Failed to import shortcuts:', error);
    }
  }
}

export const shortcutManager = new KeyboardShortcutManager();

