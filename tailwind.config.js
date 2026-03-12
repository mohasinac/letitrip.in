/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/constants/**/*.{js,ts,jsx,tsx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
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
    "dark:border-slate-700",
    "dark:border-slate-800",
  ],
  theme: {
    extend: {
      colors: {
        // Theme Colors — dual-mode palette inspired by Beyblade artwork
        primary: {
          // Lime Green — light mode energy accent (Beyblade green blades)
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
          // Hot Pink / Magenta — dark mode accent (pink Beyblade blades)
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
          // Cobalt Blue — former primary, used for links & nav accents
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
        18: "4.5rem",
        112: "28rem",
        128: "32rem",
      },
      zIndex: {
        60: "60",
        70: "70",
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.75rem" }],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      fontFamily: {
        display: [
          "var(--font-display)",
          "Bangers",
          "Impact",
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
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
        glow: "0 0 20px rgba(80, 156, 2, 0.45)",
        "glow-pink": "0 0 20px rgba(233, 30, 140, 0.5)",
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
