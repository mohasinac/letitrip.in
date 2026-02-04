import React from 'react';
import { THEME_CONSTANTS } from '@/constants/theme';

/**
 * Divider Component
 * 
 * A visual separator line with optional label text.
 * Supports horizontal and vertical orientations.
 * 
 * @component
 * @example
 * ```tsx
 * <Divider />
 * <Divider label="OR" />
 * <Divider orientation="vertical" />
 * ```
 */

interface DividerProps {
  label?: string;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export default function Divider({
  label,
  orientation = 'horizontal',
  className = '',
}: DividerProps) {
  const { themed } = THEME_CONSTANTS;

  if (orientation === 'vertical') {
    return (
      <div
        className={`w-px h-full ${themed.borderLight} ${className}`}
        role="separator"
        aria-orientation="vertical"
      />
    );
  }

  if (label) {
    return (
      <div className={`flex items-center gap-4 ${className}`} role="separator">
        <div className={`flex-1 h-px ${themed.borderLight}`} />
        <span className={`text-sm font-medium ${themed.textMuted}`}>{label}</span>
        <div className={`flex-1 h-px ${themed.borderLight}`} />
      </div>
    );
  }

  return (
    <div
      className={`w-full h-px ${themed.borderLight} ${className}`}
      role="separator"
      aria-orientation="horizontal"
    />
  );
}
