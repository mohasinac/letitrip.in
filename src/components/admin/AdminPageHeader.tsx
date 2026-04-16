"use client";

import {
  AdminPageHeader as AppkitAdminPageHeader,
  type AdminPageHeaderProps as AppkitAdminPageHeaderProps,
} from "@mohasinac/appkit/features/admin";
import { TextLink } from "@/components/typography/TextLink";
import { THEME_CONSTANTS } from "@/constants";

/**
 * AdminPageHeader — Thin letitrip adapter
 *
 * Wraps appkit AdminPageHeader and injects letitrip theme constants
 * and TextLink component.
 */

export type AdminPageHeaderProps = AppkitAdminPageHeaderProps;

export function AdminPageHeader(props: AdminPageHeaderProps) {
  const { pageHeader, typography, spacing } = THEME_CONSTANTS;

  return (
    <AppkitAdminPageHeader
      {...props}
      themeConfig={{
        gradient: pageHeader.adminGradient,
        titleClass: typography.pageTitle,
        subtitleClass: typography.pageSubtitle,
        spacingClass: spacing.stackSmall,
        TextLink,
        ...props.themeConfig,
      }}
    />
  );
}

