"use client";

/**
 * useWizardFormState Hook
 * Manages multi-step wizard form state including validation
 *
 * Purpose: Centralize wizard-specific state management with per-step Zod validation
 * Replaces: Multiple useState calls in WizardForm components
 *
 * @example
 * const wizard = useWizardFormState({
 *   steps: ['info', 'details', 'review'],
 *   initialData: { name: '' }
 * });
 * wizard.nextStep();
 * 
 * @example With Per-Step Schemas
 * const stepSchemas = [
 *   z.object({ email: z.string().email() }),
 *   z.object({ name: z.string().min(2) }),
 * ];
 * const wizard = useWizardFormState({
 *   steps: ['email', 'name'],
 *   initialData: {},
 *   stepSchemas,
 *   validateBeforeNext: true
 * });
 */

import { useCallback, useMemo, useState } from "react";
import { z } from "zod";

export type StepState = {
  isComplete: boolean;
  isValid: boolean;
  hasErrors: boolean;
  errorCount: number;
  errors?: Record<string, string>;
};

export type UseWizardFormStateConfig<T> = {
  steps: string[];
  initialData?: Partial<T>;
  onStepChange?: (stepIndex: number) => void;
  /** Array of Zod schemas for each step (optional) */
  stepSchemas?: z.ZodSchema[];
  /** Custom validation function for each step */
  onValidateStep?: (stepIndex: number, data: Partial<T>) => Record<string, string>;
  /** Validate current step before allowing next (default: false) */
  validateBeforeNext?: boolean;
  /** Auto-mark step complete after successful validation (default: true) */
  autoMarkComplete?: boolean;
};

export type UseWizardFormStateReturn<T> = {
  // Step management
  currentStep: number;
  currentStepName: string;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  stepProgress: number;

  setCurrentStep: (step: number) => void;
  nextStep: () => Promise<boolean>;
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
  /** Validate specific step with Zod schema or custom validator */
  validateStep: (stepIndex: number) => boolean;
  /** Get errors for specific step */
  getStepErrors: (stepIndex: number) => Record<string, string>;

  // Overall state
  isAllValid: boolean;
  isSubmitting: boolean;
  isSaving: boolean;
  /** Whether any step is currently being validated */
  isValidating: boolean;

  setIsSubmitting: (submitting: boolean) => void;
  setIsSaving: (saving: boolean) => void;

  // Reset
  reset: () => void;
  resetStep: (stepIndex: number) => void;
  stepSchemas,
  onValidateStep,
  validateBeforeNext = false,
  autoMarkComplete = true,
}: UseWizardFormStateConfig<T>): UseWizardFormStateReturn<T> {
  const [currentStep, setCurrentStepState] = useState(0);
  const [formData, setFormData] = useState<Partial<T>>(initialData || {});
  const [stepStates, setStepStates] = useState<StepState[]>(
    steps.map(() => ({
      isComplete: false,
      isValid: true,
      hasErrors: false,
      errorCount: 0,
      errors: {},
    }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidat
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

  co

  /**
   * Validates a specific step using Zod schema or custom validator
   */
  const validateStepData = useCallback(
    (stepIndex: number, data: Partial<T>): Record<string, string> => {
      const schema = stepSchemas?.[stepIndex];
      
      if (schema) {
        try {
          schema.parse(data);
          return {};
        } catch (error) {
          if (error instanceof z.ZodError) {
            const fieldErrors: Record<string, string> = {};
            error.errors.forEach((err) => {
              const fieldName = err.path.join(".");
              fieldErrors[fieldasync () => {
    // Validate current step before proceeding if enabled
    if (validateBeforeNext) {
      const isValid = validateStep(currentStep);
      
      if (!isValid) {
        return false;
      }

      // Auto-mark step complete if validation passed
      if (autoMarkComplete) {
        markStepComplete(currentStep);
      }
    }

    if (!isLastStep) {
      setCurrentStep(currentStep + 1);
      return true;
    }
    
    return false;
  }, [currentStep, isLastStep, validateBeforeNext, autoMarkComplete, validate
      }

      if (onValidateStep) {
        return onValidateStep(stepIndex, data);
      }

      return {};
    },
    [stepSchemas, onValidateStep]
  );

  /**
   * Validates a specific step and updates its state
   */
  const validateStep = useCallback(
    (stepIndex: number): boolean => {
      setIsValidating(true);
      const errors = validateStepData(stepIndex, formData);
      const errorCount = Object.keys(errors).length;
      const isValid = errorCount === 0;

      updateStepState(stepIndex, {
        isValid,
        hasErrors: !isValid,
        errorCount,
        errors,
      });

      setIsValidating(false);
      return isValid;
    },
    [formData, validateStepData]
  );

  /**
   * Gets errors for a specific step
   */
  const getStepErrors = useCallback(
    (stepIndex: number): Record<string, string> => {
      return stepStates[stepIndex]?.errors || {};
    },
    [stepStates]
  );ns  errors: {},
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
        errors: {},
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
    validateStep,
    getStepErrors,

    isAllValid,
    isSubmitting,
    isSaving,
    isValidat

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
