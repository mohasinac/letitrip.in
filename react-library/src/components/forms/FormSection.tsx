/**
 * Form Layout Components
 *
 * Components for organizing form fields into sections, rows, and action areas.
 *
 * @example
 * ```tsx
 * // Form with sections
 * <form>
 *   <FormSection
 *     title="Personal Information"
 *     description="Enter your details"
 *     columns={2}
 *   >
 *     <FormInput label="First Name" name="firstName" />
 *     <FormInput label="Last Name" name="lastName" />
 *     <FormInput label="Email" name="email" type="email" />
 *     <FormPhoneInput label="Phone" name="phone" />
 *   </FormSection>
 *
 *   <FormSection title="Address">
 *     <FormInput label="Street" name="street" />
 *     <FormRow columns={3}>
 *       <FormInput label="City" name="city" />
 *       <FormInput label="State" name="state" />
 *       <FormInput label="Pincode" name="pincode" />
 *     </FormRow>
 *   </FormSection>
 *
 *   <FormActions align="between">
 *     <button type="button">Cancel</button>
 *     <button type="submit">Save</button>
 *   </FormActions>
 * </form>
 * ```
 */

import { ReactNode } from "react";

function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export interface FormSectionProps {
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Form fields */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Number of columns in grid layout (default: 1) */
  columns?: 1 | 2 | 3;
  /** Gap size between fields (default: "md") */
  gap?: "sm" | "md" | "lg";
}

/**
 * FormSection - Organize form fields into sections with title and grid layout
 */
export function FormSection({
  title,
  description,
  children,
  className,
  columns = 1,
  gap = "md",
}: FormSectionProps) {
  const gapClasses = {
    sm: "gap-3",
    md: "gap-4",
    lg: "gap-6",
  };

  const columnClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  };

  return (
    <div className={cn("space-y-4", className)}>
      {(title || description) && (
        <div>
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}
      <div className={cn("grid", columnClasses[columns], gapClasses[gap])}>
        {children}
      </div>
    </div>
  );
}

export interface FormRowProps {
  /** Form fields to layout in a row */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Number of columns (default: 2) */
  columns?: 2 | 3 | 4;
  /** Gap size between fields (default: "md") */
  gap?: "sm" | "md" | "lg";
}

/**
 * FormRow - Layout form fields in a responsive grid row
 */
export function FormRow({
  children,
  className,
  columns = 2,
  gap = "md",
}: FormRowProps) {
  const gapClasses = {
    sm: "gap-3",
    md: "gap-4",
    lg: "gap-6",
  };

  const columnClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div
      className={cn("grid", columnClasses[columns], gapClasses[gap], className)}
    >
      {children}
    </div>
  );
}

export interface FormActionsProps {
  /** Action buttons */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Alignment of buttons (default: "right") */
  align?: "left" | "right" | "center" | "between";
  /** Stick to bottom of container (default: false) */
  sticky?: boolean;
}

/**
 * FormActions - Action button area at the bottom of forms
 */
export function FormActions({
  children,
  className,
  align = "right",
  sticky = false,
}: FormActionsProps) {
  const alignClasses = {
    left: "justify-start",
    right: "justify-end",
    center: "justify-center",
    between: "justify-between",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700",
        alignClasses[align],
        sticky &&
          "sticky bottom-0 bg-white dark:bg-gray-900 py-4 -mx-6 px-6 -mb-6",
        className
      )}
    >
      {children}
    </div>
  );
}

export default FormSection;
