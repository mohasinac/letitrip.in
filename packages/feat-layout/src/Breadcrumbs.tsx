import React from "react";

export interface BreadcrumbsProps {
  children: React.ReactNode;
  separator?: React.ReactNode;
  className?: string;
}

export interface BreadcrumbItemProps {
  href?: string;
  children: React.ReactNode;
  /** Marks this item as the current page — renders as plain text, not link. */
  current?: boolean;
  className?: string;
}

/**
 * Breadcrumbs — navigation hierarchy showing the user's location.
 * Automatically adds separators between items.
 *
 * @example
 * <Breadcrumbs>
 *   <BreadcrumbItem href="/">Home</BreadcrumbItem>
 *   <BreadcrumbItem href="/products">Products</BreadcrumbItem>
 *   <BreadcrumbItem current>Detail</BreadcrumbItem>
 * </Breadcrumbs>
 */
export function Breadcrumbs({
  children,
  separator = "/",
  className = "",
}: BreadcrumbsProps) {
  const items = React.Children.toArray(children);

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center gap-2 text-sm flex-wrap">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {item}
            {index < items.length - 1 && (
              <span
                className="text-zinc-400 dark:text-zinc-500 select-none"
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

export function BreadcrumbItem({
  href,
  children,
  current = false,
  className = "",
}: BreadcrumbItemProps) {
  if (current || !href) {
    return (
      <span
        aria-current={current ? "page" : undefined}
        className={`text-zinc-500 dark:text-zinc-400 ${className}`}
      >
        {children}
      </span>
    );
  }

  return (
    <a
      href={href}
      className={`text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors ${className}`}
    >
      {children}
    </a>
  );
}
