import React from 'react';
import { Label } from '../typography/Typography';
import { THEME_CONSTANTS } from '@/constants/theme';

/**
 * Input Component
 * 
 * A styled text input with optional label, error message, helper text, and icon.
 * Supports all native HTML input attributes and includes error state styling.
 * 
 * @component
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="Enter your email"
 *   error="Invalid email format"
 *   helperText="We'll never share your email"
 *   icon={<EmailIcon />}
 * />
 * ```
 */

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export default function Input({
  label,
  error,
  helperText,
  icon,
  className = '',
  required,
  ...props
}: InputProps) {
  const { input, themed } = THEME_CONSTANTS;
  
  return (
    <div className="w-full">
      {label && <Label required={required}>{label}</Label>}
      
      <div className="relative">
        {icon && (
          <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${themed.textMuted}`}>
            {icon}
          </div>
        )}
        
        <input
          className={`
            ${input.base}
            ${icon ? input.withIcon : ''}
            ${error 
              ? `${themed.borderError} focus:ring-red-500` 
              : `${themed.border} ${themed.focusRing}`
            }
            ${themed.bgInput}
            ${themed.textPrimary}
            ${themed.placeholder}
            ${input.disabled}
            ${className}
          `}
          {...props}
        />
      </div>

      {error && (
        <p className={`mt-1.5 text-sm ${themed.textError} flex items-center gap-1`}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className={`mt-1.5 text-sm ${themed.textMuted}`}>{helperText}</p>
      )}
    </div>
  );
}
