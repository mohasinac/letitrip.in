/**
 * @fileoverview TypeScript Module
 * @module src/hooks/useMobile
 * @description This file contains functionality related to useMobile
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Mobile detection utilities and hooks
 */

"use client";

import { useState, useEffect } from "react";

/**
 * Hook to detect if user is on mobile device
 */
/**
 * Custom React hook for is mobile
 *
 * @param {number} [breakpoint] - The breakpoint
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * useIsMobile(123);
 */

/**
 * Custom React hook for is mobile
 *
 * @param {number} [breakpoint] - The breakpoint
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * useIsMobile(123);
 */

export function useIsMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    /**
     * Performs check mobile operation
     *
     * @returns {any} The checkmobile result
     */

    /**
     * Performs check mobile operation
     *
     * @returns {any} The checkmobile result
     */

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
/**
 * Custom React hook for is touch device
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * useIsTouchDevice();
 */

/**
 * Custom React hook for is touch device
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * useIsTouchDevice();
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
/**
 * Custom React hook for viewport
 *
 * @returns {any} The useviewport result
 *
 * @example
 * useViewport();
 */

/**
 * Custom React hook for viewport
 *
 * @returns {any} The useviewport result
 *
 * @example
 * useViewport();
 */

export function useViewport() {
  const [viewport, setViewport] = useState({
    /** Width */
    width: 0,
    /** Height */
    height: 0,
  });

  useEffect(() => {
    /**
     * Updates existing viewport
     *
     * @returns {any} The updateviewport result
     */

    /**
     * Updates existing viewport
     *
     * @returns {any} The updateviewport result
     */

    const updateViewport = () => {
      setViewport({
        /** Width */
        width: globalThis.innerWidth ?? 0,
        /** Height */
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
  /** Sm */
  sm: 640,
  /** Md */
  md: 768,
  /** Lg */
  lg: 1024,
  /** Xl */
  xl: 1280,
  "2xl": 1536,
} as const;

/**
 * Check if viewport matches breakpoint
 */
/**
 * Custom React hook for breakpoint
 *
 * @param {keyof typeof breakpoints} breakpoint - The breakpoint
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * useBreakpoint(breakpoint);
 */

/**
 * Custom React hook for breakpoint
 *
 * @param {keyof typeof breakpoints} breakpoint - The breakpoint
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * useBreakpoint(breakpoint);
 */

export function useBreakpoint(breakpoint: keyof typeof breakpoints): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    /**
     * Performs check breakpoint operation
     *
     * @returns {any} The checkbreakpoint result
     */

    /**
     * Performs check breakpoint operation
     *
     * @returns {any} The checkbreakpoint result
     */

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
/**
 * Checks if i o s
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isIOS();
 */

/**
 * Checks if i o s
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isIOS();
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
/**
 * Checks if android
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isAndroid();
 */

/**
 * Checks if android
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isAndroid();
 */

export function isAndroid(): boolean {
  if (typeof globalThis === "undefined") return false;

  return /Android/.test(navigator.userAgent);
}

/**
 * Get device type
 */
/**
 * Retrieves device type
 *
 * @returns {any} The devicetype result
 *
 * @example
 * getDeviceType();
 */

/**
 * Retrieves device type
 *
 * @returns {any} The devicetype result
 *
 * @example
 * getDeviceType();
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
/**
 * Custom React hook for device type
 *
 * @returns {any} The usedevicetype result
 *
 * @example
 * useDeviceType();
 */

/**
 * Custom React hook for device type
 *
 * @returns {any} The usedevicetype result
 *
 * @example
 * useDeviceType();
 */

export function useDeviceType() {
  const [deviceType, setDeviceType] = useState<"desktop" | "tablet" | "mobile">(
    "desktop",
  );

  useEffect(() => {
    /**
     * Updates existing device type
     *
     * @returns {any} The updatedevicetype result
     */

    /**
     * Updates existing device type
     *
     * @returns {any} The updatedevicetype result
     */

    const updateDeviceType = () => {
      setDeviceType(getDeviceType());
    };

    updateDeviceType();
    globalThis.addEventListener?.("resize", updateDeviceType);

    return () => globalThis.removeEventListener?.("resize", updateDeviceType);
  }, []);

  return deviceType;
}
