"use client";

import React from "react";
import { Save, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WizardActionBarProps {
  onSaveDraft?: () => void;
  onValidate?: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  isSaving?: boolean;
  isValid?: boolean;
  submitLabel?: string;
  draftLabel?: string;
  showValidate?: boolean;
  showSaveDraft?: boolean;
  className?: string;
}

/**
 * WizardActionBar - Sticky footer with always-visible action buttons
 *
 * Features:
 * - Fixed position above mobile bottom nav
 * - Save Draft, Validate, Submit buttons
 * - Submit button changes based on form validity
 * - Loading states for async actions
 * - Dark mode support
 */
export const WizardActionBar: React.FC<WizardActionBarProps> = ({
  onSaveDraft,
  onValidate,
  onSubmit,
  isSubmitting = false,
  isSaving = false,
  isValid = false,
  submitLabel = "Create",
  draftLabel = "Save Draft",
  showValidate = true,
  showSaveDraft = true,
  className,
}) => {
  return (
    <div
      className={cn(
        "fixed bottom-16 lg:bottom-0 left-0 right-0 z-40",
        "bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700",
        "px-4 py-3 shadow-lg",
        className
      )}
    >
      <div className="max-w-4xl mx-auto flex flex-wrap gap-2 sm:gap-3">
        {/* Save Draft Button */}
        {showSaveDraft && onSaveDraft && (
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isSaving || isSubmitting}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg",
              "text-sm font-medium transition-colors",
              "border border-gray-300 dark:border-gray-600",
              "text-gray-700 dark:text-gray-300",
              "hover:bg-gray-50 dark:hover:bg-gray-700",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "min-w-[100px]"
            )}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{draftLabel}</span>
            <span className="sm:hidden">Draft</span>
          </button>
        )}

        {/* Validate Button */}
        {showValidate && onValidate && (
          <button
            type="button"
            onClick={onValidate}
            disabled={isSubmitting}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg",
              "text-sm font-medium transition-colors",
              "border border-gray-300 dark:border-gray-600",
              "text-gray-700 dark:text-gray-300",
              "hover:bg-gray-50 dark:hover:bg-gray-700",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "min-w-[100px]"
            )}
          >
            <CheckCircle className="w-4 h-4" />
            <span>Validate</span>
          </button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Submit Button */}
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className={cn(
            "flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg",
            "text-sm font-medium transition-colors",
            "min-w-[140px]",
            isValid
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>{isValid ? submitLabel : "Complete & Submit"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default WizardActionBar;
