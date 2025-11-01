/**
 * FormWizard Component
 *
 * Multi-step form wizard with progress indicator and step validation.
 * Manages step navigation and provides helpers to child components.
 *
 * @example
 * <FormWizard
 *   steps={[
 *     { label: 'Basic Info', icon: <Info /> },
 *     { label: 'Pricing', icon: <DollarSign /> },
 *     { label: 'Review', icon: <Check /> }
 *   ]}
 *   onSubmit={handleSubmit}
 *   validateStep={validateStep}
 * >
 *   {(step, helpers) => (
 *     <>
 *       {step === 0 && <BasicInfoStep {...helpers} />}
 *       {step === 1 && <PricingStep {...helpers} />}
 *       {step === 2 && <ReviewStep {...helpers} />}
 *     </>
 *   )}
 * </FormWizard>
 */

"use client";

import React, { useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { UnifiedButton } from "@/components/ui/unified/Button";
import { UnifiedAlert } from "@/components/ui/unified/Alert";

export interface WizardStep {
  /** Step label */
  label: string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Optional description */
  description?: string;
  /** Skip this step */
  optional?: boolean;
}

export interface WizardHelpers {
  /** Current step index */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Go to next step */
  goToNext: () => void;
  /** Go to previous step */
  goToPrevious: () => void;
  /** Go to specific step */
  goToStep: (step: number) => void;
  /** Check if current step is first */
  isFirstStep: boolean;
  /** Check if current step is last */
  isLastStep: boolean;
  /** Check if can go to next step */
  canGoNext: boolean;
  /** Check if can go to previous step */
  canGoPrevious: boolean;
}

export interface FormWizardProps {
  /** Array of step configurations */
  steps: WizardStep[];
  /** Submit handler called when completing the wizard */
  onSubmit: () => void | Promise<void>;
  /** Optional validation function called before moving to next step */
  validateStep?: (step: number) => boolean | Promise<boolean>;
  /** Initial step (default: 0) */
  initialStep?: number;
  /** Show step numbers */
  showStepNumbers?: boolean;
  /** Allow clicking on steps to navigate */
  allowStepClick?: boolean;
  /** Show progress bar */
  showProgressBar?: boolean;
  /** Custom submit button label */
  submitLabel?: string;
  /** Custom back button label */
  backLabel?: string;
  /** Custom next button label */
  nextLabel?: string;
  /** Submitting state */
  submitting?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Children render prop */
  children: (step: number, helpers: WizardHelpers) => React.ReactNode;
}

export const FormWizard = React.forwardRef<HTMLDivElement, FormWizardProps>(
  (
    {
      steps,
      onSubmit,
      validateStep,
      initialStep = 0,
      showStepNumbers = true,
      allowStepClick = false,
      showProgressBar = true,
      submitLabel = "Submit",
      backLabel = "Back",
      nextLabel = "Next",
      submitting = false,
      className,
      children,
    },
    ref
  ) => {
    const [currentStep, setCurrentStep] = useState(initialStep);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    const [validating, setValidating] = useState(false);
    const [error, setError] = useState<string>("");

    const totalSteps = steps.length;
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === totalSteps - 1;
    const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

    const goToStep = async (step: number) => {
      if (step < 0 || step >= totalSteps) return;
      if (!allowStepClick && step > currentStep + 1) return;

      setError("");
      setCurrentStep(step);
    };

    const goToNext = async () => {
      setError("");
      setValidating(true);

      try {
        // Validate current step before proceeding
        if (validateStep) {
          const isValid = await validateStep(currentStep);
          if (!isValid) {
            setError("Please fix the errors before proceeding.");
            setValidating(false);
            return;
          }
        }

        // Mark current step as completed
        if (!completedSteps.includes(currentStep)) {
          setCompletedSteps([...completedSteps, currentStep]);
        }

        // Move to next step
        if (currentStep < totalSteps - 1) {
          setCurrentStep(currentStep + 1);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Validation failed. Please try again."
        );
      } finally {
        setValidating(false);
      }
    };

    const goToPrevious = () => {
      setError("");
      if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
      }
    };

    const handleSubmit = async () => {
      setError("");
      setValidating(true);

      try {
        // Validate final step
        if (validateStep) {
          const isValid = await validateStep(currentStep);
          if (!isValid) {
            setError("Please fix the errors before submitting.");
            setValidating(false);
            return;
          }
        }

        await onSubmit();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Submission failed. Please try again."
        );
      } finally {
        setValidating(false);
      }
    };

    const helpers: WizardHelpers = {
      currentStep,
      totalSteps,
      goToNext,
      goToPrevious,
      goToStep,
      isFirstStep,
      isLastStep,
      canGoNext: !validating && !submitting,
      canGoPrevious: !validating && !submitting && !isFirstStep,
    };

    return (
      <div ref={ref} className={cn("space-y-6", className)}>
        {/* Progress Bar */}
        {showProgressBar && (
          <div className="relative">
            <div className="h-2 bg-surfaceVariant rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-xs text-textSecondary text-right mt-1">
              Step {currentStep + 1} of {totalSteps}
            </p>
          </div>
        )}

        {/* Step Indicators */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(index);
            const isCurrent = index === currentStep;
            const isClickable =
              allowStepClick && (index <= currentStep || isCompleted);

            return (
              <React.Fragment key={index}>
                {/* Step */}
                <button
                  type="button"
                  onClick={() => isClickable && goToStep(index)}
                  disabled={!isClickable}
                  className={cn(
                    "flex flex-col items-center gap-2 transition-all",
                    isClickable && "cursor-pointer hover:opacity-80",
                    !isClickable && "cursor-not-allowed opacity-50"
                  )}
                >
                  {/* Step Circle */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                      "border-2",
                      isCompleted && "bg-success border-success text-white",
                      isCurrent && "bg-primary border-primary text-white",
                      !isCompleted &&
                        !isCurrent &&
                        "bg-surface border-border text-textSecondary"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : step.icon ? (
                      <div className="w-5 h-5">{step.icon}</div>
                    ) : showStepNumbers ? (
                      <span className="text-sm font-semibold">{index + 1}</span>
                    ) : null}
                  </div>

                  {/* Step Label */}
                  <div className="text-center max-w-[100px]">
                    <p
                      className={cn(
                        "text-xs font-medium",
                        isCurrent ? "text-primary" : "text-textSecondary"
                      )}
                    >
                      {step.label}
                    </p>
                    {step.optional && (
                      <p className="text-[10px] text-textSecondary mt-0.5">
                        (Optional)
                      </p>
                    )}
                  </div>
                </button>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-2 transition-all",
                      isCompleted ? "bg-success" : "bg-border"
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Current Step Description */}
        {steps[currentStep].description && (
          <div className="text-center">
            <p className="text-sm text-textSecondary">
              {steps[currentStep].description}
            </p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <UnifiedAlert variant="error" onClose={() => setError("")}>
            {error}
          </UnifiedAlert>
        )}

        {/* Step Content */}
        <div className="py-6">{children(currentStep, helpers)}</div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-border">
          <UnifiedButton
            type="button"
            variant="outline"
            onClick={goToPrevious}
            disabled={!helpers.canGoPrevious}
            leftIcon={<ChevronLeft />}
          >
            {backLabel}
          </UnifiedButton>

          <div className="flex gap-2">
            {steps[currentStep].optional && !isLastStep && (
              <UnifiedButton
                type="button"
                variant="ghost"
                onClick={goToNext}
                disabled={validating || submitting}
              >
                Skip
              </UnifiedButton>
            )}

            {isLastStep ? (
              <UnifiedButton
                type="button"
                variant="primary"
                onClick={handleSubmit}
                loading={submitting}
                disabled={validating}
              >
                {submitLabel}
              </UnifiedButton>
            ) : (
              <UnifiedButton
                type="button"
                variant="primary"
                onClick={goToNext}
                loading={validating}
                disabled={submitting}
                rightIcon={<ChevronRight />}
              >
                {nextLabel}
              </UnifiedButton>
            )}
          </div>
        </div>
      </div>
    );
  }
);

FormWizard.displayName = "FormWizard";

export default FormWizard;
