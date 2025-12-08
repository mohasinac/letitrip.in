import { act, renderHook, waitFor } from "@testing-library/react";
import {
  useBreakpoint,
  useWindowHeight,
  useWindowResize,
  useWindowWidth,
} from "../useWindowResize";

describe("useWindowResize Hook", () => {
  // Store original window properties
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;

  beforeEach(() => {
    // Reset window size
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: 768,
    });
  });

  afterEach(() => {
    // Restore original values
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: originalInnerHeight,
    });
  });

  describe("Basic Functionality", () => {
    it("should return current window dimensions", () => {
      const { result } = renderHook(() => useWindowResize());

      expect(result.current.width).toBe(1024);
      expect(result.current.height).toBe(768);
    });

    it("should update dimensions on window resize", async () => {
      const { result } = renderHook(() => useWindowResize({ debounceMs: 50 }));

      act(() => {
        Object.defineProperty(window, "innerWidth", {
          writable: true,
          configurable: true,
          value: 1440,
        });
        Object.defineProperty(window, "innerHeight", {
          writable: true,
          configurable: true,
          value: 900,
        });
        window.dispatchEvent(new Event("resize"));
      });

      await waitFor(
        () => {
          expect(result.current.width).toBe(1440);
          expect(result.current.height).toBe(900);
        },
        { timeout: 200 }
      );
    });

    it("should debounce resize events", async () => {
      const onResize = jest.fn();
      renderHook(() => useWindowResize({ debounceMs: 100, onResize }));

      act(() => {
        window.dispatchEvent(new Event("resize"));
        window.dispatchEvent(new Event("resize"));
        window.dispatchEvent(new Event("resize"));
      });

      // Should not call immediately
      expect(onResize).not.toHaveBeenCalled();

      // Should call once after debounce
      await waitFor(() => expect(onResize).toHaveBeenCalledTimes(1), {
        timeout: 200,
      });
    });
  });

  describe("Breakpoint Detection", () => {
    it("should detect mobile breakpoint", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 500,
      });

      const { result } = renderHook(() => useWindowResize());

      expect(result.current.isMobile).toBe(true);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(false);
      expect(result.current.isLargeDesktop).toBe(false);
    });

    it("should detect tablet breakpoint", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 900,
      });

      const { result } = renderHook(() => useWindowResize());

      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(true);
      expect(result.current.isDesktop).toBe(false);
      expect(result.current.isLargeDesktop).toBe(false);
    });

    it("should detect desktop breakpoint", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1100,
      });

      const { result } = renderHook(() => useWindowResize());

      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(true);
      expect(result.current.isLargeDesktop).toBe(false);
    });

    it("should detect large desktop breakpoint", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1920,
      });

      const { result } = renderHook(() => useWindowResize());

      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(false);
      expect(result.current.isLargeDesktop).toBe(true);
    });

    it("should use custom breakpoints", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 700,
      });

      const { result } = renderHook(() =>
        useWindowResize({
          mobileBreakpoint: 640,
          tabletBreakpoint: 1024,
        })
      );

      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(true);
    });
  });

  describe("Callbacks", () => {
    it("should call onResize callback", async () => {
      const onResize = jest.fn();
      renderHook(() => useWindowResize({ debounceMs: 50, onResize }));

      act(() => {
        Object.defineProperty(window, "innerWidth", {
          writable: true,
          configurable: true,
          value: 1200,
        });
        window.dispatchEvent(new Event("resize"));
      });

      await waitFor(() => {
        expect(onResize).toHaveBeenCalledWith({
          width: 1200,
          height: 768,
        });
      });
    });

    it("should call onResize with updated dimensions", async () => {
      const onResize = jest.fn();
      renderHook(() => useWindowResize({ debounceMs: 50, onResize }));

      act(() => {
        Object.defineProperty(window, "innerWidth", {
          writable: true,
          configurable: true,
          value: 1600,
        });
        Object.defineProperty(window, "innerHeight", {
          writable: true,
          configurable: true,
          value: 1000,
        });
        window.dispatchEvent(new Event("resize"));
      });

      await waitFor(() => {
        expect(onResize).toHaveBeenCalledWith({
          width: 1600,
          height: 1000,
        });
      });
    });
  });

  describe("Cleanup", () => {
    it("should remove event listener on unmount", () => {
      const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");
      const { unmount } = renderHook(() => useWindowResize());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "resize",
        expect.any(Function)
      );
    });

    it("should clear timeout on unmount", async () => {
      const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");
      const { unmount } = renderHook(() =>
        useWindowResize({ debounceMs: 100 })
      );

      act(() => {
        window.dispatchEvent(new Event("resize"));
      });

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });

  describe("Options", () => {
    it("should use custom debounce delay", async () => {
      const onResize = jest.fn();
      renderHook(() => useWindowResize({ debounceMs: 300, onResize }));

      act(() => {
        window.dispatchEvent(new Event("resize"));
      });

      // Should not call before debounce time
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(onResize).not.toHaveBeenCalled();

      // Should call after debounce time
      await waitFor(() => expect(onResize).toHaveBeenCalledTimes(1), {
        timeout: 400,
      });
    });

    it("should handle zero debounce", async () => {
      const onResize = jest.fn();
      renderHook(() => useWindowResize({ debounceMs: 0, onResize }));

      act(() => {
        window.dispatchEvent(new Event("resize"));
      });

      await waitFor(() => expect(onResize).toHaveBeenCalledTimes(1));
    });
  });

  describe("Simplified Hooks", () => {
    describe("useWindowWidth", () => {
      it("should return only width", () => {
        Object.defineProperty(window, "innerWidth", {
          writable: true,
          configurable: true,
          value: 1440,
        });

        const { result } = renderHook(() => useWindowWidth());

        expect(result.current).toBe(1440);
      });

      it("should update width on resize", async () => {
        const { result } = renderHook(() => useWindowWidth(50));

        act(() => {
          Object.defineProperty(window, "innerWidth", {
            writable: true,
            configurable: true,
            value: 1920,
          });
          window.dispatchEvent(new Event("resize"));
        });

        await waitFor(() => expect(result.current).toBe(1920), {
          timeout: 200,
        });
      });
    });

    describe("useWindowHeight", () => {
      it("should return only height", () => {
        Object.defineProperty(window, "innerHeight", {
          writable: true,
          configurable: true,
          value: 900,
        });

        const { result } = renderHook(() => useWindowHeight());

        expect(result.current).toBe(900);
      });

      it("should update height on resize", async () => {
        const { result } = renderHook(() => useWindowHeight(50));

        act(() => {
          Object.defineProperty(window, "innerHeight", {
            writable: true,
            configurable: true,
            value: 1080,
          });
          window.dispatchEvent(new Event("resize"));
        });

        await waitFor(() => expect(result.current).toBe(1080), {
          timeout: 200,
        });
      });
    });

    describe("useBreakpoint", () => {
      it("should return only breakpoint booleans", () => {
        Object.defineProperty(window, "innerWidth", {
          writable: true,
          configurable: true,
          value: 900,
        });

        const { result } = renderHook(() => useBreakpoint());

        expect(result.current).toEqual({
          isMobile: false,
          isTablet: true,
          isDesktop: false,
          isLargeDesktop: false,
        });
      });

      it("should update breakpoints on resize", async () => {
        const { result } = renderHook(() => useBreakpoint({ debounceMs: 50 }));

        act(() => {
          Object.defineProperty(window, "innerWidth", {
            writable: true,
            configurable: true,
            value: 500,
          });
          window.dispatchEvent(new Event("resize"));
        });

        await waitFor(
          () => {
            expect(result.current.isMobile).toBe(true);
            expect(result.current.isTablet).toBe(false);
          },
          { timeout: 200 }
        );
      });
    });
  });
});
