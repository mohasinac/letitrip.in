/**
 * FormSection Component
 *
 * Reusable form section wrapper with optional collapsible functionality.
 * Provides consistent styling for form sections across the application.
 *
 * @example
 * <FormSection
 *   title="Basic Information"
 *   description="Enter product details"
 *   icon={<Package />}
 *   collapsible={true}
 * >
 *   <FormField name="name" label="Product Name" />
 *   <FormField name="description" label="Description" />
 * </FormSection>
 */

"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { UnifiedTooltip } from "@/components/ui/unified";

export interface FormSectionProps {
  /** Section title */
  title: string;
  /** Optional description text */
  description?: string;
  /** Optional icon to display */
  icon?: React.ReactNode;
  /** Enable collapsible functionality */
  collapsible?: boolean;
  /** Default expanded state (only used if collapsible=true) */
  defaultExpanded?: boolean;
  /** Show error state styling */
  error?: boolean;
  /** Show loading skeleton */
  loading?: boolean;
  /** Optional help text (shown in tooltip) */
  helpText?: string;
  /** Additional CSS classes */
  className?: string;
  /** Content CSS classes */
  contentClassName?: string;
  /** Children elements */
  children: React.ReactNode;
}

export const FormSection = React.forwardRef<HTMLDivElement, FormSectionProps>(
  (
    {
      title,
      description,
      icon,
      collapsible = false,
      defaultExpanded = true,
      error = false,
      loading = false,
      helpText,
      className,
      contentClassName,
      children,
    },
    ref
  ) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    const toggleExpanded = () => {
      if (collapsible) {
        setIsExpanded(!isExpanded);
      }
    };

    if (loading) {
      return (
        <div
          ref={ref}
          className={cn(
            "bg-surface rounded-lg border border-border p-6 mb-6 animate-pulse",
            className
          )}
        >
          <div className="h-6 bg-surfaceVariant rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-surfaceVariant rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-10 bg-surfaceVariant rounded"></div>
            <div className="h-10 bg-surfaceVariant rounded"></div>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "bg-surface rounded-lg border transition-colors",
          error ? "border-error" : "border-border",
          className
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-start justify-between p-6",
            collapsible && "cursor-pointer hover:bg-surfaceVariant/30",
            !isExpanded && "border-b-0"
          )}
          onClick={toggleExpanded}
        >
          <div className="flex items-start gap-3 flex-1">
            {/* Icon */}
            {icon && (
              <div
                className={cn(
                  "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
                  error
                    ? "bg-error/10 text-error"
                    : "bg-primary/10 text-primary"
                )}
              >
                {icon}
              </div>
            )}

            {/* Title and Description */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3
                  className={cn(
                    "text-lg font-semibold",
                    error ? "text-error" : "text-text"
                  )}
                >
                  {title}
                </h3>
                {helpText && (
                  <UnifiedTooltip content={helpText}>
                    <HelpCircle className="w-4 h-4 text-textSecondary cursor-help" />
                  </UnifiedTooltip>
                )}
              </div>
              {description && (
                <p className="text-sm text-textSecondary mt-1">{description}</p>
              )}
            </div>
          </div>

          {/* Collapse Toggle */}
          {collapsible && (
            <button
              type="button"
              className="ml-4 p-1 rounded hover:bg-surfaceVariant"
              aria-label={isExpanded ? "Collapse section" : "Expand section"}
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-textSecondary" />
              ) : (
                <ChevronDown className="w-5 h-5 text-textSecondary" />
              )}
            </button>
          )}
        </div>

        {/* Content */}
        {isExpanded && (
          <div
            className={cn(
              "px-6 pb-6 space-y-4 border-t border-border pt-6",
              contentClassName
            )}
          >
            {children}
          </div>
        )}
      </div>
    );
  }
);

FormSection.displayName = "FormSection";

export default FormSection;
