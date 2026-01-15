import { useEffect, useState } from "react";

/**
 * Field types supported by InlineEditRow
 */
export type FieldType =
  | "text"
  | "number"
  | "select"
  | "checkbox"
  | "image"
  | "date"
  | "textarea"
  | "url"
  | "email"
  | "custom";

/**
 * Option for select fields
 */
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

/**
 * Field configuration for inline editing
 */
export interface InlineField {
  key: string;
  type: FieldType;
  label: string;
  required?: boolean;
  options?: SelectOption[];
  validate?: (value: any, formData?: Record<string, any>) => string | null;
  placeholder?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  accept?: string; // For image type
  rows?: number; // For textarea
  render?: (props: {
    value: any;
    onChange: (value: any) => void;
    disabled?: boolean;
    error?: string;
    onKeyDown?: (e: React.KeyboardEvent) => void;
  }) => React.ReactNode; // Custom render function
}

/**
 * Props for InlineEditRow component
 */
export interface InlineEditRowProps {
  /** Field configurations */
  fields: InlineField[];
  /** Initial values for the fields */
  initialValues: Record<string, any>;
  /** Callback when save is triggered */
  onSave: (values: Record<string, any>) => Promise<void>;
  /** Callback when cancel is triggered */
  onCancel: () => void;
  /** Loading state */
  loading?: boolean;
  /** Resource name for accessibility (e.g., "product", "category") */
  resourceName?: string;
  /** Check icon component (default: SVG checkmark) */
  CheckIcon?: React.ComponentType<any>;
  /** X/close icon component (default: SVG X) */
  XIcon?: React.ComponentType<any>;
  /** Loader icon component (default: SVG spinner) */
  LoaderIcon?: React.ComponentType<any>;
  /** Error handler callback */
  onError?: (error: Error, context?: string) => void;
  /** Custom row className */
  rowClassName?: string;
  /** Custom cell className */
  cellClassName?: string;
}

// Default icons
const DefaultCheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 8l3 3 7-7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DefaultXIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 4l8 8m0-8l-8 8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const DefaultLoaderIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="animate-spin"
  >
    <circle
      cx="8"
      cy="8"
      r="6"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      opacity="0.25"
    />
    <path
      d="M8 2a6 6 0 0 1 6 6"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
  </svg>
);

/**
 * InlineEditRow - Editable table row for inline editing
 *
 * A table row component that allows inline editing of multiple fields with validation,
 * keyboard shortcuts, and error handling.
 *
 * @example
 * ```tsx
 * <InlineEditRow
 *   fields={[
 *     { key: 'name', type: 'text', label: 'Name', required: true },
 *     { key: 'price', type: 'number', label: 'Price', min: 0 },
 *     { key: 'status', type: 'select', label: 'Status', options: [...] }
 *   ]}
 *   initialValues={{ name: 'Product', price: 99.99, status: 'active' }}
 *   onSave={async (values) => { await saveProduct(values); }}
 *   onCancel={() => setEditing(false)}
 * />
 * ```
 */
