/// <reference types="@testing-library/jest-dom" />

import { renderHook, act } from "@testing-library/react";
import {
  useIsMobile,
  useIsTouchDevice,
  useViewport,
  useBreakpoint,
  useDeviceType,
  isIOS,
  isAndroid,
  getDeviceType,
} from "./useMobile";

// Mock window and navigator
const mockInnerWidth = 1024;
const mockInnerHeight = 768;

Object.defineProperty(window, "innerWidth", {
  writable: true,
  value: mockInnerWidth,
});

Object.defineProperty(window, "innerHeight", {
  writable: true,
  value: mockInnerHeight,
});

Object.defineProperty(navigator, "userAgent", {
  writable: true,
  value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
});

Object.defineProperty(navigator, "maxTouchPoints", {
  writable: true,
  value: 0,
});

describe("useMobile", () => {
  beforeEach(() => {
    // Reset window dimensions
    (window as any).innerWidth = 1024;
    (window as any).innerHeight = 768;
    (navigator as any).userAgent =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
    (navigator as any).maxTouchPoints = 0;
    // Ensure no touch events
    delete (window as any).ontouchstart;
  });

  describe("useIsMobile", () => {
    it("returns false for desktop width", () => {
      (window as any).innerWidth = 1024;
      const { result } = renderHook(() => useIsMobile());

      expect(result.current).toBe(false);
    });

    it("returns true for mobile width", () => {
      (window as any).innerWidth = 600;
      const { result } = renderHook(() => useIsMobile());

      expect(result.current).toBe(true);
    });

    it("respects custom breakpoint", () => {
      (window as any).innerWidth = 900;
      const { result } = renderHook(() => useIsMobile(1000));

      expect(result.current).toBe(true);
    });

    it("updates on resize", () => {
      const { result } = renderHook(() => useIsMobile());

      act(() => {
        (window as any).innerWidth = 600;
        window.dispatchEvent(new Event("resize"));
      });

      expect(result.current).toBe(true);
    });
  });

  describe("useIsTouchDevice", () => {
    it("returns false for non-touch device", () => {
      const { result } = renderHook(() => useIsTouchDevice());

      expect(result.current).toBe(false);
    });

    it("returns true for touch device with ontouchstart", () => {
      (window as any).ontouchstart = () => {};
      const { result } = renderHook(() => useIsTouchDevice());

      expect(result.current).toBe(true);
      delete (window as any).ontouchstart;
    });

    it("returns true for touch device with maxTouchPoints", () => {
      (navigator as any).maxTouchPoints = 5;
      const { result } = renderHook(() => useIsTouchDevice());

      expect(result.current).toBe(true);
    });
  });

  describe("useViewport", () => {
    it("returns initial viewport", () => {
      const { result } = renderHook(() => useViewport());

      expect(result.current).toEqual({ width: 1024, height: 768 });
    });

    it("updates on resize", () => {
      const { result } = renderHook(() => useViewport());

      act(() => {
        (window as any).innerWidth = 800;
        (window as any).innerHeight = 600;
        window.dispatchEvent(new Event("resize"));
      });

      expect(result.current).toEqual({ width: 800, height: 600 });
    });
  });

  describe("useBreakpoint", () => {
    it("returns true when width meets breakpoint", () => {
      (window as any).innerWidth = 1200;
      const { result } = renderHook(() => useBreakpoint("lg"));

      expect(result.current).toBe(true);
    });

    it("returns false when width below breakpoint", () => {
      (window as any).innerWidth = 900;
      const { result } = renderHook(() => useBreakpoint("lg"));

      expect(result.current).toBe(false);
    });

    it("updates on resize", () => {
      const { result } = renderHook(() => useBreakpoint("md"));

      act(() => {
        (window as any).innerWidth = 700;
        window.dispatchEvent(new Event("resize"));
      });

      expect(result.current).toBe(false);
    });
  });

  describe("useDeviceType", () => {
    it("returns desktop for large width", () => {
      (window as any).innerWidth = 1200;
      const { result } = renderHook(() => useDeviceType());

      expect(result.current).toBe("desktop");
    });

    it("returns tablet for medium width", () => {
      (window as any).innerWidth = 900;
      const { result } = renderHook(() => useDeviceType());

      expect(result.current).toBe("tablet");
    });

    it("returns mobile for small width", () => {
      (window as any).innerWidth = 600;
      const { result } = renderHook(() => useDeviceType());

      expect(result.current).toBe("mobile");
    });

    it("updates on resize", () => {
      const { result } = renderHook(() => useDeviceType());

      act(() => {
        (window as any).innerWidth = 600;
        window.dispatchEvent(new Event("resize"));
      });

      expect(result.current).toBe("mobile");
    });
  });

  describe("Utility functions", () => {
    it("isIOS returns true for iOS user agent", () => {
      (navigator as any).userAgent =
        "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)";
      expect(isIOS()).toBe(true);
    });

    it("isIOS returns false for non-iOS user agent", () => {
      expect(isIOS()).toBe(false);
    });

    it("isAndroid returns true for Android user agent", () => {
      (navigator as any).userAgent =
        "Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36";
      expect(isAndroid()).toBe(true);
    });

    it("isAndroid returns false for non-Android user agent", () => {
      expect(isAndroid()).toBe(false);
    });

    it("getDeviceType returns desktop", () => {
      (window as any).innerWidth = 1200;
      expect(getDeviceType()).toBe("desktop");
    });

    it("getDeviceType returns tablet", () => {
      (window as any).innerWidth = 900;
      expect(getDeviceType()).toBe("tablet");
    });

    it("getDeviceType returns mobile", () => {
      (window as any).innerWidth = 600;
      expect(getDeviceType()).toBe("mobile");
    });

    it("returns desktop on server side", () => {
      // Mock server side
      const originalWindow = global.window;
      delete (global as any).window;

      expect(getDeviceType()).toBe("desktop");
      expect(isIOS()).toBe(false);
      expect(isAndroid()).toBe(false);

      global.window = originalWindow;
    });
  });
});
