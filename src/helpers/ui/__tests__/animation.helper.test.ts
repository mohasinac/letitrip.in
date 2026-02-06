/**
 * Animation Helper Tests
 *
 * Tests for animation and transition functions
 */

import {
  easings,
  animate,
  stagger,
  fadeIn,
  fadeOut,
  slide,
} from "../animation.helper";

describe("easings", () => {
  test("should have all easing functions", () => {
    expect(easings.linear).toBeDefined();
    expect(easings.easeInQuad).toBeDefined();
    expect(easings.easeOutQuad).toBeDefined();
    expect(easings.easeInOutQuad).toBeDefined();
    expect(easings.easeInCubic).toBeDefined();
    expect(easings.easeOutCubic).toBeDefined();
    expect(easings.easeInOutCubic).toBeDefined();
    expect(easings.easeInQuart).toBeDefined();
    expect(easings.easeOutQuart).toBeDefined();
    expect(easings.easeInOutQuart).toBeDefined();
  });

  describe("linear", () => {
    test("should return input value", () => {
      expect(easings.linear(0)).toBe(0);
      expect(easings.linear(0.5)).toBe(0.5);
      expect(easings.linear(1)).toBe(1);
    });
  });

  describe("easeInQuad", () => {
    test("should accelerate from zero", () => {
      expect(easings.easeInQuad(0)).toBe(0);
      expect(easings.easeInQuad(0.5)).toBe(0.25);
      expect(easings.easeInQuad(1)).toBe(1);
    });

    test("should have gradual start", () => {
      expect(easings.easeInQuad(0.1)).toBeLessThan(0.1);
    });
  });

  describe("easeOutQuad", () => {
    test("should decelerate to target", () => {
      expect(easings.easeOutQuad(0)).toBe(0);
      expect(easings.easeOutQuad(0.5)).toBe(0.75);
      expect(easings.easeOutQuad(1)).toBe(1);
    });

    test("should have gradual end", () => {
      expect(easings.easeOutQuad(0.9)).toBeGreaterThan(0.9);
    });
  });

  describe("easeInOutQuad", () => {
    test("should ease in and out", () => {
      expect(easings.easeInOutQuad(0)).toBe(0);
      expect(easings.easeInOutQuad(0.5)).toBe(0.5);
      expect(easings.easeInOutQuad(1)).toBe(1);
    });

    test("should accelerate then decelerate", () => {
      const t1 = easings.easeInOutQuad(0.25);
      const t2 = easings.easeInOutQuad(0.75);
      expect(t1).toBeLessThan(0.25);
      expect(t2).toBeGreaterThan(0.75);
    });
  });

  describe("easeInCubic", () => {
    test("should have cubic acceleration", () => {
      expect(easings.easeInCubic(0)).toBe(0);
      expect(easings.easeInCubic(0.5)).toBe(0.125);
      expect(easings.easeInCubic(1)).toBe(1);
    });
  });

  describe("easeOutCubic", () => {
    test("should have cubic deceleration", () => {
      expect(easings.easeOutCubic(0)).toBe(0);
      expect(easings.easeOutCubic(1)).toBe(1);
    });
  });

  describe("easeInOutCubic", () => {
    test("should ease in and out with cubic curve", () => {
      expect(easings.easeInOutCubic(0)).toBe(0);
      expect(easings.easeInOutCubic(0.5)).toBe(0.5);
      expect(easings.easeInOutCubic(1)).toBe(1);
    });
  });

  describe("easeInQuart", () => {
    test("should have quartic acceleration", () => {
      expect(easings.easeInQuart(0)).toBe(0);
      expect(easings.easeInQuart(0.5)).toBe(0.0625);
      expect(easings.easeInQuart(1)).toBe(1);
    });
  });

  describe("easeOutQuart", () => {
    test("should have quartic deceleration", () => {
      expect(easings.easeOutQuart(0)).toBe(0);
      expect(easings.easeOutQuart(1)).toBe(1);
    });
  });

  describe("easeInOutQuart", () => {
    test("should ease in and out with quartic curve", () => {
      expect(easings.easeInOutQuart(0)).toBe(0);
      expect(easings.easeInOutQuart(0.5)).toBe(0.5);
      expect(easings.easeInOutQuart(1)).toBe(1);
    });
  });
});

