/**
 * useWizardFormState Hook
 * Manages multi-step wizard form state including validation
 *
 * Purpose: Centralize wizard-specific state management
 * Replaces: Multiple useState calls in WizardForm components
 *
 * @example
 * const wizard = useWizardFormState({
 *   steps: ['info', 'details', 'review'],
 *   initialData: { name: '' }
 * });
 * wizard.nextStep();
 */

import { useCallback, useMemo, useState } from "react";

export interface StepState {
  isComplete: boolean;
  isValid: boolean;
  hasErrors: boolean;
  errorCount: number;
}

export interface UseWizardFormStateConfig<T> {
  steps: string[];
  initialData?: Partial<T>;
  onStepChange?: (stepIndex: number) => void;
}

export interface UseWizardFormStateReturn<T> {
  // Step management
  currentStep: number;
  currentStepName: string;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  stepProgress: number;

  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;

  // Form data
  formData: Partial<T>;
  setFormData: (data: Partial<T> | ((prev: Partial<T>) => Partial<T>)) => void;
  updateFormData: (field: keyof T, value: any) => void;

  // Step validation
  stepStates: StepState[];
  updateStepState: (stepIndex: number, state: Partial<StepState>) => void;
  markStepComplete: (stepIndex: number) => void;
  markStepInvalid: (stepIndex: number, errorCount: number) => void;

  // Overall state
  isAllValid: boolean;
  isSubmitting: boolean;
  isSaving: boolean;

  setIsSubmitting: (submitting: boolean) => void;
  setIsSaving: (saving: boolean) => void;

  // Reset
  reset: () => void;
  resetStep: (stepIndex: number) => void;
}

export function useWizardFormState<T = Record<string, unknown>>({
  steps,
  initialData,
  onStepChange,
}: UseWizardFormStateConfig<T>): UseWizardFormStateReturn<T> {
  const [currentStep, setCurrentStepState] = useState(0);
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

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const stepProgress = ((currentStep + 1) / steps.length) * 100;
  const currentStepName = steps[currentStep];

  const isAllValid = useMemo(
    () =>
      stepStates.every(
        (step) => step.isComplete && step.isValid && !step.hasErrors
      ),
    [stepStates]
  );

  const setCurrentStep = useCallback(
    (step: number) => {
      if (step >= 0 && step < steps.length) {
        setCurrentStepState(step);
        onStepChange?.(step);
      }
    },
    [steps.length, onStepChange]
  );

  const nextStep = useCallback(() => {
    if (!isLastStep) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, isLastStep, setCurrentStep]);

  const previousStep = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep, isFirstStep, setCurrentStep]);

  const goToStep = useCallback(
    (step: number) => {
      setCurrentStep(step);
    },
    [setCurrentStep]
  );

  const updateFormData = useCallback((field: keyof T, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

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

  const markStepComplete = useCallback(
    (stepIndex: number) => {
      updateStepState(stepIndex, { isComplete: true });
    },
    [updateStepState]
  );

  const markStepInvalid = useCallback(
    (stepIndex: number, errorCount: number) => {
      updateStepState(stepIndex, {
        isValid: false,
        hasErrors: errorCount > 0,
        errorCount,
      });
    },
    [updateStepState]
  );

  const reset = useCallback(() => {
    setCurrentStepState(0);
    setFormData(initialData || {});
    setStepStates(
      steps.map(() => ({
        isComplete: false,
        isValid: true,
        hasErrors: false,
        errorCount: 0,
      }))
    );
    setIsSubmitting(false);
    setIsSaving(false);
  }, [steps.length, initialData]);

  const resetStep = useCallback(
    (stepIndex: number) => {
      updateStepState(stepIndex, {
        isComplete: false,
        isValid: true,
        hasErrors: false,
        errorCount: 0,
      });
    },
    [updateStepState]
  );

  return {
    currentStep,
    currentStepName,
    totalSteps: steps.length,
    isFirstStep,
    isLastStep,
    stepProgress,

    setCurrentStep,
    nextStep,
    previousStep,
    goToStep,

    formData,
    setFormData,
    updateFormData,

    stepStates,
    updateStepState,
    markStepComplete,
    markStepInvalid,

    isAllValid,
    isSubmitting,
    isSaving,

    setIsSubmitting,
    setIsSaving,

    reset,
    resetStep,
  };
}
