import React from 'react';
import { THEME_CONSTANTS } from '@/constants/theme';

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
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const { button, themed, colors } = THEME_CONSTANTS;
  
  const variants = {
    primary: `${colors.button.primary} shadow-sm hover:shadow-md ${button.active}`,
    secondary: `${colors.button.secondary} shadow-md hover:shadow-lg ${button.active}`,
    outline: `${colors.button.outline} ${button.active}`,
    ghost: `${themed.textPrimary} ${themed.hover} ${button.active}`,
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2.5 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2.5',
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
