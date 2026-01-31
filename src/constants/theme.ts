/**
 * Global Theme Constants
 *
 * Centralized theme configuration with industry-standard bright colors.
 * All components should use these constants for consistent styling.
 *
 * @example
 * ```tsx
 * import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';
 *
 * const MyComponent = () => (
 *   <div className={`${COLORS.primary.bg} ${SPACING.padding.lg}`}>
 *     <h1 className={TYPOGRAPHY.heading.h1}>Title</h1>
 *   </div>
 * );
 * ```
 */

// ============================================
// COLOR PALETTE - Industry Standard Bright Colors
// ============================================

/**
 * Core brand colors with bright, vibrant palette
 */
export const COLORS = {
  // Primary Brand - Bright Electric Blue
  primary: {
    DEFAULT: "#0EA5E9", // sky-500 - Bright sky blue
    50: "#F0F9FF",
    100: "#E0F2FE",
    200: "#BAE6FD",
    300: "#7DD3FC",
    400: "#38BDF8",
    500: "#0EA5E9",
    600: "#0284C7",
    700: "#0369A1",
    800: "#075985",
    900: "#0C4A6E",
    light: "#BAE6FD",
    dark: "#0369A1",
    bg: "bg-sky-500",
    text: "text-sky-500",
    border: "border-sky-500",
    hover: "hover:bg-sky-600",
  },

  // Secondary - Vibrant Purple
  secondary: {
    DEFAULT: "#A855F7", // purple-500 - Bright purple
    50: "#FAF5FF",
    100: "#F3E8FF",
    200: "#E9D5FF",
    300: "#D8B4FE",
    400: "#C084FC",
    500: "#A855F7",
    600: "#9333EA",
    700: "#7E22CE",
    800: "#6B21A8",
    900: "#581C87",
    light: "#E9D5FF",
    dark: "#7E22CE",
    bg: "bg-purple-500",
    text: "text-purple-500",
    border: "border-purple-500",
    hover: "hover:bg-purple-600",
  },

  // Accent - Bright Orange/Coral
  accent: {
    DEFAULT: "#F97316", // orange-500 - Bright orange
    50: "#FFF7ED",
    100: "#FFEDD5",
    200: "#FED7AA",
    300: "#FDBA74",
    400: "#FB923C",
    500: "#F97316",
    600: "#EA580C",
    700: "#C2410C",
    800: "#9A3412",
    900: "#7C2D12",
    light: "#FDBA74",
    dark: "#C2410C",
    bg: "bg-orange-500",
    text: "text-orange-500",
    border: "border-orange-500",
    hover: "hover:bg-orange-600",
  },

  // Success - Bright Green
  success: {
    DEFAULT: "#22C55E", // green-500 - Vibrant green
    50: "#F0FDF4",
    100: "#DCFCE7",
    200: "#BBF7D0",
    300: "#86EFAC",
    400: "#4ADE80",
    500: "#22C55E",
    600: "#16A34A",
    700: "#15803D",
    800: "#166534",
    900: "#14532D",
    light: "#BBF7D0",
    dark: "#15803D",
    bg: "bg-green-500",
    text: "text-green-500",
    border: "border-green-500",
    hover: "hover:bg-green-600",
  },

  // Warning - Bright Amber
  warning: {
    DEFAULT: "#F59E0B", // amber-500 - Bright amber
    50: "#FFFBEB",
    100: "#FEF3C7",
    200: "#FDE68A",
    300: "#FCD34D",
    400: "#FBBF24",
    500: "#F59E0B",
    600: "#D97706",
    700: "#B45309",
    800: "#92400E",
    900: "#78350F",
    light: "#FDE68A",
    dark: "#B45309",
    bg: "bg-amber-500",
    text: "text-amber-500",
    border: "border-amber-500",
    hover: "hover:bg-amber-600",
  },

  // Error/Danger - Bright Red
  error: {
    DEFAULT: "#EF4444", // red-500 - Bright red
    50: "#FEF2F2",
    100: "#FEE2E2",
    200: "#FECACA",
    300: "#FCA5A5",
    400: "#F87171",
    500: "#EF4444",
    600: "#DC2626",
    700: "#B91C1C",
    800: "#991B1B",
    900: "#7F1D1D",
    light: "#FECACA",
    dark: "#B91C1C",
    bg: "bg-red-500",
    text: "text-red-500",
    border: "border-red-500",
    hover: "hover:bg-red-600",
  },

  // Info - Bright Cyan
  info: {
    DEFAULT: "#06B6D4", // cyan-500 - Bright cyan
    50: "#ECFEFF",
    100: "#CFFAFE",
    200: "#A5F3FC",
    300: "#67E8F9",
    400: "#22D3EE",
    500: "#06B6D4",
    600: "#0891B2",
    700: "#0E7490",
    800: "#155E75",
    900: "#164E63",
    light: "#A5F3FC",
    dark: "#0E7490",
    bg: "bg-cyan-500",
    text: "text-cyan-500",
    border: "border-cyan-500",
    hover: "hover:bg-cyan-600",
  },

  // Neutral - Gray scale
  neutral: {
    DEFAULT: "#71717A", // zinc-500
    50: "#FAFAFA",
    100: "#F4F4F5",
    200: "#E4E4E7",
    300: "#D4D4D8",
    400: "#A1A1AA",
    500: "#71717A",
    600: "#52525B",
    700: "#3F3F46",
    800: "#27272A",
    900: "#18181B",
    950: "#09090B",
  },

  // Background Colors
  background: {
    primary: "bg-white dark:bg-black",
    secondary: "bg-slate-50 dark:bg-zinc-900",
    tertiary: "bg-slate-100 dark:bg-zinc-800",
    elevated: "bg-white dark:bg-zinc-900",
    hover: "hover:bg-slate-50 dark:hover:bg-zinc-800",
    active: "bg-slate-100 dark:bg-zinc-800",
    overlay: "bg-black/50",
  },

  // Text Colors
  text: {
    primary: "text-slate-900 dark:text-zinc-50",
    secondary: "text-slate-600 dark:text-zinc-400",
    tertiary: "text-slate-500 dark:text-zinc-500",
    muted: "text-slate-400 dark:text-zinc-600",
    inverse: "text-white dark:text-black",
    disabled: "text-slate-300 dark:text-zinc-700",
  },

  // Border Colors
  border: {
    primary: "border-slate-200 dark:border-zinc-700",
    secondary: "border-slate-300 dark:border-zinc-600",
    hover: "hover:border-slate-400 dark:hover:border-zinc-500",
    focus: "focus:border-sky-500 dark:focus:border-sky-400",
    error: "border-red-500",
    success: "border-green-500",
  },
} as const;

