// Shared form components
export { FormSection } from "./FormSection";
export { FormActions } from "./FormActions";

// Types
export interface FormSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  sx?: any;
}

export interface FormActionsProps {
  onCancel?: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  sx?: any;
  variant?: "inline" | "full-width";
}
