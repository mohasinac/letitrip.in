"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "primary" | "white" | "gray";
  fullScreen?: boolean;
  message?: string;
}

export function LoadingSpinner({
  size = "md",
  color = "primary",
  fullScreen = false,
  message,
}: LoadingSpinnerProps) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const colors = {
    primary: "border-blue-600",
    white: "border-white",
    gray: "border-gray-900",
  };

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`animate-spin rounded-full border-b-2 ${sizes[size]} ${colors[color]}`}
      />
      {message && (
        <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        {spinner}
      </div>
    );
  }

  return spinner;
}
