import Link from "next/link";
import { ROUTES, UI_LABELS, THEME_CONSTANTS, SITE_CONFIG } from "@/constants";

const LABELS = UI_LABELS.ABOUT_PAGE;
const { themed, typography, spacing } = THEME_CONSTANTS;

export const metadata = {
  title: `About Us — ${SITE_CONFIG.brand.name}`,
  description: LABELS.SUBTITLE,
};

export default function AboutPage() {
  return (
    <div className={`${themed.bgPrimary} min-h-screen`}>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {LABELS.TITLE}
          </h1>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
            {LABELS.SUBTITLE}
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-16 space-y-20">
        {/* Mission */}
        <section className="text-center max-w-3xl mx-auto">
          <h2 className={`${typography.h2} ${themed.textPrimary} mb-4`}>
            {LABELS.MISSION_TITLE}
          </h2>
          <p className={`text-lg ${themed.textSecondary} leading-relaxed`}>
            {LABELS.MISSION_TEXT}
          </p>
        </section>

        {/* How it works */}
        <section>
          <h2
            className={`${typography.h2} ${themed.textPrimary} text-center mb-12`}
          >
            {LABELS.HOW_IT_WORKS_TITLE}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: LABELS.HOW_BUYERS_TITLE,
                text: LABELS.HOW_BUYERS_TEXT,
                icon: "🛒",
                color:
                  "from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
              },
              {
                title: LABELS.HOW_SELLERS_TITLE,
                text: LABELS.HOW_SELLERS_TEXT,
                icon: "🏪",
                color:
                  "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
              },
              {
                title: LABELS.HOW_BIDDERS_TITLE,
                text: LABELS.HOW_BIDDERS_TEXT,
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
            {LABELS.VALUES_TITLE}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: LABELS.VALUES_TRUST,
                text: LABELS.VALUES_TRUST_TEXT,
                icon: "🔒",
              },
              {
                title: LABELS.VALUES_COMMUNITY,
                text: LABELS.VALUES_COMMUNITY_TEXT,
                icon: "🤝",
              },
              {
                title: LABELS.VALUES_INNOVATION,
                text: LABELS.VALUES_INNOVATION_TEXT,
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
            {LABELS.MILESTONES_TITLE}
          </h2>
          <div className="relative border-l-2 border-indigo-300 dark:border-indigo-700 pl-8 space-y-8 max-w-2xl mx-auto">
            {[
              { year: "2023", text: LABELS.MILESTONE_FOUNDED },
              { year: "2024", text: LABELS.MILESTONE_AUCTIONS },
              { year: "2025", text: LABELS.MILESTONE_MOBILE },
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
        <section className="text-center bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-8">{LABELS.CTA_TITLE}</h2>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              href={ROUTES.AUTH.REGISTER}
              className="bg-white text-indigo-600 font-semibold px-8 py-3 rounded-full hover:bg-indigo-50 transition-colors"
            >
              {LABELS.CTA_SELL}
            </Link>
            <Link
              href={ROUTES.PUBLIC.PRODUCTS}
              className="border-2 border-white text-white font-semibold px-8 py-3 rounded-full hover:bg-white/10 transition-colors"
            >
              {LABELS.CTA_SHOP}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
