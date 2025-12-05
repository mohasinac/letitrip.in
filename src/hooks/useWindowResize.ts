/**
 * useWindowResize Hook
 * Task 1.8.2 - Common Hooks & Utilities
 *
 * Window resize hook with debounce support.
 * Provides current window dimensions and updates on resize with debouncing
 * to avoid excessive re-renders during continuous resize operations.
 *
 * @example
 * ```tsx
 * const { width, height, isDesktop, isMobile } = useWindowResize();
 *
 * // With custom debounce delay
 * const { width, height } = useWindowResize({ debounceMs: 500 });
 *
 * // With custom breakpoints
 * const { width, isMobile, isTablet, isDesktop } = useWindowResize({
 *   mobileBreakpoint: 640,
 *   tabletBreakpoint: 1024,
 * });
 * ```
 */

import { useCallback, useEffect, useState } from "react";

// ==================== TYPES ====================

/**
 * Window dimensions
 */
export interface WindowSize {
  /** Window width in pixels */
  width: number;
  /** Window height in pixels */
  height: number;
}

/**
 * useWindowResize options
 */
export interface UseWindowResizeOptions {
  /** Debounce delay in milliseconds (default: 200) */
  debounceMs?: number;
  /** Mobile breakpoint in pixels (default: 768) */
  mobileBreakpoint?: number;
  /** Tablet breakpoint in pixels (default: 1024) */
  tabletBreakpoint?: number;
  /** Desktop breakpoint in pixels (default: 1280) */
  desktopBreakpoint?: number;
  /** Callback when resize occurs */
  onResize?: (size: WindowSize) => void;
}

/**
 * useWindowResize return value
 */
export interface UseWindowResizeReturn extends WindowSize {
  /** Whether screen is mobile size */
  isMobile: boolean;
  /** Whether screen is tablet size */
  isTablet: boolean;
  /** Whether screen is desktop size */
  isDesktop: boolean;
  /** Whether screen is large desktop size */
  isLargeDesktop: boolean;
}

// ==================== HOOK ====================

/**
 * Hook for tracking window resize with debounce
 *
 * @example
 * ```tsx
 * // Basic usage
 * const { width, height } = useWindowResize();
 *
 * return (
 *   <div>
 *     Window size: {width}x{height}
 *   </div>
 * );
 *
 * // Responsive component
 * const { isMobile, isDesktop } = useWindowResize();
 *
 * return (
 *   <div>
 *     {isMobile && <MobileNav />}
 *     {isDesktop && <DesktopNav />}
 *   </div>
 * );
 *
 * // With callback
 * const { width } = useWindowResize({
 *   onResize: (size) => console.log('Resized to:', size),
 *   debounceMs: 300,
 * });
 * ```
 */
export function useWindowResize(
  options: UseWindowResizeOptions = {}
): UseWindowResizeReturn {
  const {
    debounceMs = 200,
    mobileBreakpoint = 768,
    tabletBreakpoint = 1024,
    desktopBreakpoint = 1280,
    onResize,
  } = options;

  // Initialize with current window size (or 0 for SSR)
  const getWindowSize = useCallback((): WindowSize => {
    if (typeof window === "undefined") {
      return { width: 0, height: 0 };
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }, []);

  const [windowSize, setWindowSize] = useState<WindowSize>(getWindowSize);

  // Handle resize with debounce
  useEffect(() => {
    // Skip if not in browser
    if (typeof window === "undefined") {
      return;
    }

    let timeoutId: NodeJS.Timeout | null = null;

    const handleResize = () => {
      // Clear previous timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Set new timeout for debounced update
      timeoutId = setTimeout(() => {
        const newSize = getWindowSize();
        setWindowSize(newSize);

        // Call resize callback if provided
        if (onResize) {
          onResize(newSize);
        }
      }, debounceMs);
    };

    // Add resize event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [debounceMs, getWindowSize, onResize]);

  // Calculate breakpoint helpers
  const isMobile = windowSize.width < mobileBreakpoint;
  const isTablet =
    windowSize.width >= mobileBreakpoint && windowSize.width < tabletBreakpoint;
  const isDesktop =
    windowSize.width >= tabletBreakpoint &&
    windowSize.width < desktopBreakpoint;
  const isLargeDesktop = windowSize.width >= desktopBreakpoint;

  return {
    width: windowSize.width,
    height: windowSize.height,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
  };
}

/**
 * useWindowWidth - Simplified hook that only tracks width
 *
 * @example
 * ```tsx
 * const width = useWindowWidth();
 * ```
 */
export function useWindowWidth(debounceMs: number = 200): number {
  const { width } = useWindowResize({ debounceMs });
  return width;
}

/**
 * useWindowHeight - Simplified hook that only tracks height
 *
 * @example
 * ```tsx
 * const height = useWindowHeight();
 * ```
 */
export function useWindowHeight(debounceMs: number = 200): number {
  const { height } = useWindowResize({ debounceMs });
  return height;
}

/**
 * useBreakpoint - Simplified hook for breakpoint detection
 *
 * @example
 * ```tsx
 * const { isMobile, isDesktop } = useBreakpoint();
 * ```
 */
export function useBreakpoint(options?: UseWindowResizeOptions): {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
} {
  const { isMobile, isTablet, isDesktop, isLargeDesktop } =
    useWindowResize(options);
  return { isMobile, isTablet, isDesktop, isLargeDesktop };
}
