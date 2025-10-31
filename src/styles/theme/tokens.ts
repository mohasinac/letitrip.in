/**
 * Design Tokens - Single Source of Truth for Theme
 * All colors, spacing, typography, and other design values
 */

// ============================================================================
// COLOR TOKENS
// ============================================================================

export const colorTokens = {
  // Brand Colors
  brand: {
    primary: {
      light: "#0095f6",
      main: "#0095f6",
      dark: "#0077cc",
    },
    secondary: {
      light: "#64748b",
      main: "#64748b",
      dark: "#475569",
    },
  },

  // Semantic Colors
  semantic: {
    success: {
      light: "#22c55e",
      main: "#16a34a",
      dark: "#15803d",
    },
    warning: {
      light: "#f59e0b",
      main: "#d97706",
      dark: "#b45309",
    },
    error: {
      light: "#ef4444",
      main: "#dc2626",
      dark: "#b91c1c",
    },
    info: {
      light: "#0ea5e9",
      main: "#0284c7",
      dark: "#0369a1",
    },
  },

  // Neutral Palette
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

  // Theme-specific (Light Mode)
  light: {
    background: "#ffffff",
    surface: "#f8fafc",
    surfaceVariant: "#f1f5f9",
    text: {
      primary: "#0f172a",
      secondary: "#475569",
      disabled: "#94a3b8",
    },
    border: "#e2e8f0",
    divider: "#e2e8f0",
  },

  // Theme-specific (Dark Mode)
  dark: {
    background: "#000000",
    surface: "#0f0f0f",
    surfaceVariant: "#1a1a1a",
    text: {
      primary: "#ffffff",
      secondary: "#cccccc",
      disabled: "#666666",
    },
    border: "#333333",
    divider: "#333333",
  },

  // Custom Theme Colors
  custom: {
    light: {
      primary: "#4169E1", // Royal blue
      secondary: "#DC143C", // Crimson red
      pattern: "repeating-linear-gradient(45deg, #ffffff, #ffffff 10px, #f0f0f0 10px, #f0f0f0 20px)",
    },
    dark: {
      primary: "#00FF41", // Neon green
      secondary: "#FF4500", // Orange red
      background: "#0a0e27", // Galaxy blue
      surface: "#1a1f3a",
    },
  },
};

// ============================================================================
// TYPOGRAPHY TOKENS
// ============================================================================

export const typographyTokens = {
  fontFamily: {
    sans: [
      "Inter",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
    mono: ["Monaco", "Menlo", "Courier New", "monospace"].join(","),
  },

  fontSize: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem", // 48px
    "6xl": "3.75rem", // 60px
  },

  fontWeight: {
    thin: 100,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  letterSpacing: {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em",
  },
};

// ============================================================================
// SPACING TOKENS
// ============================================================================

export const spacingTokens = {
  0: "0",
  1: "0.25rem", // 4px
  2: "0.5rem", // 8px
  3: "0.75rem", // 12px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  8: "2rem", // 32px
  10: "2.5rem", // 40px
  12: "3rem", // 48px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
  32: "8rem", // 128px
};

// ============================================================================
// BORDER RADIUS TOKENS
// ============================================================================

export const borderRadiusTokens = {
  none: "0",
  sm: "0.25rem", // 4px
  base: "0.375rem", // 6px
  md: "0.5rem", // 8px
  lg: "0.75rem", // 12px
  xl: "1rem", // 16px
  "2xl": "1.5rem", // 24px
  "3xl": "2rem", // 32px
  full: "9999px",
};

// ============================================================================
// SHADOW TOKENS
// ============================================================================

export const shadowTokens = {
  none: "none",
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
};

// ============================================================================
// BREAKPOINT TOKENS
// ============================================================================

export const breakpointTokens = {
  xs: "0px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

// ============================================================================
// Z-INDEX TOKENS
// ============================================================================

export const zIndexTokens = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};

// ============================================================================
// TRANSITION TOKENS
// ============================================================================

export const transitionTokens = {
  fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
  base: "200ms cubic-bezier(0.4, 0, 0.2, 1)",
  slow: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
  slower: "500ms cubic-bezier(0.4, 0, 0.2, 1)",
};

// ============================================================================
// EXPORT ALL TOKENS
// ============================================================================

export const designTokens = {
  colors: colorTokens,
  typography: typographyTokens,
  spacing: spacingTokens,
  borderRadius: borderRadiusTokens,
  shadows: shadowTokens,
  breakpoints: breakpointTokens,
  zIndex: zIndexTokens,
  transitions: transitionTokens,
};

export default designTokens;
