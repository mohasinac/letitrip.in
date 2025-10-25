// Enhanced Breadcrumb component for the new structure
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { PUBLIC_ROUTES } from "@/constants/routes";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrentPage?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const generateBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Home", href: PUBLIC_ROUTES.HOME },
  ];

  let currentPath = "";
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;

    // Convert segment to readable label
    const label = segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    breadcrumbs.push({
      label,
      href: isLast ? undefined : currentPath,
      isCurrentPage: isLast,
    });
  });

  return breadcrumbs;
};

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  className = "",
}) => {
  const pathname = usePathname();
  const breadcrumbItems = items || generateBreadcrumbs(pathname);

  if (breadcrumbItems.length <= 1) return null;

  return (
    <nav
      className={`flex items-center space-x-2 text-sm text-muted-foreground ${className}`}
    >
      {breadcrumbItems.map((item, index) => (
        <div key={item.href || item.label} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground/60" />
          )}

          {index === 0 && <Home className="w-4 h-4 mr-1" />}

          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-foreground transition-colors duration-200"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb;
