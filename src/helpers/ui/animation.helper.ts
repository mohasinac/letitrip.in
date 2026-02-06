/**
 * Animation Helpers
 *
 * UI helpers for animations and transitions
 */

/**
 * Easing functions for animations
 */
export const easings = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => --t * t * t + 1,
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInQuart: (t: number) => t * t * t * t,
  easeOutQuart: (t: number) => 1 - --t * t * t * t,
  easeInOutQuart: (t: number) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,
};

/**
 * Animate value over time
 */
export function animate(
  from: number,
  to: number,
  duration: number,
  onUpdate: (value: number) => void,
  easing: (t: number) => number = easings.easeInOutQuad,
): () => void {
  const startTime = Date.now();
  let animationFrame: number;

  const step = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easing(progress);
    const currentValue = from + (to - from) * easedProgress;

    onUpdate(currentValue);

    if (progress < 1) {
      animationFrame = requestAnimationFrame(step);
    }
  };

  animationFrame = requestAnimationFrame(step);

  // Return cancel function
  return () => cancelAnimationFrame(animationFrame);
}

/**
 * Stagger animations for multiple elements
 */
export function stagger(
  elements: HTMLElement[],
  animationFn: (element: HTMLElement, index: number) => void,
  delay: number = 100,
): void {
  elements.forEach((element, index) => {
    setTimeout(() => {
      animationFn(element, index);
    }, index * delay);
  });
}

/**
 * Fade in element
 */
export function fadeIn(
  element: HTMLElement,
  duration: number = 300,
): Promise<void> {
  return new Promise((resolve) => {
    element.style.opacity = "0";
    element.style.transition = `opacity ${duration}ms ease-in-out`;

    requestAnimationFrame(() => {
      element.style.opacity = "1";
      setTimeout(() => resolve(), duration);
    });
  });
}

/**
 * Fade out element
 */
export function fadeOut(
  element: HTMLElement,
  duration: number = 300,
): Promise<void> {
  return new Promise((resolve) => {
    element.style.transition = `opacity ${duration}ms ease-in-out`;
    element.style.opacity = "0";
    setTimeout(() => resolve(), duration);
  });
}

/**
 * Slide element
 */
export function slide(
  element: HTMLElement,
  direction: "up" | "down" | "left" | "right",
  duration: number = 300,
): Promise<void> {
  return new Promise((resolve) => {
    const transform = {
      up: "translateY(-100%)",
      down: "translateY(100%)",
      left: "translateX(-100%)",
      right: "translateX(100%)",
    }[direction];

    element.style.transition = `transform ${duration}ms ease-in-out`;
    element.style.transform = transform;

    setTimeout(() => resolve(), duration);
  });
}
