"use client";

interface DemoProgressBarProps {
  completedSteps: number;
  totalSteps: number;
  label: string;
  color?: "blue" | "red";
}

export function DemoProgressBar({
  completedSteps,
  totalSteps,
  label,
  color = "blue",
}: DemoProgressBarProps) {
  const progressPercent = Math.round((completedSteps / totalSteps) * 100);
  const barColor = color === "red" ? "bg-red-600" : "bg-blue-600";

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {completedSteps} / {totalSteps} steps ({progressPercent}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
        <div
          className={`${barColor} h-3 rounded-full transition-all duration-500`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
