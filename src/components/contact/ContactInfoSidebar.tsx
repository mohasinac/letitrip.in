"use client";

import { ROUTES, UI_LABELS, THEME_CONSTANTS, SITE_CONFIG } from "@/constants";
import Link from "next/link";

const LABELS = UI_LABELS.CONTACT_PAGE;
const { themed, typography, spacing } = THEME_CONSTANTS;

const INFO_ITEMS = [
  {
    icon: "✉️",
    label: LABELS.INFO_EMAIL_LABEL,
    value: SITE_CONFIG.contact.email,
  },
  {
    icon: "📞",
    label: LABELS.INFO_PHONE_LABEL,
    value: SITE_CONFIG.contact.phone,
  },
  {
    icon: "📍",
    label: LABELS.INFO_ADDRESS_LABEL,
    value: SITE_CONFIG.contact.address,
  },
  {
    icon: "🕐",
    label: LABELS.INFO_HOURS_LABEL,
    value: LABELS.INFO_HOURS_VALUE,
  },
];

export function ContactInfoSidebar() {
  return (
    <aside className="md:col-span-2">
      <h2 className={`${typography.h3} ${themed.textPrimary} mb-6`}>
        {LABELS.INFO_TITLE}
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
          {LABELS.FAQ_LINK}{" "}
          <Link
            href={ROUTES.PUBLIC.FAQS}
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            {UI_LABELS.FOOTER.FAQS}
          </Link>
        </p>
      </div>
    </aside>
  );
}
