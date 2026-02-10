"use client";

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
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  actionDisabled?: boolean;
  className?: string;
}

export function AdminPageHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  actionIcon,
  actionDisabled = false,
  className = "",
}: AdminPageHeaderProps) {
  const { pageHeader, typography, spacing } = THEME_CONSTANTS;

  return (
    <div className={`${pageHeader.adminGradient} ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className={spacing.stackSmall}>
          <Heading level={2} className={typography.pageTitle}>
            {title}
          </Heading>
          {subtitle && (
            <Text className={typography.pageSubtitle}>{subtitle}</Text>
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
