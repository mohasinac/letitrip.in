import React from "react";
import { THEME_CONSTANTS } from "@/constants";

/**
 * Button Component
 *
 * A versatile button component with multiple variants and sizes.
 * Supports all native button props and includes active scale animations.
 *
 * @component
 * @example
 * ```tsx
 * <Button variant="primary" size="lg" onClick={() => console.log('clicked')}>
 *   Click Me
 * </Button>
 * ```
 */

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger"
    | "warning";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const { button, themed, colors } = THEME_CONSTANTS;

  const variants = {
    primary: `${colors.button.primary} shadow-sm hover:shadow-md ${button.active}`,
    secondary: `${colors.button.secondary} shadow-md hover:shadow-lg ${button.active}`,
    outline: `${colors.button.outline} ${button.active}`,
    ghost: `${colors.button.ghost} ${button.active}`,
    danger: `${colors.button.danger} shadow-sm hover:shadow-md ${button.active}`,
    warning: `${colors.button.warning} shadow-sm hover:shadow-md ${button.active}`,
  };

  const sizes = {
    sm: "px-2.5 py-1.5 text-xs sm:px-3 sm:text-sm gap-1.5",
    md: "px-3 py-2 text-sm sm:px-4 sm:py-2.5 sm:text-base gap-2",
    lg: "px-4 py-2.5 text-base sm:px-6 sm:py-3 sm:text-lg gap-2.5",
  };

  return (
    <button
      className={`${button.base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