describe("animate", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    global.requestAnimationFrame = jest.fn((cb) => {
      setTimeout(cb, 16);
      return 1;
    }) as any;
    global.cancelAnimationFrame = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("should call onUpdate with interpolated values", () => {
    const onUpdate = jest.fn();
    animate(0, 100, 1000, onUpdate);

    jest.advanceTimersByTime(500);
    expect(onUpdate).toHaveBeenCalled();
  });

  test("should return cancel function", () => {
    const onUpdate = jest.fn();
    const cancel = animate(0, 100, 1000, onUpdate);

    expect(typeof cancel).toBe("function");
    cancel();
    expect(global.cancelAnimationFrame).toHaveBeenCalled();
  });

  test("should animate from start to end value", () => {
    const onUpdate = jest.fn();
    const from = 0;
    const to = 100;

    animate(from, to, 1000, onUpdate);

    jest.advanceTimersByTime(16);
    const firstCall = onUpdate.mock.calls[0][0];
    expect(firstCall).toBeGreaterThanOrEqual(from);
    expect(firstCall).toBeLessThanOrEqual(to);
  });

  test("should use custom easing function", () => {
    const onUpdate = jest.fn();
    const customEasing = jest.fn((t) => t * t);

    animate(0, 100, 1000, onUpdate, customEasing);

    jest.advanceTimersByTime(16);
    expect(customEasing).toHaveBeenCalled();
  });

  test("should reach target value at end of duration", () => {
    const onUpdate = jest.fn();
    const to = 100;

    animate(0, to, 1000, onUpdate);

    jest.advanceTimersByTime(1016); // Duration + one frame
    const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0];
    expect(lastCall).toBe(to);
  });

  test("should handle negative values", () => {
    const onUpdate = jest.fn();
    animate(-50, 50, 1000, onUpdate);

    jest.advanceTimersByTime(16);
    expect(onUpdate).toHaveBeenCalled();
  });
});

describe("stagger", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("should call animation function for each element with delay", () => {
    const elements = [
      document.createElement("div"),
      document.createElement("div"),
      document.createElement("div"),
    ];
    const animationFn = jest.fn();

    stagger(elements, animationFn, 100);

    expect(animationFn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(0);
    expect(animationFn).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(100);
    expect(animationFn).toHaveBeenCalledTimes(2);

    jest.advanceTimersByTime(100);
    expect(animationFn).toHaveBeenCalledTimes(3);
  });

  test("should pass element and index to animation function", () => {
    const elements = [
      document.createElement("div"),
      document.createElement("div"),
    ];
    const animationFn = jest.fn();

    stagger(elements, animationFn, 100);

    jest.advanceTimersByTime(0);
    expect(animationFn).toHaveBeenCalledWith(elements[0], 0);

    jest.advanceTimersByTime(100);
    expect(animationFn).toHaveBeenCalledWith(elements[1], 1);
  });

  test("should use default delay of 100ms", () => {
    const elements = [
      document.createElement("div"),
      document.createElement("div"),
    ];
    const animationFn = jest.fn();

    stagger(elements, animationFn);

    jest.advanceTimersByTime(0);
    expect(animationFn).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(100);
    expect(animationFn).toHaveBeenCalledTimes(2);
  });

  test("should handle empty element array", () => {
    const animationFn = jest.fn();
    stagger([], animationFn, 100);

    jest.advanceTimersByTime(1000);
    expect(animationFn).not.toHaveBeenCalled();
  });

  test("should handle single element", () => {
    const elements = [document.createElement("div")];
    const animationFn = jest.fn();

    stagger(elements, animationFn, 100);

    jest.advanceTimersByTime(0);
    expect(animationFn).toHaveBeenCalledTimes(1);
  });
});

