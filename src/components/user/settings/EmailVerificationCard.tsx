"use client";

import { Card, Button, Badge, Text } from "@/components";
import { UI_LABELS, THEME_CONSTANTS } from "@/constants";

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
  const { spacing, typography } = THEME_CONSTANTS;

  const cardVariant = isVerified ? "gradient-teal" : "gradient-amber";

  return (
    <Card
      variant={cardVariant}
      className={`${spacing.cardPadding} ${className}`}
    >
      <div className={spacing.stack}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className={typography.cardTitle}>Email Verification</h3>
            <Text className={`${typography.cardBody} mt-1`}>{email}</Text>
          </div>

          <Badge variant={isVerified ? "success" : "warning"}>
            {isVerified ? "Verified" : "Not Verified"}
          </Badge>
        </div>

        {/* Status Message */}
        <Text className={typography.cardBody}>
          {isVerified
            ? "Your email address has been verified."
            : "Please verify your email address to access all features."}
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
            {isLoading ? "Sending..." : "Resend Verification Email"}
          </Button>
        )}
      </div>
    </Card>
  );
}
