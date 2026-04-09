"use client";

/**
 * Global Error Handler
 *
 * Catches errors in the root layout and provides a fallback UI.
 * This is required for production error handling.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/error#global-errorjs
 */

import { useEffect } from "react";
import { NextIntlClientProvider, useTranslations } from "next-intl";
import { logger } from "@mohasinac/appkit/core";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { Heading, Text, Button, TextLink } from "@/components";
import { nowISO } from "@/utils";
import enMessages from "../../messages/en.json";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

function GlobalErrorContent({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errorPages.criticalError");
  const tActions = useTranslations("actions");
  const { themed, spacing, flex } = THEME_CONSTANTS;

  return (
    <div className={`min-h-screen ${flex.center} ${themed.bgPrimary} p-8`}>
      <div
        className={`${THEME_CONSTANTS.container["2xl"]} w-full text-center ${spacing.stack}`}
      >
        {/* Error Icon */}
        <div className="flex justify-center mb-8">
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
          {t("title")}
        </Heading>

        {/* Error Description */}
        <Text variant="secondary" className="mb-8">
          {t("description")}
        </Text>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === "development" && error.message && (
          <div
            className={`bg-red-50 dark:bg-red-900/20 ${themed.border} rounded-lg p-4 mb-8 text-left`}
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
        <div className="flex flex-col gap-4 items-center">
          <Button
            variant="primary"
            onClick={reset}
            className={`text-lg font-medium min-w-[200px]`}
          >
            {tActions("retry")}
          </Button>
          <TextLink
            href={ROUTES.HOME}
            className={`px-6 py-3 rounded-lg border-2 border-primary text-primary text-lg font-medium min-w-[200px] inline-block text-center`}
          >
            {t("backToHome")}
          </TextLink>
        </div>
      </div>
    </div>
  );
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log critical error using centralized Logger
    logger.error("Global Critical Error", {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: nowISO(),
      type: "global-error",
    });
  }, [error]);

  return (
    <html>
      <body>
        <NextIntlClientProvider messages={enMessages} locale="en">
          <GlobalErrorContent error={error} reset={reset} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
