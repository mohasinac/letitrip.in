/**
 * 404 Not Found Page
 *
 * Displays when a user navigates to a non-existent route.
 * Provides navigation back to home page.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/not-found
 */

"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button, Heading, Text, Span } from "@/components";
import { ROUTES, THEME_CONSTANTS } from "@/constants";

export default function NotFound() {
  const { themed, spacing, typography, flex } = THEME_CONSTANTS;
  const tError = useTranslations("errorPages");
  const tActions = useTranslations("actions");
  const router = useRouter();

  return (
    <div
      className={`min-h-screen ${flex.center} ${themed.bgPrimary} ${spacing.padding.xl}`}
    >
      <div
        className={`${THEME_CONSTANTS.container["2xl"]} w-full text-center ${spacing.stack}`}
      >
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
          <Span className="text-8xl md:text-9xl font-bold opacity-10">404</Span>
        </div>

        {/* Error Title */}
        <Heading level={1} className="mb-4">
          {tError("notFound.title")}
        </Heading>

        {/* Error Description */}
        <Text variant="secondary" className="mb-8">
          {tError("notFound.description")}
        </Text>

        {/* Action Button */}
        <div className="flex justify-center">
          <Button
            variant="primary"
            size="lg"
            className="min-w-[200px]"
            onClick={() => router.push(ROUTES.HOME)}
          >
            {tActions("goHome")}
          </Button>
        </div>
      </div>
    </div>
  );
}
