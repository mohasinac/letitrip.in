import { ReactNode } from "react";

interface ToggleSwitchProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  label?: ReactNode;
  description?: ReactNode;
  id?: string;
  className?: string;
  switchClassName?: string;
  labelClassName?: string;
  descriptionClassName?: string;
}

/**
 * ToggleSwitch Component
 *
 * Pure React component for toggle switches with various sizes and customization options.
 * Framework-independent implementation with accessibility support.
 *
 * Features:
 * - Multiple sizes (sm, md, lg)
 * - Disabled state
 * - Optional label and description
 * - Keyboard navigation
 * - Screen reader support
 * - Customizable styling
 *
 * @example
 * ```tsx
 * <ToggleSwitch
 *   enabled={isDark}
 *   onToggle={setIsDark}
 *   label="Dark Mode"
 *   description="Toggle dark mode on/off"
 * />
 * ```
 */
export function ToggleSwitch({
  enabled,
  onToggle,
  disabled = false,
  size = "md",
  label,
  description,
  id,
  className = "",
  switchClassName = "",
  labelClassName = "",
  descriptionClassName = "",
}: ToggleSwitchProps) {
  const sizes = {
    sm: {
      container: "h-5 w-9",
      circle: "h-3 w-3",
      translate: enabled ? "translate-x-5" : "translate-x-1",
    },
    md: {
      container: "h-6 w-11",
      circle: "h-4 w-4",
      translate: enabled ? "translate-x-6" : "translate-x-1",
    },
    lg: {
      container: "h-7 w-14",
      circle: "h-5 w-5",
      translate: enabled ? "translate-x-8" : "translate-x-1",
    },
  };

  const sizeConfig = sizes[size];

  const handleClick = () => {
    if (!disabled) {
      onToggle(!enabled);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-describedby={description ? `${id}-description` : undefined}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={`
          relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800
          ${sizeConfig.container}
          ${enabled ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${switchClassName}
        `}
      >
        <span
          className={`
            inline-block rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out
            ${sizeConfig.circle}
            ${sizeConfig.translate}
            ${disabled ? "bg-gray-100" : ""}
          `}
        />
      </button>

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <label
              htmlFor={id}
              className={`text-sm font-medium text-gray-900 dark:text-gray-100 ${
                disabled ? "opacity-50" : "cursor-pointer"
              } ${labelClassName}`}
              onClick={handleClick}
            >
              {label}
            </label>
          )}
          {description && (
            <p
              id={`${id}-description`}
              className={`text-sm text-gray-500 dark:text-gray-400 ${
                disabled ? "opacity-50" : ""
              } ${descriptionClassName}`}
            >
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default ToggleSwitch;
