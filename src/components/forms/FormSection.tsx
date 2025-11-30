"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface FormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  columns?: 1 | 2 | 3;
  gap?: "sm" | "md" | "lg";
}

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
  children: ReactNode;
  className?: string;
  columns?: 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
}

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
  children: ReactNode;
  className?: string;
  align?: "left" | "right" | "center" | "between";
  sticky?: boolean;
}

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