// ============================================
// SPACING - Consistent spacing scale
// ============================================

export const SPACING = {
  // Padding classes
  padding: {
    none: "p-0",
    xs: "p-1", // 4px
    sm: "p-2", // 8px
    md: "p-4", // 16px
    lg: "p-6", // 24px
    xl: "p-8", // 32px
    "2xl": "p-12", // 48px
    "3xl": "p-16", // 64px
  },

  // Margin classes
  margin: {
    none: "m-0",
    xs: "m-1",
    sm: "m-2",
    md: "m-4",
    lg: "m-6",
    xl: "m-8",
    "2xl": "m-12",
    "3xl": "m-16",
  },

  // Gap classes (for flex/grid)
  gap: {
    none: "gap-0",
    xs: "gap-1",
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
    xl: "gap-8",
    "2xl": "gap-12",
  },

  // Space between classes
  space: {
    xs: "space-x-1 space-y-1",
    sm: "space-x-2 space-y-2",
    md: "space-x-4 space-y-4",
    lg: "space-x-6 space-y-6",
    xl: "space-x-8 space-y-8",
  },
} as const;

// ============================================
// TYPOGRAPHY - Text styles and sizes
// ============================================

export const TYPOGRAPHY = {
  // Heading styles
  heading: {
    h1: "text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight",
    h2: "text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight",
    h3: "text-2xl md:text-3xl lg:text-4xl font-semibold",
    h4: "text-xl md:text-2xl lg:text-3xl font-semibold",
    h5: "text-lg md:text-xl lg:text-2xl font-medium",
    h6: "text-base md:text-lg lg:text-xl font-medium",
  },

  // Body text styles
  body: {
    xl: "text-xl leading-relaxed",
    lg: "text-lg leading-relaxed",
    base: "text-base leading-normal",
    sm: "text-sm leading-normal",
    xs: "text-xs leading-tight",
  },

  // Font weights
  weight: {
    thin: "font-thin",
    light: "font-light",
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
    extrabold: "font-extrabold",
  },

  // Text alignment
  align: {
    left: "text-left",
    center: "text-center",
    right: "text-right",
    justify: "text-justify",
  },
} as const;

