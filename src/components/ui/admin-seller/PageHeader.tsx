"use client";

import React from "react";
import { UnifiedBadge } from "@/components/ui/unified/Badge";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export interface Breadcrumb {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  badge?: {
    text: string;
    variant?: "default" | "primary" | "success" | "warning" | "error";
  };
  actions?: React.ReactNode;
  tabs?: React.ReactNode;
  search?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  badge,
  actions,
  tabs,
  search,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-sm animate-fadeIn">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-textSecondary" />
              )}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="text-textSecondary hover:text-primary transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-text font-medium">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Title section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-slideUp">
        {/* Title and description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold text-text">
              {title}
            </h1>
            {badge && (
              <UnifiedBadge variant={badge.variant || "default"}>
                {badge.text}
              </UnifiedBadge>
            )}
          </div>
          {description && (
            <p className="mt-2 text-textSecondary max-w-3xl">{description}</p>
          )}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
        )}
      </div>

      {/* Search bar */}
      {search && <div className="animate-fadeIn">{search}</div>}

      {/* Tabs */}
      {tabs && (
        <div className="border-b border-border animate-fadeIn">{tabs}</div>
      )}
    </div>
  );
}
