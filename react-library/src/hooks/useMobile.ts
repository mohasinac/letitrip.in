/**
 * Mobile Detection Hooks
 *
 * Framework-agnostic hooks for mobile detection and responsive behavior.
 *
 * @example
 * ```tsx
 * const isMobile = useIsMobile(768);
 * const isTouch = useIsTouchDevice();
 * const { width, height } = useViewport();
 * const isLg = useBreakpoint('lg');
 * const deviceType = useDeviceType();
 * ```
 */

import { useEffect, useState } from "react";

/**
 * Hook to detect if user is on mobile device
 */
export function useIsMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        typeof window !== "undefined" ? window.innerWidth < breakpoint : false
      );
    };

    checkMobile();

    if (typeof window !== "undefined") {
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }
  }, [breakpoint]);

  return isMobile;
}

/**
 * Hook to detect touch device
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
    }
  }, []);

  return isTouch;
}

/**
 * Get viewport dimensions
 */
export function useViewport() {
  const [viewport, setViewport] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const updateViewport = () => {
      if (typeof window !== "undefined") {
        setViewport({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
    };

    updateViewport();

    if (typeof window !== "undefined") {
      window.addEventListener("resize", updateViewport);
      return () => window.removeEventListener("resize", updateViewport);
    }
  }, []);

  return viewport;
}

/**
 * Breakpoint definitions
 */
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

/**
 * Check if viewport matches breakpoint
 */
export function useBreakpoint(breakpoint: keyof typeof breakpoints): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const checkBreakpoint = () => {
      if (typeof window !== "undefined") {
        setMatches(window.innerWidth >= breakpoints[breakpoint]);
      }
    };

    checkBreakpoint();

    if (typeof window !== "undefined") {
      window.addEventListener("resize", checkBreakpoint);
      return () => window.removeEventListener("resize", checkBreakpoint);
    }
  }, [breakpoint]);

  return matches;
}

/**
 * Detect iOS device
 */
export function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
  );
}

/**
 * Detect Android device
 */
export function isAndroid(): boolean {
  if (typeof window === "undefined") return false;
  return /Android/.test(navigator.userAgent);
}

/**
 * Get device type
 */
export function getDeviceType(): "desktop" | "tablet" | "mobile" {
  if (typeof window === "undefined") return "desktop";

  const width = window.innerWidth;

  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

/**
 * Hook to get device type
 */
export function useDeviceType() {
  const [deviceType, setDeviceType] = useState<"desktop" | "tablet" | "mobile">(
    "desktop"
  );

  useEffect(() => {
    const updateDeviceType = () => {
      setDeviceType(getDeviceType());
    };

    updateDeviceType();

    if (typeof window !== "undefined") {
      window.addEventListener("resize", updateDeviceType);
      return () => window.removeEventListener("resize", updateDeviceType);
    }
  }, []);

  return deviceType;
}

// Re-export for convenience
export default {
  useIsMobile,
  useIsTouchDevice,
  useViewport,
  useBreakpoint,
  useDeviceType,
  isIOS,
  isAndroid,
  getDeviceType,
  breakpoints,
};
