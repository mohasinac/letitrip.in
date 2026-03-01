import { ROUTES, THEME_CONSTANTS, SITE_CONFIG } from "@/constants";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

const { themed, typography } = THEME_CONSTANTS;

export async function generateMetadata() {
  return {
    title: `Privacy Policy — ${SITE_CONFIG.brand.name}`,
    description: "Privacy policy for the LetItRip platform",
  };
}

export default async function PrivacyPage() {
  const t = await getTranslations("privacy");

  const SECTIONS = [
    { title: t("introTitle"), text: t("introText") },
    { title: t("collectTitle"), text: t("collectText") },
    { title: t("useTitle"), text: t("useText") },
    { title: t("shareTitle"), text: t("shareText") },
    { title: t("securityTitle"), text: t("securityText") },
    { title: t("rightsTitle"), text: t("rightsText") },
    { title: t("cookiesTitle"), text: t("cookiesText") },
    { title: t("changesTitle"), text: t("changesText") },
  ];

  return (
    <div className="-mx-4 md:-mx-6 lg:-mx-8 -mt-6 sm:-mt-8 lg:-mt-10">
      {/* Header */}
      <section className="bg-gradient-to-br from-slate-700 to-slate-900 text-white py-14 md:py-16 lg:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{t("title")}</h1>
          <p className="text-slate-300">{t("lastUpdated")}</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12 lg:py-16">
        <p className={`text-lg ${themed.textSecondary} mb-10`}>
          {t("subtitle")}
        </p>

        <div className="space-y-8">
          {SECTIONS.map(({ title, text }) => (
            <section key={title}>
              <h2 className={`${typography.h3} ${themed.textPrimary} mb-3`}>
                {title}
              </h2>
              <p className={`${themed.textSecondary} leading-relaxed`}>
                {text}
              </p>
            </section>
          ))}

          {/* Contact */}
          <section
            className={`${themed.bgSecondary} rounded-xl p-6 border ${themed.border}`}
          >
            <h2 className={`${typography.h4} ${themed.textPrimary} mb-2`}>
              {t("contactTitle")}
            </h2>
            <p className={`${themed.textSecondary}`}>{t("contactText")}</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 flex gap-6 text-sm">
          <Link
            href={ROUTES.PUBLIC.TERMS}
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {t("termsOfService")}
          </Link>
          <Link
            href={ROUTES.PUBLIC.CONTACT}
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {t("contactUs")}
          </Link>
        </div>
      </div>
    </div>
  );
}
