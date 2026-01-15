/**
 * WizardActionBar Component
 * Framework-agnostic sticky footer action bar
 *
 * Purpose: Fixed footer with form action buttons
 * Features: Save draft, validate, submit buttons with loading states
 *
 * @example Basic Usage
 * ```tsx
 * <WizardActionBar
 *   onSubmit={handleSubmit}
 *   isSubmitting={isSubmitting}
 *   submitLabel="Create Product"
 * />
 * ```
 *
 * @example With All Actions
 * ```tsx
 * <WizardActionBar
 *   onSaveDraft={handleSaveDraft}
 *   onValidate={handleValidate}
 *   onSubmit={handleSubmit}
 *   isSubmitting={isSubmitting}
 *   isSaving={isSaving}
 *   isValid={isValid}
 *   showSaveDraft
 *   showValidate
 * />
 * ```
 */

import React from "react";

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// Default icons
function SaveIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

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
  SaveIcon?: React.ComponentType<{ className?: string }>;
  CheckIcon?: React.ComponentType<{ className?: string }>;
  SpinnerIcon?: React.ComponentType<{ className?: string }>;
}

export function WizardActionBar({
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
  SaveIcon: SaveIconProp = SaveIcon,
  CheckIcon: CheckIconProp = CheckIcon,
  SpinnerIcon: SpinnerIconProp = SpinnerIcon,
}: WizardActionBarProps) {
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
        {/* Save Draft */}
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
              <SpinnerIconProp className="w-4 h-4" />
            ) : (
              <SaveIconProp className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{draftLabel}</span>
            <span className="sm:hidden">Draft</span>
          </button>
        )}

        {/* Validate */}
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
            <CheckIconProp className="w-4 h-4" />
            <span>Validate</span>
          </button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Submit */}
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className={cn(
            "flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg",
            "text-sm font-medium transition-colors min-w-[140px]",
            isValid
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isSubmitting ? (
            <>
              <SpinnerIconProp className="w-4 h-4" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <CheckIconProp className="w-4 h-4" />
              <span>{isValid ? submitLabel : "Complete & Submit"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
