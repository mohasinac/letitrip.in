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
    // Backgrounds - deeper dark mode with more depth
    bgPrimary: "bg-white dark:bg-gray-950",
    bgSecondary: "bg-gray-50 dark:bg-gray-900",
    bgTertiary: "bg-gray-100 dark:bg-gray-800",
    bgElevated: "bg-white dark:bg-gray-900/80",
    bgInput: "bg-white dark:bg-gray-800",

    // Text colors - brighter white text in dark mode
    textPrimary: "text-gray-900 dark:text-gray-50",
    textSecondary: "text-gray-600 dark:text-gray-400",
    textMuted: "text-gray-400 dark:text-gray-500",
    textError: "text-red-600 dark:text-red-400",
    textSuccess: "text-green-600 dark:text-green-400",
    textOnPrimary: "text-white",
    textOnDark: "text-white",

    // Borders
    border: "border-gray-200 dark:border-gray-800",
    borderSubtle: "border-gray-100 dark:border-gray-800/60",
    borderLight: "border-gray-100 dark:border-gray-700",
    borderError: "border-red-500",
    borderColor: "border-gray-200 dark:border-gray-700",

    // Interactive states - tinted hover/active for personality
    hover: "hover:bg-gray-100 dark:hover:bg-gray-800",
    hoverCard: "hover:bg-gray-50 dark:hover:bg-indigo-950/20",
    hoverBorder: "hover:border-gray-300 dark:hover:border-gray-600",
    hoverText: "hover:text-gray-700 dark:hover:text-gray-200",
    activeRow: "bg-indigo-50 dark:bg-indigo-950/30",
    focusRing: "focus:ring-indigo-500 dark:focus:ring-indigo-500",

    // Dividers
    divider: "divide-gray-200 dark:divide-gray-800",

    // Placeholders
    placeholder: "placeholder-gray-400 dark:placeholder-gray-500",
  },

  /**
   * Input/Form styles
   * Enhanced input styles with improved focus states
   */
  // Input/Form styles
  input: {
    base: "rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors duration-150 placeholder:text-gray-400 dark:placeholder:text-gray-500",
    error:
      "border-rose-400 dark:border-rose-500 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/50 dark:bg-rose-950/10",
    success:
      "border-emerald-400 dark:border-emerald-500 focus:ring-emerald-500/20 focus:border-emerald-500",
    disabled:
      "bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50",
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
    minWidth: "min-w-[200px] w-full",
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
    // Content width - consistent across all sections
    maxContentWidth: "max-w-7xl",
    // Container for header/nav elements - matches content width
    containerWidth: "max-w-7xl",
    contentPadding: "px-4 md:px-6 lg:px-8",
    navPadding: "px-4 sm:px-6 lg:px-8",
    titleBarBg:
      "bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800",
    navbarBg:
      "bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800",
    sidebarBg:
      "bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800",
    bottomNavBg:
      "bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800",
    footerBg:
      "bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900",
    // Utility layouts
    fullScreen: "min-h-screen",
    flexCenter: "flex items-center justify-center",
    centerText: "text-center",
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
    overlay: "z-[45]",
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
  // Spacing - enhanced with page and section level spacing
  spacing: {
    section: "space-y-8 md:space-y-12 lg:space-y-16",
    formGroup: "space-y-6 lg:space-y-8",
    stack: "space-y-4",
    stackSmall: "space-y-2",
    inline: "space-x-4",
    inlineSmall: "gap-2 lg:gap-3",
    inlineLarge: "gap-4 lg:gap-6",
    // Page level spacing
    pageY: "py-6 sm:py-8 lg:py-10",
    sectionGap: "mt-8 md:mt-12",
    cardPadding: "p-5 sm:p-6 lg:p-8",
    // Gap utilities
    gap: {
      xs: "gap-2",
      sm: "gap-3",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
    },
    // Padding presets
    padding: {
      xs: "p-2",
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
      xl: "p-8",
      "2xl": "p-10",
    },
    // Margin presets
    margin: {
      xs: "m-2 lg:m-3",
      sm: "m-3 lg:m-4",
      md: "m-4 lg:m-6",
      lg: "m-6 lg:m-8 2xl:m-10",
      xl: "m-8 lg:m-10 2xl:m-12",
      bottom: {
        sm: "mb-2",
        md: "mb-4",
        lg: "mb-6",
        xl: "mb-8",
      },
    },
  },

  /**
   * Typography
   * Heading and text size scales with responsive breakpoints
   * Scales up on larger screens for better readability
   */
  // Typography - refined professional scale
  typography: {
    // Page-level headings
    pageTitle: "text-2xl md:text-3xl font-bold tracking-tight leading-tight",
    pageSubtitle:
      "text-base text-gray-500 dark:text-gray-400 leading-relaxed mt-1",
    // Section headings
    sectionTitle: "text-xl md:text-2xl font-semibold tracking-tight",
    sectionSubtitle: "text-sm md:text-base text-gray-500 dark:text-gray-400",
    // Card typography
    cardTitle: "text-lg font-semibold leading-snug",
    cardBody: "text-sm md:text-base leading-relaxed",
    // Utility typography
    label: "text-sm font-medium text-gray-700 dark:text-gray-300",
    caption: "text-xs text-gray-500 dark:text-gray-400",
    overline:
      "text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400",
    // Standard headings (moderated scale)
    h1: "text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight",
    h2: "text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight",
    h3: "text-xl md:text-2xl lg:text-3xl font-bold tracking-tight",
    h4: "text-lg md:text-xl font-bold",
    h5: "text-lg md:text-xl font-medium",
    h6: "text-base md:text-lg font-medium",
    body: "text-base lg:text-lg",
    small: "text-sm lg:text-base",
    xs: "text-xs lg:text-sm",
    display: "text-8xl md:text-9xl font-bold",
  },

  /**
   * Accent colors
   * Vibrant accent colors for CTAs and highlighting
   */
  accent: {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white",
    primarySoft:
      "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
    secondary: "bg-teal-600 hover:bg-teal-700 text-white",
    secondarySoft:
      "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
    warm: "bg-amber-500 hover:bg-amber-600 text-white",
    warmSoft:
      "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white",
    successSoft:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    danger: "bg-rose-600 hover:bg-rose-700 text-white",
    dangerSoft:
      "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
    warning: "bg-amber-500 hover:bg-amber-600 text-white",
    warningSoft:
      "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    info: "bg-sky-500 hover:bg-sky-600 text-white",
    infoSoft: "bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  },

  /**
   * Badge variants
   * Enhanced badge system with ring borders and role-specific variants
   */
  badge: {
    active:
      "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-400/20",
    inactive:
      "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-600 ring-1 ring-gray-500/10 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-400/20",
    pending:
      "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-400/20",
    approved:
      "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-400/20",
    rejected:
      "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-900/30 dark:text-rose-300 dark:ring-rose-400/20",
    danger:
      "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-900/30 dark:text-rose-300 dark:ring-rose-400/20",
    info: "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-600/20 dark:bg-sky-900/30 dark:text-sky-300 dark:ring-sky-400/20",
    warning:
      "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-400/20",
    success:
      "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-400/20",
    // Role-specific badges
    admin:
      "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 ring-1 ring-purple-600/20 dark:bg-purple-900/30 dark:text-purple-300 dark:ring-purple-400/20",
    moderator:
      "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-600/20 dark:bg-sky-900/30 dark:text-sky-300 dark:ring-sky-400/20",
    seller:
      "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-teal-50 text-teal-700 ring-1 ring-teal-600/20 dark:bg-teal-900/30 dark:text-teal-300 dark:ring-teal-400/20",
    user: "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 ring-1 ring-gray-500/10 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-400/20",
    // Compact role text colors (for TitleBar/BottomNavbar)
    roleText: {
      admin: "text-purple-600 dark:text-purple-400",
      moderator: "text-sky-600 dark:text-sky-400",
      seller: "text-teal-600 dark:text-teal-400",
      user: "text-gray-600 dark:text-gray-400",
    },
  },

  /**
   * Enhanced card variants
   * Multiple card styles including gradients, glass effects, and stat cards
   */
  enhancedCard: {
    base: "rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200",
    elevated:
      "rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200",
    interactive:
      "rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200 cursor-pointer",
    glass:
      "rounded-xl backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border border-white/30 dark:border-gray-700/50 shadow-lg",
    gradient: {
      indigo:
        "rounded-xl bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/40 dark:to-gray-900 border border-indigo-100 dark:border-indigo-900/40",
      teal: "rounded-xl bg-gradient-to-br from-teal-50 to-white dark:from-teal-950/40 dark:to-gray-900 border border-teal-100 dark:border-teal-900/40",
      amber:
        "rounded-xl bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/40 dark:to-gray-900 border border-amber-100 dark:border-amber-900/40",
      rose: "rounded-xl bg-gradient-to-br from-rose-50 to-white dark:from-rose-950/40 dark:to-gray-900 border border-rose-100 dark:border-rose-900/40",
    },
    stat: {
      indigo:
        "rounded-xl border-l-4 border-l-indigo-500 bg-white dark:bg-gray-900 shadow-sm",
      teal: "rounded-xl border-l-4 border-l-teal-500 bg-white dark:bg-gray-900 shadow-sm",
      amber:
        "rounded-xl border-l-4 border-l-amber-500 bg-white dark:bg-gray-900 shadow-sm",
      rose: "rounded-xl border-l-4 border-l-rose-500 bg-white dark:bg-gray-900 shadow-sm",
      emerald:
        "rounded-xl border-l-4 border-l-emerald-500 bg-white dark:bg-gray-900 shadow-sm",
    },
  },

  /**
   * Page header styles
   * Decorative page headers with optional gradients
   */
  pageHeader: {
    wrapper: "pb-6 mb-8 border-b border-gray-200 dark:border-gray-700/60",
    withGradient:
      "pb-8 mb-8 border-b border-gray-200/80 dark:border-gray-700/40 bg-gradient-to-r from-indigo-50/60 via-transparent to-teal-50/30 dark:from-indigo-950/20 dark:via-transparent dark:to-teal-950/10 rounded-t-xl -mx-4 -mt-4 px-4 pt-6 md:-mx-6 md:-mt-6 md:px-6 md:pt-8",
    adminGradient:
      "pb-8 mb-8 border-b border-gray-200/80 dark:border-gray-700/40 bg-gradient-to-r from-purple-50/60 via-transparent to-indigo-50/30 dark:from-purple-950/20 dark:via-transparent dark:to-indigo-950/10 rounded-t-xl -mx-4 -mt-4 px-4 pt-6 md:-mx-6 md:-mt-6 md:px-6 md:pt-8",
  },

  /**
   * Section backgrounds
   * Subtle background variations for visual hierarchy
   */
  sectionBg: {
    subtle: "bg-gray-50/50 dark:bg-gray-800/20",
    warm: "bg-gradient-to-br from-amber-50/30 to-orange-50/20 dark:from-amber-950/10 dark:to-orange-950/5",
    cool: "bg-gradient-to-br from-indigo-50/30 to-sky-50/20 dark:from-indigo-950/10 dark:to-sky-950/5",
    mesh: "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/40 via-white to-teal-50/20 dark:from-indigo-950/20 dark:via-gray-900 dark:to-teal-950/10",
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
    // Button colors - harmonized with gradients and colored shadows
    button: {
      primary:
        "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 shadow-sm hover:shadow-md shadow-indigo-500/20 focus:ring-indigo-500",
      secondary:
        "bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 shadow-sm hover:shadow-md shadow-teal-500/20 focus:ring-teal-500",
      outline:
        "border-2 border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50",
      ghost:
        "text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800",
      danger:
        "bg-gradient-to-r from-rose-600 to-rose-700 text-white hover:from-rose-700 hover:to-rose-800 shadow-sm hover:shadow-md shadow-rose-500/20 focus:ring-rose-500",
      warning:
        "bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-sm hover:shadow-md shadow-amber-500/20 focus:ring-amber-500",
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
   * Predefined animation classes for common UI transitions and micro-interactions
   */
  // Animations
  animations: {
    fadeIn: "animate-in fade-in duration-200",
    slideUp: "animate-in slide-in-from-bottom-2 duration-300",
    slideDown: "animate-in slide-in-from-top-2 duration-300",
    scaleIn: "animate-in zoom-in-95 duration-200",
    scaleUp: "hover:scale-105 transition-transform",
    scaleDown: "active:scale-95 transition-transform",
    // Legacy support
    slideDownLegacy: "animate-[slideDown_0.3s_ease-out]",
    slideUpLegacy: "animate-[slideUp_0.3s_ease-out]",
    fadeInLegacy: "animate-[fadeIn_0.2s_ease-out]",
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

  /**
   * Utility classes
   * Common utilities for sizing, opacity, borders, and text styling
   */
  iconSize: {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-16 h-16",
  },
  opacity: {
    low: "opacity-10",
    medium: "opacity-50",
    high: "opacity-75",
  },
  text: {
    emphasis: "font-bold text-yellow-600 dark:text-yellow-400",
  },

  /**
   * Common Component Patterns
   * Reusable class combinations for common UI patterns
   */
  patterns: {
    // Admin input pattern
    adminInput:
      "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white",

    // Admin select pattern
    adminSelect:
      "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white",

    // Page container
    pageContainer: "min-h-screen bg-gray-50 dark:bg-gray-900",

    // Section container
    sectionContainer: "max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 lg:py-12",

    // Form container
    formContainer:
      "bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 lg:p-8 space-y-6",

    // List item
    listItem:
      "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors",

    // Badge default
    badgeDefault:
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",

    // Link default
    linkDefault:
      "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors underline-offset-2 hover:underline",

    // Icon button
    iconButton:
      "p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700",

    // Modal overlay
    modalOverlay:
      "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50",

    // Modal content
    modalContent:
      "bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-lg w-full mx-4 overflow-hidden",

    // Divider
    divider: "border-t border-gray-200 dark:border-gray-800",

    // Empty state
    emptyState:
      "flex flex-col items-center justify-center py-12 text-center text-gray-500 dark:text-gray-400",

    // Loading state
    loadingState: "flex items-center justify-center py-8",

    // Error state
    errorState:
      "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200",

    // Success state
    successState:
      "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 text-green-800 dark:text-green-200",
  },

  /**
   * CSS Classes for Component States
   * Utilities for common component states
   */
  states: {
    disabled: "opacity-50 cursor-not-allowed pointer-events-none",
    loading: "opacity-75 cursor-wait",
    readonly: "bg-gray-100 dark:bg-gray-800 cursor-default",
    error: "border-red-500 dark:border-red-500",
    success: "border-green-500 dark:border-green-500",
    focus:
      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
  },

  /**
   * Transitions
   * Predefined transition classes for smooth animations
   */
  transitions: {
    default: "transition-all duration-200 ease-in-out",
    fast: "transition-all duration-150 ease-in-out",
    slow: "transition-all duration-500 ease-in-out",
    colors: "transition-colors duration-200 ease-in-out",
    transform: "transition-transform duration-200 ease-in-out",
    opacity: "transition-opacity duration-200 ease-in-out",
  },

  /**
   * Shadows
   * Predefined shadow utilities
   */
  shadows: {
    none: "shadow-none",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
    "2xl": "shadow-2xl",
    inner: "shadow-inner",
    soft: "shadow-soft",
    glow: "shadow-glow",
  },
} as const;

export type ThemeMode = "light" | "dark";
