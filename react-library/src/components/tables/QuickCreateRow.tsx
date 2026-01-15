import { useState } from "react";
import { InlineField } from "./InlineEditRow";

/**
 * Props for QuickCreateRow component
 */
export interface QuickCreateRowProps {
  /** Field configurations */
  fields: InlineField[];
  /** Callback when save/create is triggered */
  onSave: (values: Record<string, any>) => Promise<void>;
  /** Loading state */
  loading?: boolean;
  /** Resource name for UI text (e.g., "product", "category") */
  resourceName?: string;
  /** Default values for the fields */
  defaultValues?: Record<string, any>;
  /** Plus/add icon component (default: SVG plus) */
  PlusIcon?: React.ComponentType<any>;
  /** X/close icon component (default: SVG X) */
  XIcon?: React.ComponentType<any>;
  /** Loader icon component (default: SVG spinner) */
  LoaderIcon?: React.ComponentType<any>;
  /** Error handler callback */
  onError?: (error: Error, context?: string) => void;
  /** Custom collapsed row className */
  collapsedRowClassName?: string;
  /** Custom expanded row className */
  expandedRowClassName?: string;
  /** Custom cell className */
  cellClassName?: string;
}

// Default icons
const DefaultPlusIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 3v10M3 8h10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
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
 * QuickCreateRow - Collapsible table row for quick item creation
 *
 * A table row component that starts collapsed and expands to show form fields
 * for creating new items. Includes validation and keyboard shortcuts.
 *
 * @example
 * ```tsx
 * <QuickCreateRow
 *   fields={[
 *     { key: 'name', type: 'text', label: 'Name', required: true },
 *     { key: 'price', type: 'number', label: 'Price', min: 0 }
 *   ]}
 *   onSave={async (values) => { await createProduct(values); }}
 *   resourceName="product"
 * />
 * ```
 */
export function QuickCreateRow({
  fields,
  onSave,
  loading,
  resourceName = "item",
  defaultValues = {},
  PlusIcon = DefaultPlusIcon,
  XIcon = DefaultXIcon,
  LoaderIcon = DefaultLoaderIcon,
  onError,
  collapsedRowClassName = "bg-green-50 border-t-2 border-green-200",
  expandedRowClassName = "bg-green-50 border-t-2 border-green-200",
  cellClassName = "px-4 py-2",
}: QuickCreateRowProps) {
  const [values, setValues] = useState<Record<string, any>>(defaultValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (key: string, value: any) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setTouched((prev) => ({ ...prev, [key]: true }));

    // Clear error when value changes
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
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

    // Custom validation
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

      // Reset form after successful save
      setValues(defaultValues);
      setErrors({});
      setTouched({});
      setIsExpanded(false);
    } catch (error) {
      if (onError) {
        onError(
          error as Error,
          `QuickCreateRow.handleCreate for ${resourceName}`
        );
      } else {
        console.error("QuickCreateRow save error:", error);
      }
    }
  };

  const handleCancel = () => {
    setValues(defaultValues);
    setErrors({});
    setTouched({});
    setIsExpanded(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
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

  if (!isExpanded) {
    return (
      <tr className={collapsedRowClassName}>
        <td colSpan={fields.length + 1} className="px-4 py-3">
          <button
            onClick={() => setIsExpanded(true)}
            disabled={loading}
            className="flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-800 disabled:opacity-50"
            type="button"
            aria-label={`Add new ${resourceName}`}
          >
            <PlusIcon />
            Add {resourceName}
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className={expandedRowClassName}>
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
            className="p-1.5 text-green-600 hover:bg-green-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            title={`Create ${resourceName}`}
            type="button"
            aria-label={`Create ${resourceName}`}
          >
            {loading ? <LoaderIcon /> : <PlusIcon />}
          </button>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="p-1.5 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50"
            title="Cancel"
            type="button"
            aria-label="Cancel"
          >
            <XIcon />
          </button>
        </div>
      </td>
    </tr>
  );
}
