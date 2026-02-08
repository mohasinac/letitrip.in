/**
 * 401 Unauthorized Page
 *
 * Displays when a user tries to access a protected resource without proper authentication.
 * Provides options to login or return to home page.
 */

import Link from "next/link";
import Button from "@/components/ui/Button";
import { UI_LABELS, ROUTES } from "@/constants";
import { THEME_CONSTANTS } from "@/constants/theme";

export default function UnauthorizedPage() {
  const { themed, spacing, typography } = THEME_CONSTANTS;

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${themed.bgPrimary} ${spacing.padding.xl}`}
    >
      <div className={`max-w-2xl w-full text-center ${spacing.stack}`}>
        {/* Unauthorized Icon */}
        <div className="flex justify-center mb-6">
          <div
            className={`${themed.bgSecondary} ${themed.border} rounded-full p-8 inline-block`}
          >
            <svg
              className={`w-16 h-16 ${themed.textWarning}`}
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
        <div className={`${themed.textPrimary} mb-4`}>
          <span className="text-8xl md:text-9xl font-bold opacity-10">401</span>
        </div>

        {/* Error Title */}
        <h1 className={`${typography.h1} ${themed.textPrimary} mb-4`}>
          {UI_LABELS.ERROR_PAGES.UNAUTHORIZED.TITLE}
        </h1>

        {/* Error Description */}
        <p className={`${typography.body} ${themed.textSecondary} mb-8`}>
          {UI_LABELS.ERROR_PAGES.UNAUTHORIZED.DESCRIPTION}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={ROUTES.AUTH.LOGIN}>
            <Button
              variant="primary"
              size="lg"
              className="min-w-[200px] w-full"
            >
              Login
            </Button>
          </Link>
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
