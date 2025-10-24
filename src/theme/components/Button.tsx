import React from "react";
import { cn, buttonStyles, ThemeProps } from "../utils";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ThemeProps {
  children: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  className,
  loading = false,
  fullWidth = false,
  disabled,
  ...props
}) => {
  const baseClasses = buttonStyles.base;
  const variantClasses = buttonStyles.variants[variant];
  const sizeClasses = buttonStyles.sizes[size];
  const widthClasses = fullWidth ? "w-full" : "";
  const loadingClasses = loading ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses,
        sizeClasses,
        widthClasses,
        loadingClasses,
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
};
