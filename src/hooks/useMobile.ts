/**
 * Mobile detection utilities and hooks
 */

"use client";

import { useState, useEffect } from "react";

/**
 * Hook to detect if user is on mobile device
 */
export function useIsMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile((globalThis.innerWidth ?? 0) < breakpoint);
    };

    // Check on mount
    checkMobile();

    // Add event listener
    globalThis.addEventListener?.("resize", checkMobile);

    // Cleanup
    return () => globalThis.removeEventListener?.("resize", checkMobile);
  }, [breakpoint]);

  return isMobile;
}

/**
 * Hook to detect touch device
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch("ontouchstart" in globalThis || navigator.maxTouchPoints > 0);
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
      setViewport({
        width: globalThis.innerWidth ?? 0,
        height: globalThis.innerHeight ?? 0,
      });
    };

    updateViewport();
    globalThis.addEventListener?.("resize", updateViewport);

    return () => globalThis.removeEventListener?.("resize", updateViewport);
  }, []);

  return viewport;
}

/**
 * Breakpoint helper
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
      setMatches((globalThis.innerWidth ?? 0) >= breakpoints[breakpoint]);
    };

    checkBreakpoint();
    globalThis.addEventListener?.("resize", checkBreakpoint);

    return () => globalThis.removeEventListener?.("resize", checkBreakpoint);
  }, [breakpoint]);

  return matches;
}

/**
 * Detect iOS device
 */
export function isIOS(): boolean {
  if (typeof globalThis === "undefined") return false;

  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(globalThis as any).MSStream
  );
}

/**
 * Detect Android device
 */
export function isAndroid(): boolean {
  if (typeof globalThis === "undefined") return false;

  return /Android/.test(navigator.userAgent);
}

/**
 * Get device type
 */
export function getDeviceType(): "desktop" | "tablet" | "mobile" {
  if (typeof globalThis === "undefined") return "desktop";

  const width = globalThis.innerWidth ?? 0;

  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

/**
 * Hook to get device type
 */
export function useDeviceType() {
  const [deviceType, setDeviceType] = useState<"desktop" | "tablet" | "mobile">(
    "desktop",
  );

  useEffect(() => {
    const updateDeviceType = () => {
      setDeviceType(getDeviceType());
    };

    updateDeviceType();
    globalThis.addEventListener?.("resize", updateDeviceType);

    return () => globalThis.removeEventListener?.("resize", updateDeviceType);
  }, []);

  return deviceType;
}
