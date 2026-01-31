/**
 * useTheme Hook
 *
 * Custom hook for theme management with additional utilities.
 * Wraps next-themes with extra functionality for the app.
 *
 * @example
 * ```tsx
 * const { isDark, toggleTheme, setDark, setLight } = useAppTheme();
 *
 * <button onClick={toggleTheme}>Toggle Theme</button>
 * ```
 */

"use client";

import { useTheme as useNextTheme } from "next-themes";
import { useEffect, useState } from "react";

export function useAppTheme() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get the actual current theme
  const currentTheme = resolvedTheme || theme || "dark";
  const isDark = currentTheme === "dark";
  const isLight = currentTheme === "light";

  /**
   * Toggle between light and dark mode
   */
  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    setTheme(newTheme);

    // Update document immediately for instant feedback
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark", newTheme === "dark");
    }
  };

  /**
   * Set theme to dark mode
   */
  const setDark = () => {
    setTheme("dark");
    if (typeof window !== "undefined") {
      document.documentElement.classList.add("dark");
    }
  };

  /**
   * Set theme to light mode
   */
  const setLight = () => {
    setTheme("light");
    if (typeof window !== "undefined") {
      document.documentElement.classList.remove("dark");
    }
  };

  /**
   * Get CSS variable value from current theme
   */
  const getCSSVariable = (variable: string): string => {
    if (typeof window === "undefined" || !mounted) return "";

    return getComputedStyle(document.documentElement)
      .getPropertyValue(variable)
      .trim();
  };

  /**
   * Check if theme matches system preference
   */
  const matchesSystem = theme === "system" || !theme;

  return {
    // Theme state
    theme,
    resolvedTheme: currentTheme,
    systemTheme,
    isDark,
    isLight,
    mounted,
    matchesSystem,

    // Theme setters
    setTheme,
    toggleTheme,
    setDark,
    setLight,

    // Utilities
    getCSSVariable,
  };
}

/**
 * Hook to detect user's preferred color scheme
 */
export function usePrefersDark() {
  const [prefersDark, setPrefersDark] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    setPrefersDark(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersDark(e.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return prefersDark;
}

/**
 * Hook to get theme-aware color
 * Returns different colors based on current theme
 */
export function useThemeColor(lightColor: string, darkColor: string) {
  const { isDark, mounted } = useAppTheme();

  if (!mounted) return lightColor;

  return isDark ? darkColor : lightColor;
}
