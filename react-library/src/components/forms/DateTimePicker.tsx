/**
 * DateTimePicker Component
 * Framework-agnostic date and time picker
 *
 * Purpose: Basic date/time input without external dependencies
 * Features: Date, time, datetime-local input types
 * Note: For advanced features, integrate react-datepicker or similar
 *
 * @example Date Only
 * ```tsx
 * const [date, setDate] = useState('');
 *
 * <DateTimePicker
 *   label="Select Date"
 *   type="date"
 *   value={date}
 *   onChange={setDate}
 * />
 * ```
 *
 * @example Date and Time
 * ```tsx
 * <DateTimePicker
 *   label="Appointment"
 *   type="datetime-local"
 *   value={datetime}
 *   onChange={setDatetime}
 *   min="2024-01-01T00:00"
 *   required
 * />
 * ```
 *
 * @example With Validation
 * ```tsx
 * <DateTimePicker
 *   label="Event Date"
 *   type="date"
 *   value={eventDate}
 *   onChange={setEventDate}
 *   min={new Date().toISOString().split('T')[0]}
 *   error={errors.eventDate}
 *   helperText="Must be in the future"
 * />
 * ```
 */

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// Default calendar icon
function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

// Default clock icon
function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

export interface DateTimePickerProps {
  /** Field label */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Input type */
  type?: "date" | "time" | "datetime-local";
  /** Current value (ISO string or empty) */
  value: string;
  /** Called when value changes */
  onChange: (value: string) => void;
  /** Minimum date/time (ISO string) */
  min?: string;
  /** Maximum date/time (ISO string) */
  max?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Required field */
  required?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Custom icon */
  Icon?: React.ComponentType<{ className?: string }>;
  /** Custom className */
  className?: string;
}

export function DateTimePicker({
  label,
  helperText,
  error,
  type = "date",
  value,
  onChange,
  min,
  max,
  disabled = false,
  required = false,
  placeholder,
  Icon,
  className,
}: DateTimePickerProps) {
  // Choose appropriate icon based on type
  const DefaultIcon = type === "time" ? ClockIcon : CalendarIcon;
  const IconComponent = Icon || DefaultIcon;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Icon */}
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <IconComponent className="w-5 h-5 text-gray-400 dark:text-gray-500" />
        </div>

        {/* Input */}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          className={cn(
            "w-full pl-10 pr-3 py-2 rounded-lg border text-sm",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600",
            "bg-white dark:bg-gray-900 text-gray-900 dark:text-white",
            "[color-scheme:light] dark:[color-scheme:dark]", // Style native picker
            !!error
              ? "border-red-300 dark:border-red-700"
              : "border-gray-300 dark:border-gray-600",
            disabled &&
              "bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-60"
          )}
          aria-label={label}
          aria-invalid={!!error}
          aria-describedby={
            error ? "error-text" : helperText ? "helper-text" : undefined
          }
        />
      </div>

      {helperText && !error && (
        <p
          id="helper-text"
          className="text-sm text-gray-500 dark:text-gray-400"
        >
          {helperText}
        </p>
      )}

      {error && (
        <p id="error-text" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
