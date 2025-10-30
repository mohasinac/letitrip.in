/**
 * Theme Utilities
 * Centralized theme management and color utilities
 */

/**
 * Theme color variables
 */
export const themeColors = {
  light: {
    primary: "#0095f6",
    secondary: "#64748b",
    accent: "#f8fafc",
    background: "#ffffff",
    surface: "#f9fafb",
    text: "#0f172a",
    textSecondary: "#475569",
    muted: "#94a3b8",
    border: "#e2e8f0",
    error: "#ef4444",
    success: "#22c55e",
    warning: "#f59e0b",
  },
  dark: {
    primary: "#0095f6",
    secondary: "#ffffff",
    accent: "#0f0f0f",
    background: "#000000",
    surface: "#0f0f0f",
    text: "#ffffff",
    textSecondary: "#cccccc",
    muted: "#9ca3af",
    border: "#333333",
    error: "#ef4444",
    success: "#22c55e",
    warning: "#f59e0b",
  },
} as const;

/**
 * Get theme color
 */
export function getThemeColor(
  color: keyof typeof themeColors.light,
  theme: "light" | "dark" = "light",
): string {
  return themeColors[theme][color];
}

/**
 * Convert hex to RGB
 */
export function hexToRgb(
  hex: string,
): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

/**
 * Add alpha to hex color
 */
export function hexWithAlpha(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/**
 * Lighten color
 */
export function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const amount = Math.round(255 * (percent / 100));

  return rgbToHex(
    Math.min(255, rgb.r + amount),
    Math.min(255, rgb.g + amount),
    Math.min(255, rgb.b + amount),
  );
}

/**
 * Darken color
 */
export function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const amount = Math.round(255 * (percent / 100));

  return rgbToHex(
    Math.max(0, rgb.r - amount),
    Math.max(0, rgb.g - amount),
    Math.max(0, rgb.b - amount),
  );
}

/**
 * Get contrasting text color
 */
export function getContrastingColor(bgColor: string): "light" | "dark" {
  const rgb = hexToRgb(bgColor);
  if (!rgb) return "light";

  // Calculate relative luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;

  return luminance > 0.5 ? "dark" : "light";
}

/**
 * CSS variable utilities
 */
export const cssVariables = {
  set: (name: string, value: string) => {
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty(name, value);
    }
  },

  get: (name: string): string => {
    if (typeof document !== "undefined") {
      return getComputedStyle(document.documentElement).getPropertyValue(name);
    }
    return "";
  },

  remove: (name: string) => {
    if (typeof document !== "undefined") {
      document.documentElement.style.removeProperty(name);
    }
  },
};

/**
 * Apply theme colors to CSS variables
 */
export function applyTheme(theme: "light" | "dark"): void {
  const colors = themeColors[theme];

  Object.entries(colors).forEach(([key, value]) => {
    cssVariables.set(`--theme-${key}`, value);
  });
}

/**
 * Get system theme preference
 */
export function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * Watch for theme changes
 */
export function watchThemeChange(
  callback: (theme: "light" | "dark") => void,
): () => void {
  if (typeof window === "undefined") return () => {};

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const handler = (e: MediaQueryListEvent) => {
    callback(e.matches ? "dark" : "light");
  };

  mediaQuery.addEventListener("change", handler);

  return () => mediaQuery.removeEventListener("change", handler);
}

/**
 * Gradient utilities
 */
export const gradients = {
  primary: (theme: "light" | "dark" = "light") =>
    `linear-gradient(135deg, ${themeColors[theme].primary}, ${themeColors[theme].secondary})`,

  accent: (theme: "light" | "dark" = "light") =>
    `linear-gradient(135deg, ${themeColors[theme].accent}, ${themeColors[theme].background})`,

  success: () => "linear-gradient(135deg, #22c55e, #16a34a)",

  error: () => "linear-gradient(135deg, #ef4444, #dc2626)",

  warning: () => "linear-gradient(135deg, #f59e0b, #d97706)",
};
