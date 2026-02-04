import React from 'react';
import { THEME_CONSTANTS } from '@/constants/theme';

/**
 * Spinner Component
 * 
 * A loading spinner with multiple sizes and color variants.
 * Shows a rotating circular animation to indicate loading state.
 * 
 * @component
 * @example
 * ```tsx
 * <Spinner size="lg" variant="primary" />
 * <Spinner size="sm" variant="white" />
 * ```
 */

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'white' | 'current';
  className?: string;
  label?: string;
}

export default function Spinner({
  size = 'md',
  variant = 'primary',
  className = '',
  label = 'Loading...',
}: SpinnerProps) {
  const { colors } = THEME_CONSTANTS;

  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4',
  };

  const variantClasses = {
    primary: 'border-blue-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    current: 'border-current border-t-transparent',
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`} role="status" aria-label={label}>
      <div
        className={`
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          rounded-full animate-spin
        `}
      />
      {label && <span className="sr-only">{label}</span>}
    </div>
  );
}
