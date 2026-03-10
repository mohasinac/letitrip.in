"use client";

import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";
import { Heading, Text } from "@/components";

const { themed, spacing, typography, flex } = THEME_CONSTANTS;

export function OrderSuccessHero() {
  const t = useTranslations("orderSuccess");
  return (
    <div
      className={`${themed.bgSecondary} rounded-xl p-8 text-center ${spacing.stack} mb-6`}
    >
      <div
        className={`w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full ${flex.center} mx-auto`}
      >
        <svg
          className="w-10 h-10 text-green-600 dark:text-green-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <Heading level={1} className={typography.h2}>
        {t("title")}
      </Heading>
      <Text variant="secondary">{t("subtitle")}</Text>
      <Text size="sm" variant="secondary">
        {t("emailSent")}
      </Text>
    </div>
  );
}
