/**
 * Form Accessibility Utilities
 *
 * Utilities for enhancing form component accessibility
 * Provides ARIA attributes, error announcements, and keyboard navigation helpers
 */

/**
 * Generate unique IDs for form elements
 */
let idCounter = 0;
export function generateId(prefix: string = "form"): string {
  if (typeof window === "undefined") {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

/**
 * Get ARIA attributes for form field
 */
export interface FormFieldAriaProps {
  id?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
}

export function getFormFieldAriaProps(props: FormFieldAriaProps) {
  const {
    id,
    error,
    helperText,
    required = false,
    disabled = false,
    readOnly = false,
  } = props;

  const describedBy: string[] = [];

  if (error) {
    describedBy.push(`${id}-error`);
  }

  if (helperText) {
    describedBy.push(`${id}-helper`);
  }

  return {
    id,
    "aria-invalid": error ? "true" : undefined,
    "aria-describedby":
      describedBy.length > 0 ? describedBy.join(" ") : undefined,
    "aria-required": required ? "true" : undefined,
    "aria-disabled": disabled ? "true" : undefined,
    "aria-readonly": readOnly ? "true" : undefined,
  };
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(
  message: string,
  priority: "polite" | "assertive" = "polite"
): void {
  if (typeof window === "undefined") return;

  // Create or get the live region
  let liveRegion = document.getElementById("a11y-announcer");

  if (!liveRegion) {
    liveRegion = document.createElement("div");
    liveRegion.id = "a11y-announcer";
    liveRegion.setAttribute("role", "status");
    liveRegion.setAttribute("aria-live", priority);
    liveRegion.setAttribute("aria-atomic", "true");
    liveRegion.className =
      "sr-only absolute left-[-10000px] w-[1px] h-[1px] overflow-hidden";
    document.body.appendChild(liveRegion);
  } else {
    // Update priority if needed
    liveRegion.setAttribute("aria-live", priority);
  }

  // Clear and set new message
  liveRegion.textContent = "";

  // Use setTimeout to ensure screen readers pick up the change
  setTimeout(() => {
    if (liveRegion) {
      liveRegion.textContent = message;
    }
  }, 100);

  // Clear after announcement
  setTimeout(() => {
    if (liveRegion) {
      liveRegion.textContent = "";
    }
  }, 3000);
}

/**
 * Keyboard navigation helpers
 */
export const KeyCodes = {
  ENTER: 13,
  ESCAPE: 27,
  SPACE: 32,
  ARROW_UP: 38,
  ARROW_DOWN: 40,
  ARROW_LEFT: 37,
  ARROW_RIGHT: 39,
  TAB: 9,
  HOME: 36,
  END: 35,
  PAGE_UP: 33,
  PAGE_DOWN: 34,
} as const;

/**
 * Check if key matches
 */
export function isKey(
  event: React.KeyboardEvent,
  ...keys: (keyof typeof KeyCodes)[]
): boolean {
  return keys.some((key) => event.keyCode === KeyCodes[key]);
}

/**
 * Trap focus within an element
 */
export function trapFocus(element: HTMLElement, event: KeyboardEvent): void {
  if (!isKey(event as unknown as React.KeyboardEvent, "TAB")) return;

  const focusableElements = element.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement?.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement?.focus();
  }
}

/**
 * Get label text for input (for screen readers)
 */
export function getLabelText(
  label?: string,
  required?: boolean,
  helperText?: string
): string {
  let text = label || "";
  if (required) {
    text += " (required)";
  }
  if (helperText) {
    text += `. ${helperText}`;
  }
  return text;
}

/**
 * Format error message for screen reader
 */
export function formatErrorMessage(error: string, fieldLabel?: string): string {
  if (fieldLabel) {
    return `Error in ${fieldLabel}: ${error}`;
  }
  return `Error: ${error}`;
}

/**
 * Get validation state ARIA attributes
 */
export interface ValidationState {
  error?: string;
  isValidating?: boolean;
  isValid?: boolean;
}

export function getValidationAriaProps(state: ValidationState) {
  const { error, isValidating, isValid } = state;

  return {
    "aria-invalid": error ? "true" : isValid === false ? "true" : undefined,
    "aria-busy": isValidating ? "true" : undefined,
  };
}

/**
 * Focus management utilities
 */
export function focusElement(elementOrId: HTMLElement | string): void {
  if (typeof window === "undefined") return;

  const element =
    typeof elementOrId === "string"
      ? document.getElementById(elementOrId)
      : elementOrId;

  if (element) {
    // Use requestAnimationFrame to ensure the element is rendered
    requestAnimationFrame(() => {
      element.focus();
    });
  }
}

/**
 * Get next focusable element
 */
export function getNextFocusableElement(
  current: HTMLElement,
  reverse: boolean = false
): HTMLElement | null {
  const focusableElements = Array.from(
    document.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
    )
  );

  const currentIndex = focusableElements.indexOf(current);
  if (currentIndex === -1) return null;

  const nextIndex = reverse ? currentIndex - 1 : currentIndex + 1;

  if (nextIndex < 0) {
    return focusableElements[focusableElements.length - 1];
  }

  if (nextIndex >= focusableElements.length) {
    return focusableElements[0];
  }

  return focusableElements[nextIndex];
}

/**
 * Screen reader only text (visually hidden)
 */
export const srOnlyClassName =
  "sr-only absolute left-[-10000px] w-[1px] h-[1px] overflow-hidden";

/**
 * Create screen reader only element
 */
export function createSROnlyElement(text: string): HTMLSpanElement {
  const span = document.createElement("span");
  span.className = srOnlyClassName;
  span.textContent = text;
  return span;
}
