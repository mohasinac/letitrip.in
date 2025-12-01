"use client";

import React, { useState, useCallback, ReactNode } from "react";
import { WizardSteps, WizardStep, StepState } from "./WizardSteps";
import { WizardActionBar } from "./WizardActionBar";
import { cn } from "@/lib/utils";

export interface WizardFormStep extends WizardStep {
  validate?: () => boolean | Promise<boolean>;
  content: ReactNode;
}

export interface WizardFormProps<T = Record<string, unknown>> {
  steps: WizardFormStep[];
  initialData?: Partial<T>;
  onSubmit: (data: T) => void | Promise<void>;
  onSaveDraft?: (data: T, currentStep: number) => void | Promise<void>;
  onValidate?: (stepIndex: number) => Promise<boolean>;
  onStepChange?: (stepIndex: number) => void;
  submitLabel?: string;
  className?: string;
  showValidateButton?: boolean;
  showSaveDraftButton?: boolean;
  stepsVariant?: "numbered" | "pills";
  children?: (props: WizardFormChildProps<T>) => ReactNode;
}

export interface WizardFormChildProps<T = Record<string, unknown>> {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  stepStates: StepState[];
  updateStepState: (stepIndex: number, state: Partial<StepState>) => void;
  formData: Partial<T>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<T>>>;
  isValid: boolean;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}

/**
 * WizardForm - Multi-step form wrapper with validation and state management
 *
 * Features:
 * - Step navigation with WizardSteps component
 * - Form state management
 * - Per-step validation tracking
 * - Save draft functionality
 * - Mobile-friendly action bar
 * - Dark mode support
 */
export function WizardForm<T = Record<string, unknown>>({
  steps,
  initialData,
  onSubmit,
  onSaveDraft,
  onValidate,
  onStepChange,
  submitLabel = "Create",
  className,
  showValidateButton = true,
  showSaveDraftButton = true,
  stepsVariant = "numbered",
  children,
}: WizardFormProps<T>) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<T>>(initialData || {});
  const [stepStates, setStepStates] = useState<StepState[]>(
    steps.map(() => ({
      isComplete: false,
      isValid: true,
      hasErrors: false,
      errorCount: 0,
    }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Check if all steps are valid
  const isAllValid = stepStates.every(
    (state) => state.isComplete && state.isValid && !state.hasErrors
  );

  // Update step state
  const updateStepState = useCallback(
    (stepIndex: number, state: Partial<StepState>) => {
      setStepStates((prev) => {
        const newStates = [...prev];
        newStates[stepIndex] = { ...newStates[stepIndex], ...state };
        return newStates;
      });
    },
    []
  );

  // Handle step click
  const handleStepClick = useCallback(
    (stepIndex: number) => {
      setCurrentStep(stepIndex);
      onStepChange?.(stepIndex);
    },
    [onStepChange]
  );

  // Go to next step
  const goToNextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      onStepChange?.(nextStep);
    }
  }, [currentStep, steps.length, onStepChange]);

  // Go to previous step
  const goToPreviousStep = useCallback(() => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      onStepChange?.(prevStep);
    }
  }, [currentStep, onStepChange]);

  // Handle validate all steps
  const handleValidate = useCallback(async () => {
    const newStates = [...stepStates];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (step.validate) {
        const isValid = await step.validate();
        newStates[i] = {
          ...newStates[i],
          isValid,
          hasErrors: !isValid,
          isComplete: isValid,
        };
      } else if (onValidate) {
        const isValid = await onValidate(i);
        newStates[i] = {
          ...newStates[i],
          isValid,
          hasErrors: !isValid,
          isComplete: isValid,
        };
      }
    }

    setStepStates(newStates);

    // Navigate to first step with errors
    const firstErrorIndex = newStates.findIndex((state) => state.hasErrors);
    if (firstErrorIndex >= 0) {
      setCurrentStep(firstErrorIndex);
      onStepChange?.(firstErrorIndex);
    }
  }, [stepStates, steps, onValidate, onStepChange]);

  // Handle save draft
  const handleSaveDraft = useCallback(async () => {
    if (!onSaveDraft) return;

    setIsSaving(true);
    try {
      await onSaveDraft(formData as T, currentStep);
    } finally {
      setIsSaving(false);
    }
  }, [onSaveDraft, formData, currentStep]);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      // Validate all steps first
      await handleValidate();

      // Check if all valid
      const allValid = stepStates.every(
        (state) => state.isValid && !state.hasErrors
      );
      if (!allValid) {
        setIsSubmitting(false);
        return;
      }

      await onSubmit(formData as T);
    } finally {
      setIsSubmitting(false);
    }
  }, [handleValidate, stepStates, onSubmit, formData]);

  // Child render props
  const childProps: WizardFormChildProps<T> = {
    currentStep,
    setCurrentStep: handleStepClick,
    stepStates,
    updateStepState,
    formData,
    setFormData,
    isValid: isAllValid,
    goToNextStep,
    goToPreviousStep,
  };

  // Map steps for WizardSteps component
  const wizardSteps: WizardStep[] = steps.map((step) => ({
    label: step.label,
    icon: step.icon,
  }));

  return (
    <div className={cn("flex flex-col min-h-screen", className)}>
      {/* Step Navigation */}
      <div className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <WizardSteps
          steps={wizardSteps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
          stepStates={stepStates}
          variant={stepsVariant}
          className="py-2"
        />
      </div>

      {/* Step Content */}
      <div className="flex-1 pb-24 lg:pb-16">
        {children ? (
          children(childProps)
        ) : (
          <div className="max-w-4xl mx-auto px-4 py-6">
            {steps[currentStep]?.content}
          </div>
        )}
      </div>

      {/* Action Bar */}
      <WizardActionBar
        onSaveDraft={showSaveDraftButton ? handleSaveDraft : undefined}
        onValidate={showValidateButton ? handleValidate : undefined}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isSaving={isSaving}
        isValid={isAllValid}
        submitLabel={submitLabel}
        showValidate={showValidateButton}
        showSaveDraft={showSaveDraftButton}
      />
    </div>
  );
}

export default WizardForm;
