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
import { logger } from "@/classes";
import { UI_LABELS, ROUTES, THEME_CONSTANTS } from "@/constants";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log critical error using centralized Logger
    logger.error("Global Critical Error", {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
      type: "global-error",
    });
  }, [error]);

  const { themed, spacing, typography, borderRadius } = THEME_CONSTANTS;

  return (
    <html>
      <body>
        <div
          className={`min-h-screen flex items-center justify-center ${themed.bgPrimary} ${spacing.padding.xl}`}
        >
          <div className={`max-w-2xl w-full text-center ${spacing.stack}`}>
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
            <h1 className={`${typography.h1} ${themed.textPrimary} mb-4`}>
              {UI_LABELS.ERROR_PAGES.CRITICAL_ERROR.TITLE}
            </h1>

            {/* Error Description */}
            <p className={`${typography.body} ${themed.textSecondary} mb-8`}>
              {UI_LABELS.ERROR_PAGES.CRITICAL_ERROR.DESCRIPTION}
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === "development" && error.message && (
              <div
                className={`bg-red-50 dark:bg-red-900/20 ${themed.border} ${borderRadius.lg} ${spacing.padding.md} mb-8 text-left`}
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
            <div className="flex flex-col gap-4 items-center">
              <button
                onClick={reset}
                className={`bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 ${borderRadius.lg} border-none text-lg font-medium cursor-pointer min-w-[200px] transition-colors`}
              >
                {UI_LABELS.ACTIONS.RETRY}
              </button>
              <a
                href={ROUTES.HOME}
                className={`${themed.bgPrimary} hover:bg-blue-50 text-blue-500 px-6 py-3 ${borderRadius.lg} ${themed.border} border-2 border-blue-500 text-lg font-medium no-underline inline-block min-w-[200px] transition-colors`}
              >
                {UI_LABELS.ACTIONS.BACK} to Home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
