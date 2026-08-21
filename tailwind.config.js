/** @type {import('tailwindcss').Config} */
// NOTE (Tailwind v4 migration, 2026-08-16): the JS `safelist` array that used to
// live here moved to src/app/globals.css as a `@source inline("...")` directive
// — v4's `@config` compat bridge does not support `safelist` at all (silently
// ignored), so keeping it here would be dead code. See globals.css for the
// exact same class list, now the single source of truth for that mechanism.
const { defineTailwindConfig } = require("@mohasinac/appkit/configs");

module.exports = defineTailwindConfig({
  // `important: true` (2026-08-16): compensates for the same Turbopack CSS
  // chunk-splitting bug documented at length in globals.css above the manual
  // `.hidden`/`.block`/`.flex` !important overrides — `next build`'s
  // production optimizer splits the compiled stylesheet across multiple CSS
  // chunk files, and Tailwind's `@layer base` (Preflight) vs `@layer
  // utilities` ordering guarantee only holds *within* a chunk, not across
  // chunks. Confirmed 2026-08-16: even a plain, already-generated,
  // already-served utility like `.px-3{padding-inline:var(--appkit-space-3)}`
  // computed as 0px on a live element because Preflight's `padding: 0` base
  // reset landed in a chunk that loaded after it. This is not scoped to a
  // handful of classnames the way the display-toggle fix was — every
  // spacing/sizing utility that Preflight also resets is at risk — so instead
  // of hand-enumerating overrides, this makes Tailwind emit `!important` on
  // every utility it generates (matching what the manual overrides do by
  // hand), which is immune to chunk load order the same way. Utilities still
  // cascade normally against each other (equal !important weight, tie-broken
  // by generation order), only their fight against Preflight/base is
  // affected.
  important: true,
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/constants/**/*.{js,ts,jsx,tsx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    // appkit pre-compiles its own Tailwind utilities into dist/tailwind-utilities.css
    // (imported via @mohasinac/appkit/styles). No host-side scan needed.
  ],
  theme: {
    extend: {
      colors: {
        // Theme Colors — dual-mode palette inspired by Beyblade artwork
        primary: {
          // Lime Green — light mode energy accent (Beyblade green blades)
          DEFAULT: "var(--appkit-color-primary)",
          50: "var(--appkit-color-primary-50)",
          100: "var(--appkit-color-primary-100)",
          200: "var(--appkit-color-primary-200)",
          300: "var(--appkit-color-primary-300)",
          400: "var(--appkit-color-primary-400)",
          500: "var(--appkit-color-primary-500)",
          600: "var(--appkit-color-primary-600)",
          700: "var(--appkit-color-primary-700)",
          800: "var(--appkit-color-primary-800)",
          900: "var(--appkit-color-primary-900)",
          950: "var(--appkit-color-primary-950)",
        },
        secondary: {
          // Hot Pink / Magenta — dark mode accent (pink Beyblade blades)
          DEFAULT: "var(--appkit-color-secondary)",
          50: "var(--appkit-color-secondary-50)",
          100: "var(--appkit-color-secondary-100)",
          200: "var(--appkit-color-secondary-200)",
          300: "var(--appkit-color-secondary-300)",
          400: "var(--appkit-color-secondary-400)",
          500: "var(--appkit-color-secondary-500)",
          600: "var(--appkit-color-secondary-600)",
          700: "var(--appkit-color-secondary-700)",
          800: "var(--appkit-color-secondary-800)",
          900: "var(--appkit-color-secondary-900)",
          950: "var(--appkit-color-secondary-950)",
        },
        cobalt: {
          // Static Beyblade design reference — cobalt blue frame color.
          // NOT wired to CSS variables. Use `primary` for brand-adaptive colors.
          // This scale exists so appkit internal components can reference the exact
          // cobalt hue (e.g. cobalt-night theme surfaces) without coupling to the
          // active theme's --appkit-color-primary CSS variable.
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
          // Static metallic steel reference — Beyblade silver edge / frame accents.
          // NOT wired to CSS variables. Use semantic tokens for adaptive styling.
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
        // Semantic state colors — use these instead of raw red/green/amber/sky
        // Two pairings per status, and they are NOT interchangeable:
        //   chip    -> bg-{status}-surface + text-{status}
        //   overlay -> bg-{status}-solid   + text-{status}-on-solid
        // `surface`/DEFAULT invert with the theme (light tint + dark text in
        // light themes, dark tint + light text in dark themes), so mixing
        // either with a literal `text-white` is invisible in exactly one
        // theme. `solid`/`on-solid` are theme-invariant for that reason.
        // Enforced by scripts/audit-status-color-pairs.mjs.
        success: {
          DEFAULT: "var(--appkit-color-success)",
          surface: "var(--appkit-color-success-surface)",
          solid: "var(--appkit-color-success-solid)",
          "on-solid": "var(--appkit-color-success-on-solid)",
        },
        warning: {
          DEFAULT: "var(--appkit-color-warning)",
          surface: "var(--appkit-color-warning-surface)",
          solid: "var(--appkit-color-warning-solid)",
          "on-solid": "var(--appkit-color-warning-on-solid)",
        },
        error: {
          DEFAULT: "var(--appkit-color-error)",
          surface: "var(--appkit-color-error-surface)",
          solid: "var(--appkit-color-error-solid)",
          "on-solid": "var(--appkit-color-error-on-solid)",
        },
        info: {
          DEFAULT: "var(--appkit-color-info)",
          surface: "var(--appkit-color-info-surface)",
          solid: "var(--appkit-color-info-solid)",
          "on-solid": "var(--appkit-color-info-on-solid)",
        },
        star: "var(--appkit-color-star)",
        surface: {
          DEFAULT: "var(--appkit-color-surface)",
          elevated: "var(--appkit-color-surface-elevated)",
          input: "var(--appkit-color-surface-input)",
        },
      },
      spacing: {
        // Appkit spacing tokens
        1: "var(--appkit-space-1)",
        2: "var(--appkit-space-2)",
        3: "var(--appkit-space-3)",
        4: "var(--appkit-space-4)",
        5: "var(--appkit-space-5)",
        6: "var(--appkit-space-6)",
        8: "var(--appkit-space-8)",
        10: "var(--appkit-space-10)",
        12: "var(--appkit-space-12)",
        16: "var(--appkit-space-16)",
        18: "var(--appkit-space-18)",
        20: "var(--appkit-space-20)",
        24: "var(--appkit-space-24)",
        // Additional custom spacing
        112: "28rem",
        128: "32rem",
      },
      zIndex: {
        below: "var(--appkit-z-below)",
        base: "var(--appkit-z-base)",
        raised: "var(--appkit-z-raised)",
        dropdown: "var(--appkit-z-dropdown)",
        "search-backdrop": "var(--appkit-z-search-backdrop)",
        overlay: "var(--appkit-z-overlay)",
        navbar: "var(--appkit-z-navbar)",
        "bottom-nav": "var(--appkit-z-bottom-nav)",
        sidebar: "var(--appkit-z-sidebar)",
        "title-bar": "var(--appkit-z-title-bar)",
        modal: "var(--appkit-z-modal)",
        toast: "var(--appkit-z-toast)",
        tooltip: "var(--appkit-z-tooltip)",
        "back-to-top": "var(--appkit-z-back-to-top)",
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.75rem" }],
      },
      borderRadius: {
        sm: "var(--appkit-radius-sm)",
        md: "var(--appkit-radius-md)",
        lg: "var(--appkit-radius-lg)",
        xl: "var(--appkit-radius-xl)",
        "2xl": "var(--appkit-radius-2xl)",
        "3xl": "var(--appkit-radius-3xl)",
        card: "var(--appkit-radius-card)",
        btn: "var(--appkit-radius-btn)",
        full: "var(--appkit-radius-full)",
        "4xl": "2rem",
      },
      fontFamily: {
        display: [
          "var(--font-display)",
          "Poppins",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        sans: [
          "var(--font-body)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        editorial: ["var(--font-editorial)", "Georgia", "serif"],
      },
      boxShadow: {
        sm: "var(--appkit-shadow-sm)",
        md: "var(--appkit-shadow-md)",
        lg: "var(--appkit-shadow-lg)",
        xl: "var(--appkit-shadow-xl)",
        soft: "var(--appkit-shadow-soft)",
        glow: "var(--appkit-shadow-glow)",
        "glow-pink": "var(--appkit-shadow-glow-pink)",
        "inner-soft": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
      },
      transitionDuration: {
        400: "400ms",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "fade-out": "fadeOut 0.3s ease-in-out",
        "slide-down": "slideDown 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-in": "slideInLeft 0.2s ease-out",
        "slide-in-left": "slideInLeft 0.3s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "scale-out": "scaleOut 0.2s ease-out",
        spin: "spin 1s linear infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        bounce: "bounce 1s infinite",
        shimmer: "shimmer 2s infinite linear",
        marquee: "marquee 30s linear infinite",
        "pulse-slow": "pulse-slow 4s ease-in-out infinite",
        "progress-fill": "progress-fill linear forwards",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideInLeft: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        scaleOut: {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(0.9)", opacity: "0" },
        },
        spin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        bounce: {
          "0%, 100%": {
            transform: "translateY(-25%)",
            animationTimingFunction: "cubic-bezier(0.8, 0, 1, 1)",
          },
          "50%": {
            transform: "translateY(0)",
            animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)",
          },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "0.7" },
        },
        "progress-fill": {
          from: { width: "0%" },
          to: { width: "100%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)", opacity: "0.3" },
          "50%": { transform: "translateY(-20px)", opacity: "0.7" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
});
