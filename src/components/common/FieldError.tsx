import { AlertCircle } from "lucide-react";

interface FieldErrorProps {
  error?: string;
}

export function FieldError({ error }: FieldErrorProps) {
  if (!error) return null;

  return (
    <div className="mt-1 flex items-center gap-1 text-sm text-red-600">
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{error}</span>
    </div>
  );
}

interface InputWrapperProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

export function InputWrapper({
  label,
  required,
  error,
  hint,
  children,
}: InputWrapperProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <FieldError error={error} />}
      {!error && hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
