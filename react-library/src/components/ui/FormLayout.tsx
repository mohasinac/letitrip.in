import React from "react";

export interface FormFieldProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * FormField - Wrapper for consistent spacing between form fields
 */
export const FormField: React.FC<FormFieldProps> = ({
  children,
  className = "",
}) => {
  return <div className={`space-y-1 ${className}`}>{children}</div>;
};

export interface FormSectionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * FormSection - Groups related form fields with consistent spacing
 */
export const FormSection: React.FC<FormSectionProps> = ({
  children,
  className = "",
}) => {
  return <div className={`space-y-4 ${className}`}>{children}</div>;
};

export interface FormGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

/**
 * FormGrid - Responsive grid for form fields
 */
export const FormGrid: React.FC<FormGridProps> = ({
  children,
  columns = 2,
  className = "",
}) => {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={`grid ${gridClasses[columns]} gap-4 ${className}`}>
      {children}
    </div>
  );
};

export interface FormRowProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * FormRow - Horizontal layout for form elements
 */
export const FormRow: React.FC<FormRowProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className={`flex items-start gap-4 ${className}`}>{children}</div>
  );
};
