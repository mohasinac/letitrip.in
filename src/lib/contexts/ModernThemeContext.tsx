"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type ThemeMode = "light" | "dark";
type ThemeName = "default" | "custom";

interface ModernThemeContextType {
  mode: ThemeMode;
  themeName: ThemeName;
  toggleTheme: () => void;
  setTheme: (theme: ThemeName) => void;
  isDark: boolean;
}

const ModernThemeContext = createContext<ModernThemeContextType | undefined>(
  undefined
);

// Default theme - original colors
const defaultColors = {
  light: {
    background: "#ffffff",
    surface: "#f8fafc",
    surfaceVariant: "#f1f5f9",
    primary: "#0095f6",
    secondary: "#64748b",
    text: "#0f172a",
    textSecondary: "#475569",
    border: "#e2e8f0",
    error: "#dc2626",
    success: "#16a34a",
    warning: "#d97706",
    pattern: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
  },
  dark: {
    background: "#000000",
    surface: "#0f0f0f",
    surfaceVariant: "#1a1a1a",
    primary: "#0095f6",
    secondary: "#ffffff",
    text: "#ffffff",
    textSecondary: "#cccccc",
    border: "#333333",
    error: "#ff4757",
    success: "#2ed573",
    warning: "#ffa502",
    pattern: "linear-gradient(135deg, #000000 0%, #0f0f0f 100%)",
  },
};

// Custom theme - wind pattern + blood red/royal blue (light) & galaxy starry blue + green/fire red (dark)
const customColors = {
  light: {
    background: "#ffffff",
    surface: "#f8fafc",
    surfaceVariant: "#f1f5f9",
    primary: "#4169E1", // Royal blue
    secondary: "#DC143C", // Blood red
    text: "#0f172a",
    textSecondary: "#475569",
    border: "#DC143C",
    error: "#DC143C",
    success: "#4169E1",
    warning: "#DC143C",
    pattern: `repeating-linear-gradient(
      45deg,
      #ffffff,
      #ffffff 10px,
      #f0f0f0 10px,
      #f0f0f0 20px
    ),
    repeating-linear-gradient(
      -45deg,
      #ffffff,
      #ffffff 10px,
      #f0f0f0 10px,
      #f0f0f0 20px
    )`,
  },
  dark: {
    background: "#0a0e27", // Galaxy dark blue
    surface: "#1a1f3a",
    surfaceVariant: "#2a2f4a",
    primary: "#00FF41", // Light green
    secondary: "#FF4500", // Fire red
    text: "#e0e6ff",
    textSecondary: "#b0b6d0",
    border: "#FF4500",
    error: "#FF4500",
    success: "#00FF41",
    warning: "#FF4500",
    pattern: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
  },
};

// Map theme names to color palettes
const colorPalettes = {
  default: defaultColors,
  custom: customColors,
};

export function ModernThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mode, setMode] = useState<ThemeMode>("light");
  const [themeName, setThemeName] = useState<ThemeName>("default");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated first
    setIsHydrated(true);

    // Fetch theme settings from database
    const fetchThemeSettings = async () => {
      try {
        const response = await fetch("/api/admin/theme-settings");
        const data = await response.json();

        if (data.success && data.data) {
          const { mode: savedMode, themeName: savedThemeName } = data.data;
          if (savedMode === "dark" || savedMode === "light") {
            setMode(savedMode);
          }
          if (savedThemeName === "custom" || savedThemeName === "default") {
            setThemeName(savedThemeName);
          }
        } else {
          // Fallback to system preference if API fails
          const prefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)"
          ).matches;
          setMode(prefersDark ? "dark" : "light");
        }
      } catch (error) {
        console.error("Failed to fetch theme settings:", error);
        // Fallback to system preference
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        setMode(prefersDark ? "dark" : "light");
      }
    };

    fetchThemeSettings();
  }, []);

  useEffect(() => {
    // Only update DOM and database after hydration
    if (!isHydrated) return;

    // Save theme settings to database
    const saveThemeSettings = async () => {
      try {
        await fetch("/api/admin/theme-settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode,
            themeName,
            updatedAt: new Date().toISOString(),
          }),
        });
      } catch (error) {
        console.error("Failed to save theme settings:", error);
      }
    };

    saveThemeSettings();

    // Get colors based on current theme and mode
    const palette = colorPalettes[themeName];
    const currentColors = palette[mode];

    // Update CSS custom properties for non-MUI components
    const root = document.documentElement;

    Object.entries(currentColors).forEach(([key, value]) => {
      if (typeof value === "string") {
        root.style.setProperty(`--color-${key}`, value);
      }
    });

    // Update document class for Tailwind dark mode
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [mode, themeName, isHydrated]);

  const toggleTheme = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setTheme = (theme: ThemeName) => {
    setThemeName(theme);
  };

  // Get current colors
  const palette = colorPalettes[themeName];
  const colors = palette[mode];

  // Apply theme colors to CSS variables for easy access
  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      root.style.setProperty("--color-background", colors.background);
      root.style.setProperty("--color-surface", colors.surface);
      root.style.setProperty("--color-primary", colors.primary);
      root.style.setProperty("--color-text", colors.text);
      root.style.setProperty("--color-border", colors.border);
      // Apply dark mode class
      if (mode === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, [colors, mode]);

  const value: ModernThemeContextType = {
    mode,
    themeName,
    toggleTheme,
    setTheme,
    isDark: mode === "dark",
  };

  return (
    <ModernThemeContext.Provider value={value}>
      {children}
    </ModernThemeContext.Provider>
  );
}

export function useModernTheme() {
  const context = useContext(ModernThemeContext);
  if (context === undefined) {
    throw new Error("useModernTheme must be used within a ModernThemeProvider");
  }
  return context;
}
