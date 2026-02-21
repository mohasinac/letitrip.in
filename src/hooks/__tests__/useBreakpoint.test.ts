/**
 * useBreakpoint Tests — Phase 18.5
 *
 * - Detects mobile / tablet / desktop breakpoints via matchMedia
 * - Returns correct boolean flags and breakpoint string
 */

import { renderHook } from "@testing-library/react";
import { useBreakpoint } from "../useBreakpoint";

const setupMatchMedia = (
  mobileMatches: boolean,
  tabletMatches: boolean,
  desktopMatches: boolean,
) => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn((query: string) => {
      let matches: boolean;
      if (query.includes("max-width: 767px")) {
        matches = mobileMatches;
      } else if (query.includes("768px") && query.includes("1023px")) {
        matches = tabletMatches;
      } else {
        matches = desktopMatches;
      }
      return {
        matches,
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };
    }),
  });
};

describe("useBreakpoint", () => {
  it("detects mobile breakpoint (< 768px)", () => {
    setupMatchMedia(true, false, false);
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.breakpoint).toBe("mobile");
  });

  it("detects tablet breakpoint (768px–1023px)", () => {
    setupMatchMedia(false, true, false);
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.breakpoint).toBe("tablet");
  });

  it("detects desktop breakpoint (≥ 1024px)", () => {
    setupMatchMedia(false, false, true);
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.breakpoint).toBe("desktop");
  });

  it("returns all three boolean flags and a valid breakpoint string", () => {
    setupMatchMedia(false, false, true);
    const { result } = renderHook(() => useBreakpoint());
    const { isMobile, isTablet, isDesktop, breakpoint } = result.current;
    expect(typeof isMobile).toBe("boolean");
    expect(typeof isTablet).toBe("boolean");
    expect(typeof isDesktop).toBe("boolean");
    expect(["mobile", "tablet", "desktop"]).toContain(breakpoint);
  });

  it("breakpoint is 'desktop' when no query matches (all false)", () => {
    // isMobile=false → not mobile; isTablet=false → not tablet → falls through to 'desktop'
    setupMatchMedia(false, false, false);
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.breakpoint).toBe("desktop");
  });
});
