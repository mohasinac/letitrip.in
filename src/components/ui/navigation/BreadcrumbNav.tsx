/**
 * BreadcrumbNav Component
 *
 * An enhanced breadcrumb navigation component with mobile optimization,
 * SEO schema markup, and collapsible items.
 *
 * @example
 * ```tsx
 * <BreadcrumbNav
 *   items={[
 *     { label: 'Dashboard', href: '/admin/dashboard' },
 *     { label: 'Products', href: '/admin/products' },
 *     { label: 'Edit Product' }
 *   ]}
 *   separator="/"
 *   maxItems={4}
 * />
 * ```
 */

import React from "react";
import Link from "next/link";
import { ChevronRight, Home, MoreHorizontal, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  /** Breadcrumb label */
  label: string;
  /** Optional href (if clickable) */
  href?: string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Optional aria-label */
  "aria-label"?: string;
}

export interface BreadcrumbNavProps {
  /** Array of breadcrumb items */
  items: BreadcrumbItem[];
  /** Separator between items */
  separator?: "slash" | "chevron" | "custom";
  /** Custom separator element (if separator is 'custom') */
  customSeparator?: React.ReactNode;
  /** Maximum number of items to show before collapsing */
  maxItems?: number;
  /** From which position to start collapsing (start or middle) */
  collapseFrom?: "start" | "middle";
  /** Show home icon for first item */
  showHomeIcon?: boolean;
  /** Show back button on mobile */
  showBackButton?: boolean;
  /** Include Schema.org markup for SEO */
  includeSchema?: boolean;
  /** Mobile variant */
  mobileVariant?: "full" | "back-only" | "compact";
  /** Additional class name */
  className?: string;
}

