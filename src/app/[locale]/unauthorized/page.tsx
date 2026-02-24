/**
 * 401 Unauthorized Page
 *
 * Displays when a user tries to access a protected resource without proper authentication.
 * Automatically redirects to home page after 5 seconds.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components";
import { UI_LABELS, ROUTES, THEME_CONSTANTS } from "@/constants";

export default function UnauthorizedPage() {
  const router = useRouter();
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
        <h1
          className={`${typography.h1} ${themed.textPrimary} ${spacing.margin.bottom.md}`}
        >
          {UI_LABELS.ERROR_PAGES.UNAUTHORIZED.TITLE}
        </h1>

        {/* Error Description */}
        <p
          className={`${typography.body} ${themed.textSecondary} ${spacing.margin.bottom.xl}`}
        >
          {UI_LABELS.ERROR_PAGES.UNAUTHORIZED.DESCRIPTION}
        </p>

        {/* Countdown Message */}
        <div
          className={`${themed.bgSecondary} ${themed.border} ${THEME_CONSTANTS.borderRadius.lg} ${spacing.padding.md} ${spacing.margin.bottom.xl}`}
        >
          <p className={`${typography.body} ${themed.textSecondary}`}>
            {UI_LABELS.AUTH.REDIRECTING_IN}{" "}
            <span className={THEME_CONSTANTS.text.emphasis}>{countdown}</span>{" "}
            {UI_LABELS.AUTH.SECONDS}
          </p>
        </div>

        {/* Action Buttons */}
        <div
          className={`${THEME_CONSTANTS.layout.flexCenter} ${spacing.gap.md} flex-col sm:flex-row`}
        >
          <Link href={ROUTES.AUTH.LOGIN}>
            <Button
              variant="primary"
              size="lg"
              className={THEME_CONSTANTS.button.minWidth}
            >
              {UI_LABELS.ACTIONS.LOGIN}
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push(ROUTES.HOME)}
            className={THEME_CONSTANTS.button.minWidth}
          >
            {UI_LABELS.ACTIONS.GO_HOME_NOW}
          </Button>
        </div>
      </div>
    </div>
  );
}
