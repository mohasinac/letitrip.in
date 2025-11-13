"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { QuickCreateRowProps, InlineField } from "@/types/inline-edit";
import { InlineImageUpload } from "./InlineImageUpload";
import InlineCategorySelectorWithCreate from "@/components/seller/InlineCategorySelectorWithCreate";

export function QuickCreateRow({
  fields,
  onSave,
  loading,
  resourceName = "item",
  defaultValues = {},
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
      return field.validate(value);
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
      console.error("Failed to create:", error);
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

      case "category-create":
        return (
          <div className="flex flex-col gap-1 min-w-[200px]">
            <InlineCategorySelectorWithCreate
              value={value || ""}
              onChange={(categoryId) => handleChange(field.key, categoryId)}
              disabled={field.disabled || loading}
              error={showError ? error : undefined}
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

  if (!isExpanded) {
    return (
      <tr className="bg-green-50 border-t-2 border-green-200">
        <td colSpan={fields.length + 1} className="px-4 py-3">
          <button
            onClick={() => setIsExpanded(true)}
            disabled={loading}
            className="flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-800 disabled:opacity-50"
            type="button"
          >
            <Plus className="w-4 h-4" />
            Add {resourceName}
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="bg-green-50 border-t-2 border-green-200">
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
            className="p-1.5 text-green-600 hover:bg-green-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            title={`Create ${resourceName}`}
            type="button"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="p-1.5 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50"
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
