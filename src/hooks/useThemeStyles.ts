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
    hero: `linear-gradient(135deg, ${muiTheme.palette.background.default} 0%, ${muiTheme.palette.background.paper} 100%)`,
    card: `linear-gradient(135deg, ${muiTheme.palette.background.paper} 0%, ${muiTheme.palette.background.default} 100%)`,
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
    card: muiTheme.shadows[2],
    hover: `0 8px 25px ${muiTheme.palette.primary.main}30`,
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
