"use client";

import { Card, Text } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { formatDate } from "@/utils";

/**
 * AccountInfoCard Component
 *
 * Read-only display of user account metadata.
 * Shows UID, account creation date, and last login.
 *
 * @example
 * ```tsx
 * <AccountInfoCard
 *   uid="abc123xyz"
 *   createdAt={new Date("2024-01-15")}
 *   lastLoginAt={new Date("2024-02-10")}
 * />
 * ```
 */

interface AccountInfoCardProps {
  uid: string;
  email: string;
  createdAt: Date | string;
  lastLoginAt?: Date | string | null;
  className?: string;
}

export function AccountInfoCard({
  uid,
  email,
  createdAt,
  lastLoginAt,
  className = "",
}: AccountInfoCardProps) {
  const { spacing, typography, themed } = THEME_CONSTANTS;

  const formatDateValue = (date: Date | string | null | undefined) => {
    if (!date) return "Never";
    return formatDate(typeof date === "string" ? new Date(date) : date);
  };

  return (
    <Card className={`${spacing.cardPadding} ${className}`}>
      <div className={spacing.stack}>
        <h3 className={typography.cardTitle}>Account Information</h3>

        <div className={`${spacing.stackSmall} ${themed.textSecondary}`}>
          {/* Email */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Email Address
            </p>
            <p className="text-sm font-mono mt-1">{email}</p>
          </div>

          {/* User ID */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              User ID
            </p>
            <p className="text-sm font-mono mt-1 break-all">{uid}</p>
          </div>

          {/* Account Created */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Account Created
            </p>
            <p className="text-sm mt-1">{formatDateValue(createdAt)}</p>
          </div>

          {/* Last Login */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Last Login
            </p>
            <p className="text-sm mt-1">{formatDateValue(lastLoginAt)}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
