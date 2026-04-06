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
  // Themed classes (responsive to dark mode) — slate dark backgrounds (navy-tinted)
  themed: {
    // Backgrounds — white base in light, navy-tinted slate in dark
    bgPrimary: "bg-zinc-50 dark:bg-slate-950",
    bgSecondary: "bg-zinc-100 dark:bg-slate-900",
    bgTertiary: "bg-zinc-200 dark:bg-slate-800",
    bgElevated: "bg-white dark:bg-slate-900/90",
    bgInput: "bg-white dark:bg-slate-800/60",

    // Text colors
    textPrimary: "text-zinc-900 dark:text-zinc-50",
    textSecondary: "text-zinc-500 dark:text-zinc-400",
    textMuted: "text-zinc-400 dark:text-zinc-500",
    textError: "text-red-600 dark:text-red-400",
    textSuccess: "text-emerald-600 dark:text-emerald-400",
    textOnPrimary: "text-white",
    textOnDark: "text-white",

    // Borders — subtle in light, visible slate in dark
    border: "border-zinc-200 dark:border-slate-700",
    borderSubtle: "border-zinc-100 dark:border-slate-800/60",
    borderLight: "border-zinc-100 dark:border-slate-700/60",
    borderError: "border-red-500",
    borderColor: "border-zinc-200 dark:border-slate-700",

    // Interactive states
    hover: "hover:bg-zinc-100 dark:hover:bg-slate-800",
    hoverCard: "hover:bg-zinc-50 dark:hover:bg-slate-800/60",
    hoverBorder: "hover:border-zinc-300 dark:hover:border-slate-600",
    hoverText: "hover:text-zinc-800 dark:hover:text-zinc-100",
    activeRow: "bg-primary-50 dark:bg-secondary-950/30",
    focusRing: "focus:ring-primary-500 dark:focus:ring-secondary-400",

    // Dividers
    divider: "divide-zinc-200 dark:divide-slate-700",

    // Placeholders
    placeholder: "placeholder-zinc-400 dark:placeholder-zinc-500",
  },

  /**
   * Input/Form styles
   * Enhanced input styles with improved focus states
   */
  // Input/Form styles — clean borders, lime green focus in dark mode
  input: {
    base: "rounded-lg border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-3.5 py-2.5 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary-500/40 dark:focus:ring-secondary-400/40 focus:border-primary-500 dark:focus:border-secondary-400 focus:outline-none transition-colors duration-150 placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
    error:
      "border-red-400 dark:border-red-500 focus:ring-red-500/20 focus:border-red-500 bg-red-50/30 dark:bg-red-950/10",
    success:
      "border-emerald-400 dark:border-emerald-500 focus:ring-emerald-500/20 focus:border-emerald-500",
    disabled:
      "bg-zinc-50 dark:bg-slate-800/30 text-zinc-400 dark:text-zinc-500 cursor-not-allowed opacity-60",
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
    ctaPrimary:
      "bg-white text-secondary-700 font-bold px-8 py-4 rounded-full text-lg hover:bg-secondary-50 transition-colors shadow-lg",
    ctaOutline:
      "border-2 border-white text-white font-semibold px-8 py-4 rounded-full text-lg hover:bg-white/10 transition-colors bg-transparent",
  },

  /**
   * Card styles
   * Container component styling with shadow variants
   */
  // Card styles — minimal elevation, clean borders
  card: {
    base: "rounded-2xl overflow-hidden transition-all",
    shadow: "shadow-sm",
    shadowElevated: "shadow-lg",
    hover:
      "hover:shadow-md dark:hover:shadow-xl cursor-pointer transition-shadow duration-200",
    /** Chat message bubble variants */
    chatBubble: {
      mine: "bg-primary-600 text-white dark:bg-secondary-500 dark:text-white rounded-2xl rounded-br-sm",
      theirs: "bg-zinc-100 dark:bg-slate-800 rounded-2xl rounded-bl-sm",
    },
  },

  /**
   * Layout constants
   * Dimensions and styling for all layout components (navbar, sidebar, etc.)
   */
  // Layout constants
  layout: {
    titleBarHeight: "h-12",
    navbarHeight: "h-10 md:h-12",
    sidebarWidth: "w-80",
    bottomNavHeight: "h-14",
    // Content width - consistent across all sections
    maxContentWidth: "max-w-[1920px]",
    // Container for header/nav elements - matches content width
    containerWidth: "max-w-[1920px]",
    contentPadding: "px-4 md:px-6 lg:px-8",
    navPadding: "px-4 sm:px-6 lg:px-8",
    titleBarBg:
      "bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-slate-800/80",
    navbarBg:
      "bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-slate-800/80",
    sidebarBg:
      "bg-white dark:bg-slate-900 border-l border-zinc-200 dark:border-slate-800",
    bottomNavBg:
      "bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-t border-zinc-200/80 dark:border-slate-800/80",
    footerBg:
      "bg-zinc-50 dark:bg-slate-900 border-t border-zinc-200 dark:border-slate-800",
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
    /** BottomActions sits directly above BottomNavbar (bottom-14) at the same level. */
    bottomActions: "z-40",
    search: "z-40",
    searchBackdrop: "z-[35]",
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
    /**
     * Gap token map — use with `Grid`, `Row`, and `Stack` primitives, or
     * directly as `className={THEME_CONSTANTS.spacing.gap.md}`.
     * Mirrors the inlined GAP_MAP in packages/ui/src/components/Layout.tsx.
     */
    gap: {
      none: "",
      px: "gap-px",
      xs: "gap-1",
      sm: "gap-2",
      "2.5": "gap-2.5",
      "3": "gap-3",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
      "2xl": "gap-12",
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
    pageTitle:
      "text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-tight",
    pageSubtitle:
      "text-base md:text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed mt-1",
    // Section headings
    sectionTitle:
      "text-xl md:text-2xl lg:text-3xl font-semibold tracking-tight",
    sectionSubtitle:
      "text-sm md:text-base lg:text-lg text-zinc-500 dark:text-zinc-400",
    // Card typography
    cardTitle: "text-base md:text-lg font-semibold leading-snug",
    cardBody: "text-sm md:text-base leading-relaxed",
    // Utility typography
    label: "text-sm font-medium text-zinc-700 dark:text-zinc-300",
    caption: "text-xs text-zinc-500 dark:text-zinc-400",
    overline:
      "text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400",
    // Standard headings (moderated scale) — font-display uses Poppins
    h1: "text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight font-display",
    h2: "text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight font-display",
    h3: "text-xl md:text-2xl lg:text-3xl font-bold tracking-tight font-display",
    h4: "text-lg md:text-xl lg:text-2xl font-bold font-display",
    h5: "text-base md:text-lg lg:text-xl font-medium",
    h6: "text-sm md:text-base lg:text-lg font-medium",
    body: "text-base lg:text-lg",
    small: "text-sm lg:text-base",
    xs: "text-xs lg:text-sm",
    display: "text-8xl md:text-9xl font-bold font-display",
  },

  /**
   * Accent colors
   * Vibrant accent colors for CTAs and highlighting
   */
  accent: {
    primary:
      "bg-primary-600 hover:bg-primary-700 text-white dark:bg-secondary-500 dark:hover:bg-secondary-400 dark:text-white",
    primarySoft:
      "bg-primary-50 text-primary-700 dark:bg-secondary-900/30 dark:text-secondary-300",
    secondary: "bg-secondary-600 hover:bg-secondary-700 text-white",
    secondarySoft:
      "bg-secondary-50 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-300",
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
      "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-zinc-100 text-zinc-600 ring-1 ring-zinc-500/10 dark:bg-slate-800 dark:text-zinc-400 dark:ring-zinc-400/20",
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
      "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-secondary-50 text-secondary-700 ring-1 ring-secondary-600/20 dark:bg-secondary-900/30 dark:text-secondary-300 dark:ring-secondary-400/20",
    user: "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-zinc-100 text-zinc-700 ring-1 ring-zinc-500/10 dark:bg-slate-800 dark:text-zinc-300 dark:ring-zinc-400/20",
    // Compact role text colors (for TitleBar/BottomNavbar)
    roleText: {
      admin: "text-purple-600 dark:text-purple-400",
      moderator: "text-sky-600 dark:text-sky-400",
      seller: "text-secondary-600 dark:text-secondary-400",
      user: "text-zinc-600 dark:text-zinc-400",
    },
  },

  /**
   * Enhanced card variants
   * Multiple card styles including gradients, glass effects, and stat cards
   */
  enhancedCard: {
    base: "rounded-2xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-200",
    elevated:
      "rounded-2xl bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-shadow duration-200",
    interactive:
      "rounded-2xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-primary-300/60 dark:hover:border-secondary-500/60 transition-all duration-200 cursor-pointer",
    glass:
      "rounded-2xl backdrop-blur-md bg-white/85 dark:bg-slate-900/85 border border-zinc-200/60 dark:border-slate-700/40 shadow-lg",
    gradient: {
      indigo:
        "rounded-2xl bg-gradient-to-br from-primary-50 via-white to-white dark:from-primary-950/30 dark:via-slate-900 dark:to-slate-900 border border-primary-100/80 dark:border-primary-900/40",
      teal: "rounded-2xl bg-gradient-to-br from-secondary-50 via-white to-white dark:from-secondary-950/30 dark:via-slate-900 dark:to-slate-900 border border-secondary-100/80 dark:border-secondary-900/40",
      amber:
        "rounded-2xl bg-gradient-to-br from-amber-50 via-white to-white dark:from-amber-950/30 dark:via-slate-900 dark:to-slate-900 border border-amber-100/80 dark:border-amber-900/40",
      rose: "rounded-2xl bg-gradient-to-br from-rose-50 via-white to-white dark:from-rose-950/30 dark:via-slate-900 dark:to-slate-900 border border-rose-100/80 dark:border-rose-900/40",
    },
    stat: {
      indigo:
        "rounded-2xl border-l-4 border-l-primary-500 bg-white dark:bg-slate-900 shadow-sm",
      teal: "rounded-2xl border-l-4 border-l-secondary-500 bg-white dark:bg-slate-900 shadow-sm",
      amber:
        "rounded-2xl border-l-4 border-l-amber-500 bg-white dark:bg-slate-900 shadow-sm",
      rose: "rounded-2xl border-l-4 border-l-rose-500 bg-white dark:bg-slate-900 shadow-sm",
      emerald:
        "rounded-2xl border-l-4 border-l-emerald-500 bg-white dark:bg-slate-900 shadow-sm",
    },
  },

  /**
   * Page header styles
   * Decorative page headers with optional gradients
   */
  pageHeader: {
    wrapper: "pb-6 mb-8 border-b border-zinc-200 dark:border-slate-700",
    withGradient:
      "pb-8 mb-8 border-b border-zinc-200 dark:border-slate-700 bg-gradient-to-br from-primary-50/50 via-transparent to-transparent dark:from-primary-950/10 dark:via-transparent dark:to-transparent rounded-t-2xl -mx-4 -mt-4 px-4 pt-6 md:-mx-6 md:-mt-6 md:px-6 md:pt-8",
    adminGradient:
      "pb-8 mb-8 border-b border-zinc-200 dark:border-slate-700 bg-gradient-to-br from-primary-50/50 via-transparent to-transparent dark:from-primary-950/10 dark:via-transparent dark:to-transparent rounded-t-2xl -mx-4 -mt-4 px-4 pt-6 md:-mx-6 md:-mt-6 md:px-6 md:pt-8",
  },

  /**
   * Section backgrounds
   * Subtle background variations for visual hierarchy
   */
  sectionBg: {
    subtle: "bg-zinc-50/80 dark:bg-slate-800/20",
    warm: "bg-gradient-to-br from-amber-50/40 to-orange-50/20 dark:from-amber-950/10 dark:to-orange-950/5",
    cool: "bg-gradient-to-br from-primary-50/40 to-sky-50/20 dark:from-primary-950/10 dark:to-sky-950/5",
    mesh: "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-50/50 via-white to-secondary-50/20 dark:from-primary-950/20 dark:via-slate-900 dark:to-secondary-950/10",
  },

  /**
   * Accent banner gradients
   * Themed gradient banners: green→cobalt in light mode, pink→cobalt in dark mode.
   * Use for promo strips, newsletter boxes, CTA panels, and spotlight sections.
   */
  accentBanner: {
    // Full-width promo strip (e.g. TitleBar promo strip)
    gradient:
      "bg-gradient-to-r from-primary-700 to-cobalt dark:from-secondary-700 dark:to-cobalt",
    // Semi-transparent inset boxes (e.g. footer newsletter slot)
    gradientSubtle:
      "bg-gradient-to-r from-primary/90 to-cobalt/80 dark:from-secondary/90 dark:to-cobalt/80",
    // Spotlight section — light cobalt-tinted in light mode, deep navy in dark mode
    spotlightSection:
      "bg-gradient-to-br from-cobalt-50 via-zinc-50 to-cobalt-50 dark:from-cobalt-900 dark:via-slate-900 dark:to-cobalt-950",
    spotlightText: "text-zinc-900 dark:text-white",
    spotlightTextMuted: "text-zinc-500 dark:text-white/60",
    spotlightIcon: "text-cobalt-600 dark:text-white/80",
    spotlightIconBg: "bg-cobalt-100 dark:bg-white/10",
    spotlightDivider: "border-cobalt-200 dark:border-white/10",
    // Dev/admin hero banner (e.g. DemoSeedView header)
    devHero:
      "bg-gradient-to-br from-zinc-100 via-zinc-50 to-zinc-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900",
    devHeroText: "text-zinc-900 dark:text-white",
    devHeroTextMuted: "text-zinc-600 dark:text-zinc-300",
    devHeroChipBg: "bg-zinc-200 dark:bg-white/10",
    devHeroChipText: "text-zinc-600 dark:text-zinc-300",
    devHeroChipBoldBg: "bg-zinc-300 dark:bg-white/20",
    devHeroChipBoldText: "text-zinc-900 dark:text-white",

    // ── Page-level hero banners ────────────────────────────────────────────
    // Used on all static/info pages (contact, help, legal, how-it-works, etc.)
    // Light: dark-green → cobalt  |  Dark: hot-pink → cobalt
    pageHero:
      "bg-gradient-to-br from-primary-700 to-cobalt dark:from-secondary-700 dark:to-cobalt",
    // CTA / marketing sections at bottom of feature pages (bg-gradient-to-r)
    cta: "bg-gradient-to-r from-primary-700 to-cobalt dark:from-secondary-700 dark:to-cobalt",
    // Promotions page vibrant hero (rose → pink → orange; dark: secondary pink)
    promotionHero:
      "bg-gradient-to-br from-rose-500 via-pink-600 to-orange-500 dark:from-secondary-700 dark:via-secondary-600 dark:to-rose-700",
    // Cover strip for seller storefront / public profile (purely decorative h-48)
    coverStrip:
      "bg-gradient-to-r from-primary-700 to-cobalt dark:from-secondary-700 dark:to-cobalt",
    // WhatsApp community card — always green (on-brand), darker in dark mode
    whatsappCard:
      "bg-gradient-to-br from-green-700 to-green-800 dark:from-emerald-800 dark:to-emerald-900",
    // Solid metrics/stats bar on feature pages
    statBarBg: "bg-primary-700 dark:bg-secondary-800",
    // Checkbox overlay on card images (semi-transparent)
    imageCheckbox: "bg-white/80 dark:bg-slate-800/80",
  },

  /**
   * Component-specific colors
   * Color variants for all UI components including badges, alerts, buttons, forms, navigation, etc.
   */
  // Component-specific colors
  colors: {
    // Brand colors
    brand: {
      logo: "bg-gradient-to-br from-cobalt-600 to-cobalt-700",
      logoText: "text-white",
    },
    // Badge colors
    badge: {
      default: "bg-zinc-100 dark:bg-slate-800 text-zinc-700 dark:text-zinc-300",
      primary:
        "bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300",
      secondary:
        "bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300",
      success:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
      warning:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
      danger: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
      info: "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300",
    },
    // Alert colors — softer dark mode backgrounds for less visual noise
    alert: {
      info: {
        container:
          "bg-sky-50 border-sky-200/80 dark:bg-sky-950/30 dark:border-sky-800/50",
        icon: "text-sky-600 dark:text-sky-400",
        title: "text-sky-900 dark:text-sky-200",
        text: "text-sky-800 dark:text-sky-300",
      },
      success: {
        container:
          "bg-emerald-50 border-emerald-200/80 dark:bg-emerald-950/30 dark:border-emerald-800/50",
        icon: "text-emerald-600 dark:text-emerald-400",
        title: "text-emerald-900 dark:text-emerald-200",
        text: "text-emerald-800 dark:text-emerald-300",
      },
      warning: {
        container:
          "bg-amber-50 border-amber-200/80 dark:bg-amber-950/30 dark:border-amber-800/50",
        icon: "text-amber-600 dark:text-amber-400",
        title: "text-amber-900 dark:text-amber-200",
        text: "text-amber-800 dark:text-amber-300",
      },
      error: {
        container:
          "bg-red-50 border-red-200/80 dark:bg-red-950/30 dark:border-red-800/50",
        icon: "text-red-600 dark:text-red-400",
        title: "text-red-900 dark:text-red-200",
        text: "text-red-800 dark:text-red-300",
      },
    },
    // Button colors — flat design, no gradients, clean hover states
    button: {
      primary:
        "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm focus:ring-primary-500/30 dark:bg-secondary-500 dark:text-white dark:hover:bg-secondary-400 dark:active:bg-secondary-600 dark:focus:ring-secondary-400/30",
      secondary:
        "bg-primary-700 text-white hover:bg-primary-600 active:bg-primary-800 shadow-md focus:ring-primary-500 dark:bg-secondary-700 dark:text-white dark:hover:bg-secondary-600 dark:active:bg-secondary-800 dark:focus:ring-secondary-500",
      outline:
        "border border-zinc-200 dark:border-slate-700 bg-white dark:bg-transparent text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-slate-800 focus:ring-zinc-400",
      ghost:
        "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-slate-800 focus:ring-zinc-400",
      danger:
        "bg-red-600 text-white hover:bg-red-500 active:bg-red-700 shadow-sm shadow-red-600/10 focus:ring-red-500",
      warning:
        "bg-amber-500 text-white hover:bg-amber-400 active:bg-amber-600 shadow-sm shadow-amber-500/10 focus:ring-amber-500",
      alertClose: "hover:bg-black/5 dark:hover:bg-white/5",
    },
    // Form colors
    form: {
      checked:
        "checked:bg-primary-600 checked:border-primary-600 dark:checked:bg-secondary-500 dark:checked:border-secondary-500",
      radioChecked:
        "checked:border-primary-600 checked:border-[6px] dark:checked:border-secondary-500",
      checkmark: "text-white dark:text-white",
      required: "text-red-500",
      focusRing:
        "focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-secondary-400 dark:focus:ring-offset-slate-900",
    },
    // Navbar colors
    navbar: {
      active:
        "bg-zinc-100 dark:bg-slate-800 text-zinc-900 dark:text-zinc-50 font-semibold",
      inactive:
        "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-slate-800 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors",
      icon: "w-5 h-5 md:w-6 md:h-6",
    },
    // Bottom navbar colors
    bottomNav: {
      active: "text-primary-500 dark:text-primary-400 font-semibold",
      inactive:
        "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors",
      text: "text-xs",
      icon: "w-6 h-6",
    },
    // Footer colors — adapts to light/dark mode
    footer: {
      title: "text-zinc-900 dark:text-zinc-100",
      text: "text-zinc-600 dark:text-zinc-400",
      textHover:
        "hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors",
      heading: "text-zinc-600 dark:text-zinc-400",
      border: "border-zinc-200 dark:border-white/10",
      copyright: "text-zinc-600 dark:text-zinc-400",
    },
    // Badge/notification
    notification: {
      badge: "bg-gradient-to-r from-red-500 to-red-600 text-white",
    },
    // Icon colors
    icon: {
      muted: "text-zinc-400",
      titleBar: "text-zinc-600 dark:text-zinc-300",
      navbar: "text-zinc-900 dark:text-zinc-100",
      onLight: "text-zinc-600 dark:text-zinc-300",
    },
    // Icon button hovers
    iconButton: {
      onPrimary:
        "hover:bg-zinc-100 dark:hover:bg-slate-800 active:bg-zinc-200 dark:active:bg-slate-700",
      onLight:
        "hover:bg-zinc-100 dark:hover:bg-slate-800 active:bg-zinc-200 dark:active:bg-slate-700",
    },
    // Colors for elements rendered on the chrome (navbar, sidebar, titlebar)
    onPrimary: {
      text: "text-zinc-900 dark:text-zinc-50",
      textMuted: "text-zinc-500 dark:text-zinc-400",
      textWeak: "text-zinc-600 dark:text-zinc-400",
      textSubtle: "text-zinc-500 dark:text-zinc-500",
      textIcon: "text-zinc-400 dark:text-zinc-500",
      textFaint: "text-zinc-400 dark:text-zinc-500",
      brandHover:
        "text-zinc-900 dark:text-zinc-50 group-hover:text-zinc-600 dark:group-hover:text-zinc-300",
      navItemActive:
        "bg-zinc-100 dark:bg-slate-800 text-zinc-900 dark:text-zinc-50 shadow-sm",
      navItemInactive:
        "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-slate-800 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors",
      iconBgActive: "bg-zinc-100 dark:bg-slate-700",
      iconBgInactive:
        "bg-transparent group-hover:bg-zinc-100 dark:group-hover:bg-slate-800",
      divider: "h-px flex-1 border-zinc-200 dark:border-slate-700",
      sectionLabel: "text-zinc-400 dark:text-zinc-500",
      logoutBtn:
        "bg-zinc-100 dark:bg-slate-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400",
      ghostOutlineBtn:
        "bg-transparent text-zinc-700 dark:text-zinc-300 border-2 border-zinc-200 dark:border-slate-700 hover:bg-zinc-100 dark:hover:bg-slate-800",
      settingsRow:
        "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-slate-800 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors",
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
      "scrollbar-thin [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-zinc-100 dark:[&::-webkit-scrollbar-track]:bg-slate-800/60 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-zinc-400 dark:[&::-webkit-scrollbar-thumb:hover]:bg-slate-500",
    /** Thin horizontal scrollbar for HorizontalScroller and tab strips */
    scrollbarThinX:
      "[&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-zinc-100 dark:[&::-webkit-scrollbar-track]:bg-slate-800/60 [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-zinc-400 dark:[&::-webkit-scrollbar-thumb:hover]:bg-slate-500",
    safeAreaBottom: "pb-[env(safe-area-inset-bottom)]",
    gradientText:
      "bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent",
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
    body: 'bg-white dark:bg-slate-950 text-zinc-900 dark:text-zinc-100 antialiased font-[Inter,ui-sans-serif,system-ui,-apple-system,"Segoe_UI",Roboto,"Helvetica_Neue",Arial,sans-serif]',
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
      "w-full px-3 py-2.5 border border-zinc-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800/60 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-secondary-400/20 focus:border-primary-500 dark:focus:border-secondary-400 focus:outline-none transition-colors",

    // Admin select pattern
    adminSelect:
      "w-full px-3 py-2.5 border border-zinc-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800/60 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-secondary-400/20 focus:border-primary-500 dark:focus:border-secondary-400 focus:outline-none transition-colors",

    // Page container
    pageContainer: "min-h-screen bg-white dark:bg-slate-950",

    // Section container
    sectionContainer: "max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 lg:py-12",

    // Form container
    formContainer:
      "bg-white dark:bg-slate-900 rounded-2xl border border-zinc-200 dark:border-slate-700 shadow-sm p-6 lg:p-8 space-y-6",

    // List item
    listItem:
      "bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-700 rounded-xl p-4 hover:border-zinc-300 dark:hover:border-slate-600 transition-colors",

    // Badge default
    badgeDefault:
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",

    // Link default
    linkDefault:
      "text-primary-600 dark:text-secondary-400 hover:text-primary-500 dark:hover:text-secondary-300 transition-colors underline-offset-2 hover:underline",

    // Icon button
    iconButton:
      "p-2 rounded-lg transition-colors hover:bg-zinc-100 dark:hover:bg-slate-800 active:bg-zinc-200 dark:active:bg-slate-700",

    // Modal overlay
    modalOverlay:
      "fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50",

    // Modal content
    modalContent:
      "bg-white dark:bg-slate-900 rounded-2xl border border-zinc-200 dark:border-slate-700 shadow-xl max-w-lg w-full mx-4 overflow-hidden",

    // Divider
    divider: "border-t border-zinc-200 dark:border-slate-700",

    // Empty state
    emptyState:
      "flex flex-col items-center justify-center py-12 text-center text-zinc-500 dark:text-zinc-400",

    // Loading state
    loadingState: "flex items-center justify-center py-8",

    // Error state
    errorState:
      "bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl p-4 text-red-800 dark:text-red-300",

    // Success state
    successState:
      "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-4 text-emerald-800 dark:text-emerald-300",
  },

  /**
   * CSS Classes for Component States
   * Utilities for common component states
   */
  states: {
    disabled: "opacity-50 cursor-not-allowed pointer-events-none",
    loading: "opacity-75 cursor-wait",
    readonly: "bg-zinc-100 dark:bg-slate-800 cursor-default",
    error: "border-red-500 dark:border-red-500",
    success: "border-green-500 dark:border-green-500",
    focus:
      "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-secondary-400 dark:focus:ring-offset-slate-950",
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

  /**
   * Star Rating Colors
   * Consistent star icons for product ratings, review scores etc.
   */
  rating: {
    filled: "text-yellow-400",
    empty: "text-zinc-300 dark:text-zinc-600",
  },

  /**
   * Tab active / inactive states
   * Horizontal tab navigation (orders, seller filters, search tabs etc.)
   */
  tab: {
    active:
      "border-b-2 border-primary-600 dark:border-secondary-400 text-primary-600 dark:text-secondary-400 font-semibold",
    inactive:
      "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300",
  },

  /**
   * Chart / Visualisation helpers
   * Consistent Recharts container height token.
   */
  chart: {
    height: "h-60",
    heightMd: "h-[280px]",
    heightLg: "h-80",
  },

  /**
   * Icon helper classes
   */
  icon: {
    muted: "text-zinc-400 dark:text-zinc-500",
    primary: "text-primary-600 dark:text-secondary-400",
    success: "text-emerald-500 dark:text-emerald-400",
    danger: "text-red-500 dark:text-red-400",
    warning: "text-amber-500 dark:text-amber-400",
  },

  /**
   * Skeleton loading states
   * Use these classes for skeleton placeholder elements.
   */
  skeleton: {
    base: "animate-pulse rounded bg-zinc-200 dark:bg-slate-700/60",
    text: "animate-pulse rounded bg-zinc-200 dark:bg-slate-700/60 h-4",
    heading: "animate-pulse rounded bg-zinc-200 dark:bg-slate-700/60 h-7",
    image: "animate-pulse rounded-xl bg-zinc-200 dark:bg-slate-700/60",
    card: "animate-pulse rounded-2xl bg-zinc-200 dark:bg-slate-700/60",
  },

  /**
   * Touch target sizes — WCAG 2.5.5
   */
  touch: {
    target: "min-h-[44px]",
    targetSm: "min-h-[36px]",
  },
  /**
   * Flex layout compositions
   * Pre-composed flex containers — use these instead of writing flex classes inline.
   */
  flex: {
    // ── Base containers ──────────────────────────────────────────────────
    /** `flex flex-row` */
    row: "flex flex-row",
    /** `flex flex-col` */
    col: "flex flex-col",
    /** `flex flex-row flex-wrap` */
    rowWrap: "flex flex-row flex-wrap",
    /** `flex flex-col flex-wrap` */
    colWrap: "flex flex-col flex-wrap",
    /** `inline-flex` */
    inline: "inline-flex",

    // ── Alignment combos — row (items on main axis = columns) ────────────
    /** `flex items-center justify-center` – centred in both axes */
    center: "flex items-center justify-center",
    /** `flex items-center justify-between` – spread with centred cross-axis */
    between: "flex items-center justify-between",
    /** `flex items-start justify-between` */
    betweenStart: "flex items-start justify-between",
    /** `flex items-end justify-between` */
    betweenEnd: "flex items-end justify-between",
    /** `flex items-center justify-start` */
    start: "flex items-center justify-start",
    /** `flex items-center justify-end` */
    end: "flex items-center justify-end",
    /** `flex items-center` – row, cross-axis centred, main-axis natural */
    rowCenter: "flex flex-row items-center",
    /** `flex items-start` – row, cross-axis top-aligned */
    rowStart: "flex flex-row items-start",
    /** `flex items-end` – row, cross-axis bottom-aligned */
    rowEnd: "flex flex-row items-end",

    // ── Alignment combos — column ────────────────────────────────────────
    /** `flex flex-col items-center justify-center` */
    centerCol: "flex flex-col items-center justify-center",
    /** `flex flex-col items-start` */
    colStart: "flex flex-col items-start",
    /** `flex flex-col items-center` */
    colCenter: "flex flex-col items-center",
    /** `flex flex-col items-end` */
    colEnd: "flex flex-col items-end",
    /** `flex flex-col justify-between` */
    colBetween: "flex flex-col justify-between",

    // ── Inline variants ──────────────────────────────────────────────────
    /** `inline-flex items-center` */
    inlineCenter: "inline-flex items-center",
    /** `inline-flex items-center justify-center` */
    inlineFull: "inline-flex items-center justify-center",

    // ── Child flex behaviour ─────────────────────────────────────────────
    /** `flex-1` – grow and shrink equally */
    grow: "flex-1",
    /** `flex-1 min-w-0` – grow + prevent text overflow in flex children */
    growMin: "flex-1 min-w-0",
    /** `flex-1 min-h-0` – grow + prevent overflow in scrollable flex cols */
    growMinH: "flex-1 min-h-0",
    /** `flex-shrink-0` – never shrink */
    noShrink: "flex-shrink-0",
    /** `flex-none` – neither grow nor shrink */
    none: "flex-none",
    /** `flex justify-center` – horizontal center only (no vertical alignment; use with py-* for height) */
    hCenter: "flex justify-center",
  },

  /**
   * Responsive grid presets
   * Mobile-first column counts that scale through xl/2xl. Use instead of
   * writing `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` inline.
   */
  grid: {
    /** Single column */
    cols1: "grid grid-cols-1",
    /** 1 → 2 */
    cols2: "grid grid-cols-1 sm:grid-cols-2",
    /** 1 → 2 → 3 */
    cols3:
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3",
    /** 1 → 2 → 3 → 4 */
    cols4:
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4",
    /** 1 → 2 → 3 → 4 → 5 */
    cols5:
      "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5",
    /** 2 → 3 → 4 → 5 → 6 */
    cols6:
      "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6",
    /** Card grid — starts at 2 on mobile, max 5 on 2xl */
    cards:
      "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5",
    /** Auto-fill with ~200 px min columns */
    autoFillSm: "grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))]",
    /** Auto-fill with ~280 px min columns */
    autoFillMd: "grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))]",
    /** Auto-fill with ~360 px min columns */
    autoFillLg: "grid grid-cols-[repeat(auto-fill,minmax(360px,1fr))]",
    /** Fixed left sidebar beside a growing main area */
    sidebar: "grid grid-cols-1 lg:grid-cols-[280px_1fr]",
    /** Fixed right sidebar beside a growing main area */
    sidebarRight: "grid grid-cols-1 lg:grid-cols-[1fr_280px]",
    /** Wide left sidebar (admin layout) */
    sidebarWide: "grid grid-cols-1 lg:grid-cols-[320px_1fr]",
    /** Two equal halves */
    halves: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2",
    /** Two-thirds / one-third split */
    twoThird: "grid grid-cols-1 md:grid-cols-[2fr_1fr]",
    /** One-third / two-thirds split */
    oneThird: "grid grid-cols-1 md:grid-cols-[1fr_2fr]",
    /** Auto-fill coupon/promo cards — min 264 px, gap-6 (3 cols at 1024 px, 2 at 600 px, 1 on mobile) */
    couponCards: "grid grid-cols-[repeat(auto-fill,minmax(264px,1fr))] gap-6",
    /** Auto-fill product cards — min 200 px, gap-6 (4–5 cols on desktop, 2 on mobile) */
    productCards: "grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6",
    /** Auto-fill category icon+label cards — min 130 px, gap-4 (6 cols on desktop, 2 on mobile) */
    categoryCards: "grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-4",
    /** Auto-fill store cards — min 220 px, gap-6 (4–5 cols on desktop, 2 on mobile) */
    storeCards: "grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6",
    /** Auto-fill address/wide-coupon cards — min 300 px, gap-4 (3 cols on desktop, 1 on mobile) */
    addressCards: "grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4",
    /** Auto-fill KPI / stat tiles — min 180 px, gap-4 (4 cols on desktop, 2 on mobile) */
    statTiles: "grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4",
    /** Auto-fill account nav / quick-action link tiles — min 160 px, gap-4 */
    navTiles: "grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4",
  },

  /**
   * Position utilities
   * Named position helpers for layout composition.
   */
  position: {
    relative: "relative",
    absolute: "absolute",
    fixed: "fixed",
    sticky: "sticky",
    static: "static",
    /** Covers entire parent with `absolute inset-0` */
    fill: "absolute inset-0",
    /** Centred in parent: `absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2` */
    absoluteCenter:
      "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
    /** Pinned to top edge of parent */
    absoluteTop: "absolute top-0 inset-x-0",
    /** Pinned to bottom edge of parent */
    absoluteBottom: "absolute bottom-0 inset-x-0",
    /** Top-right corner */
    absoluteTopRight: "absolute top-0 right-0",
    /** Top-left corner */
    absoluteTopLeft: "absolute top-0 left-0",
    /** Bottom-right corner */
    absoluteBottomRight: "absolute bottom-0 right-0",
    /** Bottom-left corner */
    absoluteBottomLeft: "absolute bottom-0 left-0",
    /** Covers entire viewport with `fixed inset-0` */
    fixedFill: "fixed inset-0",
    /** Fixed top bar */
    fixedTop: "fixed top-0 inset-x-0",
    /** Fixed bottom bar */
    fixedBottom: "fixed bottom-0 inset-x-0",
    /** Sticks to viewport top on scroll */
    stickyTop: "sticky top-0",
    /** Sticks to viewport bottom on scroll */
    stickyBottom: "sticky bottom-0",
  },

  /**
   * Size presets
   * Common width, height, and square size tokens.
   */
  size: {
    /** `w-full h-full` */
    full: "w-full h-full",
    /** `w-screen h-screen` */
    screen: "w-screen h-screen",
    /** `min-h-screen` — page root */
    minScreen: "min-h-screen",
    // Width tokens
    w: {
      full: "w-full",
      auto: "w-auto",
      screen: "w-screen",
      half: "w-1/2",
      third: "w-1/3",
      twoThirds: "w-2/3",
      quarter: "w-1/4",
      threeQuarters: "w-3/4",
      fit: "w-fit",
      min: "w-min",
      max: "w-max",
    },
    // Height tokens
    h: {
      full: "h-full",
      screen: "h-screen",
      auto: "h-auto",
      fit: "h-fit",
      min: "h-min",
      max: "h-max",
    },
    // Equal width + height squares (icon containers, avatars, dots)
    square: {
      xs: "w-4 h-4",
      sm: "w-6 h-6",
      md: "w-8 h-8",
      lg: "w-10 h-10",
      xl: "w-12 h-12",
      "2xl": "w-16 h-16",
      "3xl": "w-20 h-20",
      "4xl": "w-24 h-24",
    },
  },

  /**
   * Overflow utilities
   * Named overflow helpers — prefer these over raw `overflow-*` classes.
   */
  overflow: {
    /** Clip all overflow */
    hidden: "overflow-hidden",
    /** Scroll both axes when needed */
    auto: "overflow-auto",
    /** Always show scrollbars on both axes */
    scroll: "overflow-scroll",
    /** Horizontal scroll, vertical clip */
    xAuto: "overflow-x-auto overflow-y-hidden",
    /** Vertical scroll, horizontal clip */
    yAuto: "overflow-y-auto overflow-x-hidden",
    /** Clip horizontal only */
    xHidden: "overflow-x-hidden",
    /** Clip vertical only */
    yHidden: "overflow-y-hidden",
    /** Always scroll horizontally */
    xScroll: "overflow-x-scroll",
    /** Always scroll vertically */
    yScroll: "overflow-y-scroll",
    /** Visible — let content bleed out (e.g. tooltips inside overflow:hidden) */
    visible: "overflow-visible",
  },

  /**
   * Page layout tokens
   * Responsive page container patterns — max-width + centered + horizontal padding.
   * Use instead of writing `max-w-Xyl mx-auto px-4 sm:px-6 lg:px-8` inline.
   */
  page: {
    /**
     * Full-width page container: max-width + `mx-auto` + responsive horizontal padding.
     * Choose the size that matches the content area width.
     */
    container: {
      /** `max-w-3xl mx-auto px-4 sm:px-6 lg:px-8` — blog posts, legal / policy pages */
      sm: "max-w-3xl mx-auto px-4 sm:px-6 lg:px-8",
      /** `max-w-4xl mx-auto px-4 sm:px-6 lg:px-8` — narrow content, contact, about sections */
      md: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8",
      /** `max-w-5xl mx-auto px-4 sm:px-6 lg:px-8` — medium content, checkout, help */
      lg: "max-w-5xl mx-auto px-4 sm:px-6 lg:px-8",
      /** `max-w-6xl mx-auto px-4 sm:px-6 lg:px-8` — product detail, cart */
      xl: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8",
      /** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` — main content grids (products, auctions, search) */
      "2xl": "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
      /** `max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8` — full-bleed wide content */
      full: "max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8",
      /** `max-w-screen-2xl mx-auto px-4 sm:px-6` — wide store/seller layouts (no lg:px-8) */
      wide: "max-w-screen-2xl mx-auto px-4 sm:px-6",
    },
    /** `px-4 sm:px-6 lg:px-8` — responsive horizontal padding (no max-width) */
    px: "px-4 sm:px-6 lg:px-8",
    /** `px-4 sm:px-6` — responsive horizontal padding, compact (no lg step) */
    pxSm: "px-4 sm:px-6",
    /** `py-16` — vertical padding for empty / loading states */
    empty: "py-16",
    /** `py-8 sm:py-12` — vertical padding for auth form wrappers */
    authPad: "py-8 sm:py-12",
  },

  /**
   * Section header tokens (Sprint 0 / Phase 0)
   * Pill badge above H2, ornament row below.
   */
  sectionHeader: {
    pill: "inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-5 py-1.5 text-xs font-medium tracking-[0.2em] uppercase text-primary-700 dark:text-primary-400 backdrop-blur-sm",
    ornament:
      "flex items-center gap-2 mt-1 text-zinc-400 dark:text-zinc-500 text-xs select-none",
  },

  /**
   * Carousel tokens (Sprint 0 / Phase 0)
   * Shared arrow and dot styles for SectionCarousel and HeroCarousel.
   */
  carousel: {
    arrow:
      "w-10 h-10 rounded-2xl bg-white/85 dark:bg-slate-800/90 backdrop-blur-sm shadow-lg border border-zinc-300/70 dark:border-slate-600 text-zinc-800 dark:text-zinc-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-xl hover:border-zinc-400 dark:hover:border-slate-500 active:scale-95 transition-all duration-200 flex items-center justify-center",
    dotActive:
      "w-8 h-2 !min-h-0 rounded-full bg-white shadow-sm transition-all duration-500",
    dotInactive:
      "w-2 h-2 !min-h-0 rounded-full bg-white/55 shadow-sm transition-all duration-500",
  },

  /**
   * Trust strip tokens (Sprint 0 / Phase 0)
   * Icon box style for trust feature cards.
   */
  trustStrip: {
    iconBox:
      "from-primary-500/10 to-cobalt-500/10 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br flex-shrink-0",
  },
} as const;

export type ThemeMode = "light" | "dark";
