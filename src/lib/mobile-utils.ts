/**
 * Mobile Utilities - Phase 7.1
 *
 * Utility functions and hooks for mobile optimization.
 * Touch-optimized spacing, safe area insets, and device detection.
 */

import { useEffect, useState } from "react";

/**
 * Touch Target Sizes (iOS/Android HIG)
 * Minimum tap target: 44x44px (iOS), 48x48px (Android)
 */
export const TOUCH_SIZES = {
  /** Minimum touch target (44px) */
  min: "h-11 w-11", // 44px
  /** Standard touch target (48px) */
  standard: "h-12 w-12", // 48px
  /** Large touch target (56px) */
  large: "h-14 w-14", // 56px
} as const;

/**
 * Mobile Spacing
 * Touch-friendly spacing for mobile interfaces
 */
export const MOBILE_SPACING = {
  /** Tight spacing (8px) */
  tight: "gap-2",
  /** Standard spacing (12px) */
  standard: "gap-3",
  /** Comfortable spacing (16px) */
  comfortable: "gap-4",
  /** Spacious spacing (24px) */
  spacious: "gap-6",
} as const;

/**
 * Safe Area Classes
 * iOS notch and Android gesture bar support
 */
export const SAFE_AREA = {
  /** Top safe area (status bar) */
  top: "pt-safe",
  /** Bottom safe area (home indicator) */
  bottom: "pb-safe",
  /** Left safe area */
  left: "pl-safe",
  /** Right safe area */
  right: "pr-safe",
  /** All sides */
  all: "p-safe",
} as const;

/**
 * Hook: Detect if device is touch-enabled
 */
export function useIsTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const hasTouchScreen =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-ignore - msMaxTouchPoints for IE
      navigator.msMaxTouchPoints > 0;

    setIsTouchDevice(hasTouchScreen);
  }, []);

  return isTouchDevice;
}

/**
 * Hook: Detect mobile device (screen width < 1024px)
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

/**
 * Hook: Get safe area insets (iOS notch)
 */
export function useSafeAreaInsets() {
  const [insets, setInsets] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    const updateInsets = () => {
      // Get CSS env() values if supported
      const top =
        parseInt(
          getComputedStyle(document.documentElement)
            .getPropertyValue("--sat")
            .replace("px", ""),
        ) || 0;
      const right =
        parseInt(
          getComputedStyle(document.documentElement)
            .getPropertyValue("--sar")
            .replace("px", ""),
        ) || 0;
      const bottom =
        parseInt(
          getComputedStyle(document.documentElement)
            .getPropertyValue("--sab")
            .replace("px", ""),
        ) || 0;
      const left =
        parseInt(
          getComputedStyle(document.documentElement)
            .getPropertyValue("--sal")
            .replace("px", ""),
        ) || 0;

      setInsets({ top, right, bottom, left });
    };

    updateInsets();
    window.addEventListener("resize", updateInsets);

    return () => window.removeEventListener("resize", updateInsets);
  }, []);

  return insets;
}

/**
 * Hook: Detect scroll direction
 */
export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(
    null,
  );
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
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

/**
 * Hook: Detect landscape orientation
 */
export function useIsLandscape() {
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, []);

  return isLandscape;
}

/**
 * Utility: Prevent body scroll (for modals)
 */
export function lockBodyScroll() {
  document.body.style.overflow = "hidden";
  document.body.style.paddingRight = `${
    window.innerWidth - document.documentElement.clientWidth
  }px`;
}

/**
 * Utility: Restore body scroll
 */
export function unlockBodyScroll() {
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
}

/**
 * Utility: Haptic feedback (iOS/Android)
 */
export function hapticFeedback(
  type:
    | "light"
    | "medium"
    | "heavy"
    | "success"
    | "warning"
    | "error" = "light",
) {
  // Check if Haptic Feedback API is available
  if ("vibrate" in navigator) {
    const patterns = {
      light: 10,
      medium: 20,
      heavy: 30,
      success: [10, 50, 10],
      warning: [10, 50, 10, 50, 10],
      error: [30, 50, 30],
    };

    navigator.vibrate(patterns[type]);
  }
}

/**
 * Utility: Get viewport height (accounting for mobile browsers)
 */
export function getViewportHeight() {
  return window.visualViewport?.height || window.innerHeight;
}

/**
 * Utility: Check if PWA/standalone mode
 */
export function isPWA() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // @ts-ignore - navigator.standalone for iOS
    window.navigator.standalone === true
  );
}