export function InlineEditRow({
  fields,
  initialValues,
  onSave,
  onCancel,
  loading,
  resourceName = "item",
  CheckIcon = DefaultCheckIcon,
  XIcon = DefaultXIcon,
  LoaderIcon = DefaultLoaderIcon,
  onError,
  rowClassName = "bg-blue-50 border-t-2 border-blue-200",
  cellClassName = "px-4 py-2",
}: InlineEditRowProps) {
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const handleChange = (key: string, value: any) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setTouched((prev) => ({ ...prev, [key]: true }));

    // Validate field on change for immediate feedback
    const field = fields.find((f) => f.key === key);
    if (field) {
      const error = validateField(field);
      if (error) {
        setErrors((prev) => ({ ...prev, [key]: error }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[key];
          return newErrors;
        });
      }
    }
  };

  const validateField = (field: InlineField): string | null => {
    const value = values[field.key];

    // Required validation
    if (
      field.required &&
      (value === undefined || value === null || value === "")
    ) {
      return `${field.label} is required`;
    }

    // Custom validation (pass entire form data for cross-field validation)
    if (field.validate) {
      return field.validate(value, values);
    }

    // Number validation
    if (field.type === "number" && value !== undefined && value !== null) {
      if (field.min !== undefined && value < field.min) {
        return `${field.label} must be at least ${field.min}`;
      }
      if (field.max !== undefined && value > field.max) {
        return `${field.label} must be at most ${field.max}`;
      }
    }

    return null;
  };

  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      const error = validateField(field);
      if (error) {
        newErrors[field.key] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateAll()) {
      return;
    }

    try {
      await onSave(values);
    } catch (error) {
      if (onError) {
        onError(error as Error, `InlineEditRow.handleSave for ${resourceName}`);
      } else {
        console.error("InlineEditRow save error:", error);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  const renderField = (field: InlineField) => {
    const value = values[field.key];
    const error = errors[field.key];
    const showError = touched[field.key] && error;

    const baseClasses = `px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      showError ? "border-red-300" : "border-gray-300"
    } ${field.disabled ? "bg-gray-50 cursor-not-allowed" : ""}`;

    // Custom render function
    if (field.render) {
      return (
        <div className="flex flex-col gap-1">
          {field.render({
            value,
            onChange: (newValue) => handleChange(field.key, newValue),
            disabled: field.disabled || loading,
            error: showError ? error : undefined,
            onKeyDown: handleKeyDown,
          })}
          {showError && (
            <span className="text-xs text-red-600" role="alert">
              {error}
            </span>
          )}
        </div>
      );
    }

    switch (field.type) {
      case "text":
      case "email":
      case "url":
        return (
          <div className="flex flex-col gap-1 min-w-[150px]">
            <input
              type={field.type}
              value={value || ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={field.placeholder}
              disabled={field.disabled || loading}
              className={baseClasses}
              aria-label={field.label}
              aria-invalid={!!showError}
            />
            {showError && (
              <span className="text-xs text-red-600" role="alert">
                {error}
              </span>
            )}
          </div>
        );

      case "number":
        return (
          <div className="flex flex-col gap-1 min-w-[100px]">
            <input
              type="number"
              value={value ?? ""}
              onChange={(e) =>
                handleChange(field.key, parseFloat(e.target.value))
              }
              onKeyDown={handleKeyDown}
              placeholder={field.placeholder}
              disabled={field.disabled || loading}
              min={field.min}
              max={field.max}
              step={field.step}
              className={baseClasses}
              aria-label={field.label}
              aria-invalid={!!showError}
            />
            {showError && (
              <span className="text-xs text-red-600" role="alert">
                {error}
              </span>
            )}
          </div>
        );

      case "textarea":
        return (
          <div className="flex flex-col gap-1 min-w-[200px]">
            <textarea
              value={value || ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              disabled={field.disabled || loading}
              rows={field.rows || 2}
              className={baseClasses}
              aria-label={field.label}
              aria-invalid={!!showError}
            />
            {showError && (
              <span className="text-xs text-red-600" role="alert">
                {error}
              </span>
            )}
          </div>
        );

      case "select":
        return (
          <div className="flex flex-col gap-1 min-w-[150px]">
            <select
              value={value || ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
              disabled={field.disabled || loading}
              className={baseClasses}
              aria-label={field.label}
              aria-invalid={!!showError}
            >
              <option value="">Select {field.label}</option>
              {field.options?.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </option>
              ))}
            </select>
            {showError && (
              <span className="text-xs text-red-600" role="alert">
                {error}
              </span>
            )}
          </div>
        );

      case "checkbox":
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleChange(field.key, e.target.checked)}
              disabled={field.disabled || loading}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              aria-label={field.label}
            />
          </div>
        );

      case "date":
        return (
          <div className="flex flex-col gap-1 min-w-[150px]">
            <input
              type="date"
              value={value || ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={field.disabled || loading}
              className={baseClasses}
              aria-label={field.label}
              aria-invalid={!!showError}
            />
            {showError && (
              <span className="text-xs text-red-600" role="alert">
                {error}
              </span>
            )}
          </div>
        );

      case "image":
      case "custom":
        // For image and custom types, require render function
        return (
          <div className="flex flex-col gap-1">
            <div className="text-sm text-gray-500">
              Custom field type requires render function
            </div>
            {showError && (
              <span className="text-xs text-red-600" role="alert">
                {error}
              </span>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <tr className={rowClassName}>
      {fields.map((field) => (
        <td key={field.key} className={cellClassName}>
          {renderField(field)}
        </td>
      ))}
      <td className={cellClassName}>
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="p-1.5 text-green-600 hover:bg-green-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            title={`Save ${resourceName}`}
            type="button"
            aria-label={`Save ${resourceName}`}
          >
            {loading ? <LoaderIcon /> : <CheckIcon />}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="p-1.5 text-red-600 hover:bg-red-100 rounded disabled:opacity-50"
            title="Cancel"
            type="button"
            aria-label="Cancel edit"
          >
            <XIcon />
          </button>
        </div>
      </td>
    </tr>
  );
}
