/**
 * Responsive Utilities
 * Tools for handling responsive design and mobile optimization
 */

/**
 * Breakpoints (matching Tailwind defaults)
 */
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

/**
 * Check if window width matches breakpoint
 */
export function matchesBreakpoint(breakpoint: Breakpoint): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= breakpoints[breakpoint];
}

/**
 * Get current breakpoint
 */
export function getCurrentBreakpoint(): Breakpoint {
  if (typeof window === 'undefined') return 'xs';
  
  const width = window.innerWidth;
  
  if (width >= breakpoints['2xl']) return '2xl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
}

/**
 * Check if device is mobile
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth < breakpoints.md
  );
}

/**
 * Check if device is tablet
 */
export function isTablet(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    /iPad|Android/i.test(navigator.userAgent) &&
    window.innerWidth >= breakpoints.md &&
    window.innerWidth < breakpoints.lg
  );
}

/**
 * Check if device is desktop
 */
export function isDesktop(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.innerWidth >= breakpoints.lg;
}

/**
 * Check if device has touch support
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
}

/**
 * Get viewport dimensions
 */
export function getViewportDimensions(): { width: number; height: number } {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 };
  }
  
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

/**
 * Watch for viewport resize
 */
export function watchViewportResize(
  callback: (dimensions: { width: number; height: number }) => void,
  debounceMs: number = 150
): () => void {
  if (typeof window === 'undefined') return () => {};
  
  let timeout: NodeJS.Timeout;
  
  const handler = () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      callback(getViewportDimensions());
    }, debounceMs);
  };
  
  window.addEventListener('resize', handler);
  
  return () => {
    clearTimeout(timeout);
    window.removeEventListener('resize', handler);
  };
}

/**
 * Watch for orientation change
 */
export function watchOrientationChange(
  callback: (orientation: 'portrait' | 'landscape') => void
): () => void {
  if (typeof window === 'undefined') return () => {};
  
  const handler = () => {
    const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    callback(orientation);
  };
  
  window.addEventListener('orientationchange', handler);
  window.addEventListener('resize', handler);
  
  return () => {
    window.removeEventListener('orientationchange', handler);
    window.removeEventListener('resize', handler);
  };
}

/**
 * Get safe area insets (for notch devices)
 */
export function getSafeAreaInsets(): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} {
  if (typeof window === 'undefined' || !CSS.supports) {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }
  
  const getInset = (position: string): number => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(`env(safe-area-inset-${position}, 0px)`);
    return parseInt(value, 10) || 0;
  };
  
  return {
    top: getInset('top'),
    right: getInset('right'),
    bottom: getInset('bottom'),
    left: getInset('left'),
  };
}

/**
 * Lock scroll (useful for modals on mobile)
 */
export function lockScroll(): () => void {
  if (typeof document === 'undefined') return () => {};
  
  const originalStyle = window.getComputedStyle(document.body).overflow;
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  
  document.body.style.overflow = 'hidden';
  document.body.style.paddingRight = `${scrollbarWidth}px`;
  
  return () => {
    document.body.style.overflow = originalStyle;
    document.body.style.paddingRight = '';
  };
}

/**
 * Enable smooth scroll
 */
export function enableSmoothScroll(): () => void {
  if (typeof document === 'undefined') return () => {};
  
  const originalBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = 'smooth';
  
  return () => {
    document.documentElement.style.scrollBehavior = originalBehavior;
  };
}

/**
 * Scroll to element
 */
export function scrollToElement(
  element: HTMLElement | string,
  options?: ScrollIntoViewOptions
): void {
  if (typeof document === 'undefined') return;
  
  const el = typeof element === 'string' 
    ? document.querySelector(element) 
    : element;
  
  if (el) {
    el.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      ...options,
    });
  }
}

/**
 * Get responsive value based on breakpoint
 */
export function getResponsiveValue<T>(values: Partial<Record<Breakpoint, T>>): T | undefined {
  const currentBp = getCurrentBreakpoint();
  const bpOrder: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
  
  // Find the closest matching breakpoint
  for (const bp of bpOrder) {
    if (breakpoints[bp] <= breakpoints[currentBp] && values[bp] !== undefined) {
      return values[bp];
    }
  }
  
  return undefined;
}

/**
 * Mobile-specific utilities
 */
export const mobile = {
  // Prevent pull-to-refresh
  preventPullToRefresh: (): (() => void) => {
    if (typeof document === 'undefined') return () => {};
    
    const handler = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('touchmove', handler, { passive: false });
    
    return () => document.removeEventListener('touchmove', handler);
  },
  
  // Prevent zoom on double tap
  preventDoubleTapZoom: (): (() => void) => {
    if (typeof document === 'undefined') return () => {};
    
    let lastTouchEnd = 0;
    
    const handler = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };
    
    document.addEventListener('touchend', handler, { passive: false });
    
    return () => document.removeEventListener('touchend', handler);
  },
  
  // Add active state for touch
  addTouchActiveState: (element: HTMLElement, className: string = 'active') => {
    const onTouchStart = () => element.classList.add(className);
    const onTouchEnd = () => element.classList.remove(className);
    
    element.addEventListener('touchstart', onTouchStart);
    element.addEventListener('touchend', onTouchEnd);
    element.addEventListener('touchcancel', onTouchEnd);
    
    return () => {
      element.removeEventListener('touchstart', onTouchStart);
      element.removeEventListener('touchend', onTouchEnd);
      element.removeEventListener('touchcancel', onTouchEnd);
    };
  },
};
