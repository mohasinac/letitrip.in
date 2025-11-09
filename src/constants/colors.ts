/**
 * Color Constants
 * Centralized color definitions for consistent theming across the application
 */

export const COLORS = {
  // Primary Brand Colors
  primary: {
    DEFAULT: "yellow-500",
    light: "yellow-400",
    dark: "yellow-600",
    darker: "yellow-700",
    bg: "yellow-50",
    border: "yellow-200",
  },

  // Background Colors
  background: {
    primary: "bg-yellow-500",
    primaryHover: "bg-yellow-600",
    light: "bg-yellow-50",
    gradient: "bg-gradient-to-r from-yellow-400 to-yellow-500",
  },

  // Text Colors with better visibility
  text: {
    primary: "text-yellow-600",
    primaryDark: "text-yellow-700",
    primaryHover: "text-yellow-700",
    onPrimary: "text-gray-900", // Text color on yellow backgrounds
    onPrimaryBold: "text-gray-900 font-bold", // Bold text on yellow backgrounds
    secondary: "text-gray-600",
    secondaryBold: "text-gray-700 font-semibold",
    dark: "text-gray-800",
    darkBold: "text-gray-900 font-bold",
    white: "text-white",
    whiteBold: "text-white font-semibold",
  },

  // Border Colors
  border: {
    primary: "border-yellow-200",
    secondary: "border-gray-300",
  },

  // Hover States
  hover: {
    primary: "hover:bg-yellow-600",
    light: "hover:bg-yellow-50",
    text: "hover:text-yellow-700",
    textBold: "hover:text-yellow-700 hover:font-semibold",
  },

  // Focus States
  focus: {
    ring: "focus:ring-yellow-500",
  },
} as const;

// Tailwind class strings for dynamic usage with better visibility
export const COLOR_CLASSES = {
  // Buttons
  button: {
    primary: "bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold",
    primaryFull:
      "bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold",
    secondary: "bg-gray-700 hover:bg-gray-600 text-white font-medium",
  },

  // Badges/Counters
  badge: {
    primary: "bg-yellow-500 text-gray-900 font-bold",
    cart: "bg-yellow-500 text-gray-900 font-extrabold",
  },

  // Links
  link: {
    primary: "text-yellow-600 hover:text-yellow-700 font-medium",
    primaryBold: "text-yellow-600 hover:text-yellow-700 font-bold",
    hoverOnly: "hover:text-yellow-700",
    secondary: "text-gray-700 hover:text-yellow-700 font-medium",
  },

  // Backgrounds
  background: {
    light: "bg-yellow-50",
    gradient: "bg-gradient-to-r from-yellow-400 to-yellow-500",
    card: "bg-yellow-50 border-2 border-yellow-200",
  },

  // Icons
  icon: {
    primary: "text-yellow-600",
    light: "text-yellow-400",
    bright: "text-yellow-500",
  },

  // Category Icons
  category: {
    background: "bg-yellow-100 group-hover:bg-yellow-200",
    icon: "text-yellow-700",
    text: "text-gray-800 font-medium group-hover:text-yellow-700",
  },

  // Input Focus
  input: {
    focus: "focus:outline-none focus:ring-2 focus:ring-yellow-500",
    text: "text-gray-900",
  },

  // Banner/Hero text
  banner: {
    text: "text-gray-900 font-bold",
    textLight: "text-gray-800 font-semibold",
  },
} as const;
