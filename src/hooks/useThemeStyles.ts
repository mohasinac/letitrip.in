"use client";

import { useTheme } from "@mui/material/styles";
import { useModernTheme } from "@/contexts/ModernThemeContext";

/**
 * Custom hook that provides theme-aware styles
 * Can be used in client components that need theme colors
 */
export function useThemeStyles() {
  const muiTheme = useTheme();
  const { mode, isDark } = useModernTheme();

  const gradients = {
    primary: `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.primary.dark} 100%)`,
    hero: isDark 
      ? "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)"
      : "linear-gradient(135deg, #0095f6 0%, #007acc 100%)",
    card: isDark
      ? "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)"
      : "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
  };

  const colors = {
    background: muiTheme.palette.background.default,
    surface: muiTheme.palette.background.paper,
    primary: muiTheme.palette.primary.main,
    text: muiTheme.palette.text.primary,
    textSecondary: muiTheme.palette.text.secondary,
    border: muiTheme.palette.divider,
  };

  const shadows = {
    card: isDark 
      ? "0 2px 8px rgba(255, 255, 255, 0.05)"
      : "0 2px 8px rgba(0, 0, 0, 0.1)",
    hover: isDark
      ? "0 8px 25px rgba(255, 255, 255, 0.1)"
      : "0 8px 25px rgba(0, 149, 246, 0.3)",
  };

  return {
    mode,
    isDark,
    colors,
    gradients,
    shadows,
    theme: muiTheme,
  };
}
