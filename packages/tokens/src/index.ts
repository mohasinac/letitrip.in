/**
 * @mohasinac/tokens — TypeScript constants
 *
 * Mirrors the CSS custom properties in tokens.css as typed TS values.
 * Use these when you need token values in JS (e.g. canvas drawing, charting,
 * or building the tailwind.config.js color palette from a single source).
 *
 * In CSS/Tailwind prefer `var(--lir-*)` references over these constants.
 */

// ─── Brand Colors ──────────────────────────────────────────────────────────

export const COLORS = {
  primary: {
    DEFAULT: "#84e122",
    50: "#f3ffe3",
    100: "#e4ffc5",
    200: "#c8ff90",
    300: "#a3f550",
    400: "#84e122",
    500: "#65c408",
    600: "#509c02",
    700: "#3e7708",
    800: "#345e0d",
    900: "#2c5011",
    950: "#142d03",
  },
  secondary: {
    DEFAULT: "#e91e8c",
    50: "#fdf0f8",
    100: "#fce2f2",
    200: "#fac6e6",
    300: "#f79dd2",
    400: "#f063b9",
    500: "#e91e8c",
    600: "#d4107a",
    700: "#b00d66",
    800: "#900f56",
    900: "#771249",
    950: "#480525",
  },
  cobalt: {
    DEFAULT: "#3570fc",
    50: "#eef5ff",
    100: "#d9e8ff",
    200: "#bcd4ff",
    300: "#8eb9ff",
    400: "#5992ff",
    500: "#3570fc",
    600: "#1a55f2",
    700: "#1343de",
    800: "#1536b4",
    900: "#18318e",
    950: "#111e58",
  },
  accent: {
    DEFAULT: "#8393b2",
    50: "#f5f7fa",
    100: "#eaeef4",
    200: "#d1dae6",
    300: "#adb9cf",
    400: "#8393b2",
    500: "#657599",
    600: "#505f7f",
    700: "#424d67",
    800: "#394257",
    900: "#333b4b",
    950: "#222730",
  },
  semantic: {
    success: "#059669",
    warning: "#d97706",
    error: "#dc2626",
    info: "#0284c7",
  },
} as const;

// ─── Border Radius ─────────────────────────────────────────────────────────

export const RADIUS = {
  sm: "0.25rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  "2xl": "1rem",
  "3xl": "1.5rem",
  card: "1rem",
  btn: "0.75rem",
  full: "9999px",
} as const;

// ─── Shadow ────────────────────────────────────────────────────────────────

export const SHADOWS = {
  sm: "0 1px 2px 0 rgba(0,0,0,0.05)",
  md: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
  lg: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
  xl: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
  soft: "0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)",
  glow: "0 0 20px rgba(80, 156, 2, 0.45)",
  glowPink: "0 0 20px rgba(233, 30, 140, 0.5)",
} as const;

// ─── Z-index ───────────────────────────────────────────────────────────────

export const Z_INDEX = {
  dropdown: 30,
  searchBackdrop: 35,
  navbar: 40,
  bottomNav: 40,
  overlay: 45,
  sidebar: 50,
  titleBar: 50,
  modal: 60,
  toast: 70,
} as const;

// ─── Token helper ──────────────────────────────────────────────────────────

/**
 * Returns a CSS custom property reference for the given token name.
 *
 * @example
 *   token("color-primary")       // "var(--lir-color-primary)"
 *   token("radius-card")         // "var(--lir-radius-card)"
 *   token("shadow-glow")         // "var(--lir-shadow-glow)"
 */
export function token(name: string): string {
  return `var(--lir-${name})`;
}

// ─── Convenience groups ────────────────────────────────────────────────────

export const TOKENS = {
  colors: COLORS,
  radius: RADIUS,
  shadows: SHADOWS,
  zIndex: Z_INDEX,
  token,
} as const;
