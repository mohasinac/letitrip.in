"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

type ThemeMode = "light" | "dark";

interface ModernThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  isDark: boolean;
}

const ModernThemeContext = createContext<ModernThemeContextType | undefined>(
  undefined
);

// Proper light and dark theme color palette
const colors = {
  light: {
    background: "#ffffff", // White background for light mode
    surface: "#f8fafc",
    surfaceVariant: "#f1f5f9",
    primary: "#0095f6", // Instagram blue
    secondary: "#64748b", // Slate gray
    text: "#0f172a", // Dark text on light background
    textSecondary: "#475569",
    border: "#e2e8f0",
    error: "#dc2626",
    success: "#16a34a",
    warning: "#d97706",
  },
  dark: {
    background: "#000000", // Pure black background for dark mode
    surface: "#0f0f0f",
    surfaceVariant: "#1a1a1a",
    primary: "#0095f6", // Same Instagram blue
    secondary: "#ffffff", // White for contrast
    text: "#ffffff", // Pure white text
    textSecondary: "#cccccc",
    border: "#333333",
    error: "#ff4757",
    success: "#2ed573",
    warning: "#ffa502",
  },
};

export function ModernThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mode, setMode] = useState<ThemeMode>("light");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated
    setIsHydrated(true);

    const savedTheme = localStorage.getItem("theme-mode");
    if (savedTheme === "dark" || savedTheme === "light") {
      setMode(savedTheme);
    } else {
      // Detect system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setMode(prefersDark ? "dark" : "light");
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    localStorage.setItem("theme-mode", mode);

    // Update CSS custom properties for non-MUI components
    const root = document.documentElement;
    const currentColors = colors[mode];

    Object.entries(currentColors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Update document class for Tailwind dark mode
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [mode, isHydrated]);

  const toggleTheme = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const muiTheme = createTheme({
    palette: {
      mode,
      primary: {
        main: colors[mode].primary,
      },
      secondary: {
        main: colors[mode].secondary,
      },
      background: {
        default: colors[mode].background,
        paper: colors[mode].surface,
      },
      text: {
        primary: colors[mode].text,
        secondary: colors[mode].textSecondary,
      },
      divider: colors[mode].border,
      error: {
        main: colors[mode].error,
      },
      success: {
        main: colors[mode].success,
      },
      warning: {
        main: colors[mode].warning,
      },
    },
    typography: {
      fontFamily: [
        "-apple-system",
        "BlinkMacSystemFont",
        '"Segoe UI"',
        "Roboto",
        '"Helvetica Neue"',
        "Arial",
        "sans-serif",
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(","),
      h1: {
        fontSize: "2.25rem",
        fontWeight: 700,
        lineHeight: 1.2,
      },
      h2: {
        fontSize: "1.875rem",
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h3: {
        fontSize: "1.5rem",
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h4: {
        fontSize: "1.25rem",
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: "1.125rem",
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h6: {
        fontSize: "1rem",
        fontWeight: 600,
        lineHeight: 1.4,
      },
      body1: {
        fontSize: "1rem",
        lineHeight: 1.6,
      },
      body2: {
        fontSize: "0.875rem",
        lineHeight: 1.6,
      },
      caption: {
        fontSize: "0.75rem",
        lineHeight: 1.4,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: colors[mode].background,
            backgroundImage: "none",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 8,
            padding: "8px 16px",
            "&:hover": {
              backgroundColor:
                mode === "dark"
                  ? "rgba(255, 255, 255, 0.08)"
                  : "rgba(255, 255, 255, 0.1)",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: colors[mode].surface,
            border: `1px solid ${colors[mode].border}`,
            boxShadow:
              mode === "dark"
                ? "0 2px 8px rgba(255, 255, 255, 0.05)"
                : "0 2px 8px rgba(255, 255, 255, 0.1)",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: colors[mode].background,
            color: colors[mode].text,
            boxShadow: `0 1px 0 ${colors[mode].border}`,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: colors[mode].surface,
            borderColor: colors[mode].border,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              backgroundColor: colors[mode].surface,
              borderColor: colors[mode].border,
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: colors[mode].primary,
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: colors[mode].primary,
              },
            },
          },
        },
      },
    },
  });

  const value: ModernThemeContextType = {
    mode,
    toggleTheme,
    isDark: mode === "dark",
  };

  return (
    <ModernThemeContext.Provider value={value}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
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
