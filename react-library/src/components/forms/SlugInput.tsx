/**
 * SlugInput Component
 *
 * Framework-agnostic slug input with auto-generation from source text.
 * Creates URL-friendly slugs with preview and manual edit support.
 *
 * @example
 * ```tsx
 * const [title, setTitle] = useState('');
 * const [slug, setSlug] = useState('');
 *
 * <SlugInput
 *   label="URL Slug"
 *   value={slug}
 *   onChange={setSlug}
 *   sourceText={title}
 *   baseUrl="https://letitrip.in/products"
 *   showPreview
 *   helperText="Auto-generated from title, can be manually edited"
 * />
 * ```
 */

import { useEffect, useMemo, useState } from "react";

function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Generate slug from text
function generateSlug(text: string, prefix = "", suffix = ""): string {
  if (!text) return "";

  let slug = text
    .toLowerCase()
    .trim()
    // Replace spaces and special chars with hyphens
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

  if (prefix) slug = `${prefix}${slug}`;
  if (suffix) slug = `${slug}${suffix}`;

  return slug;
}

// Copy icon component
const CopyIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);

// Check icon component
const CheckIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

// X icon component
const XIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

export interface SlugInputProps {
  /** Label text displayed above the input */
  label?: string;
  /** Current slug value */
  value: string;
  /** Callback when slug changes */
  onChange: (slug: string) => void;
  /** Source text to auto-generate slug from (e.g., title) */
  sourceText?: string;
  /** Base URL for preview (default: "https://letitrip.in") */
  baseUrl?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Error message to display */
  error?: string;
  /** Helper text displayed below the input */
  helperText?: string;
  /** Async function to validate slug uniqueness */
  validateUnique?: (slug: string) => Promise<boolean>;
  /** Maximum length (default: 100) */
  maxLength?: number;
  /** Optional prefix (e.g., "product-") */
  prefix?: string;
  /** Optional suffix (e.g., "-2024") */
  suffix?: string;
  /** Show preview URL (default: true) */
  showPreview?: boolean;
  /** Allow manual editing (default: true) */
  allowManualEdit?: boolean;
  /** Whether the field is required */
  required?: boolean;
  /** Custom icon components */
  CopyIconComponent?: React.ComponentType;
  CheckIconComponent?: React.ComponentType;
  XIconComponent?: React.ComponentType;
}

