"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button, Heading, Text } from "@/components";
import { THEME_CONSTANTS } from "@/constants";

/**
 * AdminPageHeader Component
 *
 * Standardized page header for admin pages with optional action button.
 * Uses pageHeader.adminGradient and typography constants from Phase 2.
 *
 * @example
 * ```tsx
 * <AdminPageHeader
 *   title="User Management"
 *   subtitle="Manage user accounts and permissions"
 *   actionLabel="Add User"
 *   onAction={() => setShowUserDrawer(true)}
 * />
 * ```
 */

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  breadcrumb?: Array<{ label: string; href?: string }>;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  actionDisabled?: boolean;
  className?: string;
}

export function AdminPageHeader({
  title,
  subtitle,
  description,
  breadcrumb,
  actionLabel,
  onAction,
  actionIcon,
  actionDisabled = false,
  className = "",
}: AdminPageHeaderProps) {
  const { pageHeader, typography, spacing } = THEME_CONSTANTS;

  return (
    <div className={`${pageHeader.adminGradient} ${className}`}>
      {breadcrumb && breadcrumb.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          className="mb-3 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400"
        >
          {breadcrumb.map((crumb, index) => (
            <span key={index} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="w-3 h-3 flex-shrink-0" />}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-700 dark:text-gray-200 font-medium">
                  {crumb.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className={spacing.stackSmall}>
          <Heading level={2} className={typography.pageTitle}>
            {title}
          </Heading>
          {subtitle && (
            <Text className={typography.pageSubtitle}>{subtitle}</Text>
          )}
          {description && (
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {description}
            </Text>
          )}
        </div>

        {actionLabel && onAction && (
          <Button
            variant="primary"
            onClick={onAction}
            disabled={actionDisabled}
            className="flex-shrink-0"
          >
            {actionIcon}
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
