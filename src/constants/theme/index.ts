/**
 * Theme Index
 *
 * Central export point for all theme-related utilities and constants.
 * Import everything you need from this single file.
 *
 * @example
 * ```tsx
 * import { COLORS, useTheme, BUTTON_VARIANTS } from '@/constants/theme';
 * ```
 */

// Export all theme constants
export * from "../theme";

// Re-export for convenience
// export { default as ThemeDemo } from "@/components/demo/ThemeDemo";

/**
 * Quick reference guide for theme usage
 */
export const THEME_REFERENCE = {
  colors: {
    primary: "Electric Blue - #0EA5E9",
    secondary: "Vibrant Purple - #A855F7",
    accent: "Bright Orange - #F97316",
    success: "Bright Green - #22C55E",
    warning: "Bright Amber - #F59E0B",
    error: "Bright Red - #EF4444",
    info: "Bright Cyan - #06B6D4",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    "2xl": "48px",
    "3xl": "64px",
  },
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
  usage: {
    button: "Use BUTTON_VARIANTS for consistent button styling",
    card: "Use CARD_VARIANTS for consistent card styling",
    status: "Use STATUS_COLORS for order/auction/bid statuses",
    utility: "Use UTILITIES for common layout patterns",
  },
} as const;

/**
 * Helper function to combine theme classes
 */
export function combineThemeClasses(
  ...classes: (string | undefined | null | false)[]
): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Helper to create custom button styles
 */
export function createButtonStyle(
  variant:
    | "primary"
    | "secondary"
    | "accent"
    | "success"
    | "error"
    | "outline"
    | "ghost",
  additionalClasses?: string,
): string {
  const { BUTTON_VARIANTS } = require("../theme");
  return combineThemeClasses(BUTTON_VARIANTS[variant], additionalClasses);
}

/**
 * Helper to create custom card styles
 */
export function createCardStyle(
  variant: "elevated" | "flat" | "bordered" | "interactive",
  additionalClasses?: string,
): string {
  const { CARD_VARIANTS } = require("../theme");
  return combineThemeClasses(CARD_VARIANTS[variant], additionalClasses);
}

/**
 * Type-safe color accessor
 */
export function getColor(category: string, shade?: string | number): string {
  const { COLORS } = require("../theme");

  if (shade) {
    return COLORS[category]?.[shade] || COLORS[category]?.DEFAULT || "";
  }

  return COLORS[category]?.DEFAULT || COLORS[category] || "";
}

/**
 * Get status color configuration
 */
export function getStatusColor(
  type: "order" | "auction" | "bid",
  status: string,
): { bg: string; text: string; border: string } {
  const { STATUS_COLORS } = require("../theme");

  return (
    STATUS_COLORS[type]?.[status] || {
      bg: "",
      text: "",
      border: "",
    }
  );
}

/**
 * Responsive spacing helper
 */
export function getResponsiveSpacing(
  sm: string,
  md?: string,
  lg?: string,
): string {
  const { SPACING } = require("../theme");

  let classes = SPACING.padding[sm] || "";

  if (md) {
    classes += ` md:${SPACING.padding[md] || ""}`;
  }

  if (lg) {
    classes += ` lg:${SPACING.padding[lg] || ""}`;
  }

  return classes;
}

/**
 * Create utility class combinations
 */
export const createUtilityClasses = {
  flexCenter: () => {
    const { UTILITIES } = require("../theme");
    return UTILITIES.flex.center;
  },

  gridResponsive: (cols: 1 | 2 | 3 | 4) => {
    const { UTILITIES } = require("../theme");
    return UTILITIES.grid[`cols${cols}`];
  },

  container: (size: "base" | "narrow" | "wide" = "base") => {
    const { UTILITIES } = require("../theme");
    return UTILITIES.container[size];
  },
};

/**
 * CSS variable helper - returns the CSS variable string
 */
export function getCSSVar(varName: string): string {
  return `var(--${varName})`;
}

/**
 * Theme configuration helpers
 */
export const themeHelpers = {
  /**
   * Check if dark mode is enabled
   * Works with next-themes class-based approach
   */
  isDarkMode: () => {
    if (typeof window === "undefined") return true; // Default to dark
    return document.documentElement.classList.contains("dark");
  },

  /**
   * Toggle dark mode
   * Works with next-themes and localStorage
   */
  toggleDarkMode: () => {
    if (typeof window === "undefined") return;
    const isDark = document.documentElement.classList.contains("dark");
    const newTheme = isDark ? "light" : "dark";

    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("letitrip-theme", newTheme);
  },

  /**
   * Set specific theme
   * Works with next-themes class-based approach
   */
  setTheme: (theme: "light" | "dark") => {
    if (typeof window === "undefined") return;

    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("letitrip-theme", theme);
  },

  /**
   * Get current theme
   * Returns 'dark' as default
   */
  getCurrentTheme: (): "light" | "dark" => {
    if (typeof window === "undefined") return "dark"; // Default to dark

    const stored = localStorage.getItem("letitrip-theme");
    if (stored === "light" || stored === "dark") return stored;

    return document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
  },

  /**
   * Initialize theme on page load
   * Prevents flash of unstyled content
   */
  initTheme: () => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem("letitrip-theme");
    const theme = stored || "dark"; // Default to dark

    document.documentElement.classList.toggle("dark", theme === "dark");
  },
};

/**
 * Export quick access to commonly used theme elements
 */
export const QUICK_THEME = {
  // Buttons
  btnPrimary: createButtonStyle("primary"),
  btnSecondary: createButtonStyle("secondary"),
  btnSuccess: createButtonStyle("success"),
  btnError: createButtonStyle("error"),

  // Cards
  cardElevated: createCardStyle("elevated"),
  cardBordered: createCardStyle("bordered"),
  cardInteractive: createCardStyle("interactive"),

  // Common layouts
  flexCenter: createUtilityClasses.flexCenter(),
  container: createUtilityClasses.container(),
} as const;
