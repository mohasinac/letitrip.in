
/**
 * Media query and responsive hooks
 *
 * @example
 * ```tsx
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const isDesktop = useMediaQuery('(min-width: 1024px)');
 *
 * return (
 *   <div>
 *     {isMobile && <MobileMenu />}
 *     {isDesktop && <DesktopMenu />}
 *   </div>
 * );
 * ```
 */


import { useEffect, useState } from "react";

/**
 * Hook to match media query
 *
 * @param query - CSS media query string
 * @returns boolean indicating if media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Define handler
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handler);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handler);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handler);
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(handler);
      }
    };
  }, [query]);

  return matches;
}

/**
 * Hook to detect if user is on mobile device
 *
 * @param breakpoint - Breakpoint in pixels (default: 768)
 * @returns boolean indicating if screen is mobile size
 */
export function useIsMobile(breakpoint: number = 768): boolean {
  return useMediaQuery(`(max-width: ${breakpoint - 1}px)`);
}

/**
 * Hook to detect if user is on tablet device
 *
 * @param minBreakpoint - Minimum breakpoint (default: 768)
 * @param maxBreakpoint - Maximum breakpoint (default: 1024)
 * @returns boolean indicating if screen is tablet size
 */
export function useIsTablet(
  minBreakpoint: number = 768,
  maxBreakpoint: number = 1024
): boolean {
  return useMediaQuery(
    `(min-width: ${minBreakpoint}px) and (max-width: ${maxBreakpoint - 1}px)`
  );
}

/**
 * Hook to detect if user is on desktop device
 *
 * @param breakpoint - Breakpoint in pixels (default: 1024)
 * @returns boolean indicating if screen is desktop size
 */
export function useIsDesktop(breakpoint: number = 1024): boolean {
  return useMediaQuery(`(min-width: ${breakpoint}px)`);
}

/**
 * Hook to detect touch device
 *
 * @returns boolean indicating if device supports touch
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setIsTouch(
      "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0
    );
  }, []);

  return isTouch;
}

/**
 * Get viewport dimensions
 *
 * @example
 * ```tsx
 * const { width, height } = useViewport();
 *
 * return <div>Screen size: {width}x{height}</div>;
 * ```
 */
export function useViewport() {
  const [viewport, setViewport] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Set initial values
    updateViewport();

    // Add listener
    window.addEventListener("resize", updateViewport);

    // Cleanup
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  return viewport;
}

/**
 * Breakpoint presets
 */
export const BREAKPOINTS = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

/**
 * Hook to get current breakpoint
 *
 * @returns Current breakpoint name
 */
export function useBreakpoint(): keyof typeof BREAKPOINTS | "base" {
  const [breakpoint, setBreakpoint] = useState<
    keyof typeof BREAKPOINTS | "base"
  >("base");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const updateBreakpoint = () => {
      const width = window.innerWidth;

      if (width >= BREAKPOINTS["2xl"]) {
        setBreakpoint("2xl");
      } else if (width >= BREAKPOINTS.xl) {
        setBreakpoint("xl");
      } else if (width >= BREAKPOINTS.lg) {
        setBreakpoint("lg");
      } else if (width >= BREAKPOINTS.md) {
        setBreakpoint("md");
      } else if (width >= BREAKPOINTS.sm) {
        setBreakpoint("sm");
      } else if (width >= BREAKPOINTS.xs) {
        setBreakpoint("xs");
      } else {
        setBreakpoint("base");
      }
    };

    // Set initial value
    updateBreakpoint();

    // Add listener
    window.addEventListener("resize", updateBreakpoint);

    // Cleanup
    return () => window.removeEventListener("resize", updateBreakpoint);
  }, []);

  return breakpoint;
}
