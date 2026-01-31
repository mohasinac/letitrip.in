/**
 * Theme Components Index
 *
 * Central export point for all theme-related components and utilities.
 */

// Components from this directory
export { ThemeScript } from "./ThemeScript";
export { ThemeToggleDropdown } from "./ThemeToggleDropdown";

// Component from common directory
export { ThemeToggle } from "../common/ThemeToggle";

// Re-export hook for convenience
export { useAppTheme, usePrefersDark, useThemeColor } from "@/hooks/useTheme";
