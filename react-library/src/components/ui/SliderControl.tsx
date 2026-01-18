/**
 * SliderControl - Pure React
 * 
 * Range slider input with label and min/max display.
 * Framework-agnostic slider component.
 */

export interface SliderControlProps {
  /** Slider label */
  label: string;
  /** Current value */
  value: number;
  /** Minimum value */
  min: number;
  /** Maximum value */
  max: number;
  /** Callback when value changes */
  onChange: (value: number) => void;
  /** Step increment */
  step?: number;
  /** Additional CSS classes */
  className?: string;
}

export function SliderControl({
  label,
  value,
  min,
  max,
  onChange,
  step = 1,
  className = "",
}: SliderControlProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}: <span className="font-semibold">{value}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
      />
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
