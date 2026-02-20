import { ROUTES, UI_LABELS, THEME_CONSTANTS, SITE_CONFIG } from "@/constants";
import Link from "next/link";

const LABELS = UI_LABELS.TERMS_PAGE;
const { themed, typography } = THEME_CONSTANTS;

export const metadata = {
  title: `Terms & Conditions — ${SITE_CONFIG.brand.name}`,
  description: "Terms and conditions for using the LetItRip platform",
};

const SECTIONS = [
  { title: LABELS.ACCEPTANCE_TITLE, text: LABELS.ACCEPTANCE_TEXT },
  { title: LABELS.USE_TITLE, text: LABELS.USE_TEXT },
  { title: LABELS.ACCOUNTS_TITLE, text: LABELS.ACCOUNTS_TEXT },
  { title: LABELS.SELLERS_TITLE, text: LABELS.SELLERS_TEXT },
  { title: LABELS.AUCTIONS_TITLE, text: LABELS.AUCTIONS_TEXT },
  { title: LABELS.LIABILITY_TITLE, text: LABELS.LIABILITY_TEXT },
  { title: LABELS.CHANGES_TITLE, text: LABELS.CHANGES_TEXT },
];

export default function TermsPage() {
  return (
    <div className={`${themed.bgPrimary} min-h-screen`}>
      {/* Header */}
      <section className="bg-gradient-to-br from-slate-700 to-slate-900 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-3">{LABELS.TITLE}</h1>
          <p className="text-slate-300">{LABELS.LAST_UPDATED}</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <p className={`text-lg ${themed.textSecondary} mb-10`}>
          {LABELS.SUBTITLE}
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
              {LABELS.CONTACT_TITLE}
            </h2>
            <p className={`${themed.textSecondary}`}>{LABELS.CONTACT_TEXT}</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 flex gap-6 text-sm">
          <Link
            href={ROUTES.PUBLIC.PRIVACY}
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {UI_LABELS.FOOTER.PRIVACY_POLICY}
          </Link>
          <Link
            href={ROUTES.PUBLIC.CONTACT}
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {UI_LABELS.FOOTER.CONTACT}
          </Link>
        </div>
      </div>
    </div>
  );
}
