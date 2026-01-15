/**
 * WizardForm Component
 * Framework-agnostic multi-step form wrapper
 *
 * Purpose: Complete wizard form with state management and navigation
 * Features: Step navigation, validation, save draft, auto-save to localStorage
 *
 * @example Basic Usage
 * ```tsx
 * const steps = [
 *   { label: 'Personal', content: <PersonalInfoForm /> },
 *   { label: 'Contact', content: <ContactForm /> },
 *   { label: 'Review', content: <ReviewForm /> }
 * ];
 *
 * <WizardForm
 *   steps={steps}
 *   onSubmit={handleSubmit}
 * />
 * ```
 *
 * @example With Validation and useWizardFormState
 * ```tsx
 * const wizard = useWizardFormState({
 *   steps: ['email', 'password', 'profile'],
 *   initialData: {},
 *   onValidateStep: (stepIndex, data) => {
 *     // Return errors object
 *   },
 *   validateBeforeNext: true
 * });
 *
 * const formSteps = [
 *   { label: 'Email', content: <EmailForm wizard={wizard} /> },
 *   { label: 'Password', content: <PasswordForm wizard={wizard} /> },
 *   { label: 'Profile', content: <ProfileForm wizard={wizard} /> }
 * ];
 *
 * <WizardForm
 *   steps={formSteps}
 *   currentStep={wizard.currentStep}
 *   setCurrentStep={wizard.setCurrentStep}
 *   stepStates={wizard.stepStates}
 *   onSubmit={() => handleSubmit(wizard.formData)}
 * />
 * ```
 */

import { ReactNode } from "react";
import { WizardActionBar } from "./WizardActionBar";
import { WizardSteps, WizardStepState } from "./WizardSteps";

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export interface WizardFormStep {
  label: string;
  content: ReactNode;
  icon?: ReactNode;
}

export interface WizardFormProps {
  steps: WizardFormStep[];
  currentStep?: number;
  setCurrentStep?: (step: number) => void;
  stepStates?: WizardStepState[];
  onSubmit: () => void | Promise<void>;
  onSaveDraft?: () => void | Promise<void>;
  onValidate?: () => void | Promise<void>;
  isSubmitting?: boolean;
  isSaving?: boolean;
  isValid?: boolean;
  submitLabel?: string;
  draftLabel?: string;
  showValidateButton?: boolean;
  showSaveDraftButton?: boolean;
  stepsVariant?: "numbered" | "pills";
  className?: string;
}

export function WizardForm({
  steps,
  currentStep: controlledStep,
  setCurrentStep: setControlledStep,
  stepStates,
  onSubmit,
  onSaveDraft,
  onValidate,
  isSubmitting = false,
  isSaving = false,
  isValid = false,
  submitLabel = "Create",
  draftLabel = "Save Draft",
  showValidateButton = true,
  showSaveDraftButton = true,
  stepsVariant = "numbered",
  className,
}: WizardFormProps) {
  // Map steps for WizardSteps component
  const wizardSteps = steps.map((step) => ({
    label: step.label,
    icon: step.icon,
  }));

  // Use controlled or default to 0
  const currentStep = controlledStep ?? 0;

  return (
    <div className={cn("flex flex-col min-h-screen", className)}>
      {/* Step Navigation */}
      <div className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <WizardSteps
          steps={wizardSteps}
          currentStep={currentStep}
          onStepClick={setControlledStep}
          stepStates={stepStates}
          variant={stepsVariant}
          className="py-2"
        />
      </div>

      {/* Step Content */}
      <div className="flex-1 pb-24 lg:pb-16">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {steps[currentStep]?.content}
        </div>
      </div>

      {/* Action Bar */}
      <WizardActionBar
        onSaveDraft={showSaveDraftButton ? onSaveDraft : undefined}
        onValidate={showValidateButton ? onValidate : undefined}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        isSaving={isSaving}
        isValid={isValid}
        submitLabel={submitLabel}
        draftLabel={draftLabel}
        showValidate={showValidateButton}
        showSaveDraft={showSaveDraftButton}
      />
    </div>
  );
}
