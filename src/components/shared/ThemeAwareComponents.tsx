"use client";

import React from "react";
import { Box, BoxProps } from "@mui/material";
import { useThemeStyles } from "@/hooks/useThemeStyles";

interface ThemeAwareBoxProps extends Omit<BoxProps, "sx"> {
  variant?: "hero" | "card" | "surface" | "background";
  gradient?: boolean;
  children: React.ReactNode;
}

/**
 * A theme-aware Box component that automatically applies theme styles
 * Can be used to wrap server component content with client-side theming
 */
export function ThemeAwareBox({
  variant = "background",
  gradient = false,
  children,
  ...props
}: ThemeAwareBoxProps) {
  const { colors, gradients, shadows, isDark } = useThemeStyles();

  const getStyles = () => {
    const baseStyles = {
      backgroundColor: colors.background,
      color: colors.text,
    };

    switch (variant) {
      case "hero":
        return {
          ...baseStyles,
          background: gradient ? gradients.hero : colors.primary,
          color: "white",
          py: { xs: 8, md: 12 },
        };

      case "card":
        return {
          ...baseStyles,
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: 3,
          boxShadow: shadows.card,
          background: gradient ? gradients.card : colors.surface,
        };

      case "surface":
        return {
          ...baseStyles,
          backgroundColor: colors.surface,
        };

      default:
        return baseStyles;
    }
  };

  return (
    <Box sx={getStyles()} {...props}>
      {children}
    </Box>
  );
}

/**
 * Hero section wrapper with automatic theme-aware gradient
 */
export function HeroSection({ children, ...props }: BoxProps) {
  return (
    <ThemeAwareBox variant="hero" gradient {...props}>
      {children}
    </ThemeAwareBox>
  );
}

/**
 * Card wrapper with automatic theme-aware styling
 */
export function ThemeCard({ children, ...props }: BoxProps) {
  return (
    <ThemeAwareBox variant="card" {...props}>
      {children}
    </ThemeAwareBox>
  );
}
