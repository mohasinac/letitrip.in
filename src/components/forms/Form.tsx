'use client';

import React from 'react';
import { THEME_CONSTANTS } from '@/constants/theme';

/**
 * Form Component
 * 
 * A wrapper component for forms with consistent spacing between form elements.
 * Use with FormGroup and FormActions for structured form layouts.
 * 
 * @component
 * @example
 * ```tsx
 * <Form onSubmit={handleSubmit}>
 *   <FormGroup columns={2}>
 *     <Input label="First Name" />
 *     <Input label="Last Name" />
 *   </FormGroup>
 *   <FormActions align="right">
 *     <Button type="submit">Submit</Button>
 *   </FormActions>
 * </Form>
 * ```
 */

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
}

export default function Form({ children, className = '', ...props }: FormProps) {
  const { spacing } = THEME_CONSTANTS;
  return (
    <form 
      className={`${spacing.formGroup} ${className}`}
      {...props}
    >
      {children}
    </form>
  );
}

// Form Group Component
interface FormGroupProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function FormGroup({ children, columns = 1, className = '' }: FormGroupProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridClasses[columns]} gap-6 ${className}`}>
      {children}
    </div>
  );
}

// Form Actions Component (for buttons at bottom of form)
interface FormActionsProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right' | 'between';
  className?: string;
}

export function FormActions({ children, align = 'right', className = '' }: FormActionsProps) {
  const { themed, spacing } = THEME_CONSTANTS;
  
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div className={`flex items-center ${spacing.inline} pt-4 border-t ${themed.borderLight} ${alignClasses[align]} ${className}`}>
      {children}
    </div>
  );
}
