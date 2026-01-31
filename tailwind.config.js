/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",

        // Design System - Semantic Colors using CSS Variables
        // These map to src/styles/tokens/colors.css
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          light: "var(--color-primary-light)",
          dark: "var(--color-primary-dark)",
          50: "var(--color-primary-50)",
          100: "var(--color-primary-100)",
          200: "var(--color-primary-200)",
          300: "var(--color-primary-300)",
          400: "var(--color-primary-400)",
          500: "var(--color-primary-500)",
          600: "var(--color-primary-600)",
          700: "var(--color-primary-700)",
          800: "var(--color-primary-800)",
          900: "var(--color-primary-900)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          hover: "var(--color-secondary-hover)",
          light: "var(--color-secondary-light)",
          dark: "var(--color-secondary-dark)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          hover: "var(--color-accent-hover)",
          light: "var(--color-accent-light)",
          dark: "var(--color-accent-dark)",
        },
        success: {
          DEFAULT: "var(--color-success)",
          hover: "var(--color-success-hover)",
          light: "var(--color-success-light)",
          dark: "var(--color-success-dark)",
          bg: "var(--color-success-bg)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          hover: "var(--color-warning-hover)",
          light: "var(--color-warning-light)",
          dark: "var(--color-warning-dark)",
          bg: "var(--color-warning-bg)",
        },
        danger: {
          DEFAULT: "var(--color-error)",
          hover: "var(--color-error-hover)",
          light: "var(--color-error-light)",
          dark: "var(--color-error-dark)",
          bg: "var(--color-error-bg)",
        },
        error: {
          DEFAULT: "var(--color-error)",
          hover: "var(--color-error-hover)",
          light: "var(--color-error-light)",
          dark: "var(--color-error-dark)",
          bg: "var(--color-error-bg)",
        },
        info: {
          DEFAULT: "var(--color-info)",
          hover: "var(--color-info-hover)",
          light: "var(--color-info-light)",
          dark: "var(--color-info-dark)",
          bg: "var(--color-info-bg)",
        },

        // Semantic background colors
        "bg-primary": "var(--color-bg-primary)",
        "bg-secondary": "var(--color-bg-secondary)",
        "bg-tertiary": "var(--color-bg-tertiary)",
        "bg-inverse": "var(--color-bg-inverse)",
        "bg-elevated": "var(--color-bg-elevated)",
        "bg-hover": "var(--color-bg-hover)",
        "bg-active": "var(--color-bg-active)",

        // Semantic text colors
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-tertiary": "var(--color-text-tertiary)",
        "text-muted": "var(--color-text-muted)",
        "text-inverse": "var(--color-text-inverse)",
        "text-disabled": "var(--color-text-disabled)",
        "text-link": "var(--color-text-link)",

        // Semantic border colors
        "border-primary": "var(--color-border-primary)",
        "border-secondary": "var(--color-border-secondary)",
        "border-focus": "var(--color-border-focus)",
        "border-error": "var(--color-border-error)",

        // Status colors
        "status-pending": "var(--color-status-pending)",
        "status-processing": "var(--color-status-processing)",
        "status-shipped": "var(--color-status-shipped)",
        "status-delivered": "var(--color-status-delivered)",
        "status-cancelled": "var(--color-status-cancelled)",
        "status-active": "var(--color-status-active)",

        // Auction colors
        "auction-active": "var(--color-auction-active)",
        "auction-ending": "var(--color-auction-ending)",
        "auction-ended": "var(--color-auction-ended)",

        // RipLimit colors
        riplimit: {
          DEFAULT: "var(--color-riplimit)",
          bg: "var(--color-riplimit-bg)",
          blocked: "var(--color-riplimit-blocked)",
          available: "var(--color-riplimit-available)",
        },

        // Keep existing neutral scale for gray utilities (updated to zinc)
        neutral: {
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

        // Add bright color palette
        sky: {
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
        },

        purple: {
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
        },

        orange: {
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
        },

        cyan: {
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
        },
      },

      // Use CSS variables for semantic backgrounds
      backgroundColor: {
        surface: {
          primary: "var(--color-bg-primary)",
          secondary: "var(--color-bg-secondary)",
          tertiary: "var(--color-bg-tertiary)",
          inverse: "var(--color-bg-inverse)",
          elevated: "var(--color-bg-elevated)",
        },
      },

      // Use CSS variables for text colors
      textColor: {
        content: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          tertiary: "var(--color-text-tertiary)",
          muted: "var(--color-text-muted)",
          inverse: "var(--color-text-inverse)",
        },
      },

      // Use CSS variables for borders
      borderColor: {
        line: {
          primary: "var(--color-border-primary)",
          secondary: "var(--color-border-secondary)",
          focus: "var(--color-border-focus)",
        },
      },

      // Use CSS variables for shadows
      boxShadow: {
        "token-xs": "var(--shadow-xs)",
        "token-sm": "var(--shadow-sm)",
        "token-md": "var(--shadow-md)",
        "token-lg": "var(--shadow-lg)",
        "token-xl": "var(--shadow-xl)",
        "token-2xl": "var(--shadow-2xl)",
        "token-inner": "var(--shadow-inner)",
        "token-focus": "var(--shadow-focus-ring)",
        "inner-lg": "inset 0 2px 4px 0 rgb(0 0 0 / 0.1)",
        "3xl": "0 35px 60px -15px rgba(0, 0, 0, 0.3)",
      },

      // Use CSS variables for border radius
      borderRadius: {
        "token-sm": "var(--radius-sm)",
        "token-md": "var(--radius-md)",
        "token-lg": "var(--radius-lg)",
        "token-xl": "var(--radius-xl)",
        "token-2xl": "var(--radius-2xl)",
        "token-full": "var(--radius-full)",
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      // Custom spacing scale
      spacing: {
        13: "3.25rem",
        15: "3.75rem",
        17: "4.25rem",
        18: "4.5rem",
        22: "5.5rem",
        26: "6.5rem",
        30: "7.5rem",
        34: "8.5rem",
        38: "9.5rem",
        42: "10.5rem",
        46: "11.5rem",
        50: "12.5rem",
        54: "13.5rem",
        58: "14.5rem",
        62: "15.5rem",
        66: "16.5rem",
        70: "17.5rem",
        74: "18.5rem",
        78: "19.5rem",
        82: "20.5rem",
        86: "21.5rem",
        90: "22.5rem",
        94: "23.5rem",
        98: "24.5rem",
        102: "25.5rem",
        106: "26.5rem",
        110: "27.5rem",
      },

      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.75rem" }],
      },

      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-in": "slideIn 0.3s ease-in-out",
        "bounce-slow": "bounce 3s infinite",
        "spin-slow": "spin 3s linear infinite",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },

      // Z-index scale from design tokens
      zIndex: {
        dropdown: "var(--z-index-dropdown)",
        sticky: "var(--z-index-sticky)",
        fixed: "var(--z-index-fixed)",
        backdrop: "var(--z-index-backdrop)",
        modal: "var(--z-index-modal)",
        popover: "var(--z-index-popover)",
        tooltip: "var(--z-index-tooltip)",
        toast: "var(--z-index-toast)",
      },
    },
  },
  // Tailwind plugins
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    // Safe area insets plugin for iOS
    function ({ addUtilities }) {
      addUtilities({
        ".pt-safe": {
          paddingTop: "env(safe-area-inset-top)",
        },
        ".pb-safe": {
          paddingBottom: "env(safe-area-inset-bottom)",
        },
        ".pl-safe": {
          paddingLeft: "env(safe-area-inset-left)",
        },
        ".pr-safe": {
          paddingRight: "env(safe-area-inset-right)",
        },
        ".p-safe": {
          paddingTop: "env(safe-area-inset-top)",
          paddingRight: "env(safe-area-inset-right)",
          paddingBottom: "env(safe-area-inset-bottom)",
          paddingLeft: "env(safe-area-inset-left)",
        },
        ".mt-safe": {
          marginTop: "env(safe-area-inset-top)",
        },
        ".mb-safe": {
          marginBottom: "env(safe-area-inset-bottom)",
        },
        ".ml-safe": {
          marginLeft: "env(safe-area-inset-left)",
        },
        ".mr-safe": {
          marginRight: "env(safe-area-inset-right)",
        },
        ".m-safe": {
          marginTop: "env(safe-area-inset-top)",
          marginRight: "env(safe-area-inset-right)",
          marginBottom: "env(safe-area-inset-bottom)",
          marginLeft: "env(safe-area-inset-left)",
        },
      });
    },
  ],
};
