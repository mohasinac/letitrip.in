"use client";

export type StatusType =
  | "active"
  | "inactive"
  | "pending"
  | "approved"
  | "rejected"
  | "banned"
  | "verified"
  | "unverified"
  | "featured"
  | "draft"
  | "published"
  | "archived"
  | "success"
  | "error"
  | "warning"
  | "info";

export interface StatusBadgeProps {
  status: StatusType | string;
  variant?: "default" | "outline" | "solid";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const statusStyles: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  active: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-800 dark:text-green-400",
    border: "border-green-300 dark:border-green-700",
  },
  inactive: {
    bg: "bg-gray-100 dark:bg-gray-700",
    text: "text-gray-800 dark:text-gray-300",
    border: "border-gray-300 dark:border-gray-600",
  },
  pending: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-800 dark:text-yellow-400",
    border: "border-yellow-300 dark:border-yellow-700",
  },
  approved: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-800 dark:text-green-400",
    border: "border-green-300 dark:border-green-700",
  },
  rejected: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-800 dark:text-red-400",
    border: "border-red-300 dark:border-red-700",
  },
  banned: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-800 dark:text-red-400",
    border: "border-red-300 dark:border-red-700",
  },
  verified: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-800 dark:text-blue-400",
    border: "border-blue-300 dark:border-blue-700",
  },
  unverified: {
    bg: "bg-gray-100 dark:bg-gray-700",
    text: "text-gray-800 dark:text-gray-300",
    border: "border-gray-300 dark:border-gray-600",
  },
  featured: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-800 dark:text-purple-400",
    border: "border-purple-300 dark:border-purple-700",
  },
  draft: {
    bg: "bg-gray-100 dark:bg-gray-700",
    text: "text-gray-800 dark:text-gray-300",
    border: "border-gray-300 dark:border-gray-600",
  },
  published: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-800 dark:text-green-400",
    border: "border-green-300 dark:border-green-700",
  },
  archived: {
    bg: "bg-gray-100 dark:bg-gray-700",
    text: "text-gray-800 dark:text-gray-300",
    border: "border-gray-300 dark:border-gray-600",
  },
  success: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-800 dark:text-green-400",
    border: "border-green-300 dark:border-green-700",
  },
  error: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-800 dark:text-red-400",
    border: "border-red-300 dark:border-red-700",
  },
  warning: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-800 dark:text-yellow-400",
    border: "border-yellow-300 dark:border-yellow-700",
  },
  info: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-800 dark:text-blue-400",
    border: "border-blue-300 dark:border-blue-700",
  },
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-base",
};

export function StatusBadge({
  status,
  variant = "default",
  size = "md",
  className = "",
}: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();
  const styles = statusStyles[normalizedStatus] || statusStyles.info;

  const baseClasses = `inline-flex items-center font-medium rounded-full ${sizeStyles[size]}`;

  const variantClasses = {
    default: `${styles.bg} ${styles.text}`,
    outline: `bg-transparent ${styles.text} border ${styles.border}`,
    solid: `${styles.bg} ${styles.text}`,
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
