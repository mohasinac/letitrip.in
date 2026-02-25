import Link from "next/link";
import { ROUTES, THEME_CONSTANTS, SITE_CONFIG } from "@/constants";
import { getTranslations } from "next-intl/server";

const { themed, typography, spacing, button } = THEME_CONSTANTS;

export async function generateMetadata() {
  const t = await getTranslations("sellersPage");
  return {
    title: `Sell on ${SITE_CONFIG.brand.name}`,
    description: t("subtitle"),
  };
}

export default async function SellersPage() {
  const t = await getTranslations("sellersPage");

  const BENEFITS = [
    { title: t("benefitReach"), text: t("benefitReachText"), icon: "ðŸŒ" },
    { title: t("benefitTools"), text: t("benefitToolsText"), icon: "ðŸ› ï¸" },
    { title: t("benefitTrust"), text: t("benefitTrustText"), icon: "ðŸ›¡ï¸" },
    { title: t("benefitFees"), text: t("benefitFeesText"), icon: "ðŸ’°" },
  ];

  const STEPS = [
    { step: "01", title: t("step1Title"), text: t("step1Text") },
    { step: "02", title: t("step2Title"), text: t("step2Text") },
    { step: "03", title: t("step3Title"), text: t("step3Text") },
  ];

  const FAQS = [
    { q: t("faq1Q"), a: t("faq1A") },
    { q: t("faq2Q"), a: t("faq2A") },
    { q: t("faq3Q"), a: t("faq3A") },
  ];

  return (
    <div className={`${themed.bgPrimary} min-h-screen`}>
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">{t("title")}</h1>
          <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href={ROUTES.AUTH.REGISTER} className={button.ctaPrimary}>
              {t("heroCta")}
            </Link>
            <a href="#how-it-works" className={button.ctaOutline}>
              {t("heroSecondary")}
            </a>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-emerald-700 text-white py-6 px-4">
        <div className="max-w-4xl mx-auto flex justify-center gap-12 flex-wrap">
          {[
            {
              label: t("statSellersLabel"),
              value: t("statSellersValue"),
            },
            {
              label: t("statProductsLabel"),
              value: t("statProductsValue"),
            },
            {
              label: t("statBuyersLabel"),
              value: t("statBuyersValue"),
            },
            {
              label: t("statCommissionLabel"),
              value: t("statCommissionValue"),
            },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-emerald-200 text-sm">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-20 space-y-24">
        {/* Benefits */}
        <section>
          <h2
            className={`${typography.h2} ${themed.textPrimary} text-center mb-12`}
          >
            {t("whyTitle")}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {BENEFITS.map(({ title, text, icon }) => (
              <div
                key={title}
                className={`${themed.bgSecondary} border ${themed.border} rounded-2xl p-6 flex gap-5`}
              >
                <div className="text-4xl shrink-0">{icon}</div>
                <div>
                  <h3 className={`${typography.h4} ${themed.textPrimary} mb-2`}>
                    {title}
                  </h3>
                  <p
                    className={`text-sm ${themed.textSecondary} leading-relaxed`}
                  >
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works">
          <h2
            className={`${typography.h2} ${themed.textPrimary} text-center mb-12`}
          >
            {t("howTitle")}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map(({ step, title, text }) => (
              <div key={step} className="text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                  {step}
                </div>
                <h3 className={`${typography.h4} ${themed.textPrimary} mb-2`}>
                  {title}
                </h3>
                <p className={`text-sm ${themed.textSecondary}`}>{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section>
          <h2
            className={`${typography.h2} ${themed.textPrimary} text-center mb-10`}
          >
            {t("faqTitle")}
          </h2>
          <div className={`${spacing.stack} max-w-2xl mx-auto`}>
            {FAQS.map(({ q, a }) => (
              <div
                key={q}
                className={`${themed.bgSecondary} border ${themed.border} rounded-xl p-6`}
              >
                <h3 className={`font-semibold ${themed.textPrimary} mb-2`}>
                  {q}
                </h3>
                <p className={`text-sm ${themed.textSecondary}`}>{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">{t("ctaTitle")}</h2>
          <Link
            href={ROUTES.AUTH.REGISTER}
            className={`inline-block mt-4 ${button.ctaPrimary}`}
          >
            {t("ctaButton")}
          </Link>
          <p className="mt-4 text-emerald-100 text-sm">
            {t("signInPrompt")}{" "}
            <Link href={ROUTES.AUTH.LOGIN} className="underline font-medium">
              {t("signInLink")}
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
