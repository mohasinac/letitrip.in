"use client";

import { ROUTES, THEME_CONSTANTS, SITE_CONFIG } from "@/constants";
import Link from "next/link";
import { useTranslations } from "next-intl";

const { themed, typography, spacing } = THEME_CONSTANTS;

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
    <aside className="md:col-span-2">
      <h2 className={`${typography.h3} ${themed.textPrimary} mb-6`}>
        {t("infoGetInTouch")}
      </h2>
      <div className={spacing.stack}>
        {INFO_ITEMS.map(({ icon, label, value }) => (
          <div key={label} className="flex gap-3">
            <span className="text-xl shrink-0">{icon}</span>
            <div>
              <p
                className={`text-xs font-semibold uppercase tracking-wide ${themed.textSecondary}`}
              >
                {label}
              </p>
              <p className={`mt-1 text-sm ${themed.textPrimary}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div
        className={`mt-8 p-4 rounded-xl ${themed.bgSecondary} border ${themed.border}`}
      >
        <p className={`text-sm ${themed.textSecondary}`}>
          {t("faqLink")}{" "}
          <Link
            href={ROUTES.PUBLIC.FAQS}
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            {t("faqsLinkText")}
          </Link>
        </p>
      </div>
    </aside>
  );
}
