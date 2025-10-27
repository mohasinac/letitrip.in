import BeybladeSpinner from "./BeybladeSpinner";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "blue" | "gray" | "white";
  text?: string;
  className?: string;
  variant?: "default" | "beyblade";
}

export default function LoadingSpinner({
  size = "md",
  color = "blue",
  text,
  className = "",
  variant = "default",
}: LoadingSpinnerProps) {
  // If beyblade variant is requested, use the BeybladeSpinner
  if (variant === "beyblade") {
    const beybladeColorMap = {
      blue: "blue" as const,
      gray: "silver" as const,
      white: "silver" as const,
    };

    return (
      <BeybladeSpinner
        size={size}
        color={beybladeColorMap[color]}
        text={text}
        className={className}
        variant="classic"
      />
    );
  }

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const colorClasses = {
    blue: "border-blue-200 border-t-blue-600",
    gray: "border-gray-200 border-t-gray-600",
    white: "border-white/20 border-t-white",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} border-4 border-solid rounded-full animate-spin ${colorClasses[color]}`}
      ></div>
      {text && (
        <p className={`mt-2 text-gray-600 ${textSizeClasses[size]}`}>{text}</p>
      )}
    </div>
  );
}

// Simple inline spinner for buttons or small spaces
export function InlineSpinner({
  size = "sm",
  color = "blue",
}: Pick<LoadingSpinnerProps, "size" | "color">) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const colorClasses = {
    blue: "border-blue-200 border-t-blue-600",
    gray: "border-gray-200 border-t-gray-600",
    white: "border-white/20 border-t-white",
  };

  return (
    <div
      className={`${sizeClasses[size]} border-2 border-solid rounded-full animate-spin ${colorClasses[color]}`}
    ></div>
  );
}

// Full page loading overlay
export function LoadingOverlay({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-sm mx-4">
        <LoadingSpinner size="lg" text={text} className="text-center" />
      </div>
    </div>
  );
}
