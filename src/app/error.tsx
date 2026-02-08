"use client";

/**
 * Error Page Component
 *
 * Catches runtime errors in the app and displays a user-friendly error page.
 * Provides options to retry or return to home page.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/error
 */

import { useEffect } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { UI_LABELS, ROUTES } from "@/constants";
import { THEME_CONSTANTS } from "@/constants/theme";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console (in production, send to error tracking service)
    console.error("Application Error:", error);
  }, [error]);

  const { themed, spacing, typography, borderRadius } = THEME_CONSTANTS;

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${themed.bgPrimary} ${spacing.padding.xl}`}
    >
      <div className={`max-w-2xl w-full text-center ${spacing.stack}`}>
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div
            className={`${themed.bgSecondary} ${themed.border} rounded-full p-8 inline-block`}
          >
            <svg
              className={`w-16 h-16 ${themed.textError}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Error Title */}
        <h1 className={`${typography.h1} ${themed.textPrimary} mb-4`}>
          {UI_LABELS.ERROR_PAGES.GENERIC_ERROR.TITLE}
        </h1>

        {/* Error Description */}
        <p className={`${typography.body} ${themed.textSecondary} mb-6`}>
          {UI_LABELS.ERROR_PAGES.GENERIC_ERROR.DESCRIPTION}
        </p>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === "development" && error.message && (
          <div
            className={`${themed.bgError} ${themed.border} ${borderRadius.lg} ${spacing.padding.md} mb-6 text-left`}
          >
            <p
              className={`${typography.small} ${themed.textError} font-mono break-all`}
            >
              <strong>Error:</strong> {error.message}
            </p>
            {error.digest && (
              <p
                className={`${typography.small} ${themed.textSecondary} font-mono mt-2`}
              >
                <strong>Digest:</strong> {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={reset}
            className="min-w-[200px]"
          >
            {UI_LABELS.ACTIONS.RETRY}
          </Button>
          <Link href={ROUTES.HOME}>
            <Button
              variant="outline"
              size="lg"
              className="min-w-[200px] w-full"
            >
              {UI_LABELS.ACTIONS.BACK} to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
