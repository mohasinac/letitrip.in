/**
 * Theme Constants
 *
 * Centralized theme configuration for the entire application.
 * Contains all styling constants using Tailwind CSS classes with dark mode support.
 *
 * Features:
 * - Themed classes (responsive to dark mode)
 * - Component-specific styling (input, button, card, etc.)
 * - Layout dimensions and positioning
 * - Z-index layering system
 * - Typography scale
 * - Color variants for all component states
 * - Animation utilities
 * - Breakpoint reference
 *
 * @constant
 * @example
 * ```tsx
 * import { THEME_CONSTANTS } from '@/constants/theme';
 *
 * <div className={THEME_CONSTANTS.themed.bgPrimary}>
 *   <h1 className={THEME_CONSTANTS.typography.h1}>Title</h1>
 * </div>
 * ```
 */

export const THEME_CONSTANTS = {
  /**
   * Themed classes - Responsive to dark mode
   * All classes here automatically adjust colors based on theme
   */
  // Themed classes (responsive to dark mode)
  themed: {
    // Backgrounds
    bgPrimary: "bg-gray-50 dark:bg-gray-950",
    bgSecondary: "bg-white dark:bg-gray-900",
    bgTertiary: "bg-gray-100 dark:bg-gray-800",
    bgInput: "bg-white dark:bg-gray-900",

    // Text colors
    textPrimary: "text-gray-900 dark:text-gray-100",
    textSecondary: "text-gray-600 dark:text-gray-400",
    textMuted: "text-gray-500 dark:text-gray-500",
    textError: "text-red-600 dark:text-red-400",
    textSuccess: "text-green-600 dark:text-green-400",
    textOnPrimary: "text-white",
    textOnDark: "text-white",

    // Borders
    border: "border-gray-200 dark:border-gray-800",
    borderLight: "border-gray-100 dark:border-gray-700",
    borderError: "border-red-500",
    borderColor: "border-gray-200 dark:border-gray-700",

    // Interactive states
    hover: "hover:bg-gray-100 dark:hover:bg-gray-800",
    hoverCard: "hover:bg-gray-50 dark:hover:bg-gray-800",
    hoverBorder: "hover:border-gray-300 dark:hover:border-gray-600",
    hoverText: "hover:text-gray-700 dark:hover:text-gray-200",
    focusRing: "focus:ring-blue-500 dark:focus:ring-blue-500",

    // Placeholders
    placeholder: "placeholder-gray-500 dark:placeholder-gray-500",
  },

  /**
   * Input/Form styles
   * Base styles for text inputs, selects, and textareas
   */
  // Input/Form styles
  input: {
    base: "w-full px-4 py-2.5 rounded-xl border transition-all focus:outline-none focus:ring-2",
    disabled: "disabled:opacity-50 disabled:cursor-not-allowed",
    withIcon: "pl-10",
  },

  /**
   * Button styles
   * Base button styling with active state animations
   */
  // Button styles
  button: {
    base: "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
    active: "active:scale-95",
  },

  /**
   * Card styles
   * Container component styling with shadow variants
   */
  // Card styles
  card: {
    base: "rounded-xl overflow-hidden transition-all",
    shadow: "shadow-md",
    shadowElevated: "shadow-xl",
    hover:
      "hover:scale-[1.02] hover:shadow-lg dark:hover:shadow-2xl cursor-pointer",
  },

  /**
   * Layout constants
   * Dimensions and styling for all layout components (navbar, sidebar, etc.)
   */
  // Layout constants
  layout: {
    titleBarHeight: "h-14",
    navbarHeight: "h-12 md:h-14",
    sidebarWidth: "w-80",
    bottomNavHeight: "h-16",
    maxContentWidth: "max-w-7xl 2xl:max-w-[1600px]",
    contentPadding: "px-4 md:px-6 lg:px-8 2xl:px-12",
    titleBarBg:
      "bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800",
    navbarBg:
      "bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800",
    sidebarBg:
      "bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800",
    bottomNavBg:
      "bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800",
    footerBg: "bg-gradient-to-r from-gray-800 to-gray-900",
  },

  /**
   * Z-index layers
   * Layering system to control component stacking order
   */
  // Z-index layers
  zIndex: {
    titleBar: "z-50",
    navbar: "z-40",
    sidebar: "z-50",
    overlay: "z-40",
    bottomNav: "z-40",
    search: "z-40",
    searchBackdrop: "z-[35]",
  },

  /**
   * Animation durations
   * Standard timing for transitions and animations
   */
  // Animation durations
  animation: {
    fast: "duration-150",
    normal: "duration-300",
    slow: "duration-500",
  },

  /**
   * Spacing
   * Standard spacing patterns for groups and sections
   */
  // Spacing
  spacing: {
    section: "space-y-8 lg:space-y-12 2xl:space-y-16",
    formGroup: "space-y-6 lg:space-y-8",
    stack: "space-y-4 lg:space-y-6",
    stackSmall: "space-y-2 lg:space-y-3",
    inline: "gap-3 lg:gap-4",
    inlineSmall: "gap-2 lg:gap-3",
    inlineLarge: "gap-4 lg:gap-6",
    // Padding presets
    padding: {
      xs: "p-2 lg:p-3",
      sm: "p-3 lg:p-4",
      md: "p-4 lg:p-6",
      lg: "p-6 lg:p-8 2xl:p-10",
      xl: "p-8 lg:p-10 2xl:p-12",
    },
    // Margin presets
    margin: {
      xs: "m-2 lg:m-3",
      sm: "m-3 lg:m-4",
      md: "m-4 lg:m-6",
      lg: "m-6 lg:m-8 2xl:m-10",
      xl: "m-8 lg:m-10 2xl:m-12",
    },
  },

  /**
   * Typography
   * Heading and text size scales with responsive breakpoints
   * Scales up on larger screens for better readability
   */
  // Typography
  typography: {
    h1: "text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl font-bold",
    h2: "text-3xl md:text-4xl lg:text-5xl 2xl:text-6xl font-bold",
    h3: "text-2xl md:text-3xl lg:text-4xl 2xl:text-5xl font-semibold",
    h4: "text-xl md:text-2xl lg:text-3xl 2xl:text-4xl font-semibold",
    h5: "text-lg md:text-xl lg:text-2xl 2xl:text-3xl font-medium",
    h6: "text-base md:text-lg lg:text-xl 2xl:text-2xl font-medium",
    body: "text-base lg:text-lg",
    small: "text-sm lg:text-base",
    xs: "text-xs lg:text-sm",
  },

  /**
   * Component-specific colors
   * Color variants for all UI components including badges, alerts, buttons, forms, navigation, etc.
   */
  // Component-specific colors
  colors: {
    // Brand colors
    brand: {
      logo: "bg-gradient-to-br from-blue-600 to-blue-700",
      logoText: "text-white",
    },
    // Badge colors
    badge: {
      default: "bg-gray-200 dark:bg-gray-700 text-slate-700 dark:text-gray-200",
      primary: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      secondary:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      success:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      warning:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      danger: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      info: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
    },
    // Alert colors
    alert: {
      info: {
        container:
          "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800",
        icon: "text-blue-600 dark:text-blue-400",
        title: "text-blue-900 dark:text-blue-200",
        text: "text-blue-800 dark:text-blue-300",
      },
      success: {
        container:
          "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800",
        icon: "text-green-600 dark:text-green-400",
        title: "text-green-900 dark:text-green-200",
        text: "text-green-800 dark:text-green-300",
      },
      warning: {
        container:
          "bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800",
        icon: "text-yellow-600 dark:text-yellow-400",
        title: "text-yellow-900 dark:text-yellow-200",
        text: "text-yellow-800 dark:text-yellow-300",
      },
      error: {
        container:
          "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800",
        icon: "text-red-600 dark:text-red-400",
        title: "text-red-900 dark:text-red-200",
        text: "text-red-800 dark:text-red-300",
      },
    },
    // Button colors
    button: {
      primary:
        "bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 focus:ring-primary-500",
      secondary:
        "bg-gradient-to-r from-secondary-500 to-secondary-600 text-white hover:from-secondary-600 hover:to-secondary-700",
      outline:
        "border-2 border-primary-600 dark:border-blue-500 text-primary-600 dark:text-blue-400 hover:bg-primary-50 dark:hover:bg-blue-950",
      alertClose: "hover:bg-black/5 dark:hover:bg-white/5",
    },
    // Form colors
    form: {
      checked: "checked:bg-blue-600 checked:border-blue-600",
      radioChecked: "checked:border-blue-600 checked:border-[6px]",
      checkmark: "text-white",
      required: "text-red-500",
      focusRing:
        "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
    },
    // Navbar colors
    navbar: {
      active:
        "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold shadow-sm",
      inactive:
        "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors",
      icon: "w-5 h-5 md:w-6 md:h-6",
    },
    // Bottom navbar colors
    bottomNav: {
      active: "text-blue-600 dark:text-blue-400 font-semibold",
      inactive:
        "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors",
      text: "text-xs",
      icon: "w-6 h-6",
    },
    // Footer colors
    footer: {
      title: "text-white",
      text: "text-gray-300",
      textHover: "hover:text-white transition-colors",
      border: "border-gray-700",
      copyright: "text-gray-400",
    },
    // Badge/notification
    notification: {
      badge: "bg-gradient-to-r from-red-500 to-red-600 text-white",
    },
    // Icon colors
    icon: {
      muted: "text-gray-400",
      titleBar: "text-gray-900 dark:text-gray-100",
      navbar: "text-gray-900 dark:text-gray-100",
      onLight: "text-slate-600 dark:text-gray-300",
    },
    // Icon button hovers
    iconButton: {
      onPrimary: "hover:bg-black/10 active:bg-black/20",
      onLight:
        "hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700",
    },
  },

  /**
   * Breakpoints
   * Reference for responsive design breakpoints (matches Tailwind defaults)
   * sm: Mobile landscape / Small tablets
   * md: Tablets
   * lg: Laptops / Small desktops
   * xl: Desktops
   * 2xl: Large desktops / Widescreens
   * 3xl: Ultra-wide / 4K displays
   */
  // Breakpoints (for reference)
  breakpoints: {
    sm: "640px", // Mobile landscape
    md: "768px", // Tablets
    lg: "1024px", // Laptops
    xl: "1280px", // Desktops
    "2xl": "1536px", // Widescreens
    "3xl": "1920px", // 4K displays
  },

  /**
   * Utility classes
   * Helper classes for scrollbar styling, safe areas, gradients, etc.
   */
  // Utility classes
  utilities: {
    scrollbarHide:
      "scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
    scrollbarThin:
      "scrollbar-thin [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gradient-to-b [&::-webkit-scrollbar-thumb]:from-primary-400 [&::-webkit-scrollbar-thumb]:to-primary-500 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:from-primary-500 [&::-webkit-scrollbar-thumb:hover]:to-primary-600",
    safeAreaBottom: "pb-[env(safe-area-inset-bottom)]",
    gradientText:
      "bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent",
  },

  /**
   * Border radius presets
   * Standard border radius values for consistent rounding
   */
  borderRadius: {
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

  /**
   * Container and section widths
   * Standard width constraints for content areas
   * Responsive max-widths for different screen sizes
   */
  container: {
    xs: "max-w-xs", // ~320px
    sm: "max-w-sm", // ~384px
    md: "max-w-md", // ~448px
    lg: "max-w-lg", // ~512px
    xl: "max-w-xl", // ~576px
    "2xl": "max-w-2xl", // ~672px
    "3xl": "max-w-3xl", // ~768px
    "4xl": "max-w-4xl", // ~896px
    "5xl": "max-w-5xl", // ~1024px
    "6xl": "max-w-6xl", // ~1152px
    "7xl": "max-w-7xl", // ~1280px
    full: "max-w-full",
    screen: "max-w-screen-xl", // Viewport width at xl breakpoint
    ultrawide: "max-w-[1600px]", // For 2xl+ screens
    "4k": "max-w-[1920px]", // For 4K displays
  },

  /**
   * Animations
   * Predefined animation classes for common UI transitions
   */
  // Animations
  animations: {
    slideDown: "animate-[slideDown_0.3s_ease-out]",
    slideUp: "animate-[slideUp_0.3s_ease-out]",
    fadeIn: "animate-[fadeIn_0.2s_ease-out]",
    scaleUp: "hover:scale-105 transition-transform",
    scaleDown: "active:scale-95 transition-transform",
  },

  /**
   * Base styles
   * Global HTML/body styling classes
   */
  // Base styles (for body/html)
  base: {
    body: 'bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased font-[system-ui,-apple-system,"Segoe_UI",Roboto,"Helvetica_Neue",Arial,sans-serif]',
    html: "scroll-smooth",
  },
} as const;

export type ThemeMode = "light" | "dark";
