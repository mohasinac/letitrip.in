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
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Heading, Text, Button } from "@mohasinac/appkit/ui";

import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { logger } from "@mohasinac/appkit/core";
import { nowISO } from "@/utils";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error using centralized Logger with file logging enabled
    logger.error("Application Runtime Error", {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: nowISO(),
      type: "runtime-error",
    });
  }, [error]);

  const tError = useTranslations("errorPages");
  const tActions = useTranslations("actions");
  const router = useRouter();
  const { themed, spacing, typography, flex } = THEME_CONSTANTS;

  return (
    <div className={`min-h-screen ${flex.center} ${themed.bgPrimary} p-8`}>
      <div
        className={`${THEME_CONSTANTS.container["2xl"]} w-full text-center ${spacing.stack}`}
      >
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
        <Heading level={1} className="mb-4">
          {tError("genericError.title")}
        </Heading>

        {/* Error Description */}
        <Text variant="secondary" className="mb-6">
          {tError("genericError.description")}
        </Text>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === "development" && error.message && (
          <div
            className={`bg-red-50 dark:bg-red-900/20 ${themed.border} rounded-lg p-4 mb-6 text-left`}
          >
            <Text size="sm" variant="error" className="font-mono break-all">
              <strong>Error:</strong> {error.message}
            </Text>
            {error.digest && (
              <Text size="sm" variant="secondary" className="font-mono mt-2">
                <strong>Digest:</strong> {error.digest}
              </Text>
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
            {tActions("retry")}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="min-w-[200px] w-full"
            onClick={() => router.push(ROUTES.HOME)}
          >
            {tActions("goHome")}
          </Button>
        </div>
      </div>
    </div>
  );
}
