"use client";

import { useTranslations } from "next-intl";
import { Card, Button, Badge } from "@/components";
import { Heading, Text } from "@mohasinac/appkit/ui";
import { THEME_CONSTANTS } from "@/constants";

/**
 * PhoneVerificationCard Component
 *
 * Shows phone verification status with verify CTA.
 * Uses card.gradient variants based on status.
 *
 * @example
 * ```tsx
 * <PhoneVerificationCard
 *   phone="+1234567890"
 *   isVerified={false}
 *   onVerify={handleVerify}
 *   isLoading={verifying}
 * />
 * ```
 */

interface PhoneVerificationCardProps {
  phone?: string;
  isVerified: boolean;
  onVerify?: () => void | Promise<void>;
  isLoading?: boolean;
  className?: string;
}

export function PhoneVerificationCard({
  phone,
  isVerified,
  onVerify,
  isLoading = false,
  className = "",
}: PhoneVerificationCardProps) {
  const t = useTranslations("userSettings");
  const { spacing, typography, flex } = THEME_CONSTANTS;

  const cardVariant = isVerified
    ? "gradient-teal"
    : phone
      ? "gradient-amber"
      : "default";
  const hasPhone = phone && phone.trim() !== "";

  return (
    <Card
      variant={cardVariant}
      className={`${spacing.cardPadding} ${className}`}
    >
      <div className={spacing.stack}>
        {/* Header */}
        <div className={`${flex.betweenStart} gap-3`}>
          <div>
            <Heading level={3}>{t("phoneVerificationTitle")}</Heading>
            {hasPhone && (
              <Text className={`${typography.cardBody} mt-1`}>{phone}</Text>
            )}
          </div>

          {hasPhone && (
            <Badge variant={isVerified ? "success" : "warning"}>
              {isVerified ? t("verified") : t("notVerified")}
            </Badge>
          )}
        </div>

        {/* Status Message */}
        <Text className={typography.cardBody}>
          {!hasPhone
            ? t("phoneNotAdded")
            : isVerified
              ? t("phoneVerifiedMessage")
              : t("phoneNotVerifiedMessage")}
        </Text>

        {/* Verify Button */}
        {hasPhone && !isVerified && onVerify && (
          <Button
            variant="warning"
            size="sm"
            onClick={onVerify}
            disabled={isLoading}
            className="self-start"
          >
            {isLoading ? t("verifying") : t("verify")}
          </Button>
        )}
      </div>
    </Card>
  );
}
