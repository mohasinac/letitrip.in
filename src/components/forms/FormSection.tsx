/**
 * @fileoverview React Component
 * @module src/components/forms/FormSection
 * @description This file contains the FormSection component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * FormSectionProps interface
 * 
 * @interface
 * @description Defines the structure and contract for FormSectionProps
 */
export interface FormSectionProps {
  /** Title */
  title?: string;
  /** Description */
  description?: string;
  /** Children */
  children: ReactNode;
  /** Class Name */
  className?: string;
  /** Columns */
  columns?: 1 | 2 | 3;
  /** Gap */
  gap?: "sm" | "md" | "lg";
}

/**
 * Function: Form Section
 */
/**
 * Performs form section operation
 *
 * @returns {any} The formsection result
 *
 * @example
 * FormSection();
 */

/**
 * Performs form section operation
 *
 * @returns {any} The formsection result
 *
 * @example
 * FormSection();
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
    /** Sm */
    sm: "gap-3",
    /** Md */
    md: "gap-4",
    /** Lg */
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

/**
 * FormRowProps interface
 * 
 * @interface
 * @description Defines the structure and contract for FormRowProps
 */
export interface FormRowProps {
  /** Children */
  children: ReactNode;
  /** Class Name */
  className?: string;
  /** Columns */
  columns?: 2 | 3 | 4;
  /** Gap */
  gap?: "sm" | "md" | "lg";
}

/**
 * Function: Form Row
 */
/**
 * Performs form row operation
 *
 * @returns {any} The formrow result
 *
 * @example
 * FormRow();
 */

/**
 * Performs form row operation
 *
 * @returns {any} The formrow result
 *
 * @example
 * FormRow();
 */

export function FormRow({
  children,
  className,
  columns = 2,
  gap = "md",
}: FormRowProps) {
  const gapClasses = {
    /** Sm */
    sm: "gap-3",
    /** Md */
    md: "gap-4",
    /** Lg */
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

/**
 * FormActionsProps interface
 * 
 * @interface
 * @description Defines the structure and contract for FormActionsProps
 */
export interface FormActionsProps {
  /** Children */
  children: ReactNode;
  /** Class Name */
  className?: string;
  /** Align */
  align?: "left" | "right" | "center" | "between";
  /** Sticky */
  sticky?: boolean;
}

/**
 * Function: Form Actions
 */
/**
 * Performs form actions operation
 *
 * @returns {any} The formactions result
 *
 * @example
 * FormActions();
 */

/**
 * Performs form actions operation
 *
 * @returns {any} The formactions result
 *
 * @example
 * FormActions();
 */

export function FormActions({
  children,
  className,
  align = "right",
  sticky = false,
}: FormActionsProps) {
  const alignClasses = {
    /** Left */
    left: "justify-start",
    /** Right */
    right: "justify-end",
    /** Center */
    center: "justify-center",
    /** Between */
    between: "justify-between",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700",
        alignClasses[align],
        sticky &&
          "sticky bottom-0 bg-white dark:bg-gray-900 py-4 -mx-6 px-6 -mb-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export default FormSection;
