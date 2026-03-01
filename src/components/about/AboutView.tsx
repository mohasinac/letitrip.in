import Link from "next/link";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { getTranslations } from "next-intl/server";

const { themed, typography, spacing } = THEME_CONSTANTS;

export async function AboutView() {
  const t = await getTranslations("about");

  return (
    <div className="-mx-4 md:-mx-6 lg:-mx-8 -mt-6 sm:-mt-8 lg:-mt-10">
      {/* Hero — full-bleed within the content container */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white py-16 md:py-20 lg:py-24">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{t("title")}</h1>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 space-y-16 md:space-y-20">
        {/* Mission */}
        <section className="text-center max-w-3xl mx-auto">
          <h2 className={`${typography.h2} ${themed.textPrimary} mb-4`}>
            {t("missionTitle")}
          </h2>
          <p className={`text-lg ${themed.textSecondary} leading-relaxed`}>
            {t("missionText")}
          </p>
        </section>

        {/* How it works */}
        <section>
          <h2
            className={`${typography.h2} ${themed.textPrimary} text-center mb-12`}
          >
            {t("howItWorksTitle")}
          </h2>
          <div className="grid md:grid-cols-3 xl:grid-cols-3 gap-6 md:gap-8 xl:gap-10">
            {[
              {
                title: t("howBuyersTitle"),
                text: t("howBuyersText"),
                icon: "🛒",
                color:
                  "from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
              },
              {
                title: t("howSellersTitle"),
                text: t("howSellersText"),
                icon: "🏪",
                color:
                  "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
              },
              {
                title: t("howBiddersTitle"),
                text: t("howBiddersText"),
                icon: "🏆",
                color:
                  "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
              },
            ].map(({ title, text, icon, color }) => (
              <div
                key={title}
                className={`bg-gradient-to-br ${color} rounded-2xl p-6 ${spacing.stack}`}
              >
                <div className="text-4xl">{icon}</div>
                <h3 className={`${typography.h4} ${themed.textPrimary}`}>
                  {title}
                </h3>
                <p
                  className={`text-sm ${themed.textSecondary} leading-relaxed`}
                >
                  {text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section>
          <h2
            className={`${typography.h2} ${themed.textPrimary} text-center mb-12`}
          >
            {t("valuesTitle")}
          </h2>
          <div className="grid md:grid-cols-3 xl:grid-cols-3 gap-5 md:gap-6 xl:gap-8">
            {[
              {
                title: t("valuesTrust"),
                text: t("valuesTrustText"),
                icon: "🔒",
              },
              {
                title: t("valuesCommunity"),
                text: t("valuesCommunityText"),
                icon: "🤝",
              },
              {
                title: t("valuesInnovation"),
                text: t("valuesInnovationText"),
                icon: "🚀",
              },
            ].map(({ title, text, icon }) => (
              <div
                key={title}
                className={`${themed.bgSecondary} rounded-xl p-6 ${spacing.stack} border ${themed.border}`}
              >
                <div className="text-3xl">{icon}</div>
                <h3 className={`${typography.h4} ${themed.textPrimary}`}>
                  {title}
                </h3>
                <p
                  className={`text-sm ${themed.textSecondary} leading-relaxed`}
                >
                  {text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Milestones */}
        <section>
          <h2
            className={`${typography.h2} ${themed.textPrimary} text-center mb-10`}
          >
            {t("milestonesTitle")}
          </h2>
          <div className="relative border-l-2 border-indigo-300 dark:border-indigo-700 pl-8 space-y-8 max-w-2xl mx-auto">
            {[
              { year: "2023", text: t("milestoneFounded") },
              { year: "2024", text: t("milestoneAuctions") },
              { year: "2025", text: t("milestoneMobile") },
            ].map(({ year, text }) => (
              <div key={year} className="relative">
                <div className="absolute -left-10 top-1 w-4 h-4 rounded-full bg-indigo-500 border-2 border-white dark:border-gray-900" />
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                  {year}
                </span>
                <p className={`mt-1 ${themed.textPrimary}`}>{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 md:p-12 xl:p-16 text-white">
          <h2 className="text-3xl font-bold mb-8">{t("ctaTitle")}</h2>
          <div className="flex justify-center gap-3 md:gap-4 flex-wrap">
            <Link
              href={ROUTES.AUTH.REGISTER}
              className="bg-white text-indigo-600 font-semibold px-8 py-3 rounded-full hover:bg-indigo-50 transition-colors"
            >
              {t("ctaSell")}
            </Link>
            <Link
              href={ROUTES.PUBLIC.PRODUCTS}
              className="border-2 border-white text-white font-semibold px-8 py-3 rounded-full hover:bg-white/10 transition-colors"
            >
              {t("ctaShop")}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
