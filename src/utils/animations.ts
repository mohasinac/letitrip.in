/**
 * Animation Utilities
 * Optimized animation helpers
 */

/**
 * CSS Animation classes with performance optimizations
 */
export const animations = {
  // Fade animations
  fadeIn: "animate-fadeIn",
  fadeOut: "animate-fadeOut",

  // Slide animations
  slideInFromLeft: "animate-slideInFromLeft",
  slideInFromRight: "animate-slideInFromRight",
  slideInFromTop: "animate-slideInFromTop",
  slideInFromBottom: "animate-slideInFromBottom",

  // Scale animations
  scaleIn: "animate-scaleIn",
  scaleOut: "animate-scaleOut",

  // Spin animations
  spin: "animate-spin",
  spinSlow: "animate-spin-slow",
  spinFast: "animate-spin-fast",

  // Pulse animations
  pulse: "animate-pulse",
  heartbeat: "animate-heartbeat",

  // Bounce animations
  bounce: "animate-bounce",
  bounceIn: "animate-bounceIn",

  // Specialized animations
  shimmer: "animate-shimmer",
  glow: "animate-glow",
  float: "animate-float",
} as const;

/**
 * Animation duration presets
 */
export const durations = {
  fast: "150ms",
  normal: "300ms",
  slow: "500ms",
  slower: "1000ms",
} as const;

/**
 * Animation timing functions
 */
export const easings = {
  linear: "linear",
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  easeOut: "cubic-bezier(0, 0, 0.2, 1)",
  easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  elastic: "cubic-bezier(0.68, -0.55, 0.265, 1.95)",
} as const;

/**
 * Create optimized CSS animation
 */
export function createAnimation(
  name: string,
  duration: string = durations.normal,
  easing: string = easings.easeInOut,
  fillMode: "none" | "forwards" | "backwards" | "both" = "both",
): string {
  return `${name} ${duration} ${easing} ${fillMode}`;
}

/**
 * Animation observer for triggering animations on scroll
 */
export class AnimationObserver {
  private observer: IntersectionObserver | null = null;
  private elements: Map<Element, string> = new Map();

  constructor(options?: IntersectionObserverInit) {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const animationClass = this.elements.get(entry.target);

          if (entry.isIntersecting && animationClass) {
            entry.target.classList.add(animationClass);

            // Optional: Unobserve after animation
            // this.observer?.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
        ...options,
      },
    );
  }

  observe(element: Element, animationClass: string): void {
    if (!this.observer) return;

    this.elements.set(element, animationClass);
    element.classList.add("opacity-0"); // Hide initially
    this.observer.observe(element);
  }

  unobserve(element: Element): void {
    if (!this.observer) return;

    this.elements.delete(element);
    this.observer.unobserve(element);
  }

  disconnect(): void {
    if (!this.observer) return;

    this.observer.disconnect();
    this.elements.clear();
  }
}

/**
 * Stagger animation helper
 */
export function staggerAnimation(
  elements: Element[],
  animationClass: string,
  delayIncrement: number = 100,
): void {
  elements.forEach((element, index) => {
    setTimeout(() => {
      element.classList.add(animationClass);
    }, index * delayIncrement);
  });
}

/**
 * Sequential animation helper
 */
export async function sequentialAnimation(
  animations: Array<() => void | Promise<void>>,
  delay: number = 300,
): Promise<void> {
  for (const animation of animations) {
    await animation();
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

/**
 * Parallax effect helper
 */
export class ParallaxEffect {
  private elements: Map<Element, { speed: number; initialY: number }> =
    new Map();
  private ticking = false;

  add(element: Element, speed: number = 0.5): void {
    const rect = element.getBoundingClientRect();
    this.elements.set(element, {
      speed,
      initialY: rect.top + window.scrollY,
    });
  }

  remove(element: Element): void {
    this.elements.delete(element);
  }

  private update = (): void => {
    this.elements.forEach((config, element) => {
      const scrolled = window.scrollY;
      const diff = scrolled - config.initialY;
      const translateY = diff * config.speed;

      (element as HTMLElement).style.transform = `translateY(${translateY}px)`;
    });

    this.ticking = false;
  };

  private handleScroll = (): void => {
    if (!this.ticking) {
      requestAnimationFrame(this.update);
      this.ticking = true;
    }
  };

  start(): void {
    window.addEventListener("scroll", this.handleScroll, { passive: true });
  }

  stop(): void {
    window.removeEventListener("scroll", this.handleScroll);
  }
}

/**
 * Check if animation should be disabled
 */
export function shouldDisableAnimation(): boolean {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    !("animate" in document.body) // Check for animation support
  );
}

/**
 * Smooth scroll to element with animation
 */
export function smoothScrollTo(
  target: string | Element,
  options?: {
    duration?: number;
    offset?: number;
    callback?: () => void;
  },
): void {
  if (typeof window === "undefined") return;

  const element =
    typeof target === "string" ? document.querySelector(target) : target;

  if (!element) return;

  const { duration = 1000, offset = 0, callback } = options || {};
  const start = window.scrollY;
  const targetPosition = element.getBoundingClientRect().top + start - offset;
  const distance = targetPosition - start;
  let startTime: number | null = null;

  function animation(currentTime: number) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);

    // Easing function
    const ease =
      progress < 0.5
        ? 2 * progress * progress
        : -1 + (4 - 2 * progress) * progress;

    window.scrollTo(0, start + distance * ease);

    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    } else if (callback) {
      callback();
    }
  }

  requestAnimationFrame(animation);
}

/**
 * CSS transition helper
 */
export function createTransition(
  properties: string[],
  duration: string = durations.normal,
  easing: string = easings.easeInOut,
): string {
  return properties.map((prop) => `${prop} ${duration} ${easing}`).join(", ");
}

/**
 * Performance-optimized CSS properties
 * Use these for animations to avoid repaints/reflows
 */
export const optimizedProperties = ["transform", "opacity", "filter"] as const;

/**
 * Add will-change hint for better performance
 */
export function addWillChange(
  element: HTMLElement,
  properties: string[],
): () => void {
  element.style.willChange = properties.join(", ");

  // Remove will-change after animation
  return () => {
    element.style.willChange = "auto";
  };
}
