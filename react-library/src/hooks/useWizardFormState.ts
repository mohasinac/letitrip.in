
/**
 * useWizardFormState Hook
 * Framework-agnostic multi-step wizard form state management
 *
 * Purpose: Centralize wizard-specific state management with per-step validation
 * Replaces: Multiple useState calls in WizardForm components
 *
 * @example Basic Usage
 * ```tsx
 * const wizard = useWizardFormState({
 *   steps: ['personal', 'contact', 'review'],
 *   initialData: { name: '', email: '' }
 * });
 *
 * <WizardStep active={wizard.currentStepName === 'personal'}>
 *   <input
 *     value={wizard.formData.name}
 *     onChange={(e) => wizard.updateFormData('name', e.target.value)}
 *   />
 * </WizardStep>
 *
 * <button onClick={wizard.nextStep} disabled={wizard.isLastStep}>
 *   Next
 * </button>
 * ```
 *
 * @example With Validation
 * ```tsx
 * const wizard = useWizardFormState({
 *   steps: ['email', 'password', 'profile'],
 *   initialData: {},
 *   onValidateStep: (stepIndex, data) => {
 *     const errors: Record<string, string> = {};
 *     if (stepIndex === 0 && !data.email) {
 *       errors.email = 'Email is required';
 *     }
 *     if (stepIndex === 1 && !data.password) {
 *       errors.password = 'Password is required';
 *     }
 *     return errors;
 *   },
 *   validateBeforeNext: true,
 *   autoMarkComplete: true
 * });
 *
 * const handleNext = async () => {
 *   const canProceed = await wizard.nextStep();
 *   if (!canProceed) {
 *     // Show errors from wizard.stepStates[wizard.currentStep].errors
 *   }
 * };
 * ```
 *
 * @example With Custom Schema Validator
 * ```tsx
 * import { z } from 'zod';
 *
 * const stepSchemas = [
 *   (data) => { // Step 1 validator
 *     try {
 *       z.object({ email: z.string().email() }).parse(data);
 *       return {};
 *     } catch (error) {
 *       if (error instanceof z.ZodError) {
 *         return { email: error.errors[0].message };
 *       }
 *       return {};
 *     }
 *   },
 *   (data) => { // Step 2 validator
 *     try {
 *       z.object({ name: z.string().min(2) }).parse(data);
 *       return {};
 *     } catch (error) {
 *       if (error instanceof z.ZodError) {
 *         return { name: error.errors[0].message };
 *       }
 *       return {};
 *     }
 *   },
 * ];
 *
 * const wizard = useWizardFormState({
 *   steps: ['email', 'name', 'review'],
 *   initialData: {},
 *   stepSchemas,
 *   validateBeforeNext: true
 * });
 * ```
 */

import { useCallback, useMemo, useState } from "react";

export type StepState = {
  /** Whether step is marked as complete */
  isComplete: boolean;
  /** Whether step passed validation */
  isValid: boolean;
  /** Whether step has validation errors */
  hasErrors: boolean;
  /** Number of errors in step */
  errorCount: number;
  /** Validation errors by field */
  errors?: Record<string, string>;
};

export type UseWizardFormStateConfig<T> = {
  /** Array of step names/IDs */
  steps: string[];
  /** Initial form data */
  initialData?: Partial<T>;
  /** Called when step changes */
  onStepChange?: (stepIndex: number) => void;
  /** Array of validator functions for each step (returns errors object) */
  stepSchemas?: ((data: Partial<T>) => Record<string, string>)[];
  /** Custom validation function for each step */
  onValidateStep?: (
    stepIndex: number,
    data: Partial<T>
  ) => Record<string, string>;
  /** Validate current step before allowing next (default: false) */
  validateBeforeNext?: boolean;
  /** Auto-mark step complete after successful validation (default: true) */
  autoMarkComplete?: boolean;
};

