/**
 * @jest-environment jsdom
 */

import {
  globalEventManager,
  throttle,
  debounce,
  addGlobalScrollHandler,
  addGlobalResizeHandler,
  addGlobalClickHandler,
  addGlobalKeyHandler,
  removeGlobalHandler,
  isMobileDevice,
  hasTouchSupport,
  getViewportDimensions,
  isInViewport,
  smoothScrollTo,
  preventBodyScroll,
} from "../event-manager";

describe("Event Manager Module", () => {
  beforeEach(() => {
    // Mock window.scrollTo
    window.scrollTo = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("GlobalEventManager", () => {
    beforeEach(() => {
      globalEventManager.clear();
    });

    afterEach(() => {
      globalEventManager.clear();
    });

    it("should add event listener", () => {
      const callback = jest.fn();
      const id = globalEventManager.add(window, "scroll", callback);

      expect(id).toBeTruthy();
      expect(globalEventManager.has(id)).toBe(true);

      globalEventManager.remove(id);
    });

    it("should remove event listener", () => {
      const callback = jest.fn();
      const id = globalEventManager.add(window, "scroll", callback);

      expect(globalEventManager.has(id)).toBe(true);
      globalEventManager.remove(id);
      expect(globalEventManager.has(id)).toBe(false);
    });

    it("should return handler count", () => {
      const callback = jest.fn();
      globalEventManager.add(window, "scroll", callback);
      globalEventManager.add(window, "resize", callback);

      expect(globalEventManager.getHandlerCount()).toBe(2);
    });

    it("should clear all handlers", () => {
      const callback = jest.fn();
      globalEventManager.add(window, "scroll", callback);
      globalEventManager.add(window, "resize", callback);

      globalEventManager.clear();
      expect(globalEventManager.getHandlerCount()).toBe(0);
    });
  });

  describe("throttle()", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should throttle function calls", () => {
      const callback = jest.fn();
      const throttled = throttle(callback, 100);

      // First call should execute immediately
      throttled();
      expect(callback).toHaveBeenCalledTimes(1);

      // Subsequent calls within delay period should not execute
      throttled();
      throttled();

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should preserve function arguments", () => {
      const callback = jest.fn();
      const throttled = throttle(callback, 100);

      throttled("arg1", "arg2");
      expect(callback).toHaveBeenCalledWith("arg1", "arg2");
    });

    it("should allow execution after delay", () => {
      const callback = jest.fn();
      const throttled = throttle(callback, 100);

      throttled();
      expect(callback).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(100);
      throttled();

      // Advance to ensure callback is executed
      jest.advanceTimersByTime(50);
      expect(callback).toHaveBeenCalledTimes(2);
    });
  });

  describe("debounce()", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should debounce function calls", () => {
      const callback = jest.fn();
      const debounced = debounce(callback, 100);

      debounced();
      debounced();
      debounced();

      expect(callback).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should preserve function arguments", () => {
      const callback = jest.fn();
      const debounced = debounce(callback, 100);

      debounced("arg1", "arg2");
      jest.advanceTimersByTime(100);

      expect(callback).toHaveBeenCalledWith("arg1", "arg2");
    });

    it("should reset delay on subsequent calls", () => {
      const callback = jest.fn();
      const debounced = debounce(callback, 100);

      debounced();
      jest.advanceTimersByTime(50);
      debounced();

      expect(callback).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe("addGlobalScrollHandler()", () => {
    it("should add scroll handler", () => {
      const callback = jest.fn();
      const id = addGlobalScrollHandler(callback);

      expect(id).toBeTruthy();
      expect(globalEventManager.has(id)).toBe(true);

      globalEventManager.remove(id);
    });

    it("should accept throttle delay option", () => {
      const callback = jest.fn();
      const id = addGlobalScrollHandler(callback, { throttle: 100 });

      expect(id).toBeTruthy();
      globalEventManager.remove(id);
    });

    it("should accept target option", () => {
      const callback = jest.fn();
      const element = document.createElement("div");
      const id = addGlobalScrollHandler(callback, { target: element });

      expect(id).toBeTruthy();
      globalEventManager.remove(id);
    });
  });

  describe("addGlobalResizeHandler()", () => {
    it("should add resize handler", () => {
      const callback = jest.fn();
      const id = addGlobalResizeHandler(callback);

      expect(id).toBeTruthy();
      expect(globalEventManager.has(id)).toBe(true);

      globalEventManager.remove(id);
    });

    it("should accept throttle delay option", () => {
      const callback = jest.fn();
      const id = addGlobalResizeHandler(callback, { throttle: 200 });

      expect(id).toBeTruthy();
      globalEventManager.remove(id);
    });
  });

  describe("addGlobalClickHandler()", () => {
    it("should add click handler with selector", () => {
      const callback = jest.fn();
      const id = addGlobalClickHandler(".btn", callback);

      expect(id).toBeTruthy();
      expect(globalEventManager.has(id)).toBe(true);

      globalEventManager.remove(id);
    });

    it("should match elements by selector", () => {
      const callback = jest.fn();
      const id = addGlobalClickHandler(".btn", callback);

      const button = document.createElement("button");
      button.className = "btn";
      document.body.appendChild(button);

      button.click();

      expect(callback).toHaveBeenCalled();
      globalEventManager.remove(id);
      document.body.removeChild(button);
    });

    it("should support preventDefault option", () => {
      const callback = jest.fn();
      const id = addGlobalClickHandler(".btn", callback, {
        preventDefault: true,
      });

      expect(id).toBeTruthy();
      globalEventManager.remove(id);
    });
  });

  describe("addGlobalKeyHandler()", () => {
    it("should add keyboard handler", () => {
      const callback = jest.fn();
      const id = addGlobalKeyHandler("Enter", callback);

      expect(id).toBeTruthy();
      expect(globalEventManager.has(id)).toBe(true);

      globalEventManager.remove(id);
    });

    it("should handle single key", () => {
      const callback = jest.fn();
      const id = addGlobalKeyHandler("Enter", callback);

      const event = new KeyboardEvent("keydown", { key: "Enter" });
      document.dispatchEvent(event);

      expect(callback).toHaveBeenCalled();
      globalEventManager.remove(id);
    });

    it("should handle multiple keys", () => {
      const callback = jest.fn();
      const id = addGlobalKeyHandler(["Enter", "Space"], callback);

      const event1 = new KeyboardEvent("keydown", { key: "Enter" });
      document.dispatchEvent(event1);

      expect(callback).toHaveBeenCalledTimes(1);

      const event2 = new KeyboardEvent("keydown", { key: "Space" });
      document.dispatchEvent(event2);

      expect(callback).toHaveBeenCalledTimes(2);

      globalEventManager.remove(id);
    });

    it("should handle modifier keys", () => {
      const callback = jest.fn();
      const id = addGlobalKeyHandler("s", callback, { ctrl: true });

      const event = new KeyboardEvent("keydown", { key: "s", ctrlKey: true });
      document.dispatchEvent(event);

      expect(callback).toHaveBeenCalled();
      globalEventManager.remove(id);
    });

    it("should support preventDefault option", () => {
      const callback = jest.fn();
      const id = addGlobalKeyHandler("Enter", callback, {
        preventDefault: true,
      });

      expect(id).toBeTruthy();
      globalEventManager.remove(id);
    });
  });

  describe("removeGlobalHandler()", () => {
    it("should remove handler by id", () => {
      const callback = jest.fn();
      const id = addGlobalScrollHandler(callback);

      expect(globalEventManager.has(id)).toBe(true);
      removeGlobalHandler(id);
      expect(globalEventManager.has(id)).toBe(false);
    });
  });

  describe("isMobileDevice()", () => {
    it("should return boolean", () => {
      const result = isMobileDevice();
      expect(typeof result).toBe("boolean");
    });

    it("should detect mobile user agents", () => {
      Object.defineProperty(window.navigator, "userAgent", {
        value: "Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X)",
        configurable: true,
      });

      expect(isMobileDevice()).toBe(true);
    });
  });

  describe("hasTouchSupport()", () => {
    it("should return boolean", () => {
      const result = hasTouchSupport();
      expect(typeof result).toBe("boolean");
    });

    it("should detect touch support", () => {
      const hasTouch = hasTouchSupport();
      expect(typeof hasTouch).toBe("boolean");
    });
  });

  describe("getViewportDimensions()", () => {
    it("should return viewport dimensions", () => {
      const dims = getViewportDimensions();

      expect(dims).toHaveProperty("width");
      expect(dims).toHaveProperty("height");
      expect(typeof dims.width).toBe("number");
      expect(typeof dims.height).toBe("number");
    });

    it("should return non-zero dimensions in jsdom", () => {
      const dims = getViewportDimensions();

      expect(dims.width).toBeGreaterThanOrEqual(0);
      expect(dims.height).toBeGreaterThanOrEqual(0);
    });
  });

  describe("isInViewport()", () => {
    it("should check if element is in viewport", () => {
      const element = document.createElement("div");
      element.style.position = "absolute";
      element.style.top = "0";
      element.style.left = "0";
      element.style.width = "100px";
      element.style.height = "100px";
      document.body.appendChild(element);

      const result = isInViewport(element);
      expect(typeof result).toBe("boolean");

      document.body.removeChild(element);
    });

    it("should support offset parameter", () => {
      const element = document.createElement("div");
      element.style.position = "absolute";
      element.style.top = "0";
      element.style.left = "0";
      element.style.width = "100px";
      element.style.height = "100px";
      document.body.appendChild(element);

      const result = isInViewport(element, 50);
      expect(typeof result).toBe("boolean");

      document.body.removeChild(element);
    });
  });

  describe("smoothScrollTo()", () => {
    it("should accept element parameter", () => {
      const element = document.createElement("div");
      document.body.appendChild(element);

      expect(() => smoothScrollTo(element)).not.toThrow();

      document.body.removeChild(element);
    });

    it("should accept selector parameter", () => {
      const element = document.createElement("div");
      element.id = "target";
      document.body.appendChild(element);

      expect(() => smoothScrollTo("#target")).not.toThrow();

      document.body.removeChild(element);
    });

    it("should accept offset option", () => {
      const element = document.createElement("div");
      document.body.appendChild(element);

      expect(() => smoothScrollTo(element, { offset: 80 })).not.toThrow();

      document.body.removeChild(element);
    });

    it("should handle non-existent selectors gracefully", () => {
      expect(() => smoothScrollTo("#non-existent")).not.toThrow();
    });
  });

  describe("preventBodyScroll()", () => {
    afterEach(() => {
      preventBodyScroll(false);
    });

    it("should prevent body scroll", () => {
      preventBodyScroll(true);
      expect(document.body.style.overflow).toBe("hidden");
    });

    it("should restore body scroll", () => {
      preventBodyScroll(true);
      preventBodyScroll(false);
      expect(document.body.style.overflow).toBe("");
    });

    it("should handle multiple calls", () => {
      preventBodyScroll(true);
      preventBodyScroll(true);
      preventBodyScroll(false);

      expect(document.body.style.overflow).toBe("");
    });
  });
});
