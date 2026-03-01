import Link from "next/link";
import { ROUTES, THEME_CONSTANTS, SITE_CONFIG } from "@/constants";
import { getTranslations } from "next-intl/server";

const { themed, typography } = THEME_CONSTANTS;

export async function generateMetadata() {
  return {
    title: `Help Center - ${SITE_CONFIG.brand.name}`,
    description: "Find help and answers to common questions",
  };
}

export default async function HelpPage() {
  const t = await getTranslations("help");

  const TOPICS = [
    { key: "orders", icon: "box", label: t("topicOrders"), q: "orders" },
    { key: "payments", icon: "card", label: t("topicPayments"), q: "payment" },
    { key: "account", icon: "user", label: t("topicAccount"), q: "account" },
    { key: "selling", icon: "shop", label: t("topicSelling"), q: "sellers" },
    {
      key: "auctions",
      icon: "trophy",
      label: t("topicAuctions"),
      q: "products",
    },
  ];

  return (
    <div className="-mx-4 md:-mx-6 lg:-mx-8 -mt-6 sm:-mt-8 lg:-mt-10">
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-14 md:py-16 lg:py-20">
        <div className="max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
          <p className="text-blue-100 text-lg mb-8">{t("subtitle")}</p>
          <Link
            href={ROUTES.PUBLIC.FAQS}
            className="inline-flex items-center gap-2 bg-white text-indigo-700 font-medium px-6 py-3 rounded-full hover:bg-indigo-50 transition-colors"
          >
            {t("searchPlaceholder")}
          </Link>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-16 space-y-14 md:space-y-16">
        <section>
          <h2
            className={`${typography.h2} ${themed.textPrimary} text-center mb-10`}
          >
            {t("browseTitle")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 gap-3 md:gap-4">
            {TOPICS.map(({ key, label, q }) => (
              <Link
                key={key}
                href={`${ROUTES.PUBLIC.FAQS}?category=${q}`}
                className={`${themed.bgSecondary} border ${themed.border} rounded-xl p-5 text-center hover:border-indigo-400 hover:shadow-md transition-all group`}
              >
                <p
                  className={`text-sm font-medium ${themed.textPrimary} group-hover:text-indigo-600 dark:group-hover:text-indigo-400`}
                >
                  {label}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section
          className={`${themed.bgSecondary} rounded-2xl p-8 border ${themed.border} text-center`}
        >
          <h2 className={`${typography.h3} ${themed.textPrimary} mb-4`}>
            {t("popularTitle")}
          </h2>
          <p className={`${themed.textSecondary} mb-6`}>
            Browse our comprehensive FAQ library for answers to hundreds of
            common questions.
          </p>
          <Link
            href={ROUTES.PUBLIC.FAQS}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-8 py-3 rounded-full hover:bg-indigo-700 transition-colors"
          >
            {t("faqsLink")}
          </Link>
        </section>

        <section className="text-center">
          <h2 className={`${typography.h3} ${themed.textPrimary} mb-4`}>
            {t("contactPrompt")}
          </h2>
          <p className={`${themed.textSecondary} mb-6`}>
            Our support team typically responds within 24 hours.
          </p>
          <Link
            href={ROUTES.PUBLIC.CONTACT}
            className="inline-flex items-center gap-2 border-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-semibold px-8 py-3 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
          >
            {t("contactLink")}
          </Link>
        </section>
      </div>
    </div>
  );
}
