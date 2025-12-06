/**
 * @fileoverview Generic Selector with Create Modal Component
 * @module src/components/common/SelectorWithCreate
 * @description Reusable component that combines a dropdown selector with inline creation capability.
 * Eliminates duplication across 7+ similar selector components.
 *
 * @created 2025-12-06
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { Plus, X } from "lucide-react";
import React, { ReactNode, useCallback, useState } from "react";

/**
 * Option type for selector
 * @interface
 */
export interface SelectorOption {
  /** Option value/ID */
  value: string;
  /** Display label */
  label: string;
  /** Optional icon */
  icon?: ReactNode;
  /** Optional metadata */
  metadata?: Record<string, any>;
}

/**
 * Props for SelectorWithCreate component
 * @interface
 */
export interface SelectorWithCreateProps<T = any> {
  /** Field label */
  label: string;
  /** Field name for form integration */
  name?: string;
  /** Currently selected value */
  value: string | null;
  /** Options array */
  options: SelectorOption[];
  /** Change handler */
  onChange: (value: string, option?: SelectorOption) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether field is required */
  required?: boolean;
  /** Whether field is disabled */
  disabled?: boolean;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;

  // Creation functionality
  /** Whether to show create button */
  allowCreate?: boolean;
  /** Create button label */
  createLabel?: string;
  /** Modal title for creation */
  createTitle?: string;
  /** Form component for creation */
  createForm?:
    | ReactNode
    | ((props: {
        onSubmit: (data: T) => void;
        onCancel: () => void;
      }) => ReactNode);
  /** Create submission handler */
  onCreateSubmit?: (data: T) => Promise<SelectorOption> | SelectorOption;
  /** Loading state during creation */
  creating?: boolean;

  // Styling
  /** Additional CSS classes */
  className?: string;
  /** Show search/filter */
  searchable?: boolean;
  /** Custom empty state */
  emptyState?: ReactNode;
}

/**
 * Generic Selector with Create Modal Component
 *
 * Replaces 7 duplicated components:
 * - AddressSelectorWithCreate
 * - ContactSelectorWithCreate
 * - DocumentSelectorWithUpload
 * - TagSelectorWithCreate
 * - CategorySelectorWithCreate
 * - BankAccountSelectorWithCreate
 * - TaxDetailsSelectorWithCreate
 *
 * @template T - Type of data for creation
 * @param {SelectorWithCreateProps<T>} props - Component props
 * @returns {JSX.Element} Rendered component
 *
 * @example
 * // Basic usage
 * <SelectorWithCreate
 *   label="Category"
 *   value={selectedCategory}
 *   options={categories}
 *   onChange={setSelectedCategory}
 *   allowCreate
 *   createLabel="New Category"
 *   createForm={<CategoryForm onSubmit={handleCreate} />}
 * />
 *
 * @example
 * // With render props for form
 * <SelectorWithCreate
 *   label="Address"
 *   value={selectedAddress}
 *   options={addresses}
 *   onChange={setSelectedAddress}
 *   allowCreate
 *   createForm={({ onSubmit, onCancel }) => (
 *     <AddressForm onSubmit={onSubmit} onCancel={onCancel} />
 *   )}
 *   onCreateSubmit={async (data) => {
 *     const newAddress = await createAddress(data);
 *     return { value: newAddress.id, label: newAddress.fullAddress };
 *   }}
 * />
 */
