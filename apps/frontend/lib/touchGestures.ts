/**
 * Touch Gesture Handler
 * Handles touch gestures for tablets and mobile devices
 */

export interface TouchGestureConfig {
  enablePinchZoom: boolean;
  enablePan: boolean;
  enableTap: boolean;
  enableDoubleTap: boolean;
  enableLongPress: boolean;
  longPressDuration: number;
}

export const DEFAULT_TOUCH_CONFIG: TouchGestureConfig = {
  enablePinchZoom: true,
  enablePan: true,
  enableTap: true,
  enableDoubleTap: true,
  enableLongPress: true,
  longPressDuration: 500, // ms
};

export class TouchGestureHandler {
  private config: TouchGestureConfig;
  private element: HTMLElement | null = null;
  private lastTouchDistance: number = 0;
  private lastTouchTime: number = 0;
  private longPressTimer: number | null = null;
  private startX: number = 0;
  private startY: number = 0;
  
  // Callbacks
  private onPinchZoom: ((scale: number) => void) | null = null;
  private onPan: ((deltaX: number, deltaY: number) => void) | null = null;
  private onTap: ((x: number, y: number) => void) | null = null;
  private onDoubleTap: ((x: number, y: number) => void) | null = null;
  private onLongPress: ((x: number, y: number) => void) | null = null;

  constructor(config: TouchGestureConfig = DEFAULT_TOUCH_CONFIG) {
    this.config = config;
  }

  /**
   * Attach to element
   */
  attach(element: HTMLElement): void {
    this.element = element;
    
    element.addEventListener('touchstart', this.handleTouchStart);
    element.addEventListener('touchmove', this.handleTouchMove);
    element.addEventListener('touchend', this.handleTouchEnd);
  }

  /**
   * Detach from element
   */
  detach(): void {
    if (!this.element) return;

    this.element.removeEventListener('touchstart', this.handleTouchStart);
    this.element.removeEventListener('touchmove', this.handleTouchMove);
    this.element.removeEventListener('touchend', this.handleTouchEnd);
    
    this.element = null;
  }

  /**
   * Handle touch start
   */
  private handleTouchStart = (e: TouchEvent): void => {
    if (e.touches.length === 1) {
      // Single touch - potential tap/long press
      const touch = e.touches[0];
      this.startX = touch.clientX;
      this.startY = touch.clientY;

      // Start long press timer
      if (this.config.enableLongPress) {
        this.longPressTimer = window.setTimeout(() => {
          this.onLongPress?.(this.startX, this.startY);
        }, this.config.longPressDuration);
      }
    } else if (e.touches.length === 2 && this.config.enablePinchZoom) {
      // Two touches - pinch zoom
      this.lastTouchDistance = this.getTouchDistance(e.touches[0], e.touches[1]);
      this.clearLongPressTimer();
    }
  };

  /**
   * Handle touch move
   */
  private handleTouchMove = (e: TouchEvent): void {
    this.clearLongPressTimer();

    if (e.touches.length === 1 && this.config.enablePan) {
      // Pan
      const touch = e.touches[0];
      const deltaX = touch.clientX - this.startX;
      const deltaY = touch.clientY - this.startY;

      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        this.onPan?.(deltaX, deltaY);
        this.startX = touch.clientX;
        this.startY = touch.clientY;
      }
    } else if (e.touches.length === 2 && this.config.enablePinchZoom) {
      // Pinch zoom
      const currentDistance = this.getTouchDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / this.lastTouchDistance;
      
      this.onPinchZoom?.(scale);
      this.lastTouchDistance = currentDistance;
      
      e.preventDefault(); // Prevent browser zoom
    }
  };

  /**
   * Handle touch end
   */
  private handleTouchEnd = (e: TouchEvent): void {
    this.clearLongPressTimer();

    if (e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      const now = Date.now();
      const timeSinceLastTouch = now - this.lastTouchTime;

      // Check for double tap
      if (this.config.enableDoubleTap && timeSinceLastTouch < 300) {
        this.onDoubleTap?.(touch.clientX, touch.clientY);
        this.lastTouchTime = 0; // Reset to prevent triple tap
      } else if (this.config.enableTap) {
        // Single tap
        const deltaX = Math.abs(touch.clientX - this.startX);
        const deltaY = Math.abs(touch.clientY - this.startY);

        // Only trigger tap if finger didn't move much
        if (deltaX < 10 && deltaY < 10) {
          this.onTap?.(touch.clientX, touch.clientY);
        }

        this.lastTouchTime = now;
      }
    }
  };

  /**
   * Get distance between two touches
   */
  private getTouchDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Clear long press timer
   */
  private clearLongPressTimer(): void {
    if (this.longPressTimer !== null) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  /**
   * Set callbacks
   */
  setPinchZoomCallback(callback: (scale: number) => void): void {
    this.onPinchZoom = callback;
  }

  setPanCallback(callback: (deltaX: number, deltaY: number) => void): void {
    this.onPan = callback;
  }

  setTapCallback(callback: (x: number, y: number) => void): void {
    this.onTap = callback;
  }

  setDoubleTapCallback(callback: (x: number, y: number) => void): void {
    this.onDoubleTap = callback;
  }

  setLongPressCallback(callback: (x: number, y: number) => void): void {
    this.onLongPress = callback;
  }
}

/**
 * Check if device supports touch
 */
export function isTouchDevice(): boolean {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
}

/**
 * Get optimal touch target size
 */
export function getTouchTargetSize(): number {
  // Minimum recommended touch target size is 44x44px (iOS HIG)
  return isTouchDevice() ? 44 : 32;
}

