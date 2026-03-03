import React from "react";
import { THEME_CONSTANTS } from "@/constants";

/**
 * Heading Component
 *
 * A semantic heading component (h1-h6) with consistent styling and theme support.
 * Provides level-based sizing and variant-based color theming.
 *
 * @component
 * @example
 * ```tsx
 * <Heading level={1} variant="primary">
 *   Main Title
 * </Heading>
 * ```
 */

// Heading Component
interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  variant?: "primary" | "secondary" | "muted";
  children: React.ReactNode;
}

export function Heading({
  level = 1,
  variant = "primary",
  className = "",
  children,
  ...props
}: HeadingProps) {
  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  const { typography, themed } = THEME_CONSTANTS;

  const sizeClasses = {
    1: typography.h1,
    2: typography.h2,
    3: typography.h3,
    4: typography.h4,
    5: typography.h5,
    6: typography.h6,
  };

  const variantClasses = {
    primary: themed.textPrimary,
    secondary: themed.textSecondary,
    muted: themed.textMuted,
  };

  return (
    <Tag
      className={`${sizeClasses[level]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}

// Text Component
interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: "primary" | "secondary" | "muted" | "error" | "success";
  size?: "xs" | "sm" | "base" | "lg" | "xl";
  weight?: "normal" | "medium" | "semibold" | "bold";
  children: React.ReactNode;
}

export function Text({
  variant = "primary",
  size = "base",
  weight = "normal",
  className = "",
  children,
  ...props
}: TextProps) {
  const { typography, themed } = THEME_CONSTANTS;

  const sizeClasses = {
    xs: typography.xs,
    sm: typography.small,
    base: typography.body,
    lg: "text-lg",
    xl: "text-xl",
  };

  const weightClasses = {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
  };

  const variantClasses = {
    primary: themed.textPrimary,
    secondary: themed.textSecondary,
    muted: themed.textMuted,
    error: themed.textError,
    success: themed.textSuccess,
  };

  return (
    <p
      className={`${sizeClasses[size]} ${weightClasses[weight]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}

// Label Component
interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  children: React.ReactNode;
}

export function Label({
  required,
  className = "",
  children,
  ...props
}: LabelProps) {
  const { themed, typography, colors } = THEME_CONSTANTS;
  return (
    <label
      className={`block ${typography.small} font-medium ${themed.textSecondary} mb-1.5 ${className}`}
      {...props}
    >
      {children}
      {required && <span className={`${colors.form.required} ml-1`}>*</span>}
    </label>
  );
}

// Caption Component
interface CaptionProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** "default" — muted grey (default); "accent" — indigo, semibold; "inverse" — light indigo for use on dark indigo backgrounds */
  variant?: "default" | "accent" | "inverse";
  children: React.ReactNode;
}

export function Caption({
  variant = "default",
  className = "",
  children,
  ...props
}: CaptionProps) {
  const { themed, typography } = THEME_CONSTANTS;

  const variantClasses = {
    default: themed.textMuted,
    accent: "text-indigo-600 dark:text-indigo-400 font-semibold",
    inverse: "text-indigo-200",
  };

  return (
    <span
      className={`${typography.xs} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

// ─── Span Component ──────────────────────────────────────────────────────────
/**
 * Span Component
 *
 * Inline wrapper for styled text fragments. Use instead of a raw `<span>`.
 * When `variant` is "inherit" (default) the element carries no colour classes
 * so it blends with its parent — perfect for purely structural/CSS wrappers.
 *
 * @example
 * ```tsx
 * // Gradient highlight
 * <Span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
 *   Highlighted
 * </Span>
 *
 * // Semantic colour
 * <Span variant="error" weight="semibold">Required</Span>
 * ```
 */
interface SpanProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Colour variant. "inherit" (default) applies no colour class. */
  variant?:
    | "inherit"
    | "primary"
    | "secondary"
    | "muted"
    | "error"
    | "success"
    | "accent";
  size?: "xs" | "sm" | "base" | "lg" | "xl";
  weight?: "normal" | "medium" | "semibold" | "bold";
  children?: React.ReactNode;
}

export function Span({
  variant = "inherit",
  size,
  weight,
  className = "",
  children,
  ...props
}: SpanProps) {
  const { themed, typography } = THEME_CONSTANTS;

  const variantClasses: Record<NonNullable<SpanProps["variant"]>, string> = {
    inherit: "",
    primary: themed.textPrimary,
    secondary: themed.textSecondary,
    muted: themed.textMuted,
    error: themed.textError,
    success: themed.textSuccess,
    accent: "text-indigo-600 dark:text-indigo-400",
  };

  const sizeClasses: Record<NonNullable<SpanProps["size"]>, string> = {
    xs: typography.xs,
    sm: typography.small,
    base: typography.body,
    lg: "text-lg",
    xl: "text-xl",
  };

  const weightClasses: Record<NonNullable<SpanProps["weight"]>, string> = {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
  };

  const classes = [
    size ? sizeClasses[size] : "",
    weight ? weightClasses[weight] : "",
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}
