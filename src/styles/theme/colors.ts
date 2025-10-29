/**
 * Theme Colors
 * Centralized color palette for the application
 * Supports light and dark modes
 */

export const colors = {
  // Primary
  primary: {
    light: "#6366f1",
    main: "#4f46e5",
    dark: "#4338ca",
    darker: "#3730a3",
  },

  // Secondary
  secondary: {
    light: "#ec4899",
    main: "#db2777",
    dark: "#be185d",
  },

  // Success
  success: {
    light: "#86efac",
    main: "#22c55e",
    dark: "#16a34a",
  },

  // Warning
  warning: {
    light: "#fbbf24",
    main: "#f59e0b",
    dark: "#d97706",
  },

  // Error
  error: {
    light: "#f87171",
    main: "#ef4444",
    dark: "#dc2626",
  },

  // Info
  info: {
    light: "#0ea5e9",
    main: "#0284c7",
    dark: "#0369a1",
  },

  // Neutral
  neutral: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },

  // Brand
  brand: {
    primary: "#4f46e5",
    accent: "#ec4899",
    background: "#ffffff",
    surface: "#f9fafb",
  },
};

// CSS Variables for dynamic theming
export const cssVariables = {
  light: {
    "--color-primary": colors.primary.main,
    "--color-primary-light": colors.primary.light,
    "--color-primary-dark": colors.primary.dark,
    "--color-success": colors.success.main,
    "--color-warning": colors.warning.main,
    "--color-error": colors.error.main,
    "--color-info": colors.info.main,
    "--color-text": colors.neutral[900],
    "--color-text-secondary": colors.neutral[600],
    "--color-border": colors.neutral[200],
    "--color-background": colors.brand.background,
    "--color-surface": colors.brand.surface,
  },
  dark: {
    "--color-primary": colors.primary.light,
    "--color-primary-light": colors.primary.main,
    "--color-primary-dark": colors.primary.dark,
    "--color-success": colors.success.light,
    "--color-warning": colors.warning.light,
    "--color-error": colors.error.light,
    "--color-info": colors.info.light,
    "--color-text": colors.neutral[50],
    "--color-text-secondary": colors.neutral[400],
    "--color-border": colors.neutral[700],
    "--color-background": colors.neutral[900],
    "--color-surface": colors.neutral[800],
  },
};

export default colors;
