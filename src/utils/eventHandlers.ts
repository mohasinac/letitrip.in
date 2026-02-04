/**
 * Global Event Handlers Utility
 * 
 * Centralized event handler management to avoid duplicate listeners
 * and improve performance across the application.
 */

type EventCallback = (...args: any[]) => void;

interface EventHandler {
  type: string;
  target: EventTarget;
  callback: EventListener;
  options?: AddEventListenerOptions;
}

class GlobalEventManager {
  private handlers: Map<string, EventHandler[]> = new Map();
  private handlerIds: Map<string, number> = new Map();

  /**
   * Generate unique ID for a handler
   */
  private generateId(type: string, target: EventTarget): string {
    const targetId = this.getTargetId(target);
    const key = `${type}-${targetId}`;
    const count = (this.handlerIds.get(key) || 0) + 1;
    this.handlerIds.set(key, count);
    return `${key}-${count}`;
  }

  /**
   * Get unique identifier for event target
   */
  private getTargetId(target: EventTarget): string {
    if (target === window) return 'window';
    if (target === document) return 'document';
    if (target instanceof HTMLElement && target.id) return target.id;
    return `element-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add an event listener
   * @returns Handler ID for removal
   */
  add(
    target: EventTarget,
    type: string,
    callback: EventListener,
    options?: AddEventListenerOptions
  ): string {
    const id = this.generateId(type, target);
    const handler: EventHandler = { type, target, callback, options };

    if (!this.handlers.has(id)) {
      this.handlers.set(id, []);
    }

    this.handlers.get(id)!.push(handler);
    target.addEventListener(type, callback, options);

    return id;
  }

  /**
   * Remove an event listener by ID
   */
  remove(id: string): void {
    const handlers = this.handlers.get(id);
    if (!handlers) return;

    handlers.forEach(({ type, target, callback, options }) => {
      target.removeEventListener(type, callback, options);
    });

    this.handlers.delete(id);
  }

  /**
   * Remove all handlers for a specific type and target
   */
  removeAllForTarget(target: EventTarget, type?: string): void {
    const handlersToRemove: string[] = [];

    this.handlers.forEach((handlers, id) => {
      const matchesTarget = handlers.some((h) => h.target === target);
      const matchesType = !type || handlers.some((h) => h.type === type);

      if (matchesTarget && matchesType) {
        handlersToRemove.push(id);
      }
    });

    handlersToRemove.forEach((id) => this.remove(id));
  }

  /**
   * Clear all event listeners
   */
  clear(): void {
    this.handlers.forEach((handlers, id) => {
      handlers.forEach(({ type, target, callback, options }) => {
        target.removeEventListener(type, callback, options);
      });
    });

    this.handlers.clear();
    this.handlerIds.clear();
  }

  /**
   * Get count of active handlers
   */
  getHandlerCount(): number {
    return this.handlers.size;
  }

  /**
   * Check if handler exists
   */
  has(id: string): boolean {
    return this.handlers.has(id);
  }
}

// Singleton instance
export const globalEventManager = new GlobalEventManager();

/**
 * Throttle function - limits execution rate
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastRun = 0;

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();

    if (now - lastRun >= delay) {
      func.apply(this, args);
      lastRun = now;
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(
        () => {
          func.apply(this, args);
          lastRun = Date.now();
        },
        delay - (now - lastRun)
      );
    }
  };
}

/**
 * Debounce function - delays execution until after delay has elapsed
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

/**
 * Global scroll handler with throttling
 */
export function addGlobalScrollHandler(
  callback: (event: Event) => void,
  options?: { throttle?: number; target?: EventTarget }
): string {
  const { throttle: throttleDelay = 100, target = window } = options || {};
  const handler = throttleDelay > 0 ? throttle(callback, throttleDelay) : callback;

  return globalEventManager.add(target, 'scroll', handler as EventListener, { passive: true });
}

/**
 * Global resize handler with throttling
 */
export function addGlobalResizeHandler(
  callback: (event: Event) => void,
  options?: { throttle?: number }
): string {
  const { throttle: throttleDelay = 200 } = options || {};
  const handler = throttleDelay > 0 ? throttle(callback, throttleDelay) : callback;

  return globalEventManager.add(window, 'resize', handler as EventListener, { passive: true });
}

/**
 * Global click handler with delegation
 */
export function addGlobalClickHandler(
  selector: string,
  callback: (event: MouseEvent, element: Element) => void,
  options?: { preventDefault?: boolean }
): string {
  const handler = (event: Event) => {
    const target = event.target as Element;
    const element = target.closest(selector);

    if (element) {
      if (options?.preventDefault) {
        event.preventDefault();
      }
      callback(event as MouseEvent, element);
    }
  };

  return globalEventManager.add(document, 'click', handler as EventListener);
}

/**
 * Global keyboard handler
 */
export function addGlobalKeyHandler(
  key: string | string[],
  callback: (event: KeyboardEvent) => void,
  options?: {
    preventDefault?: boolean;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
  }
): string {
  const keys = Array.isArray(key) ? key : [key];
  const {
    preventDefault = false,
    ctrl = false,
    shift = false,
    alt = false,
    meta = false,
  } = options || {};

  const handler = (event: Event) => {
    const keyEvent = event as KeyboardEvent;
    const isKeyMatch = keys.some((k) => keyEvent.key === k || keyEvent.code === k);

    if (!isKeyMatch) return;

    const modifiersMatch =
      keyEvent.ctrlKey === ctrl &&
      keyEvent.shiftKey === shift &&
      keyEvent.altKey === alt &&
      keyEvent.metaKey === meta;

    if (!modifiersMatch) return;

    if (preventDefault) {
      event.preventDefault();
    }

    callback(keyEvent);
  };

  return globalEventManager.add(document, 'keydown', handler as EventListener);
}

/**
 * Remove a global handler by ID
 */
export function removeGlobalHandler(id: string): void {
  globalEventManager.remove(id);
}

/**
 * Helper: Detect mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Helper: Detect touch support
 */
export function hasTouchSupport(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
}

/**
 * Helper: Get viewport dimensions
 */
export function getViewportDimensions() {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 };
  }

  return {
    width: window.innerWidth || document.documentElement.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight,
  };
}

/**
 * Helper: Check if element is in viewport
 */
export function isInViewport(element: HTMLElement, offset = 0): boolean {
  if (typeof window === 'undefined') return false;

  const rect = element.getBoundingClientRect();
  const { width, height } = getViewportDimensions();

  return (
    rect.top >= -offset &&
    rect.left >= -offset &&
    rect.bottom <= height + offset &&
    rect.right <= width + offset
  );
}

/**
 * Helper: Smooth scroll to element
 */
export function smoothScrollTo(
  element: HTMLElement | string,
  options?: { offset?: number; duration?: number }
): void {
  const target = typeof element === 'string' ? document.querySelector(element) : element;
  if (!target) return;

  const { offset = 0 } = options || {};
  const targetPosition = (target as HTMLElement).getBoundingClientRect().top + window.pageYOffset;
  const offsetPosition = targetPosition - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth',
  });
}

/**
 * Helper: Prevent body scroll (for modals, drawers, etc.)
 */
export function preventBodyScroll(prevent: boolean): void {
  if (typeof document === 'undefined') return;

  if (prevent) {
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
  } else {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }
}
