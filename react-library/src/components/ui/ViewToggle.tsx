import { LucideIcon } from "lucide-react";

export interface ViewToggleProps {
  view: string;
  onViewChange: (view: string) => void;
  options: Array<{
    value: string;
    label: string;
    icon: LucideIcon;
  }>;
  className?: string;
}

export function ViewToggle({
  view,
  onViewChange,
  options,
  className = "",
}: ViewToggleProps) {
  return (
    <div
      data-testid="view-toggle"
      className={`inline-flex rounded-lg border border-gray-300 bg-white p-1 ${className}`}
    >
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = view === option.value;

        return (
          <button
            key={option.value}
            onClick={() => onViewChange(option.value)}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Icon className="h-4 w-4" />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
