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
 * Animates a value from start to end over a specified duration
 *
 * @param from - The starting value
 * @param to - The ending value
 * @param duration - Animation duration in milliseconds
 * @param onUpdate - Callback function called with the current value on each frame
 * @param easing - Easing function to apply (default: easeInOutQuad)
 * @returns A function to cancel the animation
 *
 * @example
 * ```typescript
 * const cancel = animate(0, 100, 1000, (value) => {
 *   element.style.opacity = value / 100;
 * });
 * // To cancel: cancel();
 * ```
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
 * Staggers animation execution across multiple elements with delay
 *
 * @param elements - Array of HTML elements to animate
 * @param animationFn - Function to call for each element
 * @param delay - Delay in milliseconds between each animation (default: 100)
 *
 * @example
 * ```typescript
 * const items = document.querySelectorAll('.list-item');
 * stagger(Array.from(items), (element, index) => {
 *   element.classList.add('fade-in');
 * }, 100);
 * ```
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
 * Fades an element in with a smooth transition
 *
 * @param element - The HTML element to fade in
 * @param duration - Animation duration in milliseconds (default: 300)
 * @returns A promise that resolves when the animation completes
 *
 * @example
 * ```typescript
 * const modal = document.querySelector('.modal');
 * await fadeIn(modal, 500);
 * console.log('Modal is now visible');
 * ```
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
 * Fades an element out with a smooth transition
 *
 * @param element - The HTML element to fade out
 * @param duration - Animation duration in milliseconds (default: 300)
 * @returns A promise that resolves when the animation completes
 *
 * @example
 * ```typescript
 * const alert = document.querySelector('.alert');
 * await fadeOut(alert, 500);
 * alert.remove();
 * ```
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
 * Slides an element in a specified direction
 *
 * @param element - The HTML element to slide
 * @param direction - Slide direction: 'up', 'down', 'left', or 'right'
 * @param duration - Animation duration in milliseconds (default: 300)
 * @returns A promise that resolves when the animation completes
 *
 * @example
 * ```typescript
 * const drawer = document.querySelector('.drawer');
 * await slide(drawer, 'left', 400);
 * ```
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
