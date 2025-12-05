/**
 * @fileoverview TypeScript Module
 * @module src/constants/colors
 * @description This file contains functionality related to colors
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Color Constants
 * Centralized color definitions for consistent theming across the application
 */

/**
 * Colors
 * @constant
 */
export const COLORS = {
  // Primary Brand Colors
  /** Primary */
  primary: {
    /** D E F A U L T */
    DEFAULT: "yellow-500",
    /** Light */
    light: "yellow-400",
    /** Dark */
    dark: "yellow-600",
    /** Darker */
    darker: "yellow-700",
    /** Bg */
    bg: "yellow-50",
    /** Border */
    border: "yellow-200",
  },

  // Background Colors
  /** Background */
  background: {
    /** Primary */
    primary: "bg-yellow-500",
    /** Primary Hover */
    primaryHover: "bg-yellow-600",
    /** Light */
    light: "bg-yellow-50",
    /** Gradient */
    gradient: "bg-gradient-to-r from-yellow-400 to-yellow-500",
  },

  // Text Colors with better visibility
  /** Text */
  text: {
    /** Primary */
    primary: "text-yellow-600",
    /** Primary Dark */
    primaryDark: "text-yellow-700",
    /** Primary Hover */
    primaryHover: "text-yellow-700",
    onPrimary: "text-gray-900", // Text color on yellow backgrounds
    onPrimaryBold: "text-gray-900 font-bold", // Bold text on yellow backgrounds
    /** Secondary */
    secondary: "text-gray-600",
    /** Secondary Bold */
    secondaryBold: "text-gray-700 font-semibold",
    /** Dark */
    dark: "text-gray-800",
    /** Dark Bold */
    darkBold: "text-gray-900 font-bold",
    /** White */
    white: "text-white",
    /** White Bold */
    whiteBold: "text-white font-semibold",
  },

  // Border Colors
  /** Border */
  border: {
    /** Primary */
    primary: "border-yellow-200",
    /** Secondary */
    secondary: "border-gray-300",
  },

  // Hover States
  /** Hover */
  hover: {
    /** Primary */
    primary: "hover:bg-yellow-600",
    /** Light */
    light: "hover:bg-yellow-50",
    /** Text */
    text: "hover:text-yellow-700",
    /** Text Bold */
    textBold: "hover:text-yellow-700 hover:font-semibold",
  },

  // Focus States
  /** Focus */
  focus: {
    /** Ring */
    ring: "focus:ring-yellow-500",
  },
} as const;

// Tailwind class strings for dynamic usage with better visibility
/**
 * Color Classes
 * @constant
 */
export const COLOR_CLASSES = {
  // Buttons
  /** Button */
  button: {
    /** Primary */
    primary: "bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold",
    /** Primary Full */
    primaryFull:
      "bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold",
    /** Secondary */
    secondary: "bg-gray-700 hover:bg-gray-600 text-white font-medium",
  },

  // Badges/Counters
  /** Badge */
  badge: {
    /** Primary */
    primary: "bg-yellow-500 text-gray-900 font-bold",
    /** Cart */
    cart: "bg-yellow-500 text-gray-900 font-extrabold",
  },

  // Links
  /** Link */
  link: {
    /** Primary */
    primary: "text-yellow-600 hover:text-yellow-700 font-medium",
    /** Primary Bold */
    primaryBold: "text-yellow-600 hover:text-yellow-700 font-bold",
    /** Hover Only */
    hoverOnly: "hover:text-yellow-700",
    /** Secondary */
    secondary: "text-gray-700 hover:text-yellow-700 font-medium",
  },

  // Backgrounds
  /** Background */
  background: {
    /** Light */
    light: "bg-yellow-50",
    /** Gradient */
    gradient: "bg-gradient-to-r from-yellow-400 to-yellow-500",
    /** Card */
    card: "bg-yellow-50 border-2 border-yellow-200",
  },

  // Icons
  /** Icon */
  icon: {
    /** Primary */
    primary: "text-yellow-600",
    /** Light */
    light: "text-yellow-400",
    /** Bright */
    bright: "text-yellow-500",
  },

  // Category Icons
  /** Category */
  category: {
    /** Background */
    background: "bg-yellow-100 group-hover:bg-yellow-200",
    /** Icon */
    icon: "text-yellow-700",
    /** Text */
    text: "text-gray-800 font-medium group-hover:text-yellow-700",
  },

  // Input Focus
  /** Input */
  input: {
    /** Focus */
    focus: "focus:outline-none focus:ring-2 focus:ring-yellow-500",
    /** Text */
    text: "text-gray-900",
  },

  // Banner/Hero text
  /** Banner */
  banner: {
    /** Text */
    text: "text-gray-900 font-bold",
    /** Text Light */
    textLight: "text-gray-800 font-semibold",
  },
} as const;
