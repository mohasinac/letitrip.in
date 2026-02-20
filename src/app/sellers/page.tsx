import Link from "next/link";
import { ROUTES, UI_LABELS, THEME_CONSTANTS, SITE_CONFIG } from "@/constants";

const LABELS = UI_LABELS.SELLERS_PAGE;
const { themed, typography, spacing } = THEME_CONSTANTS;

export const metadata = {
  title: `Sell on ${SITE_CONFIG.brand.name}`,
  description: LABELS.SUBTITLE,
};

const BENEFITS = [
  { title: LABELS.BENEFIT_REACH, text: LABELS.BENEFIT_REACH_TEXT, icon: "🌐" },
  { title: LABELS.BENEFIT_TOOLS, text: LABELS.BENEFIT_TOOLS_TEXT, icon: "🛠️" },
  { title: LABELS.BENEFIT_TRUST, text: LABELS.BENEFIT_TRUST_TEXT, icon: "🛡️" },
  { title: LABELS.BENEFIT_FEES, text: LABELS.BENEFIT_FEES_TEXT, icon: "💰" },
];

const STEPS = [
  { step: "01", title: LABELS.STEP_1_TITLE, text: LABELS.STEP_1_TEXT },
  { step: "02", title: LABELS.STEP_2_TITLE, text: LABELS.STEP_2_TEXT },
  { step: "03", title: LABELS.STEP_3_TITLE, text: LABELS.STEP_3_TEXT },
];

const FAQS = [
  { q: LABELS.FAQ_1_Q, a: LABELS.FAQ_1_A },
  { q: LABELS.FAQ_2_Q, a: LABELS.FAQ_2_A },
  { q: LABELS.FAQ_3_Q, a: LABELS.FAQ_3_A },
];

export default function SellersPage() {
  return (
    <div className={`${themed.bgPrimary} min-h-screen`}>
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {LABELS.TITLE}
          </h1>
          <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto">
            {LABELS.SUBTITLE}
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              href={ROUTES.AUTH.REGISTER}
              className="bg-white text-emerald-700 font-bold px-8 py-4 rounded-full text-lg hover:bg-emerald-50 transition-colors shadow-lg"
            >
              {LABELS.HERO_CTA}
            </Link>
            <a
              href="#how-it-works"
              className="border-2 border-white text-white font-semibold px-8 py-4 rounded-full text-lg hover:bg-white/10 transition-colors"
            >
              {LABELS.HERO_SECONDARY}
            </a>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-emerald-700 text-white py-6 px-4">
        <div className="max-w-4xl mx-auto flex justify-center gap-12 flex-wrap">
          {[
            { label: "Active Sellers", value: "500+" },
            { label: "Products Listed", value: "10,000+" },
            { label: "Monthly Buyers", value: "25,000+" },
            { label: "Commission", value: "From 3%" },
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
            {LABELS.WHY_TITLE}
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
            {LABELS.HOW_TITLE}
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
            {LABELS.FAQ_TITLE}
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
          <h2 className="text-3xl font-bold mb-4">{LABELS.CTA_TITLE}</h2>
          <Link
            href={ROUTES.AUTH.REGISTER}
            className="inline-block bg-white text-emerald-700 font-bold px-10 py-4 rounded-full text-lg hover:bg-emerald-50 transition-colors shadow-lg mt-4"
          >
            {LABELS.CTA_BUTTON}
          </Link>
          <p className="mt-4 text-emerald-100 text-sm">
            {LABELS.SIGN_IN_PROMPT}{" "}
            <Link href={ROUTES.AUTH.LOGIN} className="underline font-medium">
              {LABELS.SIGN_IN_LINK}
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
