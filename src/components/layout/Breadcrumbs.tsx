import React from "react";
import { THEME_CONSTANTS } from "@/constants";

/**
 * Breadcrumbs Component
 *
 * Navigation hierarchy showing the user's location in the application.
 * Automatically adds separators between items.
 *
 * @component
 * @example
 * ```tsx
 * <Breadcrumbs>
 *   <BreadcrumbItem href="/">Home</BreadcrumbItem>
 *   <BreadcrumbItem href="/products">Products</BreadcrumbItem>
 *   <BreadcrumbItem current>Detail</BreadcrumbItem>
 * </Breadcrumbs>
 * ```
 */

interface BreadcrumbsProps {
  children: React.ReactNode;
  separator?: React.ReactNode;
  className?: string;
}

export default function Breadcrumbs({
  children,
  separator = "/",
  className = "",
}: BreadcrumbsProps) {
  const items = React.Children.toArray(children);
  const { themed } = THEME_CONSTANTS;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center gap-2 text-sm">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {item}
            {index < items.length - 1 && (
              <span
                className={`${themed.textMuted} select-none`}
                aria-hidden="true"
              >
                {separator}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// BreadcrumbItem
interface BreadcrumbItemProps {
  href?: string;
  current?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function BreadcrumbItem({
  href,
  current = false,
  children,
  className = "",
  onClick,
}: BreadcrumbItemProps) {
  const { themed } = THEME_CONSTANTS;

  if (current) {
    return (
      <span
        aria-current="page"
        className={`${themed.textPrimary} font-medium ${className}`}
      >
        {children}
      </span>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        className={`
          ${themed.textSecondary}
          hover:${themed.textPrimary}
          hover:underline
          transition-colors
          ${className}
        `}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        ${themed.textSecondary}
        hover:${themed.textPrimary}
        hover:underline
        transition-colors
        ${className}
      `}
    >
      {children}
    </button>
  );
}
