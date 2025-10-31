/**
 * Unified Button Component
 * Single source of truth for all button variants
 * Supports both Tailwind and MUI-like props for maximum flexibility
 */

"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface UnifiedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // Variant
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "destructive"
    | "success"
    | "warning"
    | "contained"
    | "outlined"
    | "text";

  // Size
  size?: "xs" | "sm" | "md" | "lg" | "xl";

  // State
  loading?: boolean;
  disabled?: boolean;
  active?: boolean;

  // Icons
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: React.ReactNode; // For icon-only buttons

  // Layout
  fullWidth?: boolean;

  // Style
  rounded?: "none" | "sm" | "md" | "lg" | "full";
  shadow?: boolean;

  // Link behavior
  href?: string;
  target?: "_blank" | "_self" | "_parent" | "_top";

  // Children
  children?: React.ReactNode;
}

// Variant classes
const variantClasses = {
  primary:
    "bg-primary text-white hover:bg-primary/90 active:bg-primary/80 shadow-md hover:shadow-lg",
  secondary:
    "bg-secondary text-white hover:bg-secondary/90 active:bg-secondary/80 shadow-md hover:shadow-lg",
  outline:
    "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-white active:bg-primary/90",
  ghost: "bg-transparent text-primary hover:bg-primary/10 active:bg-primary/20",
  destructive:
    "bg-error text-white hover:bg-error/90 active:bg-error/80 shadow-md hover:shadow-lg",
  success:
    "bg-success text-white hover:bg-success/90 active:bg-success/80 shadow-md hover:shadow-lg",
  warning:
    "bg-warning text-white hover:bg-warning/90 active:bg-warning/80 shadow-md hover:shadow-lg",
  contained:
    "bg-primary text-white hover:bg-primary/90 active:bg-primary/80 shadow-md hover:shadow-lg",
  outlined:
    "border-2 border-primary text-primary bg-transparent hover:bg-primary/10 active:bg-primary/20",
  text: "bg-transparent text-primary hover:bg-primary/10 active:bg-primary/20",
};

// Size classes
const sizeClasses = {
  xs: "px-2 py-1 text-xs min-h-[24px]",
  sm: "px-3 py-1.5 text-sm min-h-[32px]",
  md: "px-4 py-2 text-base min-h-[40px]",
  lg: "px-6 py-3 text-lg min-h-[48px]",
  xl: "px-8 py-4 text-xl min-h-[56px]",
};

// Rounded classes
const roundedClasses = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

export const UnifiedButton = React.forwardRef<
  HTMLButtonElement,
  UnifiedButtonProps
>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      active = false,
      leftIcon,
      rightIcon,
      icon,
      fullWidth = false,
      rounded = "md",
      shadow = false,
      href,
      target,
      className,
      onClick,
      type = "button",
      ...props
    },
    ref
  ) => {
    // Determine if it's an icon-only button
    const isIconOnly = icon && !children;

    // Handle link behavior
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) {
        e.preventDefault();
        return;
      }

      if (href) {
        if (target === "_blank") {
          window.open(href, "_blank", "noopener,noreferrer");
        } else {
          window.location.href = href;
        }
      }

      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        onClick={handleClick}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center font-medium",
          "transition-all duration-200 ease-in-out",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",

          // Variant
          variantClasses[variant],

          // Size
          isIconOnly ? "p-2 aspect-square" : sizeClasses[size],

          // Rounded
          roundedClasses[rounded],

          // Full width
          fullWidth && "w-full",

          // Shadow
          shadow && "shadow-lg hover:shadow-xl",

          // Active state
          active && "ring-2 ring-primary ring-offset-2",

          // Loading state
          loading && "cursor-wait",

          // Custom className
          className
        )}
        {...props}
      >
        {/* Loading Spinner */}
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {/* Icon Only */}
        {isIconOnly && icon}

        {/* Left Icon */}
        {!isIconOnly && !loading && leftIcon && (
          <span className="mr-2 -ml-1 flex-shrink-0">{leftIcon}</span>
        )}

        {/* Children */}
        {!isIconOnly && <span className="flex-1">{children}</span>}

        {/* Right Icon */}
        {!isIconOnly && !loading && rightIcon && (
          <span className="ml-2 -mr-1 flex-shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

UnifiedButton.displayName = "UnifiedButton";

// Export convenience components for common patterns
export const PrimaryButton = React.forwardRef<
  HTMLButtonElement,
  Omit<UnifiedButtonProps, "variant">
>((props, ref) => <UnifiedButton ref={ref} variant="primary" {...props} />);
PrimaryButton.displayName = "PrimaryButton";

export const SecondaryButton = React.forwardRef<
  HTMLButtonElement,
  Omit<UnifiedButtonProps, "variant">
>((props, ref) => <UnifiedButton ref={ref} variant="secondary" {...props} />);
SecondaryButton.displayName = "SecondaryButton";

export const OutlineButton = React.forwardRef<
  HTMLButtonElement,
  Omit<UnifiedButtonProps, "variant">
>((props, ref) => <UnifiedButton ref={ref} variant="outline" {...props} />);
OutlineButton.displayName = "OutlineButton";

export const GhostButton = React.forwardRef<
  HTMLButtonElement,
  Omit<UnifiedButtonProps, "variant">
>((props, ref) => <UnifiedButton ref={ref} variant="ghost" {...props} />);
GhostButton.displayName = "GhostButton";

export const IconButton = React.forwardRef<
  HTMLButtonElement,
  Omit<UnifiedButtonProps, "leftIcon" | "rightIcon" | "children"> & {
    icon: React.ReactNode;
  }
>(({ icon, ...props }, ref) => (
  <UnifiedButton ref={ref} icon={icon} rounded="full" {...props} />
));
IconButton.displayName = "IconButton";

export default UnifiedButton;
