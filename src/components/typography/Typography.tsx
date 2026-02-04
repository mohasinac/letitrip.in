import React from 'react';
import { THEME_CONSTANTS } from '@/constants/theme';

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
  variant?: 'primary' | 'secondary' | 'muted';
  children: React.ReactNode;
}

export function Heading({ 
  level = 1, 
  variant = 'primary',
  className = '', 
  children, 
  ...props 
}: HeadingProps) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
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
  variant?: 'primary' | 'secondary' | 'muted' | 'error' | 'success';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  children: React.ReactNode;
}

export function Text({ 
  variant = 'primary',
  size = 'base',
  weight = 'normal',
  className = '', 
  children, 
  ...props 
}: TextProps) {
  const { typography, themed } = THEME_CONSTANTS;
  
  const sizeClasses = {
    xs: typography.xs,
    sm: typography.small,
    base: typography.body,
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
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

export function Label({ required, className = '', children, ...props }: LabelProps) {
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
  children: React.ReactNode;
}

export function Caption({ className = '', children, ...props }: CaptionProps) {
  const { themed, typography } = THEME_CONSTANTS;
  return (
    <span 
      className={`${typography.xs} ${themed.textMuted} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
