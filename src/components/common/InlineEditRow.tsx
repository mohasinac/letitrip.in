"use client";

import { useState, useEffect } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { InlineEditRowProps, InlineField } from "@/types/inline-edit";
import { InlineImageUpload } from "./InlineImageUpload";

export function InlineEditRow({
  fields,
  initialValues,
  onSave,
  onCancel,
  loading,
  resourceName = "item",
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
      console.error("Failed to save:", error);
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
        return (
          <div className="flex flex-col gap-1">
            <InlineImageUpload
              value={value}
              onChange={(url) => handleChange(field.key, url)}
              accept={field.accept}
              disabled={field.disabled || loading}
              context={field.placeholder || "product"}
            />
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
    <tr className="bg-blue-50 border-t-2 border-blue-200">
      {fields.map((field) => (
        <td key={field.key} className="px-4 py-2">
          {renderField(field)}
        </td>
      ))}
      <td className="px-4 py-2">
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="p-1.5 text-green-600 hover:bg-green-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            title="Save"
            type="button"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="p-1.5 text-red-600 hover:bg-red-100 rounded disabled:opacity-50"
            title="Cancel"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
