"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Define themes based on Beyblade color schemes with dark mode support
export const BEYBLADE_THEMES = {
  "dragoon-gt": {
    name: "Dragoon GT",
    svgFile: "dragoon GT.svg",
    colors: {
      secondary: "#DC2626", // Red
      primary: "#2563EB", // Blue
      accent: "#FFFFFF", // White
      background: "#FEF2F2", // Very light red-white
      text: "#1F2937", // Dark text
      muted: "#6B7280", // Gray
    },
    darkColors: {
      secondary: "#EF4444", // Brighter red for dark mode
      primary: "#3B82F6", // Brighter blue for dark mode
      accent: "#F3F4F6", // Light gray instead of white
      background: "#000000", // Pure black background
      text: "#FFFFFF", // White text
      muted: "#9CA3AF", // Light gray for muted text
    },
    description: "Legendary dragon with red, blue and white power",
  },
  "dran-buster": {
    name: "Dran Buster",
    svgFile: "dran buster.svg",
    colors: {
      primary: "#1E40AF", // Deep blue
      secondary: "#3B82F6", // Bright blue
      accent: "#60A5FA", // Light blue
      background: "#EFF6FF", // Very light blue
      text: "#1E3A8A", // Dark blue text
      muted: "#64748B", // Blue gray
    },
    darkColors: {
      primary: "#3B82F6", // Brighter blue for dark mode
      secondary: "#60A5FA", // Light blue for dark mode
      accent: "#93C5FD", // Even lighter blue
      background: "#000000", // Pure black background
      text: "#FFFFFF", // White text
      muted: "#94A3B8", // Light slate gray
    },
    description: "Intense blue energy waves",
  },
  "dranzer-gt": {
    name: "Dranzer GT",
    svgFile: "dranzer GT.svg",
    colors: {
      primary: "#2563EB", // Blue
      accent: "#059669", // Green
      secondary: "#DC2626", // Red
      background: "#F0F9FF", // Very light blue
      text: "#1E293B", // Dark text
      muted: "#64748B", // Slate gray
    },
    darkColors: {
      primary: "#3B82F6", // Brighter blue for dark mode
      accent: "#10B981", // Brighter green for dark mode
      secondary: "#EF4444", // Brighter red for dark mode
      background: "#000000", // Pure black background
      text: "#FFFFFF", // White text
      muted: "#94A3B8", // Light slate gray
    },
    description: "Phoenix fire with blue, green and red flames",
  },
  "hells-hammer": {
    name: "Hell's Hammer",
    svgFile: "hells hammer.svg",
    colors: {
      primary: "#B91C1C", // Dark red
      secondary: "#DC2626", // Red
      accent: "#EF4444", // Bright red
      background: "#FEF2F2", // Very light red
      text: "#7F1D1D", // Dark red text
      muted: "#991B1B", // Dark red muted
    },
    darkColors: {
      primary: "#EF4444", // Bright red for dark mode
      secondary: "#F87171", // Light red for dark mode
      accent: "#FCA5A5", // Even lighter red
      background: "#000000", // Pure black background
      text: "#FFFFFF", // White text
      muted: "#D1D5DB", // Light gray for better readability
    },
    description: "Infernal red hammer of destruction",
  },
  meteo: {
    name: "Meteo",
    svgFile: "meteo.svg",
    colors: {
      primary: "#1D4ED8", // Blue
      secondary: "#B91C0F", // Blood red
      accent: "#FFFFFF", // White
      background: "#F8FAFC", // Very light background
      text: "#1F2937", // Dark text
      muted: "#374151", // Darker gray for better contrast
    },
    darkColors: {
      primary: "#3B82F6", // Brighter blue for dark mode
      secondary: "#EF4444", // Brighter red for dark mode
      accent: "#F3F4F6", // Light gray instead of white
      background: "#000000", // Pure black background
      text: "#FFFFFF", // White text
      muted: "#9CA3AF", // Light gray for muted text
    },
    description: "Meteoric white, blood red and blue energy",
  },
  pegasus: {
    name: "Pegasus",
    svgFile: "pegasus.svg",
    colors: {
      primary: "#1E3A8A", // Galaxy blue (deep blue)
      secondary: "#0EA5E9", // Sky blue
      accent: "#DC2626", // Red
      background: "#F0F9FF", // Very light blue
      text: "#1E3A8A", // Galaxy blue text
      muted: "#64748B", // Gray
    },
    darkColors: {
      primary: "#3B82F6", // Brighter blue for dark mode
      secondary: "#38BDF8", // Brighter sky blue for dark mode
      accent: "#EF4444", // Brighter red for dark mode
      background: "#000000", // Pure black background
      text: "#FFFFFF", // White text
      muted: "#94A3B8", // Light slate gray
    },
    description: "Celestial pegasus with galaxy blue, sky blue and red",
  },
  spriggan: {
    name: "Spriggan",
    svgFile: "spriggan.svg",
    colors: {
      primary: "#DC2626", // Red
      accent: "#F59E0B", // Gold
      secondary: "#0EA5E9", // Sky blue
      background: "#FFF7ED", // Very light warm
      text: "#1F2937", // Dark text
      muted: "#78716C", // Brown gray
    },
    darkColors: {
      primary: "#EF4444", // Brighter red for dark mode
      accent: "#FBBF24", // Brighter gold for dark mode
      secondary: "#38BDF8", // Brighter sky blue for dark mode
      background: "#000000", // Pure black background
      text: "#FFFFFF", // White text
      muted: "#D1D5DB", // Light gray for better readability
    },
    description: "Mystical red and gold with sky blue accents",
  },
  valkyrie: {
    name: "Valkyrie",
    svgFile: "valkyrie.svg",
    colors: {
      primary: "#DC2626", // Red
      secondary: "#2563EB", // Blue
      accent: "#F59E0B", // Gold
      background: "#FEF2F2", // Very light red
      text: "#1F2937", // Dark text
      muted: "#6B7280", // Gray
    },
    darkColors: {
      primary: "#EF4444", // Brighter red for dark mode
      secondary: "#3B82F6", // Brighter blue for dark mode
      accent: "#FBBF24", // Brighter gold for dark mode
      background: "#000000", // Pure black background
      text: "#FFFFFF", // White text
      muted: "#9CA3AF", // Light gray for muted text
    },
    description: "Warrior spirit with red, blue and gold",
  },
} as const;

