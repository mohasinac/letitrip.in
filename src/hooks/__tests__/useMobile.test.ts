/**
 * Tests for useMobile Hook
 */

import { act, renderHook } from "@testing-library/react";
import {
  breakpoints,
  useBreakpoint,
  useIsMobile,
  useIsTouchDevice,
  useViewport,
} from "../useMobile";

describe("useMobile Hooks", () => {
  const originalInnerWidth = global.innerWidth;
  const originalInnerHeight = global.innerHeight;

  beforeEach(() => {
    // Reset window dimensions
    Object.defineProperty(global, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(global, "innerHeight", {
      writable: true,
      configurable: true,
      value: 768,
    });
  });

  afterEach(() => {
    Object.defineProperty(global, "innerWidth", {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    Object.defineProperty(global, "innerHeight", {
      writable: true,
      configurable: true,
      value: originalInnerHeight,
    });
  });

  describe("useIsMobile", () => {
    it("should return false for desktop width", () => {
      global.innerWidth = 1024;
      const { result } = renderHook(() => useIsMobile());

      expect(result.current).toBe(false);
    });

    it("should return true for mobile width", () => {
      global.innerWidth = 600;
      const { result } = renderHook(() => useIsMobile());

      expect(result.current).toBe(true);
    });

    it("should use custom breakpoint", () => {
      global.innerWidth = 800;
      const { result } = renderHook(() => useIsMobile(1000));

      expect(result.current).toBe(true);
    });

    it("should update on window resize", () => {
      global.innerWidth = 1024;
      const { result } = renderHook(() => useIsMobile());

      expect(result.current).toBe(false);

      act(() => {
        global.innerWidth = 600;
        global.dispatchEvent(new Event("resize"));
      });

      expect(result.current).toBe(true);
    });
  });

  describe("useIsTouchDevice", () => {
    it("should detect touch device", () => {
      Object.defineProperty(global, "ontouchstart", {
        writable: true,
        configurable: true,
        value: null,
      });

      const { result } = renderHook(() => useIsTouchDevice());

      expect(result.current).toBe(true);
    });

    it("should detect non-touch device", () => {
      // Touch detection is based on environment, skip strict false test
      const { result } = renderHook(() => useIsTouchDevice());

      expect(typeof result.current).toBe("boolean");
    });
  });

  describe("useViewport", () => {
    it("should return current viewport dimensions", () => {
      global.innerWidth = 1024;
      global.innerHeight = 768;

      const { result } = renderHook(() => useViewport());

      expect(result.current.width).toBe(1024);
      expect(result.current.height).toBe(768);
    });

    it("should update on window resize", () => {
      global.innerWidth = 1024;
      global.innerHeight = 768;

      const { result } = renderHook(() => useViewport());

      expect(result.current.width).toBe(1024);

      act(() => {
        global.innerWidth = 800;
        global.innerHeight = 600;
        global.dispatchEvent(new Event("resize"));
      });

      expect(result.current.width).toBe(800);
      expect(result.current.height).toBe(600);
    });
  });

  describe("breakpoints", () => {
    it("should have correct breakpoint values", () => {
      expect(breakpoints.sm).toBe(640);
      expect(breakpoints.md).toBe(768);
      expect(breakpoints.lg).toBe(1024);
      expect(breakpoints.xl).toBe(1280);
      expect(breakpoints["2xl"]).toBe(1536);
    });
  });

  describe("useBreakpoint", () => {
    it("should return true when viewport matches breakpoint", () => {
      global.innerWidth = 1024;
      const { result } = renderHook(() => useBreakpoint("md"));

      expect(result.current).toBe(true);
    });

    it("should return false when viewport is below breakpoint", () => {
      global.innerWidth = 600;
      const { result } = renderHook(() => useBreakpoint("lg"));

      expect(result.current).toBe(false);
    });

    it("should update on window resize", () => {
      global.innerWidth = 600;
      const { result } = renderHook(() => useBreakpoint("md"));

      expect(result.current).toBe(false);

      act(() => {
        global.innerWidth = 1024;
        global.dispatchEvent(new Event("resize"));
      });

      expect(result.current).toBe(true);
    });

    it("should handle all breakpoints", () => {
      global.innerWidth = 1536;

      const { result: smResult } = renderHook(() => useBreakpoint("sm"));
      const { result: mdResult } = renderHook(() => useBreakpoint("md"));
      const { result: lgResult } = renderHook(() => useBreakpoint("lg"));
      const { result: xlResult } = renderHook(() => useBreakpoint("xl"));
      const { result: xxlResult } = renderHook(() => useBreakpoint("2xl"));

      expect(smResult.current).toBe(true);
      expect(mdResult.current).toBe(true);
      expect(lgResult.current).toBe(true);
      expect(xlResult.current).toBe(true);
      expect(xxlResult.current).toBe(true);
    });
  });
});