export function SlugInput({
  label,
  value,
  onChange,
  sourceText,
  baseUrl = "https://letitrip.in",
  placeholder = "auto-generated-slug",
  disabled = false,
  error,
  helperText,
  validateUnique,
  maxLength = 100,
  prefix = "",
  suffix = "",
  showPreview = true,
  allowManualEdit = true,
  required,
  CopyIconComponent = CopyIcon,
  CheckIconComponent = CheckIcon,
  XIconComponent = XIcon,
}: SlugInputProps) {
  const [isManualEdit, setIsManualEdit] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [localValue, setLocalValue] = useState(value);

  // Auto-generate slug from source text
  useEffect(() => {
    if (!isManualEdit && sourceText) {
      const newSlug = generateSlug(sourceText, prefix, suffix);
      if (newSlug !== localValue) {
        setLocalValue(newSlug);
        onChange(newSlug);
      }
    }
  }, [sourceText, prefix, suffix, isManualEdit, localValue, onChange]);

  // Validate uniqueness with debounce
  useEffect(() => {
    if (!validateUnique || !localValue) return;

    const timeoutId = setTimeout(async () => {
      setIsValidating(true);
      setValidationError(null);

      try {
        const isUnique = await validateUnique(localValue);
        if (!isUnique) {
          setValidationError("This slug is already taken");
        }
      } catch (err) {
        setValidationError("Failed to validate slug");
      } finally {
        setIsValidating(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [localValue, validateUnique]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const slugValue = generateSlug(newValue, prefix, suffix);
    setLocalValue(slugValue);
    onChange(slugValue);
    setIsManualEdit(true);
  };

  // Handle regenerate
  const handleRegenerate = () => {
    if (sourceText) {
      const newSlug = generateSlug(sourceText, prefix, suffix);
      setLocalValue(newSlug);
      onChange(newSlug);
      setIsManualEdit(false);
    }
  };

  // Full preview URL
  const previewUrl = useMemo(() => {
    if (!localValue) return "";
    return `${baseUrl}/${localValue}`;
  }, [baseUrl, localValue]);

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(previewUrl);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Get display error
  const displayError = error || validationError;

  // Check if slug is valid format
  const isValidFormat = useMemo(() => {
    if (!localValue) return false;
    // Only lowercase alphanumeric and hyphens
    return /^[a-z0-9-]+$/.test(localValue);
  }, [localValue]);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input container */}
      <div className="relative">
        <div
          className={cn(
            "flex items-center gap-2 border rounded-lg overflow-hidden",
            disabled
              ? "bg-gray-100 dark:bg-gray-900"
              : "bg-white dark:bg-gray-800",
            displayError
              ? "border-red-500 dark:border-red-400"
              : "border-gray-300 dark:border-gray-600",
            !disabled && "focus-within:ring-2 focus-within:ring-blue-500"
          )}
        >
          {/* Prefix indicator */}
          {prefix && (
            <span className="px-3 text-gray-500 dark:text-gray-400 text-sm bg-gray-50 dark:bg-gray-700 border-r border-gray-300 dark:border-gray-600">
              {prefix}
            </span>
          )}

          {/* Input */}
          <input
            type="text"
            value={localValue}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled || !allowManualEdit}
            maxLength={maxLength}
            className={cn(
              "flex-1 px-4 py-2 outline-none bg-transparent text-gray-900 dark:text-white",
              "font-mono text-sm",
              (disabled || !allowManualEdit) && "cursor-not-allowed opacity-60"
            )}
          />

          {/* Suffix indicator */}
          {suffix && (
            <span className="px-3 text-gray-500 dark:text-gray-400 text-sm bg-gray-50 dark:bg-gray-700 border-l border-gray-300 dark:border-gray-600">
              {suffix}
            </span>
          )}

          {/* Validation status */}
          <div className="px-3 flex items-center gap-2">
            {isValidating && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
            )}

            {!isValidating &&
              isValidFormat &&
              !validationError &&
              localValue && <CheckIconComponent />}

            {!isValidating && validationError && <XIconComponent />}
          </div>
        </div>

        {/* Regenerate button */}
        {allowManualEdit && sourceText && (
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={disabled}
            className={cn(
              "absolute right-16 top-1/2 -translate-y-1/2",
              "px-2 py-1 text-xs rounded",
              "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600",
              "text-gray-700 dark:text-gray-300",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-colors"
            )}
            title="Regenerate from source"
          >
            ↻ Auto
          </button>
        )}
      </div>

      {/* Preview URL */}
      {showPreview && localValue && (
        <div className="mt-2 flex items-center gap-2 text-sm">
          <span className="text-gray-600 dark:text-gray-400">Preview:</span>
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline font-mono flex-1 truncate"
          >
            {previewUrl}
          </a>

          {/* Copy button */}
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors text-gray-500 dark:text-gray-400"
            title="Copy URL"
          >
            <CopyIconComponent />
          </button>
        </div>
      )}

      {/* Helper text / Error */}
      {displayError ? (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
          {displayError}
        </p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      ) : isManualEdit ? (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Manual edit mode. Click "Auto" to regenerate.
        </p>
      ) : (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Auto-generated from source. You can edit manually.
        </p>
      )}

      {/* Format requirements */}
      {!isValidFormat && localValue && (
        <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">
          ⚠ Slug should only contain lowercase letters, numbers, and hyphens
        </p>
      )}
    </div>
  );
}

export default SlugInput;
