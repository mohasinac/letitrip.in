/**
 * WizardSteps Component
 * Framework-agnostic horizontal step indicator
 *
 * Purpose: Mobile-friendly step navigation for multi-step forms
 * Features: Auto-scroll, touch support, state indicators, click navigation
 *
 * @example Basic Usage
 * ```tsx
 * const steps = [
 *   { label: 'Personal Info' },
 *   { label: 'Contact' },
 *   { label: 'Review' }
 * ];
 *
 * <WizardSteps
 *   steps={steps}
 *   currentStep={currentStep}
 *   onStepClick={setCurrentStep}
 *   stepStates={stepStates}
 * />
 * ```
 */

import React, { useEffect, useRef } from "react";

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// Default icons
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
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
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
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

export interface WizardStep {
  id?: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface WizardStepState {
  isComplete: boolean;
  isValid: boolean;
  hasErrors: boolean;
  errorCount?: number;
}

export interface WizardStepsProps {
  steps: WizardStep[];
  currentStep: number;
  stepStates?: WizardStepState[];
  onStepClick?: (index: number) => void;
  className?: string;
  variant?: "numbered" | "pills";
  CheckIcon?: React.ComponentType<{ className?: string }>;
  AlertIcon?: React.ComponentType<{ className?: string }>;
}

export function WizardSteps({
  steps,
  currentStep,
  stepStates,
  onStepClick,
  className,
  variant = "numbered",
  CheckIcon: CheckIconProp = CheckIcon,
  AlertIcon: AlertIconProp = AlertIcon,
}: WizardStepsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current step
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const activeButton = container.querySelector(
      `[data-step="${currentStep}"]`
    ) as HTMLElement;

    if (activeButton) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();

      const scrollLeft =
        activeButton.offsetLeft -
        containerRect.width / 2 +
        buttonRect.width / 2;

      container.scrollTo({
        left: Math.max(0, scrollLeft),
        behavior: "smooth",
      });
    }
  }, [currentStep]);

  const getStepState = (
    index: number
  ): "current" | "completed" | "error" | "pending" => {
    if (stepStates && stepStates[index]) {
      const state = stepStates[index];
      if (state.hasErrors) return "error";
      if (index === currentStep) return "current";
      if (state.isComplete) return "completed";
      return "pending";
    }
    // Fallback
    if (index === currentStep) return "current";
    if (index < currentStep) return "completed";
    return "pending";
  };

  return (
    <div className={cn("relative", className)}>
      {/* Gradient fade left */}
      <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white dark:from-gray-900 to-transparent z-10 pointer-events-none" />

      {/* Scrollable steps */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto px-6 py-3"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {steps.map((step, index) => {
          const state = getStepState(index);

          return (
            <button
              key={step.id || index}
              data-step={index}
              onClick={() => onStepClick?.(index)}
              disabled={!onStepClick}
              type="button"
              className={cn(
                "flex-shrink-0 transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
                variant === "pills"
                  ? "px-4 py-2 rounded-full text-sm font-medium"
                  : "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                state === "current" &&
                  variant === "pills" &&
                  "bg-blue-600 text-white shadow-md",
                state === "current" &&
                  variant !== "pills" &&
                  "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-500",
                state === "completed" &&
                  variant === "pills" &&
                  "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
                state === "completed" &&
                  variant !== "pills" &&
                  "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700",
                state === "error" &&
                  variant === "pills" &&
                  "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
                state === "error" &&
                  variant !== "pills" &&
                  "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-700",
                state === "pending" &&
                  variant === "pills" &&
                  "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
                state === "pending" &&
                  variant !== "pills" &&
                  "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700",
                onStepClick && "cursor-pointer hover:scale-105"
              )}
            >
              {/* Step indicator */}
              {variant === "numbered" && (
                <span
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold",
                    state === "current" && "bg-blue-600 text-white",
                    state === "completed" && "bg-green-500 text-white",
                    state === "error" && "bg-red-500 text-white",
                    state === "pending" &&
                      "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                  )}
                >
                  {state === "completed" ? (
                    <CheckIconProp className="w-3.5 h-3.5" />
                  ) : state === "error" ? (
                    <AlertIconProp className="w-3.5 h-3.5" />
                  ) : (
                    index + 1
                  )}
                </span>
              )}

              {/* Step name */}
              <span className="whitespace-nowrap">
                {step.icon}
                {step.label}
              </span>

              {/* Pills variant icons */}
              {variant === "pills" && state === "completed" && (
                <CheckIconProp className="w-4 h-4 ml-1" />
              )}
              {variant === "pills" && state === "error" && (
                <AlertIconProp className="w-4 h-4 ml-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* Gradient fade right */}
      <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white dark:from-gray-900 to-transparent z-10 pointer-events-none" />
    </div>
  );
}