// ============================================
// SHADOWS - Elevation system
// ============================================

export const SHADOWS = {
  none: "shadow-none",
  sm: "shadow-sm",
  base: "shadow",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
  "2xl": "shadow-2xl",
  inner: "shadow-inner",
  glow: {
    primary: "shadow-[0_0_20px_rgba(14,165,233,0.5)]",
    secondary: "shadow-[0_0_20px_rgba(168,85,247,0.5)]",
    accent: "shadow-[0_0_20px_rgba(249,115,22,0.5)]",
    success: "shadow-[0_0_20px_rgba(34,197,94,0.5)]",
    error: "shadow-[0_0_20px_rgba(239,68,68,0.5)]",
  },
} as const;

// ============================================
// BORDERS - Border styles
// ============================================

export const BORDERS = {
  width: {
    none: "border-0",
    thin: "border",
    medium: "border-2",
    thick: "border-4",
  },

  radius: {
    none: "rounded-none",
    sm: "rounded-sm",
    base: "rounded",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    "3xl": "rounded-3xl",
    full: "rounded-full",
  },

  style: {
    solid: "border-solid",
    dashed: "border-dashed",
    dotted: "border-dotted",
  },
} as const;

// ============================================
// TRANSITIONS - Animation durations
// ============================================

export const TRANSITIONS = {
  duration: {
    fast: "duration-150",
    base: "duration-200",
    slow: "duration-300",
    slower: "duration-500",
  },

  timing: {
    linear: "ease-linear",
    in: "ease-in",
    out: "ease-out",
    inOut: "ease-in-out",
  },

  // Complete transition classes
  all: {
    fast: "transition-all duration-150 ease-in-out",
    base: "transition-all duration-200 ease-in-out",
    slow: "transition-all duration-300 ease-in-out",
  },

  colors: {
    fast: "transition-colors duration-150 ease-in-out",
    base: "transition-colors duration-200 ease-in-out",
    slow: "transition-colors duration-300 ease-in-out",
  },
} as const;

// ============================================
// BREAKPOINTS - Responsive design
// ============================================

export const BREAKPOINTS = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

// ============================================
// Z-INDEX - Layer management
// ============================================

export const Z_INDEX = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  notification: 1080,
  maximum: 9999,
} as const;

// ============================================
// COMPONENT VARIANTS - Reusable button/card styles
// ============================================

export const BUTTON_VARIANTS = {
  primary: `${COLORS.primary.bg} ${COLORS.text.inverse} ${COLORS.primary.hover} ${SHADOWS.base} ${TRANSITIONS.colors.base}`,
  secondary: `${COLORS.secondary.bg} ${COLORS.text.inverse} ${COLORS.secondary.hover} ${SHADOWS.base} ${TRANSITIONS.colors.base}`,
  accent: `${COLORS.accent.bg} ${COLORS.text.inverse} ${COLORS.accent.hover} ${SHADOWS.base} ${TRANSITIONS.colors.base}`,
  success: `${COLORS.success.bg} ${COLORS.text.inverse} ${COLORS.success.hover} ${SHADOWS.base} ${TRANSITIONS.colors.base}`,
  error: `${COLORS.error.bg} ${COLORS.text.inverse} ${COLORS.error.hover} ${SHADOWS.base} ${TRANSITIONS.colors.base}`,
  outline: `${COLORS.background.primary} ${COLORS.primary.text} ${COLORS.primary.border} ${BORDERS.width.medium} ${COLORS.primary.hover} ${TRANSITIONS.colors.base}`,
  ghost: `${COLORS.background.hover} ${COLORS.text.primary} ${TRANSITIONS.colors.base}`,
} as const;

export const CARD_VARIANTS = {
  elevated: `${COLORS.background.elevated} ${SHADOWS.lg} ${BORDERS.radius.lg} ${COLORS.border.primary} ${BORDERS.width.thin}`,
  flat: `${COLORS.background.secondary} ${BORDERS.radius.lg}`,
  bordered: `${COLORS.background.primary} ${COLORS.border.primary} ${BORDERS.width.medium} ${BORDERS.radius.lg}`,
  interactive: `${COLORS.background.elevated} ${SHADOWS.base} ${BORDERS.radius.lg} ${COLORS.background.hover} ${TRANSITIONS.all.base}`,
} as const;

