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
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-300",
  },
  inactive: {
    bg: "bg-gray-100",
    text: "text-gray-800",
    border: "border-gray-300",
  },
  pending: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    border: "border-yellow-300",
  },
  approved: {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-300",
  },
  rejected: {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-300",
  },
  banned: { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" },
  verified: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-300",
  },
  unverified: {
    bg: "bg-gray-100",
    text: "text-gray-800",
    border: "border-gray-300",
  },
  featured: {
    bg: "bg-purple-100",
    text: "text-purple-800",
    border: "border-purple-300",
  },
  draft: {
    bg: "bg-gray-100",
    text: "text-gray-800",
    border: "border-gray-300",
  },
  published: {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-300",
  },
  archived: {
    bg: "bg-gray-100",
    text: "text-gray-800",
    border: "border-gray-300",
  },
  success: {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-300",
  },
  error: { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" },
  warning: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    border: "border-yellow-300",
  },
  info: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300" },
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
