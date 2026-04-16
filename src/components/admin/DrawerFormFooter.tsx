"use client";

import {
  DrawerFormFooter as AppkitDrawerFormFooter,
  type DrawerFormFooterProps as AppkitDrawerFormFooterProps,
} from "@mohasinac/appkit/features/admin";
import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";

/**
 * DrawerFormFooter — Thin letitrip adapter
 *
 * Wraps appkit DrawerFormFooter and injects letitrip theme constants
 * and locale labels.
 */

export type DrawerFormFooterProps = AppkitDrawerFormFooterProps;

export function DrawerFormFooter(props: DrawerFormFooterProps) {
  const t = useTranslations("actions");
  const tLoading = useTranslations("loading");
  const { themed } = THEME_CONSTANTS;

  return (
    <AppkitDrawerFormFooter
      {...props}
      labels={{
        submit: t("save"),
        delete: t("delete"),
        cancel: t("cancel"),
        saving: tLoading("saving"),
        ...props.labels,
      }}
      themeConfig={{
        borderClass: `border-t ${themed.border}`,
        ...props.themeConfig,
      }}
    />
  );
}

