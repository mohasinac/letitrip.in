"use client";

import { useTranslations } from "next-intl";
import { Heading, Text } from "@mohasinac/appkit/ui";
import { Card, Button, Badge } from "@/components";
import { THEME_CONSTANTS } from "@/constants";

/**
 * EmailVerificationCard Component
 *
 * Shows email verification status with resend CTA.
 * Uses card.gradient.teal (verified) or card.gradient.amber (unverified).
 *
 * @example
 * ```tsx
 * <EmailVerificationCard
 *   email="user@example.com"
 *   isVerified={false}
 *   onResendVerification={handleResend}
 *   isLoading={sending}
 * />
 * ```
 */

interface EmailVerificationCardProps {
  email: string;
  isVerified: boolean;
  onResendVerification?: () => void | Promise<void>;
  isLoading?: boolean;
  className?: string;
}

export function EmailVerificationCard({
  email,
  isVerified,
  onResendVerification,
  isLoading = false,
  className = "",
}: EmailVerificationCardProps) {
  const t = useTranslations("userSettings");
  const { spacing, typography, flex } = THEME_CONSTANTS;

  const cardVariant = isVerified ? "gradient-teal" : "gradient-amber";

  return (
    <Card
      variant={cardVariant}
      className={`${spacing.cardPadding} ${className}`}
    >
      <div className={spacing.stack}>
        {/* Header */}
        <div className={`${flex.betweenStart} gap-3`}>
          <div>
            <Heading level={3}>{t("emailVerificationTitle")}</Heading>
            <Text className={`${typography.cardBody} mt-1`}>{email}</Text>
          </div>

          <Badge variant={isVerified ? "success" : "warning"}>
            {isVerified ? t("verified") : t("notVerified")}
          </Badge>
        </div>

        {/* Status Message */}
        <Text className={typography.cardBody}>
          {isVerified ? t("verifiedMessage") : t("notVerifiedMessage")}
        </Text>

        {/* Resend Button */}
        {!isVerified && onResendVerification && (
          <Button
            variant="warning"
            size="sm"
            onClick={onResendVerification}
            disabled={isLoading}
            className="self-start"
          >
            {isLoading ? t("sending") : t("resendVerification")}
          </Button>
        )}
      </div>
    </Card>
  );
}
