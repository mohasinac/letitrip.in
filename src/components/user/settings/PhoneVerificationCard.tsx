"use client";

import { Card, Button, Badge, Text } from "@/components";
import { UI_LABELS, THEME_CONSTANTS } from "@/constants";

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
  const { spacing, typography } = THEME_CONSTANTS;

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
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className={typography.cardTitle}>Phone Verification</h3>
            {hasPhone && (
              <Text className={`${typography.cardBody} mt-1`}>{phone}</Text>
            )}
          </div>

          {hasPhone && (
            <Badge variant={isVerified ? "success" : "warning"}>
              {isVerified ? "Verified" : "Not Verified"}
            </Badge>
          )}
        </div>

        {/* Status Message */}
        <Text className={typography.cardBody}>
          {!hasPhone
            ? "Add a phone number to enable SMS notifications and two-factor authentication."
            : isVerified
              ? "Your phone number has been verified."
              : "Verify your phone number to enable SMS notifications."}
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
            {isLoading ? "Verifying..." : "Verify Phone Number"}
          </Button>
        )}
      </div>
    </Card>
  );
}
