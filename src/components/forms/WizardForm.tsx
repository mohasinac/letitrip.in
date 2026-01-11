"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";
import React, { ReactNode, useCallback, useEffect, useState } from "react";
import { WizardActionBar } from "./WizardActionBar";
import { StepState, WizardStep, WizardSteps } from "./WizardSteps";

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
  // Auto-save props
  enableAutoSave?: boolean; // Enable auto-save to localStorage (default: false)
  autoSaveKey?: string; // localStorage key for auto-save
  autoSaveDelay?: number; // Debounce delay in ms (default: 1000)
  onAutoSave?: (data: T, currentStep: number) => void; // Callback when auto-save happens
  onRestore?: (data: T, currentStep: number) => void; // Callback when data is restored
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
  clearAutoSave?: () => void; // Clear auto-saved data
  hasAutoSavedData?: boolean; // Whether auto-saved data exists
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
  enableAutoSave = false,
  autoSaveKey = "wizard-form-autosave",
  autoSaveDelay = 1000,
  onAutoSave,
  onRestore,
}: WizardFormProps<T>) {
  // Auto-save data structure
  interface AutoSaveData {
    formData: Partial<T>;
    currentStep: number;
    timestamp: number;
  }

  // Use localStorage for auto-save
  const [savedData, setSavedData, clearSavedData] =
    useLocalStorage<AutoSaveData | null>(autoSaveKey, null, {
      initializeWithValue: enableAutoSave,
      syncData: false,
    });

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
  const [hasRestoredData, setHasRestoredData] = useState(false);

  // Restore saved data on mount
  useEffect(() => {
    if (enableAutoSave && savedData && !hasRestoredData) {
      setFormData(savedData.formData);
      setCurrentStep(savedData.currentStep);
      setHasRestoredData(true);
      onRestore?.(savedData.formData as T, savedData.currentStep);
    }
  }, [enableAutoSave, savedData, hasRestoredData, onRestore]);

  // Auto-save with debounce
  useEffect(() => {
    if (!enableAutoSave) return;

    const timeoutId = setTimeout(() => {
      const autoSaveData: AutoSaveData = {
        formData,
        currentStep,
        timestamp: Date.now(),
      };
      setSavedData(autoSaveData);
      onAutoSave?.(formData as T, currentStep);
    }, autoSaveDelay);

    return () => clearTimeout(timeoutId);
  }, [
    formData,
    currentStep,
    enableAutoSave,
    autoSaveDelay,
    setSavedData,
    onAutoSave,
  ]);

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

      // Clear auto-saved data after successful submission
      if (enableAutoSave) {
        clearSavedData();
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    handleValidate,
    stepStates,
    onSubmit,
    formData,
    enableAutoSave,
    clearSavedData,
  ]);

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
    clearAutoSave: enableAutoSave ? clearSavedData : undefined,
    hasAutoSavedData: enableAutoSave && savedData !== null,
  };

  // Map steps for WizardSteps component
  const wizardSteps: WizardStep[] = steps.map((step) => ({
    label: step.label,
    icon: step.icon,
  }));

  return (
    <div className={cn("flex flex-col min-h-screen", className)}>
      {/* Restore Notification */}
      {enableAutoSave && hasRestoredData && savedData && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm text-blue-800 dark:text-blue-200">
                Your progress has been restored from{" "}
                {new Date(savedData.timestamp).toLocaleString()}
              </span>
            </div>
            <button
              onClick={clearSavedData}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Start Fresh
            </button>
          </div>
        </div>
      )}

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
