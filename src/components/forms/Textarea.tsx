import React from 'react';
import { Label } from '../typography/Typography';
import { THEME_CONSTANTS } from '@/constants/theme';

/**
 * Textarea Component
 * 
 * A styled multi-line text input with optional label, error message, and helper text.
 * Supports vertical resizing and all native textarea attributes.
 * 
 * @component
 * @example
 * ```tsx
 * <Textarea
 *   label="Message"
 *   placeholder="Enter your message"
 *   rows={5}
 *   error="Message is required"
 *   helperText="Max 500 characters"
 * />
 * ```
 */

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function Textarea({
  label,
  error,
  helperText,
  className = '',
  required,
  ...props
}: TextareaProps) {
  const { input, themed } = THEME_CONSTANTS;
  
  return (
    <div className="w-full">
      {label && <Label required={required}>{label}</Label>}
      
      <textarea
        className={`
          ${input.base}
          resize-y
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
