"use client";

import React from "react";

interface ThemeAwareBoxProps extends React.HTMLAttributes<HTMLDivElement> {
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
  className = "",
  ...props
}: ThemeAwareBoxProps) {
  const getClassNames = () => {
    const baseClasses =
      "bg-white dark:bg-gray-950 text-gray-900 dark:text-white";

    switch (variant) {
      case "hero":
        return `${
          gradient
            ? "bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900"
            : "bg-blue-600 dark:bg-blue-700"
        } text-white py-16 md:py-24`;

      case "card":
        return `${
          gradient
            ? "bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
            : "bg-white dark:bg-gray-900"
        } border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm`;

      case "surface":
        return "bg-white dark:bg-gray-900";

      default:
        return baseClasses;
    }
  };

  return (
    <div className={`${getClassNames()} ${className}`} {...props}>
      {children}
    </div>
  );
}

/**
 * Hero section wrapper with automatic theme-aware gradient
 */
export function HeroSection({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <ThemeAwareBox variant="hero" gradient className={className} {...props}>
      {children}
    </ThemeAwareBox>
  );
}

/**
 * Card wrapper with automatic theme-aware styling
 */
export function ThemeCard({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <ThemeAwareBox variant="card" className={className} {...props}>
      {children}
    </ThemeAwareBox>
  );
}
