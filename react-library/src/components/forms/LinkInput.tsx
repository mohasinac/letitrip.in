
/**
 * LinkInput Component
 *
 * Framework-agnostic link input with validation and preview.
 * Supports relative paths, full URLs, and link validation.
 *
 * @example
 * ```tsx
 * const [link, setLink] = useState('');
 *
 * <LinkInput
 *   label="Button Link"
 *   value={link}
 *   onChange={setLink}
 *   showPreview
 *   baseUrl="https://letitrip.in"
 *   placeholder="/products or https://example.com"
 * />
 * ```
 */

import { useMemo } from "react";

function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

// External link icon
const ExternalIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
      clipRule="evenodd"
    />
    <path
      fillRule="evenodd"
      d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
      clipRule="evenodd"
    />
  </svg>
);

// Internal link icon
const InternalIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M12.207 2.232a.75.75 0 00.025 1.06l4.146 3.958H6.375a5.375 5.375 0 000 10.75H9.25a.75.75 0 000-1.5H6.375a3.875 3.875 0 010-7.75h10.003l-4.146 3.957a.75.75 0 001.036 1.085l5.5-5.25a.75.75 0 000-1.085l-5.5-5.25a.75.75 0 00-1.06.025z"
      clipRule="evenodd"
    />
  </svg>
);

export interface LinkInputProps {
  /** Label text displayed above the input */
  label?: string;
  /** Current link value */
  value: string;
  /** Callback when value changes */
  onChange: (value: string) => void;
  /** Helper text displayed below the input */
  helperText?: string;
  /** Error message to display */
  error?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Base URL for resolving relative paths (default: "https://letitrip.in") */
  baseUrl?: string;
  /** Show the resolved URL preview (default: true) */
  showPreview?: boolean;
  /** Allow external URLs (default: true) */
  allowExternal?: boolean;
  /** Allow relative paths (default: true) */
  allowRelative?: boolean;
  /** Custom icon components */
  ExternalIconComponent?: React.ComponentType;
  InternalIconComponent?: React.ComponentType;
}

export function LinkInput({
  label,
  value,
  onChange,
  helperText,
  error,
  required,
  disabled,
  placeholder = "e.g., /products or https://example.com",
  baseUrl = "https://letitrip.in",
  showPreview = true,
  allowExternal = true,
  allowRelative = true,
  ExternalIconComponent = ExternalIcon,
  InternalIconComponent = InternalIcon,
}: LinkInputProps) {
  // Determine link type and resolved URL
  const linkInfo = useMemo(() => {
    if (!value || value.trim() === "") {
      return { type: "none", resolvedUrl: "", isValid: true };
    }

    const trimmed = value.trim();

    // Check for external URL
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      try {
        new URL(trimmed);
        return {
          type: "external",
          resolvedUrl: trimmed,
          isValid: allowExternal,
        };
      } catch {
        return { type: "invalid", resolvedUrl: "", isValid: false };
      }
    }

    // Check for relative path
    if (trimmed.startsWith("/")) {
      return {
        type: "internal",
        resolvedUrl: `${baseUrl}${trimmed}`,
        isValid: allowRelative,
      };
    }

    // Check for anchor
    if (trimmed.startsWith("#")) {
      return {
        type: "anchor",
        resolvedUrl: trimmed,
        isValid: true,
      };
    }

    // Check for mailto/tel
    if (trimmed.startsWith("mailto:") || trimmed.startsWith("tel:")) {
      return {
        type: "special",
        resolvedUrl: trimmed,
        isValid: true,
      };
    }

    // Assume invalid format
    return { type: "invalid", resolvedUrl: "", isValid: false };
  }, [value, baseUrl, allowExternal, allowRelative]);

  const displayError =
    error ||
    (!linkInfo.isValid && value
      ? "Invalid link format or type not allowed"
      : undefined);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full rounded-lg border px-3 py-2 pr-10 text-sm transition-colors duration-200",
            "focus:outline-none focus:ring-2",
            displayError
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500",
            "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
            "placeholder:text-gray-400 dark:placeholder:text-gray-500",
            disabled &&
              "bg-gray-100 dark:bg-gray-900 cursor-not-allowed opacity-60"
          )}
        />

        {/* Link type indicator */}
        {value && linkInfo.isValid && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            {linkInfo.type === "external" ? (
              <ExternalIconComponent />
            ) : linkInfo.type === "internal" ? (
              <InternalIconComponent />
            ) : null}
          </div>
        )}
      </div>

      {/* Preview URL */}
      {showPreview && linkInfo.resolvedUrl && linkInfo.isValid && (
        <div className="mt-1 flex items-center gap-2 text-xs">
          <span className="text-gray-500 dark:text-gray-400">→</span>
          <a
            href={linkInfo.resolvedUrl}
            target={linkInfo.type === "external" ? "_blank" : undefined}
            rel={
              linkInfo.type === "external" ? "noopener noreferrer" : undefined
            }
            className="text-blue-600 dark:text-blue-400 hover:underline truncate"
          >
            {linkInfo.resolvedUrl}
          </a>
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
      ) : null}
    </div>
  );
}

export default LinkInput;

