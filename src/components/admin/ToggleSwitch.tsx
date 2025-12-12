"use client";

interface ToggleSwitchProps {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  label?: string;
  description?: string;
  id?: string;
}

export function ToggleSwitch({
  enabled,
  onToggle,
  disabled = false,
  size = "md",
  label,
  description,
  id,
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

  // Default to md if size is invalid
  const sizeConfig = sizes[size] || sizes.md;

  const switchId =
    id ||
    (label ? `toggle-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

  if (label || description) {
    return (
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {label && (
            <label
              htmlFor={switchId}
              className="block text-sm font-medium text-gray-900 dark:text-white"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {description}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          className={`relative inline-flex ${
            sizeConfig.container
          } items-center rounded-full transition-colors ${
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          } ${enabled ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-600"}`}
          aria-pressed={enabled}
          id={switchId}
          aria-labelledby={label ? `${switchId}-label` : undefined}
        >
          <span
            className={`inline-block ${sizeConfig.circle} transform rounded-full bg-white transition-transform ${sizeConfig.translate}`}
          />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`relative inline-flex ${
        sizeConfig.container
      } items-center rounded-full transition-colors ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } ${enabled ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-600"}`}
      aria-pressed={enabled}
    >
      <span
        className={`inline-block ${sizeConfig.circle} transform rounded-full bg-white transition-transform ${sizeConfig.translate}`}
      />
    </button>
  );
}
