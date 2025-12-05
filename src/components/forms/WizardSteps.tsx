/**
 * @fileoverview React Component
 * @module src/components/forms/WizardSteps
 * @description This file contains the WizardSteps component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import React, { useRef, useEffect } from "react";
import { Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * WizardStep interface
 * 
 * @interface
 * @description Defines the structure and contract for WizardStep
 */
export interface WizardStep {
  /** Id */
  id?: string;
  /** Name */
  name?: string;
  /** Label */
  label?: string; // Alternative to name
  /** Description */
  description?: string;
  /** Icon */
  icon?: React.ReactNode;
}

/**
 * StepState interface
 * 
 * @interface
 * @description Defines the structure and contract for StepState
 */
export interface StepState {
  /** Is Complete */
  isComplete: boolean;
  /** Is Valid */
  isValid: boolean;
  /** Has Errors */
  hasErrors: boolean;
  /** Error Count */
  errorCount?: number;
}

/**
 * WizardStepsProps interface
 * 
 * @interface
 * @description Defines the structure and contract for WizardStepsProps
 */
export interface WizardStepsProps {
  /** Steps */
  steps: WizardStep[];
  /** Current Step */
  currentStep: number;
  /** Completed Steps */
  completedSteps?: number[];
  /** Error Steps */
  errorSteps?: number[];
  /** StepStates */
  stepStates?: StepState[]; // Alternative to completedSteps/errorSteps
  /** On Step Click */
  onStepClick?: (index: number) => void;
  /** Class Name */
  className?: string;
  /** Variant */
  variant?: "numbered" | "pills";
}

/**
 * WizardSteps - Mobile-friendly horizontally scrollable step indicator
 *
 * Features:
 * - Horizontal scroll with touch support
 * - Auto-scroll to current step
 * - Gradient fade indicators at edges
 * - Step states: current, completed, error, pending
 * - Click to navigate to any step
 */
/**
 * Performs wizard steps operation
 *
 * @returns {any} The wizardsteps result
 *
 * @example
 * WizardSteps();
 */

/**
 * W
 * @constant
 */
/**
 * Performs wizard steps operation
 *
 * @returns {any} The wizardsteps result
 *
 * @example
 * WizardSteps();
 */

/**
 * W
 * @constant
 */
export const WizardSteps: React.FC<WizardStepsProps> = ({
  steps,
  currentStep,
  completedSteps = [],
  errorSteps = [],
  stepStates,
  onStepClick,
  className,
  variant = "numbered",
}) => {
  /**
 * Performs scroll ref operation
 *
 * @param {any} null - The null
 *
 * @returns {any} The scrollref result
 *
 */
const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current step when it changes
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const activeButton = container.querySelector(
      `[data-step="${currentStep}"]`,
    ) as HTMLElement;

    if (activeButton) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();

      // Calculate scroll position to center the button
      const scrollLeft =
        activeButton.offsetLeft -
        containerRect.width / 2 +
        buttonRect.width / 2;

      container.scrollTo({
        /** Left */
        left: Math.max(0, scrollLeft),
        /** Behavior */
        behavior: "smooth",
      });
    }
  }, [currentStep]);

  /**
   * Retrieves step state
   *
   * @param {number} index - The index
   *
   * @returns {number} The stepstate result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Retrieves step state
   *
   * @param {number} index - The index
   *
   * @returns {number} The stepstate result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const getStepState = (index: number) => {
    // Use stepStates if provided
    if (stepStates && stepStates[index]) {
      const state = stepStates[index];
      if (state.hasErrors) return "error";
      if (index === currentStep) return "current";
      if (state.isComplete) return "completed";
      return "pending";
    }
    // Fallback to legacy completedSteps/errorSteps
    if (errorSteps.includes(index)) return "error";
    if (index === currentStep) return "current";
    if (completedSteps.includes(index)) return "completed";
    return "pending";
  };

  // Helper to get step name/label
  /**
   * Retrieves step name
   *
   * @param {WizardStep} step - The step
   *
   * @returns {any} The stepname result
   */

  /**
   * Retrieves step name
   *
   * @param {WizardStep} step - The step
   *
   * @returns {any} The stepname result
   */

  const getStepName = (step: WizardStep) => step.name || step.label || "";
  return (
    <div className={cn("relative", className)}>
      {/* Gradient fade left */}
      <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white dark:from-gray-900 to-transparent z-10 pointer-events-none" />

      {/* Scrollable steps container */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide px-6 py-3 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {steps.map((step, index) => {
          const state = getStepState(index);

          return (
            <button
              key={step.id}
              data-step={index}
              onClick={() => onStepClick?.(index)}
              disabled={!onStepClick}
              className={cn(
                "flex-shrink-0 snap-center transition-all duration-200",
                "touch-manipulation focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                "dark:focus:ring-offset-gray-900",
                variant === "pills"
                  ? "px-4 py-2 rounded-full text-sm font-medium"
                  : "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                // State-based styling
                state === "current" && [
                  variant === "pills"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-500",
                ],
                state === "completed" && [
                  variant === "pills"
                    ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                    : "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700",
                ],
                state === "error" && [
                  variant === "pills"
                    ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                    : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-700",
                ],
                state === "pending" && [
                  variant === "pills"
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    : "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700",
                ],
                onStepClick && "cursor-pointer hover:scale-105",
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
                      "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300",
                  )}
                >
                  {state === "completed" ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : state === "error" ? (
                    <AlertCircle className="w-3.5 h-3.5" />
                  ) : (
                    index + 1
                  )}
                </span>
              )}

              {/* Step name */}
              <span className="whitespace-nowrap">
                {step.icon}
                {getStepName(step)}
              </span>

              {/* Pills variant: show icon for completed/error */}
              {variant === "pills" && state === "completed" && (
                <Check className="w-4 h-4 ml-1" />
              )}
              {variant === "pills" && state === "error" && (
                <AlertCircle className="w-4 h-4 ml-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* Gradient fade right */}
      <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white dark:from-gray-900 to-transparent z-10 pointer-events-none" />
    </div>
  );
};

export default WizardSteps;
