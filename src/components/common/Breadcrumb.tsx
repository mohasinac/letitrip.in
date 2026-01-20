"use client";

import { ChevronRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import React from "react";

interface BreadcrumbProps {
  currentPath?: string;
  LinkComponent?: React.ComponentType<any>;
  separator?: React.ReactNode;
  className?: string;
}

interface BreadcrumbItem {
  label: string;
  href: string;
}

// Generate breadcrumbs from current path
function generateBreadcrumbs(currentPath: string): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [{ label: "Home", href: "/" }];

  if (!currentPath || currentPath === "/") {
    return breadcrumbs;
  }

  const pathSegments = currentPath.split("/").filter(Boolean);
  let currentHref = "";

  for (let i = 0; i < pathSegments.length; i++) {
    currentHref += `/${pathSegments[i]}`;

    // Generate readable label from path segment
    let label = pathSegments[i]
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

    // Handle special cases
    if (pathSegments[i] === "buy-product-all") {
      label = "All Products";
    } else if (pathSegments[i] === "buy-auction-all") {
      label = "All Auctions";
    } else if (pathSegments[i].startsWith("buy-product")) {
      label = "Products";
    } else if (pathSegments[i].startsWith("buy-auction")) {
      label = "Auctions";
    }

    breadcrumbs.push({
      label,
      href: currentHref,
    });
  }

  return breadcrumbs;
}

export function Breadcrumb({
  currentPath = "",
  LinkComponent = Link,
  separator = <ChevronRightIcon className="w-4 h-4" />,
  className = "",
}: BreadcrumbProps) {
  const breadcrumbs = generateBreadcrumbs(currentPath);

  return (
    <nav aria-label="Breadcrumb" className={`breadcrumb ${className}`}>
      <ol className="flex items-center space-x-2 text-sm">
        {breadcrumbs.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index > 0 && (
              <span className="breadcrumb-separator text-gray-400 dark:text-gray-500 mr-2">
                {separator}
              </span>
            )}
            {index === breadcrumbs.length - 1 ? (
              <span className="text-gray-900 dark:text-white font-medium">
                {item.label}
              </span>
            ) : (
              <LinkComponent
                href={item.href}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                {item.label}
              </LinkComponent>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