export function SelectorWithCreate<T = any>({
  label,
  name,
  value,
  options,
  onChange,
  placeholder = "Select...",
  required = false,
  disabled = false,
  error,
  helperText,
  allowCreate = true,
  createLabel = "Create New",
  createTitle = "Create New Item",
  createForm,
  onCreateSubmit,
  creating = false,
  className = "",
  searchable = false,
  emptyState,
}: SelectorWithCreateProps<T>) {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter options based on search
  const filteredOptions =
    searchable && searchQuery
      ? options.filter((opt) =>
          opt.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options;

  // Find selected option
  const selectedOption = options.find((opt) => opt.value === value);

  /**
   * Handles form submission from create modal
   */
  const handleCreateSubmit = useCallback(
    async (data: T) => {
      if (!onCreateSubmit) return;

      try {
        setIsSubmitting(true);
        const newOption = await onCreateSubmit(data);

        // Select the newly created item
        onChange(newOption.value, newOption);

        // Close modal
        setShowModal(false);
      } catch (error) {
        console.error("Failed to create item:", error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [onCreateSubmit, onChange]
  );

  /**
   * Handles modal close
   */
  const handleModalClose = useCallback(() => {
    if (!isSubmitting) {
      setShowModal(false);
    }
  }, [isSubmitting]);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="flex gap-2">
        {/* Selector */}
        <div className="flex-1">
          {searchable ? (
            <div className="relative">
              <input
                type="text"
                value={searchQuery || selectedOption?.label || ""}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  error ? "border-red-500" : "border-gray-300"
                } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
              />
              {filteredOptions.length > 0 && searchQuery && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {filteredOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onChange(option.value, option);
                        setSearchQuery("");
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      {option.icon}
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <select
              name={name}
              value={value || ""}
              onChange={(e) => {
                const selected = options.find(
                  (opt) => opt.value === e.target.value
                );
                onChange(e.target.value, selected);
              }}
              disabled={disabled}
              required={required}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                error ? "border-red-500" : "border-gray-300"
              } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
            >
              <option value="">{placeholder}</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}

          {/* Empty State */}
          {options.length === 0 && emptyState && (
            <div className="mt-2 text-sm text-gray-500">{emptyState}</div>
          )}
        </div>

        {/* Create Button */}
        {allowCreate && !disabled && (
          <button
            type="button"
            onClick={() => setShowModal(true)}
            disabled={creating || isSubmitting}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
            title={createLabel}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{createLabel}</span>
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Helper Text */}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}

      {/* Create Modal */}
      {showModal && createForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={handleModalClose}
            />

            {/* Modal */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              {/* Header */}
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {createTitle}
                  </h3>
                  <button
                    type="button"
                    onClick={handleModalClose}
                    disabled={isSubmitting}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form Content */}
                <div>
                  {typeof createForm === "function"
                    ? createForm({
                        onSubmit: handleCreateSubmit,
                        onCancel: handleModalClose,
                      })
                    : React.cloneElement(createForm as React.ReactElement, {
                        onSubmit: handleCreateSubmit,
                        onCancel: handleModalClose,
                      })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Specialized variant for multi-select
 * @interface
 */
export interface MultiSelectorWithCreateProps<T = any>
  extends Omit<SelectorWithCreateProps<T>, "value" | "onChange"> {
  /** Selected values array */
  value: string[];
  /** Multi-select change handler */
  onChange: (values: string[], options?: SelectorOption[]) => void;
  /** Maximum selections allowed */
  maxSelections?: number;
}

/**
 * Multi-select variant with create capability
 *
 * @template T - Type of data for creation
 * @param {MultiSelectorWithCreateProps<T>} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export function MultiSelectorWithCreate<T = any>({
  value,
  onChange,
  options,
  maxSelections,
  ...props
}: MultiSelectorWithCreateProps<T>) {
  const handleToggle = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : maxSelections && value.length >= maxSelections
      ? value
      : [...value, optionValue];

    const selectedOptions = options.filter((opt) =>
      newValue.includes(opt.value)
    );
    onChange(newValue, selectedOptions);
  };

  return (
    <div className="space-y-2">
      <SelectorWithCreate
        {...props}
        value={value[0] || null}
        onChange={(v, opt) => {
          if (opt) handleToggle(v);
        }}
        options={options}
      />

      {/* Selected Items */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((v) => {
            const option = options.find((opt) => opt.value === v);
            return option ? (
              <span
                key={v}
                className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
              >
                {option.icon}
                {option.label}
                <button
                  type="button"
                  onClick={() => handleToggle(v)}
                  className="text-indigo-500 hover:text-indigo-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ) : null;
          })}
        </div>
      )}

      {maxSelections && (
        <p className="text-xs text-gray-500">
          {value.length} / {maxSelections} selected
        </p>
      )}
    </div>
  );
}

export default SelectorWithCreate;
