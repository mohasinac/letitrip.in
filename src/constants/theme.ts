/**
 * Theme Constants
 *
 * Letitrip.in extends the base THEME_CONSTANTS from @mohasinac/tokens.
 * The base provides: themed, layout, typography, spacing (+ gap map), grid,
 * page, input, card, flex, position, states, transitions, skeleton, touch,
 * utilities, patterns, icon, tab, rating, breakpoints, base.
 *
 * This file spreads the base and adds letitrip-specific brand values:
 * button variants, enhancedCard, pageHeader, sectionBg, accentBanner,
 * badge (with role variants), accent utilities, and component color maps.
 *
 * @see @mohasinac/tokens THEME_CONSTANTS for the canonical base definition.
 */
import { THEME_CONSTANTS as _base } from "@mohasinac/appkit";

export const THEME_CONSTANTS = {
  // ── Base sections — sourced from @mohasinac/tokens ──────────────────────
  // Identity (spread first so project overrides win):
  themed: _base.themed,
  layout: _base.layout,
  typography: _base.typography,

  // Spacing: use base (includes section/form/card/gap map + pageY).
  spacing: _base.spacing,

  // Grid: fixed widescreen scaling + new auto-fill presets from @mohasinac/tokens.
  // cols3/4 now scale to 2xl:4/5; cards starts at 1-col on portrait mobile.
  // Grid: fixed widescreen scaling + auto-fill presets with viewport-relative minmax.
  // cols3/4 scale to 2xl:4/5; cards starts at 1-col on portrait mobile.
  // productCards/storeCards use clamp() so card min-width scales with the viewport.
  grid: {
    ..._base.grid,
    /** Auto-fill product cards — viewport-relative min: clamp(150px,18vw,260px) */
    productCards:
      "grid grid-cols-[repeat(auto-fill,minmax(clamp(150px,18vw,260px),1fr))] gap-6" as const,
    /** Auto-fill store cards — viewport-relative min: clamp(170px,20vw,280px) */
    storeCards:
      "grid grid-cols-[repeat(auto-fill,minmax(clamp(170px,20vw,280px),1fr))] gap-6" as const,
  },

  flex: _base.flex,

  // Position: base + fixed/sticky shorthand helpers.
  position: {
    ..._base.position,
    fixedFill: "fixed inset-0" as const,
    fixedTop: "fixed top-0 inset-x-0" as const,
    fixedBottom: "fixed bottom-0 inset-x-0" as const,
    stickyTop: "sticky top-0" as const,
    stickyBottom: "sticky bottom-0" as const,
  },

  states: _base.states,
  transitions: _base.transitions,
  skeleton: _base.skeleton,
  touch: _base.touch,
  utilities: _base.utilities,
  tab: _base.tab,
  rating: _base.rating,
  breakpoints: _base.breakpoints,
  base: _base.base,

  // Icon: base icon colours; iconSize is a separate top-level key below.
  icon: _base.icon,

  // Input/Form: identical to base.
  input: _base.input,

  // Page container: extend base with compact-px and auth-padding variants.
  page: {
    ..._base.page,
    /** `px-4 sm:px-6` — compact horizontal padding (no lg step) */
    pxSm: "px-4 sm:px-6" as const,
    /** `py-16` — vertical padding for empty / loading states */
    empty: "py-16" as const,
    /** `py-8 sm:py-12` — vertical padding for auth form wrappers */
    authPad: "py-8 sm:py-12" as const,
  },

  // Patterns: extend base with admin and legacy helpers.
  patterns: {
    ..._base.patterns,
    adminInput:
      "w-full px-3 py-2.5 border border-zinc-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800/60 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-secondary-400/20 focus:border-primary-500 dark:focus:border-secondary-400 focus:outline-none transition-colors" as const,
    adminSelect:
      "w-full px-3 py-2.5 border border-zinc-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800/60 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-secondary-400/20 focus:border-primary-500 dark:focus:border-secondary-400 focus:outline-none transition-colors" as const,
    badgeDefault:
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" as const,
    linkDefault:
      "text-primary-600 dark:text-secondary-400 hover:text-primary-500 dark:hover:text-secondary-300 transition-colors underline-offset-2 hover:underline" as const,
    modalContent:
      "bg-white dark:bg-slate-900 rounded-2xl border border-zinc-200 dark:border-slate-700 shadow-xl max-w-lg w-full mx-4 overflow-hidden" as const,
    successState:
      "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-4 text-emerald-800 dark:text-emerald-300" as const,
    errorState:
      "bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl p-4 text-red-800 dark:text-red-300" as const,
    loadingState: "flex items-center justify-center py-8" as const,
    listItem:
      "bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-700 rounded-xl p-4 hover:border-zinc-300 dark:hover:border-slate-600 transition-colors" as const,
    formContainer:
      "bg-white dark:bg-slate-900 rounded-2xl border border-zinc-200 dark:border-slate-700 shadow-sm p-6 lg:p-8 space-y-6" as const,
    sectionContainer:
      "max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 lg:py-12" as const,
    pageContainer: "min-h-screen bg-white dark:bg-slate-950" as const,
    divider: "border-t border-zinc-200 dark:border-slate-700" as const,
    iconButton:
      "p-2 rounded-lg transition-colors hover:bg-zinc-100 dark:hover:bg-slate-800 active:bg-zinc-200 dark:active:bg-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center" as const,
    emptyState:
      "flex flex-col items-center justify-center py-12 text-center text-zinc-500 dark:text-zinc-400" as const,
    modalOverlay:
      "fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" as const,
  },

  // ── Letitrip.in brand extensions ────────────────────────────────────────

  /**
   * Button styles — CTA and interactive variants.
   * base: any interactive element; ctaPrimary/ctaOutline for hero CTAs.
   */
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
   * Card — extends base with letitrip chat bubble variants and viewport-relative dimensions.
   */
  card: {
    ..._base.card,
    /** Chat message bubble variants */
    chatBubble: {
      mine: "bg-primary-600 text-white dark:bg-secondary-500 dark:text-white rounded-2xl rounded-br-sm" as const,
      theirs:
        "bg-zinc-100 dark:bg-slate-800 rounded-2xl rounded-bl-sm" as const,
    },
    /**
     * Viewport-relative card dimensions — applied consistently to all media cards.
     * Values clamp between a pixel floor (small screens) and a pixel ceiling (large screens),
     * scaling proportionally with viewport width/height in between.
     */
    dimensions: {
      /** Min card width — scales from 150px at narrow viewports to 260px max */
      minW: "min-w-[clamp(150px,18vw,260px)]" as const,
      /** Max card width — for standalone cards not constrained by a grid column */
      maxW: "max-w-[clamp(240px,40vw,400px)]" as const,
      /** Min card height — ensures cards have visual presence even with no image */
      minH: "min-h-[clamp(220px,26vh,360px)]" as const,
      /** Max card height — caps runaway card growth on large viewports */
      maxH: "max-h-[clamp(300px,50vh,520px)]" as const,
      /** Min height for the card media/image hero section */
      heroMinH: "min-h-[clamp(120px,14vh,200px)]" as const,
      /** Max height for the card media/image hero section */
      heroMaxH: "max-h-[clamp(160px,24vh,280px)]" as const,
      /** Min height for list-row card layouts */
      listMinH: "min-h-[clamp(190px,24vh,320px)]" as const,
      /** Width for media block in horizontal list rows */
      listMediaW: "w-[clamp(120px,18vw,220px)]" as const,
      /** Default min width for horizontal scroller items */
      railMinW: "min-w-[clamp(150px,18vw,260px)]" as const,
      /** Default max width for horizontal scroller items */
      railMaxW: "max-w-[clamp(240px,36vw,380px)]" as const,
    },
  },

  /** Homepage section dimensions (viewport-relative + clamped). */
  homepage: {
    ..._base.homepage,
    heroSkeletonH: "h-[clamp(420px,72vh,680px)]" as const,
    splitBannerMinH: "min-h-[clamp(300px,40vh,420px)]" as const,
    promoBannerMinH: "min-h-[clamp(240px,34vh,360px)]" as const,
    promoBannerCompactH: "h-[clamp(112px,16vh,160px)]" as const,
    newsletterH: "h-[clamp(220px,28vh,320px)]" as const,
    trustCardH: "h-[clamp(120px,18vh,170px)]" as const,
    categoryTileH: "h-[clamp(112px,16vh,160px)]" as const,
    reviewCardH: "h-[clamp(180px,26vh,260px)]" as const,
  },

  /**
   * Z-index layers — Tailwind class strings for z-index stacking.
   * (See also Z_INDEX from @mohasinac/tokens for numeric values.)
   */
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
   * Shadows — Tailwind shadow utility classes.
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
   * Chart / Visualisation helpers
   * Consistent Recharts container height token.
   */
  chart: {
    height: "h-60",
    heightMd: "h-[280px]",
    heightLg: "h-80",
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
   * Section header tokens (Sprint 0 / Phase 0)
   * Pill badge above H2, ornament row below.
   */
  sectionHeader: {
    pill: "inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-5 py-1.5 text-xs font-medium tracking-[0.2em] uppercase text-primary-700 dark:text-primary-400 backdrop-blur-sm",
    ornament:
      "flex items-center gap-2 mt-1 text-zinc-400 dark:text-zinc-500 text-xs select-none",
  },

  /**
   * Carousel tokens — sourced from @mohasinac/tokens (arrow, dotActive, dotInactive).
   */
  carousel: _base.carousel,

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

