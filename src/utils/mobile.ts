/**
 * Mobile Optimization Utilities
 * Utilities for mobile-specific optimizations and responsive behavior
 */

"use client";

import { useState, useEffect, useCallback } from "react";

// ============================================================================
// DEVICE DETECTION
// ============================================================================

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: "portrait" | "landscape";
}

/**
 * Detect device type and capabilities
 */
export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouchDevice: false,
    isIOS: false,
    isAndroid: false,
    screenWidth: typeof window !== "undefined" ? window.innerWidth : 1920,
    screenHeight: typeof window !== "undefined" ? window.innerHeight : 1080,
    orientation: "landscape",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const userAgent = navigator.userAgent.toLowerCase();

      setDeviceInfo({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        isTouchDevice: "ontouchstart" in window || navigator.maxTouchPoints > 0,
        isIOS: /iphone|ipad|ipod/.test(userAgent),
        isAndroid: /android/.test(userAgent),
        screenWidth: width,
        screenHeight: height,
        orientation: width > height ? "landscape" : "portrait",
      });
    };

    updateDeviceInfo();
    window.addEventListener("resize", updateDeviceInfo);
    window.addEventListener("orientationchange", updateDeviceInfo);

    return () => {
      window.removeEventListener("resize", updateDeviceInfo);
      window.removeEventListener("orientationchange", updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
}

// ============================================================================
// RESPONSIVE BREAKPOINTS
// ============================================================================

export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

/**
 * Hook to check current breakpoint
 */
export function useBreakpoint() {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<keyof typeof breakpoints>("lg");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateBreakpoint = () => {
      const width = window.innerWidth;
      
      if (width < breakpoints.sm) {
        setCurrentBreakpoint("xs");
      } else if (width < breakpoints.md) {
        setCurrentBreakpoint("sm");
      } else if (width < breakpoints.lg) {
        setCurrentBreakpoint("md");
      } else if (width < breakpoints.xl) {
        setCurrentBreakpoint("lg");
      } else if (width < breakpoints["2xl"]) {
        setCurrentBreakpoint("xl");
      } else {
        setCurrentBreakpoint("2xl");
      }
    };

    updateBreakpoint();
    window.addEventListener("resize", updateBreakpoint);

    return () => window.removeEventListener("resize", updateBreakpoint);
  }, []);

  return currentBreakpoint;
}

/**
 * Check if screen is at or above a breakpoint
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

// ============================================================================
// TOUCH GESTURES
// ============================================================================

export interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

/**
 * Hook to handle swipe gestures
 */
export function useSwipe(handlers: SwipeHandlers, threshold: number = 50) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart) return;

      const touchEnd = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
      };

      const deltaX = touchEnd.x - touchStart.x;
      const deltaY = touchEnd.y - touchStart.y;

      // Horizontal swipe
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          handlers.onSwipeRight?.();
        } else {
          handlers.onSwipeLeft?.();
        }
      }

      // Vertical swipe
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > threshold) {
        if (deltaY > 0) {
          handlers.onSwipeDown?.();
        } else {
          handlers.onSwipeUp?.();
        }
      }

      setTouchStart(null);
    },
    [touchStart, handlers, threshold]
  );

  return { onTouchStart, onTouchEnd };
}

// ============================================================================
// VIEWPORT
// ============================================================================

/**
 * Hook to get viewport dimensions
 */
export function useViewport() {
  const [viewport, setViewport] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return viewport;
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// ============================================================================
// SCROLL
// ============================================================================

/**
 * Hook to track scroll position
 */
export function useScrollPosition() {
  const [scrollPosition, setScrollPosition] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      setScrollPosition({
        x: window.scrollX,
        y: window.scrollY,
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return scrollPosition;
}

/**
 * Hook to detect scroll direction
 */
export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(null);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY) {
        setScrollDirection("down");
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection("up");
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return scrollDirection;
}

// ============================================================================
// SAFE AREA (iOS Notch)
// ============================================================================

/**
 * Get safe area insets for iOS devices
 */
export function useSafeArea() {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    if (typeof window === "undefined" || typeof getComputedStyle === "undefined") return;

    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);

    setSafeArea({
      top: parseInt(computedStyle.getPropertyValue("env(safe-area-inset-top)")) || 0,
      right: parseInt(computedStyle.getPropertyValue("env(safe-area-inset-right)")) || 0,
      bottom: parseInt(computedStyle.getPropertyValue("env(safe-area-inset-bottom)")) || 0,
      left: parseInt(computedStyle.getPropertyValue("env(safe-area-inset-left)")) || 0,
    });
  }, []);

  return safeArea;
}

// ============================================================================
// NETWORK
// ============================================================================

/**
 * Hook to detect network status
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Hook to get connection type (if available)
 */
export function useConnectionType() {
  const [connectionType, setConnectionType] = useState<string>("unknown");

  useEffect(() => {
    if (typeof navigator === "undefined" || !("connection" in navigator)) return;

    const connection = (navigator as any).connection;
    setConnectionType(connection?.effectiveType || "unknown");

    const handleChange = () => {
      setConnectionType(connection?.effectiveType || "unknown");
    };

    connection?.addEventListener("change", handleChange);

    return () => {
      connection?.removeEventListener("change", handleChange);
    };
  }, []);

  return connectionType;
}

// ============================================================================
// ORIENTATION
// ============================================================================

/**
 * Hook to lock/unlock screen orientation (mobile)
 */
export function useOrientation() {
  const [orientation, setOrientation] = useState<OrientationType | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.screen?.orientation) return;

    const handleOrientationChange = () => {
      setOrientation(window.screen.orientation.type);
    };

    handleOrientationChange();
    window.screen.orientation.addEventListener("change", handleOrientationChange);

    return () => {
      window.screen.orientation.removeEventListener("change", handleOrientationChange);
    };
  }, []);

  const lockOrientation = async (lock: "portrait" | "landscape") => {
    if (typeof window !== "undefined" && window.screen?.orientation && "lock" in window.screen.orientation) {
      try {
        await (window.screen.orientation as any).lock(lock);
      } catch (error) {
        console.warn("Orientation lock failed:", error);
      }
    }
  };

  const unlockOrientation = () => {
    if (typeof window !== "undefined" && window.screen?.orientation && "unlock" in window.screen.orientation) {
      (window.screen.orientation as any).unlock();
    }
  };

  return { orientation, lockOrientation, unlockOrientation };
}

// ============================================================================
// HAPTIC FEEDBACK
// ============================================================================

/**
 * Trigger haptic feedback (if supported)
 */
export function triggerHapticFeedback(type: "light" | "medium" | "heavy" = "medium") {
  if (typeof window === "undefined" || !("vibrate" in navigator)) return;

  const patterns = {
    light: [10],
    medium: [20],
    heavy: [30],
  };

  navigator.vibrate(patterns[type]);
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  useDeviceDetection,
  useBreakpoint,
  useMediaQuery,
  useSwipe,
  useViewport,
  isInViewport,
  useScrollPosition,
  useScrollDirection,
  useSafeArea,
  useNetworkStatus,
  useConnectionType,
  useOrientation,
  triggerHapticFeedback,
};
