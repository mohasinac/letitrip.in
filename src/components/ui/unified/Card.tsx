/**
 * Unified Card Component
 * Single source of truth for all card variants
 * Responsive, accessible, and theme-aware
 */

"use client";

import React from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// CARD CONTAINER
// ============================================================================

export interface UnifiedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  // Variant
  variant?: "default" | "elevated" | "outlined" | "filled" | "glass";

  // Interaction
  hover?: boolean;
  clickable?: boolean;

  // Padding
  padding?: "none" | "sm" | "md" | "lg" | "xl";

  // Border
  border?: boolean;
  borderColor?: string;

  // Shadow
  shadow?: "none" | "sm" | "md" | "lg" | "xl";

  // Rounded
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";

  // Background
  gradient?: boolean;

  // Accessibility
  role?: string;
  tabIndex?: number;

  // Event handlers
  onClick?: () => void;

  children?: React.ReactNode;
}

const variantClasses = {
  default: "bg-surface border border-border",
  elevated: "bg-surface shadow-md",
  outlined: "bg-transparent border-2 border-border",
  filled: "bg-surfaceVariant",
  glass: "bg-surface/80 backdrop-blur-md border border-border/50",
};

const paddingClasses = {
  none: "p-0",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
  xl: "p-8",
};

const shadowClasses = {
  none: "shadow-none",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
};

const roundedClasses = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
};

export const UnifiedCard = React.forwardRef<HTMLDivElement, UnifiedCardProps>(
  (
    {
      children,
      variant = "default",
      hover = false,
      clickable = false,
      padding = "md",
      border = false,
      borderColor,
      shadow = "none",
      rounded = "lg",
      gradient = false,
      role,
      tabIndex,
      onClick,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        role={clickable ? "button" : role}
        tabIndex={clickable ? 0 : tabIndex}
        onClick={onClick}
        className={cn(
          // Base styles
          "transition-all duration-200 ease-in-out",

          // Variant
          variantClasses[variant],

          // Padding
          paddingClasses[padding],

          // Shadow
          shadowClasses[shadow],

          // Rounded
          roundedClasses[rounded],

          // Hover effect
          hover && "hover:shadow-lg hover:scale-[1.02] hover:border-primary/50",

          // Clickable
          clickable &&
            "cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",

          // Border
          border && "border-2",
          borderColor && `border-[${borderColor}]`,

          // Gradient
          gradient &&
            "bg-gradient-to-br from-surface via-surfaceVariant to-surface",

          // Custom className
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

UnifiedCard.displayName = "UnifiedCard";

// ============================================================================
// CARD HEADER
// ============================================================================

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  avatar?: React.ReactNode;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, subtitle, action, avatar, children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-start justify-between gap-4 mb-4", className)}
        {...props}
      >
        <div className="flex items-start gap-3 flex-1">
          {avatar && <div className="flex-shrink-0">{avatar}</div>}
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="text-lg font-semibold text-text truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-textSecondary mt-1">{subtitle}</p>
            )}
            {children}
          </div>
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    );
  }
);

CardHeader.displayName = "CardHeader";

// ============================================================================
// CARD CONTENT
// ============================================================================

export interface CardContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("text-text", className)} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = "CardContent";

// ============================================================================
// CARD FOOTER
// ============================================================================

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "left" | "center" | "right" | "between";
}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, align = "right", className, ...props }, ref) => {
    const alignClasses = {
      left: "justify-start",
      center: "justify-center",
      right: "justify-end",
      between: "justify-between",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-2 mt-4 pt-4 border-t border-border",
          alignClasses[align],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = "CardFooter";

// ============================================================================
// CARD MEDIA
// ============================================================================

export interface CardMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  image?: string;
  alt?: string;
  aspectRatio?: "square" | "video" | "portrait" | "wide";
  objectFit?: "cover" | "contain" | "fill" | "none";
}

export const CardMedia = React.forwardRef<HTMLDivElement, CardMediaProps>(
  (
    {
      image,
      alt = "",
      aspectRatio = "video",
      objectFit = "cover",
      children,
      className,
      ...props
    },
    ref
  ) => {
    const aspectClasses = {
      square: "aspect-square",
      video: "aspect-video",
      portrait: "aspect-[3/4]",
      wide: "aspect-[21/9]",
    };

    const fitClasses = {
      cover: "object-cover",
      contain: "object-contain",
      fill: "object-fill",
      none: "object-none",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-t-lg -mt-4 -mx-4 mb-4",
          aspectClasses[aspectRatio],
          className
        )}
        {...props}
      >
        {image ? (
          <img
            src={image}
            alt={alt}
            className={cn("w-full h-full", fitClasses[objectFit])}
            loading="lazy"
          />
        ) : (
          children
        )}
      </div>
    );
  }
);

CardMedia.displayName = "CardMedia";

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

export const ElevatedCard = React.forwardRef<
  HTMLDivElement,
  Omit<UnifiedCardProps, "variant">
>((props, ref) => (
  <UnifiedCard ref={ref} variant="elevated" shadow="md" {...props} />
));
ElevatedCard.displayName = "ElevatedCard";

export const OutlinedCard = React.forwardRef<
  HTMLDivElement,
  Omit<UnifiedCardProps, "variant">
>((props, ref) => <UnifiedCard ref={ref} variant="outlined" {...props} />);
OutlinedCard.displayName = "OutlinedCard";

export const GlassCard = React.forwardRef<
  HTMLDivElement,
  Omit<UnifiedCardProps, "variant">
>((props, ref) => <UnifiedCard ref={ref} variant="glass" {...props} />);
GlassCard.displayName = "GlassCard";

export default UnifiedCard;
