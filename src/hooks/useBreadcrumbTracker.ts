import { useEffect, useMemo } from "react";
import { BreadcrumbItem } from "@/components/shared/Breadcrumb";
import { useBreadcrumb } from "@/contexts/BreadcrumbContext";
import { Category } from "@/types";

interface UseBreadcrumbTrackerOptions {
  enabled?: boolean;
  includeHome?: boolean;
  homeLabel?: string;
  homeHref?: string;
}

/**
 * Hook to manage breadcrumb navigation
 * Automatically updates breadcrumb trail based on current page
 */
export const useBreadcrumbTracker = (
  breadcrumbItems: BreadcrumbItem[],
  options: UseBreadcrumbTrackerOptions = {},
) => {
  const {
    enabled = true,
    includeHome = true,
    homeLabel = "Home",
    homeHref = "/",
  } = options;

  const { setBreadcrumbItems } = useBreadcrumb();

  // Memoize the breadcrumb items to prevent infinite loops
  const memoizedItems = useMemo(() => {
    if (!enabled) return [];

    const items: BreadcrumbItem[] = [];

    if (includeHome) {
      items.push({
        label: homeLabel,
        href: homeHref,
      });
    }

    items.push(...breadcrumbItems);

    return items;
  }, [
    breadcrumbItems.length,
    enabled,
    includeHome,
    homeLabel,
    homeHref,
    // Stringify items to compare by value, not reference
    JSON.stringify(breadcrumbItems),
  ]);

  useEffect(() => {
    if (!enabled || memoizedItems.length === 0) return;

    setBreadcrumbItems(memoizedItems);
  }, [memoizedItems, enabled, setBreadcrumbItems]);
};

/**
 * Build breadcrumb from category hierarchy
 */
export const buildCategoryBreadcrumb = (
  category: Category,
  allCategories: Category[],
): BreadcrumbItem[] => {
  const breadcrumb: BreadcrumbItem[] = [];
  let current: Category | undefined = category;

  while (current) {
    breadcrumb.unshift({
      label: current.name,
      href: `/categories/${current.slug}`,
      active: current.id === category.id,
    });

    if (current.parentId) {
      current = allCategories.find((cat) => cat.id === current!.parentId);
    } else {
      break;
    }
  }

  return breadcrumb;
};

/**
 * Build breadcrumb for product page
 */
export const buildProductBreadcrumb = (
  productName: string,
  category: Category | undefined,
  allCategories: Category[],
): BreadcrumbItem[] => {
  const breadcrumb: BreadcrumbItem[] = [];

  // Add category breadcrumb if available
  if (category) {
    let current: Category | undefined = category;
    const categoryBreadcrumbs: BreadcrumbItem[] = [];

    while (current) {
      categoryBreadcrumbs.unshift({
        label: current.name,
        href: `/categories/${current.slug}`,
      });

      if (current.parentId) {
        current = allCategories.find((cat) => cat.id === current!.parentId);
      } else {
        break;
      }
    }

    breadcrumb.push(...categoryBreadcrumbs);
  }

  // Add current product
  breadcrumb.push({
    label: productName,
    href: "#",
    active: true,
  });

  return breadcrumb;
};

/**
 * Build breadcrumb for custom path
 * Converts URL segments to breadcrumb items
 */
export const buildPathBreadcrumb = (pathname: string): BreadcrumbItem[] => {
  if (pathname === "/" || !pathname) {
    return [];
  }

  const segments = pathname.split("/").filter((segment) => segment.length > 0);

  return segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return {
      label,
      href,
      active: index === segments.length - 1,
    };
  });
};
