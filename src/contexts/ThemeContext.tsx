"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

// Theme types
export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  /** Current theme setting (light, dark, or system) */
  theme: Theme;
  /** Set the theme */
  setTheme: (theme: Theme) => void;
  /** The actual resolved theme (light or dark) */
  resolvedTheme: ResolvedTheme;
  /** Whether the theme is currently loading */
  isLoading: boolean;
  /** Toggle between light and dark (ignores system) */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "jfv-theme";

/**
 * Get the system theme preference
 */
function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * Get the stored theme from localStorage
 */
function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
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
function storeTheme(theme: Theme): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // localStorage not available
  }
}

/**
 * Resolve the theme to light or dark
 */
function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === "system") {
    return getSystemTheme();
  }
  return theme;
}

/**
 * Apply theme to document
 */
function applyTheme(resolvedTheme: ResolvedTheme): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  // Remove both classes first
  root.classList.remove("light", "dark");

  // Add the resolved theme class
  root.classList.add(resolvedTheme);

  // Set data-theme attribute for CSS selectors
  root.setAttribute("data-theme", resolvedTheme);

  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute(
      "content",
      resolvedTheme === "dark" ? "#111827" : "#ffffff"
    );
  }
}

interface ThemeProviderProps {
  children: React.ReactNode;
  /** Default theme if none stored */
  defaultTheme?: Theme;
  /** Force a specific theme (overrides user preference) */
  forcedTheme?: ResolvedTheme;
  /** Enable system theme detection */
  enableSystem?: boolean;
  /** Enable localStorage persistence */
  enableStorage?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  forcedTheme,
  enableSystem = true,
  enableStorage = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const [isLoading, setIsLoading] = useState(true);

  // Initialize theme from storage or default
  useEffect(() => {
    const storedTheme = enableStorage ? getStoredTheme() : null;
    const initialTheme = storedTheme || defaultTheme;

    setThemeState(initialTheme);

    const resolved = forcedTheme || resolveTheme(initialTheme);
    setResolvedTheme(resolved);
    applyTheme(resolved);

    setIsLoading(false);
  }, [defaultTheme, enableStorage, forcedTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (!enableSystem || forcedTheme) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      if (theme === "system") {
        const newResolved = getSystemTheme();
        setResolvedTheme(newResolved);
        applyTheme(newResolved);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, enableSystem, forcedTheme]);

  // Set theme function
  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);

      if (enableStorage) {
        storeTheme(newTheme);
      }

      const resolved = forcedTheme || resolveTheme(newTheme);
      setResolvedTheme(resolved);
      applyTheme(resolved);
    },
    [enableStorage, forcedTheme]
  );

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
  }, [resolvedTheme, setTheme]);

  // Memoize context value
  const value = useMemo<ThemeContextType>(
    () => ({
      theme,
      setTheme,
      resolvedTheme,
      isLoading,
      toggleTheme,
    }),
    [theme, setTheme, resolvedTheme, isLoading, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
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
export const ThemeScript = () => {
  const script = `
    (function() {
      try {
        var stored = localStorage.getItem('${THEME_STORAGE_KEY}');
        var theme = stored || 'system';
        var resolved = theme;
        
        if (theme === 'system') {
          resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        
        document.documentElement.classList.add(resolved);
        document.documentElement.setAttribute('data-theme', resolved);
      } catch (e) {}
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  );
};
