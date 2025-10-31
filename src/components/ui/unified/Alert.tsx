/**
 * Unified Alert Component
 * Single source of truth for all alert/notification variants
 * Inline messages, toasts, and banners
 */

"use client";

import React from "react";
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface UnifiedAlertProps {
  // Content
  title?: string;
  children: React.ReactNode;

  // Variants
  variant?: "info" | "success" | "warning" | "error" | "default";

  // Style
  filled?: boolean;
  bordered?: boolean;
  showIcon?: boolean;

  // Dismissible
  onClose?: () => void;

  // HTML
  className?: string;
  role?: "alert" | "status";
}

const variantConfig = {
  info: {
    icon: Info,
    colorClasses: {
      filled: "bg-info text-white",
      outline: "bg-info/10 text-info border-info",
    },
  },
  success: {
    icon: CheckCircle,
    colorClasses: {
      filled: "bg-success text-white",
      outline: "bg-success/10 text-success border-success",
    },
  },
  warning: {
    icon: AlertTriangle,
    colorClasses: {
      filled: "bg-warning text-textDark",
      outline: "bg-warning/10 text-warning border-warning",
    },
  },
  error: {
    icon: AlertCircle,
    colorClasses: {
      filled: "bg-error text-white",
      outline: "bg-error/10 text-error border-error",
    },
  },
  default: {
    icon: Info,
    colorClasses: {
      filled: "bg-surface text-text",
      outline: "bg-surface text-text border-border",
    },
  },
};

export const UnifiedAlert: React.FC<UnifiedAlertProps> = ({
  title,
  children,
  variant = "default",
  filled = false,
  bordered = true,
  showIcon = true,
  onClose,
  className,
  role = "alert",
}) => {
  const config = variantConfig[variant];
  const Icon = config.icon;
  const colorClass = filled
    ? config.colorClasses.filled
    : config.colorClasses.outline;

  return (
    <div
      role={role}
      className={cn(
        "relative rounded-lg p-4",
        "flex items-start gap-3",
        bordered && "border-2",
        colorClass,
        "transition-all",
        className
      )}
    >
      {/* Icon */}
      {showIcon && (
        <Icon
          className={cn("w-5 h-5 flex-shrink-0", title ? "mt-0.5" : "mt-0")}
        />
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && <h4 className="font-semibold mb-1 text-sm">{title}</h4>}
        <div className="text-sm">{children}</div>
      </div>

      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className={cn(
            "flex-shrink-0 p-1 rounded-md",
            "hover:bg-black/10 dark:hover:bg-white/10",
            "transition-colors focus:outline-none focus:ring-2",
            filled ? "focus:ring-white/50" : "focus:ring-current/50"
          )}
          aria-label="Close alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// ============================================================================
// BANNER ALERT
// ============================================================================

export interface BannerAlertProps extends UnifiedAlertProps {
  position?: "top" | "bottom";
  fullWidth?: boolean;
}

export const BannerAlert: React.FC<BannerAlertProps> = ({
  position = "top",
  fullWidth = true,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "sticky z-banner",
        position === "top" ? "top-0" : "bottom-0",
        fullWidth && "left-0 right-0"
      )}
    >
      <UnifiedAlert
        {...props}
        bordered={false}
        className={cn(fullWidth && "rounded-none", className)}
      />
    </div>
  );
};

// ============================================================================
// TOAST ALERT (Container Component)
// ============================================================================

export interface ToastAlertProps extends Omit<UnifiedAlertProps, "className"> {
  duration?: number;
  onAutoClose?: () => void;
}

export const ToastAlert: React.FC<ToastAlertProps> = ({
  duration = 5000,
  onAutoClose,
  onClose,
  ...props
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (!duration) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      onAutoClose?.();
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onAutoClose, onClose]);

  if (!isVisible) return null;

  return (
    <UnifiedAlert
      {...props}
      onClose={() => {
        setIsVisible(false);
        onClose?.();
      }}
      className={cn("shadow-lg animate-slideLeft", "max-w-md w-full")}
    />
  );
};

// ============================================================================
// INLINE VALIDATION ALERT
// ============================================================================

export interface ValidationAlertProps
  extends Omit<UnifiedAlertProps, "variant" | "showIcon"> {
  isValid?: boolean;
}

export const ValidationAlert: React.FC<ValidationAlertProps> = ({
  isValid,
  ...props
}) => {
  return (
    <UnifiedAlert
      variant={isValid ? "success" : "error"}
      showIcon
      filled={false}
      bordered
      {...props}
    />
  );
};

export default UnifiedAlert;
