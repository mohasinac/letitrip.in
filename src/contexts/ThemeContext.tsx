/**
 * @fileoverview React Component
 * @module src/contexts/ThemeContext
 * @description This file contains the ThemeContext component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

// Theme types - Only light and dark (no system)
/**
 * Theme type
 * 
 * @typedef {Object} Theme
 * @description Type definition for Theme
 */
export type Theme = "light" | "dark";

/**
 * ThemeContextType interface
 * 
 * @interface
 * @description Defines the structure and contract for ThemeContextType
 */
interface ThemeContextType {
  /** Current theme setting (light or dark) */
  theme: Theme;
  /** Set the theme */
  setTheme: (theme: Theme) => void;
  /** Whether the theme is currently loading */
  isLoading: boolean;
  /** Toggle between light and dark */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "jfv-theme";

/**
 * Get the stored theme from localStorage
 */
/**
 * Retrieves stored theme
 *
 * @returns {any} The storedtheme result
 */

/**
 * Retrieves stored theme
 *
 * @returns {any} The storedtheme result
 */

function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      return stored;
    }
  } catch {
    // localStorage not available
  }
  return null;
}

/**
 * Store theme in localStorage
 */
/**
 * Performs store theme operation
 *
 * @param {Theme} theme - The theme
 *
 * @returns {void} No return value
 */

/**
 * Performs store theme operation
 *
 * @param {Theme} theme - The theme
 *
 * @returns {void} No return value
 */

function storeTheme(theme: Theme): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // localStorage not available
  }
}

/**
 * Apply theme to document
 */
/**
 * Performs apply theme operation
 *
 * @param {Theme} theme - The theme
 *
 * @returns {void} No return value
 */

/**
 * Performs apply theme operation
 *
 * @param {Theme} theme - The theme
 *
 * @returns {void} No return value
 */

function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  // Remove both classes first
  root.classList.remove("light", "dark");

  // Add the theme class
  root.classList.add(theme);

  // Set data-theme attribute for CSS selectors
  root.setAttribute("data-theme", theme);

  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute(
      "content",
      theme === "dark" ? "#111827" : "#ffffff",
    );
  }
}

/**
 * ThemeProviderProps interface
 * 
 * @interface
 * @description Defines the structure and contract for ThemeProviderProps
 */
interface ThemeProviderProps {
  /** Children */
  children: React.ReactNode;
  /** Default theme if none stored - defaults to dark */
  defaultTheme?: Theme;
  /** Enable localStorage persistence */
  enableStorage?: boolean;
}

/**
 * Function: Theme Provider
 */
/**
 * Performs theme provider operation
 *
 * @param {ThemeProviderProps} [{
  children,
  defaultTheme] - The {
  children,
  default theme
 *
 * @returns {any} The themeprovider result
 *
 * @example
 * ThemeProvider({
  children,
  defaultTheme);
 */

/**
 * Performs theme provider operation
 *
 * @param {ThemeProviderProps} [{
  children,
  defaultTheme] - The {
  children,
  default theme
 *
 * @returns {any} The themeprovider result
 *
 * @example
 * ThemeProvider({
  children,
  defaultTheme);
 */

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  enableStorage = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize theme from storage or default
  useEffect(() => {
    const storedTheme = enableStorage ? getStoredTheme() : null;
    const initialTheme = storedTheme || defaultTheme;

    setThemeState(initialTheme);
    applyTheme(initialTheme);

    setIsLoading(false);
  }, [defaultTheme, enableStorage]);

  // Set theme function
  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);

      if (enableStorage) {
        storeTheme(newTheme);
      }

      applyTheme(newTheme);
    },
    [enableStorage],
  );

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  }, [theme, setTheme]);

  // Memoize context value
  const value = useMemo<ThemeContextType>(
    () => ({
      theme,
      setTheme,
      isLoading,
      toggleTheme,
    }),
    [theme, setTheme, isLoading, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 */
/**
 * Custom React hook for theme
 *
 * @returns {any} The usetheme result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * useTheme();
 */

/**
 * Custom React hook for theme
 *
 * @returns {any} The usetheme result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * useTheme();
 */

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

/**
 * Script to prevent flash of wrong theme
 * Add this to <head> before any content
 */
/**
 * Performs theme script operation
 *
 * @returns {any} The themescript result
 *
 * @example
 * ThemeScript();
 */

/**
 * T
 * @constant
 */
/**
 * Performs theme script operation
 *
 * @returns {any} The themescript result
 *
 * @example
 * ThemeScript();
 */

/**
 * T
 * @constant
 */
export const ThemeScript = () => {
  const script = `
    (function() {
      try {
        var stored = localStorage.getItem('${THEME_STORAGE_KEY}');
        var theme = (stored === 'light' || stored === 'dark') ? stored : 'dark';
        
        // Remove both classes first, then add the correct one
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(theme);
        document.documentElement.setAttribute('data-theme', theme);
      } catch (e) {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  );
};
