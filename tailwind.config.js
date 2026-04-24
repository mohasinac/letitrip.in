/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/constants/**/*.{js,ts,jsx,tsx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    // @mohasinac packages are often consumed as source in dev.
    // Scan all package source files so shared utility classes are not purged.
    "./node_modules/@mohasinac/*/src/**/*.{js,ts,jsx,tsx,mdx}",
    // Keep dist scan for environments where packages are built prepublish.
    "./node_modules/@mohasinac/*/dist/**/*.{js,mjs,cjs}",
  ],
  safelist: [
    // Zinc neutrals (light mode)
    "bg-white",
    "bg-zinc-50",
    "bg-zinc-100",
    "bg-zinc-800",
    "text-zinc-900",
    "text-zinc-100",
    "text-zinc-50",
    "dark:text-zinc-100",
    "dark:text-zinc-50",
    "border-zinc-200",
    // Slate neutrals (dark mode — navy-tinted)
    "dark:bg-slate-800",
    "dark:bg-slate-900",
    "dark:bg-slate-950",
    "dark:bg-slate-950/90",
    "dark:border-slate-700",
    "dark:border-slate-800",
    "dark:border-slate-800/80",
    // Opacity-modifier variants used by titleBarBg / navbarBg tokens
    "bg-white/90",
    "border-zinc-200/80",
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
          // Cobalt Blue — former primary, used for links & nav accents
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
          // Metallic Steel — silver edges (Beyblade frame)
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
        dropdown: "var(--appkit-z-dropdown)",
        "search-backdrop": "var(--appkit-z-search-backdrop)",
        navbar: "var(--appkit-z-navbar)",
        "bottom-nav": "var(--appkit-z-bottom-nav)",
        sidebar: "var(--appkit-z-sidebar)",
        "title-bar": "var(--appkit-z-title-bar)",
        60: "60",
        70: "70",
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
  plugins: [],
};
