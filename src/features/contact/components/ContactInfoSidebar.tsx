"use client";

import { ROUTES, THEME_CONSTANTS, SITE_CONFIG } from "@/constants";
import { Aside, Heading, Span, Text } from "@mohasinac/appkit/ui";
import { TextLink } from "@/components";
import { useTranslations } from "next-intl";

const { themed, spacing } = THEME_CONSTANTS;

export function ContactInfoSidebar() {
  const t = useTranslations("contact");

  const INFO_ITEMS = [
    {
      icon: "✉️",
      label: t("infoEmailLabel"),
      value: SITE_CONFIG.contact.email,
    },
    {
      icon: "📞",
      label: t("infoPhoneLabel"),
      value: SITE_CONFIG.contact.phone,
    },
    {
      icon: "📍",
      label: t("infoAddressLabel"),
      value: SITE_CONFIG.contact.address,
    },
    {
      icon: "🕐",
      label: t("infoHoursLabel"),
      value: t("infoHoursValue"),
    },
  ];

  return (
    <Aside className="md:col-span-2">
      <Heading level={2} className="mb-6">
        {t("infoGetInTouch")}
      </Heading>
      <div className={spacing.stack}>
        {INFO_ITEMS.map(({ icon, label, value }) => (
          <div key={label} className="flex gap-3">
            <Span className="text-xl shrink-0">{icon}</Span>
            <div>
              <Text
                size="xs"
                className="font-semibold uppercase tracking-wide"
                variant="secondary"
              >
                {label}
              </Text>
              <Text size="sm" className="mt-1">
                {value}
              </Text>
            </div>
          </div>
        ))}
      </div>

      <div
        className={`mt-8 p-4 rounded-xl ${themed.bgSecondary} border ${themed.border}`}
      >
        <Text size="sm" variant="secondary">
          {t("faqLink")}{" "}
          <TextLink href={ROUTES.PUBLIC.FAQS}>{t("faqsLinkText")}</TextLink>
        </Text>
      </div>
    </Aside>
  );
}
