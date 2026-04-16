"use client";

import {
  AdminFilterBar as AppkitAdminFilterBar,
  type AdminFilterBarProps as AppkitAdminFilterBarProps,
} from "@mohasinac/appkit/features/admin";
import { Card } from "@mohasinac/appkit/ui";
import { THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";

/**
 * AdminFilterBar — Thin letitrip adapter
 *
 * Wraps appkit AdminFilterBar and injects letitrip theme constants,
 * Card component, and locale labels.
 */

export type AdminFilterBarProps = AppkitAdminFilterBarProps;

export function AdminFilterBar(props: AdminFilterBarProps) {
  const { spacing, flex } = THEME_CONSTANTS;
  const t = useTranslations("filters");

  return (
    <AppkitAdminFilterBar
      {...props}
      labels={{
        apply: t("apply"),
        reset: t("reset"),
        applyCount: t("apply"),
        ...props.labels,
      }}
      themeConfig={{
        cardPadding: spacing.cardPadding,
        flexEnd: flex.end,
        Card,
        ...props.themeConfig,
      }}
    />
  );
}

