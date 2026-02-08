/**
 * 404 Not Found Page
 *
 * Displays when a user navigates to a non-existent route.
 * Provides navigation back to home page.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/not-found
 */

import Link from "next/link";
import Button from "@/components/ui/Button";
import { UI_LABELS, ROUTES } from "@/constants";
import { THEME_CONSTANTS } from "@/constants/theme";

export default function NotFound() {
  const { themed, spacing, typography, borderRadius } = THEME_CONSTANTS;

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${themed.bgPrimary} ${spacing.padding.xl}`}
    >
      <div className={`max-w-2xl w-full text-center ${spacing.stack}`}>
        {/* 404 Icon */}
        <div className="flex justify-center mb-6">
          <div
            className={`${themed.bgSecondary} ${themed.border} rounded-full p-8 inline-block`}
          >
            <svg
              className={`w-16 h-16 ${themed.textSecondary}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Large 404 Text */}
        <div className={`${themed.textPrimary} mb-4`}>
          <span className="text-8xl md:text-9xl font-bold opacity-10">404</span>
        </div>

        {/* Error Title */}
        <h1 className={`${typography.h1} ${themed.textPrimary} mb-4`}>
          {UI_LABELS.ERROR_PAGES.NOT_FOUND.TITLE}
        </h1>

        {/* Error Description */}
        <p className={`${typography.body} ${themed.textSecondary} mb-8`}>
          {UI_LABELS.ERROR_PAGES.NOT_FOUND.DESCRIPTION}
        </p>

        {/* Action Button */}
        <div className="flex justify-center">
          <Link href={ROUTES.HOME}>
            <Button variant="primary" size="lg" className="min-w-[200px]">
              {UI_LABELS.ACTIONS.BACK} to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
