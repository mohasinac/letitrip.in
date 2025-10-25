"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRightIcon, HomeIcon } from "@heroicons/react/24/outline";
import { ROUTE_GROUPS, getRouteGroup } from "@/constants/routes";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface BreadcrumbProps {
  className?: string;
  maxItems?: number;
}

export default function Breadcrumb({
  className = "",
  maxItems = 5,
}: BreadcrumbProps) {
  const pathname = usePathname();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Always start with home
    breadcrumbs.push({
      label: "Home",
      href: "/",
    });

    let currentPath = "";

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += `/${segment}`;
      const isLast = i === segments.length - 1;

      // Generate readable labels
      let label = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      // Handle special cases
      switch (segment) {
        case "account":
          label = "Account";
          break;
        case "seller":
          label = "Seller Panel";
          break;
        case "admin":
          label = "Admin Panel";
          break;
        case "auth":
          label = "Authentication";
          break;
        case "shop":
          label = "Shop";
          break;
        case "dev":
          label = "Development";
          break;
        default:
          // Handle nested segments better
          if (segments[i - 1] === "settings") {
            label = `${label} Settings`;
          } else if (segments[i - 1] === "products") {
            if (segment === "all") label = "All Products";
            else if (segment === "new") label = "Add Product";
            else if (segment === "inventory") label = "Inventory";
          } else if (segments[i - 1] === "orders") {
            if (segment === "pending") label = "Pending Orders";
            else if (segment === "processing") label = "Processing Orders";
            else if (segment === "shipped") label = "Shipped Orders";
            else if (segment === "completed") label = "Completed Orders";
          }
      }

      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath,
        isActive: isLast,
      });
    }

    // Limit breadcrumbs if maxItems is set
    if (breadcrumbs.length > maxItems) {
      const start = breadcrumbs.slice(0, 1); // Keep home
      const end = breadcrumbs.slice(-(maxItems - 2)); // Keep last items
      return [...start, { label: "...", href: undefined }, ...end];
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();
  const routeGroup = getRouteGroup(pathname);

  // Don't show breadcrumbs on home page
  if (pathname === "/") {
    return null;
  }

  // Style based on route group
  const getGroupStyles = () => {
    switch (routeGroup) {
      case ROUTE_GROUPS.ADMIN:
        return "border-red-200 bg-red-50";
      case ROUTE_GROUPS.SELLER:
        return "border-purple-200 bg-purple-50";
      case ROUTE_GROUPS.ACCOUNT:
        return "border-blue-200 bg-blue-50";
      case ROUTE_GROUPS.SHOP:
        return "border-green-200 bg-green-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  return (
    <nav
      className={`flex items-center space-x-1 text-sm p-3 rounded-lg border ${getGroupStyles()} ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1">
        {breadcrumbs.map((crumb, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-2" />
            )}

            {crumb.href ? (
              <Link
                href={crumb.href}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                {index === 0 && <HomeIcon className="h-4 w-4 mr-1" />}
                {crumb.label}
              </Link>
            ) : crumb.label === "..." ? (
              <span className="text-gray-400 px-1">...</span>
            ) : (
              <span
                className={`flex items-center font-medium ${
                  crumb.isActive ? "text-gray-900" : "text-gray-600"
                }`}
              >
                {index === 0 && <HomeIcon className="h-4 w-4 mr-1" />}
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
