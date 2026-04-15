"use client";

import { Heading, Text } from "@mohasinac/appkit/ui";
import { Card } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { formatDate } from "@/utils";
import { useTranslations } from "next-intl";

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
  const { spacing, themed } = THEME_CONSTANTS;
  const t = useTranslations("userAccount");

  const formatDateValue = (date: Date | string | null | undefined) => {
    if (!date) return t("never");
    return formatDate(typeof date === "string" ? new Date(date) : date);
  };

  return (
    <Card className={`${spacing.cardPadding} ${className}`}>
      <div className={spacing.stack}>
        <Heading level={3}>{t("accountInfo")}</Heading>

        <div className={`${spacing.stackSmall} ${themed.textSecondary}`}>
          {/* Email */}
          <div>
            <Text size="xs" variant="secondary">
              {t("emailAddress")}
            </Text>
            <Text size="sm" className="font-mono mt-1">
              {email}
            </Text>
          </div>

          {/* User ID */}
          <div>
            <Text size="xs" variant="secondary">
              {t("userId")}
            </Text>
            <Text size="sm" className="font-mono mt-1 break-all">
              {uid}
            </Text>
          </div>

          {/* Account Created */}
          <div>
            <Text size="xs" variant="secondary">
              {t("accountCreated")}
            </Text>
            <Text size="sm" className="mt-1">
              {formatDateValue(createdAt)}
            </Text>
          </div>

          {/* Last Login */}
          <div>
            <Text size="xs" variant="secondary">
              {t("lastLogin")}
            </Text>
            <Text size="sm" className="mt-1">
              {formatDateValue(lastLoginAt)}
            </Text>
          </div>
        </div>
      </div>
    </Card>
  );
}