// ============================================
// STATUS COLORS - For auction/order statuses
// ============================================

export const STATUS_COLORS = {
  // Order statuses
  order: {
    pending: {
      bg: "bg-amber-50 dark:bg-amber-900/20",
      text: "text-amber-700 dark:text-amber-400",
      border: "border-amber-200 dark:border-amber-800",
    },
    processing: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      text: "text-blue-700 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-800",
    },
    shipped: {
      bg: "bg-purple-50 dark:bg-purple-900/20",
      text: "text-purple-700 dark:text-purple-400",
      border: "border-purple-200 dark:border-purple-800",
    },
    delivered: {
      bg: "bg-green-50 dark:bg-green-900/20",
      text: "text-green-700 dark:text-green-400",
      border: "border-green-200 dark:border-green-800",
    },
    cancelled: {
      bg: "bg-red-50 dark:bg-red-900/20",
      text: "text-red-700 dark:text-red-400",
      border: "border-red-200 dark:border-red-800",
    },
  },

  // Auction statuses
  auction: {
    active: {
      bg: "bg-green-50 dark:bg-green-900/20",
      text: "text-green-700 dark:text-green-400",
      border: "border-green-200 dark:border-green-800",
    },
    ending: {
      bg: "bg-orange-50 dark:bg-orange-900/20",
      text: "text-orange-700 dark:text-orange-400",
      border: "border-orange-200 dark:border-orange-800",
    },
    ended: {
      bg: "bg-gray-50 dark:bg-gray-900/20",
      text: "text-gray-700 dark:text-gray-400",
      border: "border-gray-200 dark:border-gray-800",
    },
    upcoming: {
      bg: "bg-cyan-50 dark:bg-cyan-900/20",
      text: "text-cyan-700 dark:text-cyan-400",
      border: "border-cyan-200 dark:border-cyan-800",
    },
  },

  // Bid statuses
  bid: {
    winning: {
      bg: "bg-green-50 dark:bg-green-900/20",
      text: "text-green-700 dark:text-green-400",
      border: "border-green-200 dark:border-green-800",
    },
    outbid: {
      bg: "bg-red-50 dark:bg-red-900/20",
      text: "text-red-700 dark:text-red-400",
      border: "border-red-200 dark:border-red-800",
    },
    placed: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      text: "text-blue-700 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-800",
    },
  },
} as const;

// ============================================
// UTILITY CLASSES - Common combinations
// ============================================

export const UTILITIES = {
  // Flexbox utilities
  flex: {
    center: "flex items-center justify-center",
    between: "flex items-center justify-between",
    start: "flex items-center justify-start",
    end: "flex items-center justify-end",
    col: "flex flex-col",
    colCenter: "flex flex-col items-center justify-center",
  },

  // Grid utilities
  grid: {
    cols1: "grid grid-cols-1",
    cols2: "grid grid-cols-1 md:grid-cols-2",
    cols3: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    cols4: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  },

  // Container utilities
  container: {
    base: "container mx-auto px-4 sm:px-6 lg:px-8",
    narrow: "container mx-auto px-4 max-w-4xl",
    wide: "container mx-auto px-4 max-w-7xl",
  },

  // Truncate text
  truncate: {
    single: "truncate",
    multi2: "line-clamp-2",
    multi3: "line-clamp-3",
  },
} as const;

// ============================================
// THEME CONFIGURATION - Global settings
// ============================================

export const THEME_CONFIG = {
  defaultTheme: "dark",
  enableSystemTheme: false,
  storageKey: "letitrip-theme",
  colorScheme: {
    light: "light",
    dark: "dark",
  },
} as const;

/**
 * Type exports for TypeScript
 */
export type ColorKey = keyof typeof COLORS;
export type SpacingKey = keyof typeof SPACING;
export type TypographyKey = keyof typeof TYPOGRAPHY;
export type ShadowKey = keyof typeof SHADOWS;
export type BorderKey = keyof typeof BORDERS;
export type TransitionKey = keyof typeof TRANSITIONS;