export type BeybladeThemeKey = keyof typeof BEYBLADE_THEMES;
export type BeybladeTheme = (typeof BEYBLADE_THEMES)[BeybladeThemeKey];

interface ThemeContextType {
  currentTheme: BeybladeThemeKey;
  theme: BeybladeTheme;
  isDarkMode: boolean;
  setTheme: (theme: BeybladeThemeKey) => void;
  toggleDarkMode: () => void;
  availableThemes: typeof BEYBLADE_THEMES;
  getCurrentColors: () => {
    secondary: string;
    primary: string;
    accent: string;
    background: string;
    text: string;
    muted: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] =
    useState<BeybladeThemeKey>("dragoon-gt");
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("beyblade-theme");
    const savedDarkMode = localStorage.getItem("beyblade-dark-mode");

    if (savedTheme && savedTheme in BEYBLADE_THEMES) {
      setCurrentTheme(savedTheme as BeybladeThemeKey);
    }

    if (savedDarkMode !== null) {
      setIsDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // Get current colors based on dark mode state
  const getCurrentColors = () => {
    const theme = BEYBLADE_THEMES[currentTheme];
    return isDarkMode ? theme.darkColors : theme.colors;
  };

  // Apply CSS custom properties when theme or dark mode changes
  useEffect(() => {
    const theme = BEYBLADE_THEMES[currentTheme];
    const colors = isDarkMode ? theme.darkColors : theme.colors;
    const root = document.documentElement;

    // Apply theme colors as CSS custom properties
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value);
    });

    // Add/remove dark class for Tailwind dark mode
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Store in localStorage
    localStorage.setItem("beyblade-theme", currentTheme);
    localStorage.setItem("beyblade-dark-mode", JSON.stringify(isDarkMode));
  }, [currentTheme, isDarkMode]);

  const setTheme = (theme: BeybladeThemeKey) => {
    setCurrentTheme(theme);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const value: ThemeContextType = {
    currentTheme,
    theme: BEYBLADE_THEMES[currentTheme],
    isDarkMode,
    setTheme,
    toggleDarkMode,
    getCurrentColors,
    availableThemes: BEYBLADE_THEMES,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