describe("fadeIn", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    global.requestAnimationFrame = jest.fn((cb) => {
      setTimeout(cb, 16);
      return 1;
    }) as any;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("should set opacity to 0 initially", () => {
    const element = document.createElement("div");
    fadeIn(element, 300);

    expect(element.style.opacity).toBe("0");
  });

  test("should set transition property", () => {
    const element = document.createElement("div");
    fadeIn(element, 300);

    expect(element.style.transition).toBe("opacity 300ms ease-in-out");
  });

  test("should animate opacity to 1", () => {
    const element = document.createElement("div");
    fadeIn(element, 300);

    jest.advanceTimersByTime(16);
    expect(element.style.opacity).toBe("1");
  });

  test("should resolve promise after duration", async () => {
    const element = document.createElement("div");
    const promise = fadeIn(element, 300);

    jest.advanceTimersByTime(316); // Duration + one frame
    await promise;
    // If we reach here, promise resolved
    expect(true).toBe(true);
  });

  test("should use default duration of 300ms", () => {
    const element = document.createElement("div");
    fadeIn(element);

    expect(element.style.transition).toBe("opacity 300ms ease-in-out");
  });
});

describe("fadeOut", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("should set transition property", () => {
    const element = document.createElement("div");
    element.style.opacity = "1";
    fadeOut(element, 300);

    expect(element.style.transition).toBe("opacity 300ms ease-in-out");
  });

  test("should set opacity to 0", () => {
    const element = document.createElement("div");
    element.style.opacity = "1";
    fadeOut(element, 300);

    expect(element.style.opacity).toBe("0");
  });

  test("should resolve promise after duration", async () => {
    const element = document.createElement("div");
    const promise = fadeOut(element, 300);

    jest.advanceTimersByTime(300);
    await expect(promise).resolves.toBeUndefined();
  });

  test("should use default duration of 300ms", () => {
    const element = document.createElement("div");
    fadeOut(element);

    expect(element.style.transition).toBe("opacity 300ms ease-in-out");
  });
});

describe("slide", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("should slide up", () => {
    const element = document.createElement("div");
    slide(element, "up", 300);

    expect(element.style.transform).toBe("translateY(-100%)");
    expect(element.style.transition).toBe("transform 300ms ease-in-out");
  });

  test("should slide down", () => {
    const element = document.createElement("div");
    slide(element, "down", 300);

    expect(element.style.transform).toBe("translateY(100%)");
  });

  test("should slide left", () => {
    const element = document.createElement("div");
    slide(element, "left", 300);

    expect(element.style.transform).toBe("translateX(-100%)");
  });

  test("should slide right", () => {
    const element = document.createElement("div");
    slide(element, "right", 300);

    expect(element.style.transform).toBe("translateX(100%)");
  });

  test("should resolve promise after duration", async () => {
    const element = document.createElement("div");
    const promise = slide(element, "up", 300);

    jest.advanceTimersByTime(300);
    await expect(promise).resolves.toBeUndefined();
  });

  test("should use default duration of 300ms", () => {
    const element = document.createElement("div");
    slide(element, "up");

    expect(element.style.transition).toBe("transform 300ms ease-in-out");
  });

  test("should handle all directions", () => {
    const element = document.createElement("div");

    slide(element, "up", 100);
    expect(element.style.transform).toBe("translateY(-100%)");

    slide(element, "down", 100);
    expect(element.style.transform).toBe("translateY(100%)");

    slide(element, "left", 100);
    expect(element.style.transform).toBe("translateX(-100%)");

    slide(element, "right", 100);
    expect(element.style.transform).toBe("translateX(100%)");
  });
});
