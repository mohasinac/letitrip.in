import React from "react";
import { cn } from "../utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className,
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 text-muted-foreground">{leftIcon}</div>
          </div>
        )}

        <input
          id={inputId}
          className={cn(
            "input",
            leftIcon ? "pl-10" : "",
            rightIcon ? "pr-10" : "",
            error ? "border-error focus:border-error focus:ring-error" : "",
            className
          )}
          {...props}
        />

        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 text-muted-foreground">{rightIcon}</div>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      {helperText && !error && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
};

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}) => {
  const textareaId =
    id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}

      <textarea
        id={textareaId}
        className={cn(
          "input min-h-[80px] resize-y",
          error ? "border-error focus:border-error focus:ring-error" : "",
          className
        )}
        {...props}
      />

      {error && <p className="text-sm text-error">{error}</p>}

      {helperText && !error && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
};