export const BreadcrumbNav = React.forwardRef<HTMLElement, BreadcrumbNavProps>(
  (
    {
      items,
      separator = "chevron",
      customSeparator,
      maxItems = 5,
      collapseFrom = "middle",
      showHomeIcon = true,
      showBackButton = true,
      includeSchema = true,
      mobileVariant = "full",
      className,
    },
    ref
  ) => {
    const getSeparator = () => {
      if (separator === "custom" && customSeparator) return customSeparator;
      if (separator === "slash")
        return <span className="text-textSecondary mx-2">/</span>;
      return <ChevronRight className="w-4 h-4 text-textSecondary mx-1" />;
    };

    const getCollapsedItems = () => {
      if (items.length <= maxItems) return items;

      if (collapseFrom === "start") {
        // Keep first and last items, collapse middle
        const firstItem = items[0];
        const lastItems = items.slice(-(maxItems - 2));
        const collapsedCount = items.length - maxItems + 1;

        return [
          firstItem,
          {
            label: `... (${collapsedCount} more)`,
            icon: <MoreHorizontal className="w-4 h-4" />,
          } as BreadcrumbItem,
          ...lastItems,
        ];
      } else {
        // Keep first few and last few, collapse middle
        const keepStart = Math.floor((maxItems - 1) / 2);
        const keepEnd = maxItems - keepStart - 1;
        const firstItems = items.slice(0, keepStart);
        const lastItems = items.slice(-keepEnd);
        const collapsedCount = items.length - maxItems + 1;

        return [
          ...firstItems,
          {
            label: `... (${collapsedCount} more)`,
            icon: <MoreHorizontal className="w-4 h-4" />,
          } as BreadcrumbItem,
          ...lastItems,
        ];
      }
    };

    const displayItems = getCollapsedItems();

    const renderBreadcrumb = (item: BreadcrumbItem, index: number) => {
      const isLast = index === displayItems.length - 1;
      const isFirst = index === 0;

      const content = (
        <span className="flex items-center gap-1.5">
          {isFirst && showHomeIcon && !item.icon && (
            <Home className="w-4 h-4" />
          )}
          {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
          <span className="truncate">{item.label}</span>
        </span>
      );

      return (
        <li key={index} className="flex items-center">
          {item.href && !isLast ? (
            <Link
              href={item.href}
              className={cn(
                "text-textSecondary hover:text-text transition-colors",
                "max-w-[200px] truncate"
              )}
              aria-label={item["aria-label"] || item.label}
            >
              {content}
            </Link>
          ) : (
            <span
              className={cn(
                isLast ? "text-text font-medium" : "text-textSecondary",
                "max-w-[200px] truncate"
              )}
              aria-current={isLast ? "page" : undefined}
            >
              {content}
            </span>
          )}
          {!isLast && <span className="flex-shrink-0">{getSeparator()}</span>}
        </li>
      );
    };

    // Mobile back button variant
    if (mobileVariant === "back-only" && items.length > 1) {
      const previousItem = items[items.length - 2];
      return (
        <nav
          ref={ref}
          className={cn("flex md:hidden items-center text-sm", className)}
          aria-label="Breadcrumb"
        >
          {showBackButton && previousItem.href && (
            <Link
              href={previousItem.href}
              className="flex items-center gap-2 text-textSecondary hover:text-text transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to {previousItem.label}</span>
            </Link>
          )}
        </nav>
      );
    }

    // Mobile compact variant
    if (mobileVariant === "compact" && items.length > 1) {
      const currentItem = items[items.length - 1];
      const previousItem = items[items.length - 2];

      return (
        <>
          {/* Mobile compact */}
          <nav
            ref={ref}
            className={cn("flex md:hidden items-center text-sm", className)}
            aria-label="Breadcrumb"
          >
            {showBackButton && previousItem.href && (
              <Link
                href={previousItem.href}
                className="flex items-center gap-1 text-textSecondary hover:text-text transition-colors mr-2"
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>
            )}
            <span className="text-text font-medium truncate">
              {currentItem.label}
            </span>
          </nav>

          {/* Desktop full */}
          <nav
            className={cn("hidden md:flex items-center text-sm", className)}
            aria-label="Breadcrumb"
          >
            <ol className="flex items-center flex-wrap gap-y-2">
              {displayItems.map(renderBreadcrumb)}
            </ol>
          </nav>
        </>
      );
    }

    // Full breadcrumb (mobile + desktop)
    return (
      <nav
        ref={ref}
        className={cn("flex items-center text-sm", className)}
        aria-label="Breadcrumb"
      >
        <ol className="flex items-center flex-wrap gap-y-2">
          {displayItems.map(renderBreadcrumb)}
        </ol>

        {/* Schema.org structured data for SEO */}
        {includeSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                itemListElement: items.map((item, index) => ({
                  "@type": "ListItem",
                  position: index + 1,
                  name: item.label,
                  ...(item.href && {
                    item: `${
                      typeof window !== "undefined"
                        ? window.location.origin
                        : ""
                    }${item.href}`,
                  }),
                })),
              }),
            }}
          />
        )}
      </nav>
    );
  }
);

BreadcrumbNav.displayName = "BreadcrumbNav";

/**
 * Hook for managing breadcrumb navigation
 *
 * @example
 * ```tsx
 * const { breadcrumbs, addBreadcrumb, setBreadcrumbs } = useBreadcrumbs([
 *   { label: 'Dashboard', href: '/dashboard' }
 * ]);
 *
 * // Add a breadcrumb
 * addBreadcrumb({ label: 'Products', href: '/products' });
 *
 * return <BreadcrumbNav items={breadcrumbs} />;
 * ```
 */
export function useBreadcrumbs(initialBreadcrumbs: BreadcrumbItem[] = []) {
  const [breadcrumbs, setBreadcrumbs] =
    React.useState<BreadcrumbItem[]>(initialBreadcrumbs);

  const addBreadcrumb = (item: BreadcrumbItem) => {
    setBreadcrumbs((prev) => [...prev, item]);
  };

  const removeBreadcrumb = (index: number) => {
    setBreadcrumbs((prev) => prev.filter((_, i) => i !== index));
  };

  const clearBreadcrumbs = () => {
    setBreadcrumbs([]);
  };

  return {
    breadcrumbs,
    setBreadcrumbs,
    addBreadcrumb,
    removeBreadcrumb,
    clearBreadcrumbs,
  };
}
