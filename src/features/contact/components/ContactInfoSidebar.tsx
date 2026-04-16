"use client";

import { ROUTES } from "@/constants/routes";
import { SITE_CONFIG } from "@/constants/site";
import { ContactInfoSidebar as AppkitContactInfoSidebar } from "@mohasinac/appkit/features/contact";
import { TextLink } from "@/components";
import { Text } from "@mohasinac/appkit/ui";
import { useTranslations } from "next-intl";

export function ContactInfoSidebar() {
  const t = useTranslations("contact");

  return (
    <AppkitContactInfoSidebar
      infoItems={[
        {
          icon: "\u2709\uFE0F",
          label: t("infoEmailLabel"),
          value: SITE_CONFIG.contact.email,
        },
        {
          icon: "\uD83D\uDCDE",
          label: t("infoPhoneLabel"),
          value: SITE_CONFIG.contact.phone,
        },
        {
          icon: "\uD83D\uDCCD",
          label: t("infoAddressLabel"),
          value: SITE_CONFIG.contact.address,
        },
        {
          icon: "\uD83D\uDD50",
          label: t("infoHoursLabel"),
          value: t("infoHoursValue"),
        },
      ]}
      labels={{ title: t("infoGetInTouch") }}
      renderActions={() => (
        <div className="mt-8 p-4 rounded-xl bg-secondary/10 dark:bg-slate-800/60 border border-neutral-200 dark:border-slate-700">
          <Text className="text-sm text-neutral-500">
            {t("faqLink")}{" "}
            <TextLink href={ROUTES.PUBLIC.FAQS}>{t("faqsLinkText")}</TextLink>
          </Text>
        </div>
      )}
    />
  );
}

