"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href: string;
  active?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
  homeLabel?: string;
  homeHref?: string;
  divider?: "slash" | "arrow" | "chevron";
}

/**
 * Reusable Breadcrumb Component
 * Can be used with custom items or auto-generated from URL
 */
export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items = [],
  className = "",
  showHome = true,
  homeLabel = "Home",
  homeHref = "/",
  divider = "chevron",
}) => {
  if (!items.length && !showHome) {
    return null;
  }

  const breadcrumbItems: BreadcrumbItem[] = [];

  if (showHome) {
    breadcrumbItems.push({
      label: homeLabel,
      href: homeHref,
    });
  }

  breadcrumbItems.push(
    ...items.map((item, index) => ({
      ...item,
      active: index === items.length - 1 && items.length > 0,
    }))
  );

  const getDivider = () => {
    switch (divider) {
      case "slash":
        return <span className="text-gray-400 mx-1">/</span>;
      case "arrow":
        return <span className="text-gray-400 mx-1">→</span>;
      case "chevron":
      default:
        return (
          <ChevronRight className="w-4 h-4 text-gray-400 mx-1 inline-block" />
        );
    }
  };

  return (
    <nav
      className={`flex items-center text-sm mb-4 ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-0">
        {breadcrumbItems.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index > 0 && getDivider()}
            {item.active ? (
              <span className="text-gray-600 font-medium">{item.label}</span>
            ) : (
              <Link
                href={item.href}
                className="text-primary hover:text-primary-dark transition-colors"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

/**
 * Auto-generating Breadcrumb from URL path
 */
export const AutoBreadcrumb: React.FC<{
  className?: string;
  divider?: "slash" | "arrow" | "chevron";
}> = ({ className = "", divider = "chevron" }) => {
  const pathname = usePathname();

  if (!pathname || pathname === "/") {
    return null;
  }

  const segments = pathname.split("/").filter((segment) => segment.length > 0);

  const items: BreadcrumbItem[] = segments.map((segment, index) => {
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

  return (
    <Breadcrumb
      items={items}
      showHome={true}
      className={className}
      divider={divider}
    />
  );
};

export default Breadcrumb;
