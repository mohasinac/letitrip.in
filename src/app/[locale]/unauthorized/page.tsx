/**
 * 401 Unauthorized Page
 *
 * Displays when a user tries to access a protected resource without proper authentication.
 * Automatically redirects to home page after 5 seconds.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button, Heading, Span, Text } from "@/components";
import { ROUTES, THEME_CONSTANTS } from "@/constants";

export default function UnauthorizedPage() {
  const router = useRouter();
  const tError = useTranslations("errorPages");
  const tAuth = useTranslations("auth");
  const tActions = useTranslations("actions");
  const [countdown, setCountdown] = useState(5);
  const { themed, spacing, typography } = THEME_CONSTANTS;

  useEffect(() => {
    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push(ROUTES.HOME);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div
      className={`${THEME_CONSTANTS.layout.fullScreen} ${THEME_CONSTANTS.layout.flexCenter} ${themed.bgPrimary} ${spacing.padding.xl}`}
    >
      <div
        className={`${THEME_CONSTANTS.container.xl} ${THEME_CONSTANTS.layout.centerText} ${spacing.stack}`}
      >
        {/* Unauthorized Icon */}
        <div
          className={`${THEME_CONSTANTS.layout.flexCenter} ${spacing.margin.bottom.xl}`}
        >
          <div
            className={`${themed.bgSecondary} ${themed.border} ${THEME_CONSTANTS.borderRadius.full} ${spacing.padding.xl} inline-block`}
          >
            <svg
              className={THEME_CONSTANTS.iconSize.xl}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        </div>

        {/* Large 401 Text */}
        <div className={`${themed.textPrimary} ${spacing.margin.bottom.md}`}>
          <span
            className={`${typography.display} ${THEME_CONSTANTS.opacity.low}`}
          >
            401
          </span>
        </div>

        {/* Error Title */}
        <Heading
          level={1}
          className={`${typography.h1} ${themed.textPrimary} ${spacing.margin.bottom.md}`}
        >
          {tError("unauthorized.title")}
        </Heading>

        {/* Error Description */}
        <Text variant="secondary" className={spacing.margin.bottom.xl}>
          {tError("unauthorized.description")}
        </Text>

        {/* Countdown Message */}
        <div
          className={`${themed.bgSecondary} ${themed.border} ${THEME_CONSTANTS.borderRadius.lg} ${spacing.padding.md} ${spacing.margin.bottom.xl}`}
        >
          <Text variant="secondary">
            {tAuth("redirectingIn")}{" "}
            <Span className={THEME_CONSTANTS.text.emphasis}>{countdown}</Span>{" "}
            {tAuth("seconds")}
          </Text>
        </div>

        {/* Action Buttons */}
        <div
          className={`${THEME_CONSTANTS.layout.flexCenter} ${spacing.gap.md} flex-col sm:flex-row`}
        >
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push(ROUTES.AUTH.LOGIN)}
            className={THEME_CONSTANTS.button.minWidth}
          >
            {tActions("login")}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push(ROUTES.HOME)}
            className={THEME_CONSTANTS.button.minWidth}
          >
            {tActions("goHomeNow")}
          </Button>
        </div>
      </div>
    </div>
  );
}
