import Link from "next/link";
import { ROUTES, UI_LABELS, THEME_CONSTANTS, SITE_CONFIG } from "@/constants";

const LABELS = UI_LABELS.HELP_PAGE;
const { themed, typography, spacing } = THEME_CONSTANTS;

export const metadata = {
  title: `Help Center — ${SITE_CONFIG.brand.name}`,
  description: "Find help and answers to common questions",
};

const TOPICS = [
  { key: "orders", icon: "📦", label: LABELS.TOPIC_ORDERS, q: "orders" },
  { key: "payments", icon: "💳", label: LABELS.TOPIC_PAYMENTS, q: "payment" },
  { key: "account", icon: "👤", label: LABELS.TOPIC_ACCOUNT, q: "account" },
  { key: "selling", icon: "🏪", label: LABELS.TOPIC_SELLING, q: "sellers" },
  { key: "auctions", icon: "🏆", label: LABELS.TOPIC_AUCTIONS, q: "products" },
];

export default function HelpPage() {
  return (
    <div className={`${themed.bgPrimary} min-h-screen`}>
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">{LABELS.TITLE}</h1>
          <p className="text-blue-100 text-lg mb-8">{LABELS.SUBTITLE}</p>
          {/* Search - links to FAQs */}
          <Link
            href={ROUTES.PUBLIC.FAQS}
            className="inline-flex items-center gap-2 bg-white text-indigo-700 font-medium px-6 py-3 rounded-full hover:bg-indigo-50 transition-colors"
          >
            🔍 {LABELS.SEARCH_PLACEHOLDER}
          </Link>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-16 space-y-16">
        {/* Browse topics */}
        <section>
          <h2
            className={`${typography.h2} ${themed.textPrimary} text-center mb-10`}
          >
            {LABELS.BROWSE_TITLE}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {TOPICS.map(({ key, icon, label, q }) => (
              <Link
                key={key}
                href={`${ROUTES.PUBLIC.FAQS}?category=${q}`}
                className={`${themed.bgSecondary} border ${themed.border} rounded-xl p-5 text-center hover:border-indigo-400 hover:shadow-md transition-all group`}
              >
                <div className="text-3xl mb-3">{icon}</div>
                <p
                  className={`text-sm font-medium ${themed.textPrimary} group-hover:text-indigo-600 dark:group-hover:text-indigo-400`}
                >
                  {label}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Popular FAQs link */}
        <section
          className={`${themed.bgSecondary} rounded-2xl p-8 border ${themed.border} text-center`}
        >
          <h2 className={`${typography.h3} ${themed.textPrimary} mb-4`}>
            {LABELS.POPULAR_TITLE}
          </h2>
          <p className={`${themed.textSecondary} mb-6`}>
            Browse our comprehensive FAQ library for answers to hundreds of
            common questions.
          </p>
          <Link
            href={ROUTES.PUBLIC.FAQS}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-8 py-3 rounded-full hover:bg-indigo-700 transition-colors"
          >
            {LABELS.FAQS_LINK} →
          </Link>
        </section>

        {/* Still need help */}
        <section className="text-center">
          <h2 className={`${typography.h3} ${themed.textPrimary} mb-4`}>
            {LABELS.CONTACT_PROMPT}
          </h2>
          <p className={`${themed.textSecondary} mb-6`}>
            Our support team typically responds within 24 hours.
          </p>
          <Link
            href={ROUTES.PUBLIC.CONTACT}
            className="inline-flex items-center gap-2 border-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-semibold px-8 py-3 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
          >
            ✉️ {LABELS.CONTACT_LINK}
          </Link>
        </section>
      </div>
    </div>
  );
}