export type UseWizardFormStateReturn<T> = {
  // Step management
  /** Current step index (0-based) */
  currentStep: number;
  /** Current step name */
  currentStepName: string;
  /** Total number of steps */
  totalSteps: number;
  /** Whether on first step */
  isFirstStep: boolean;
  /** Whether on last step */
  isLastStep: boolean;
  /** Progress percentage (0-100) */
  stepProgress: number;

  /** Set current step by index */
  setCurrentStep: (step: number) => void;
  /** Go to next step (validates if enabled) */
  nextStep: () => Promise<boolean>;
  /** Go to previous step */
  previousStep: () => void;
  /** Jump to specific step */
  goToStep: (step: number) => void;

  // Form data
  /** Current form data */
  formData: Partial<T>;
  /** Set entire form data */
  setFormData: (data: Partial<T> | ((prev: Partial<T>) => Partial<T>)) => void;
  /** Update single field */
  updateFormData: (field: keyof T, value: any) => void;

  // Step validation
  /** State of all steps */
  stepStates: StepState[];
  /** Update state of specific step */
  updateStepState: (stepIndex: number, state: Partial<StepState>) => void;
  /** Mark step as complete */
  markStepComplete: (stepIndex: number) => void;
  /** Mark step as invalid */
  markStepInvalid: (stepIndex: number, errorCount: number) => void;
  /** Validate specific step with schema/validator */
  validateStep: (stepIndex: number) => boolean;
  /** Get errors for specific step */
  getStepErrors: (stepIndex: number) => Record<string, string>;

  // Overall state
  /** Whether all steps are valid */
  isAllValid: boolean;
  /** Whether form is being submitted */
  isSubmitting: boolean;
  /** Whether form is being saved (draft) */
  isSaving: boolean;
  /** Whether any step is currently being validated */
  isValidating: boolean;

  /** Set submitting state */
  setIsSubmitting: (submitting: boolean) => void;
  /** Set saving state */
  setIsSaving: (saving: boolean) => void;

  // Reset
  /** Reset entire wizard */
  reset: () => void;
  /** Reset specific step */
  resetStep: (stepIndex: number) => void;
};

export function useWizardFormState<T extends Record<string, any>>({
  steps,
  initialData = {},
  onStepChange,
  stepSchemas,
  onValidateStep,
  validateBeforeNext = false,
  autoMarkComplete = true,
}: UseWizardFormStateConfig<T>): UseWizardFormStateReturn<T> {
  const [currentStep, setCurrentStepState] = useState(0);
  const [formData, setFormData] = useState<Partial<T>>(initialData);
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
  const [isValidating, setIsValidating] = useState(false);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const stepProgress = ((currentStep + 1) / steps.length) * 100;
  const currentStepName = steps[currentStep];

  /**
   * Validates a specific step using schema or custom validator
   */
  const validateStepData = useCallback(
    (stepIndex: number, data: Partial<T>): Record<string, string> => {
      const schemaValidator = stepSchemas?.[stepIndex];

      if (schemaValidator) {
        return schemaValidator(data);
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

  const nextStep = useCallback(async (): Promise<boolean> => {
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
  }, [
    currentStep,
    isLastStep,
    validateBeforeNext,
    autoMarkComplete,
    validateStep,
    setCurrentStep,
  ]);

  const previousStep = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  }, [isFirstStep, currentStep, setCurrentStep]);

  const goToStep = useCallback(
    (step: number) => {
      setCurrentStep(step);
    },
    [setCurrentStep]
  );

  const updateFormData = useCallback((field: keyof T, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
        errors: {},
      }))
    );
    setIsSubmitting(false);
    setIsSaving(false);
  }, [steps, initialData]);

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

  // Computed: whether all steps are valid
  const isAllValid = useMemo(() => {
    return stepStates.every((state) => state.isValid);
  }, [stepStates]);

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
    isValidating,

    setIsSubmitting,
    setIsSaving,

    reset,
    resetStep,
  };
}
