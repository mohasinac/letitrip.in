/**
 * Reusable Input Component with Theme Support
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={cn('form-group', fullWidth && 'w-full')}>
        {label && (
          <label htmlFor={inputId} className="form-label">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'form-input',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-error focus:ring-error',
              className
            )}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && <p className="form-error mt-1">{error}</p>}
        {helperText && !error && <p className="form-help mt-1">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
