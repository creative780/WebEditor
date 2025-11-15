/**
 * Accessibility Features
 * High contrast mode, screen reader support, and focus management
 */

export type ColorTheme = 'light' | 'dark' | 'high-contrast';

export class AccessibilityManager {
  private currentTheme: ColorTheme = 'light';
  private focusTrapStack: HTMLElement[] = [];
  private announcer: HTMLElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeAnnouncer();
      this.loadTheme();
    }
  }

  /**
   * Initialize screen reader announcer
   */
  private initializeAnnouncer(): void {
    this.announcer = document.createElement('div');
    this.announcer.setAttribute('role', 'status');
    this.announcer.setAttribute('aria-live', 'polite');
    this.announcer.setAttribute('aria-atomic', 'true');
    this.announcer.className = 'sr-only'; // Screen reader only
    this.announcer.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    document.body.appendChild(this.announcer);
  }

  /**
   * Announce message to screen readers
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.announcer) return;

    this.announcer.setAttribute('aria-live', priority);
    this.announcer.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      if (this.announcer) {
        this.announcer.textContent = '';
      }
    }, 1000);
  }

  /**
   * Set color theme
   */
  setTheme(theme: ColorTheme): void {
    this.currentTheme = theme;
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    
    // Save preference
    localStorage.setItem('theme', theme);

    // Announce change
    this.announce(`Theme changed to ${theme}`);
  }

  /**
   * Get current theme
   */
  getTheme(): ColorTheme {
    return this.currentTheme;
  }

  /**
   * Toggle high contrast mode
   */
  toggleHighContrast(): void {
    const newTheme = this.currentTheme === 'high-contrast' ? 'light' : 'high-contrast';
    this.setTheme(newTheme);
  }

  /**
   * Load saved theme
   */
  private loadTheme(): void {
    const saved = localStorage.getItem('theme') as ColorTheme;
    if (saved) {
      this.setTheme(saved);
    }
  }

  /**
   * Trap focus within element
   */
  trapFocus(element: HTMLElement): void {
    this.focusTrapStack.push(element);
    
    const focusableElements = element.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    element.addEventListener('keydown', handleTab);
    firstElement.focus();
  }

  /**
   * Release focus trap
   */
  releaseFocusTrap(): void {
    this.focusTrapStack.pop();
  }

  /**
   * Check if screen reader is active
   */
  isScreenReaderActive(): boolean {
    // Heuristic: Check if certain accessibility APIs are in use
    return typeof window !== 'undefined' && (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.hasAttribute('data-screen-reader')
    );
  }

  /**
   * Add skip navigation link
   */
  addSkipLink(targetId: string, label: string = 'Skip to main content'): void {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.textContent = label;
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
      position: absolute;
      left: -10000px;
      top: auto;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;

    skipLink.addEventListener('focus', () => {
      skipLink.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        z-index: 10000;
        padding: 10px 20px;
        background: #000;
        color: #fff;
        text-decoration: none;
        border-radius: 4px;
      `;
    });

    skipLink.addEventListener('blur', () => {
      skipLink.style.cssText = `
        position: absolute;
        left: -10000px;
        top: auto;
        width: 1px;
        height: 1px;
        overflow: hidden;
      `;
    });

    document.body.insertBefore(skipLink, document.body.firstChild);
  }
}

export const accessibilityManager = new AccessibilityManager();

