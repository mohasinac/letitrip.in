import { ROUTES, UI_LABELS, THEME_CONSTANTS, SITE_CONFIG } from "@/constants";
import Link from "next/link";

const LABELS = UI_LABELS.PRIVACY_PAGE;
const { themed, typography } = THEME_CONSTANTS;

export const metadata = {
  title: `Privacy Policy — ${SITE_CONFIG.brand.name}`,
  description: "Privacy policy for the LetItRip platform",
};

const SECTIONS = [
  { title: LABELS.INTRO_TITLE, text: LABELS.INTRO_TEXT },
  { title: LABELS.COLLECT_TITLE, text: LABELS.COLLECT_TEXT },
  { title: LABELS.USE_TITLE, text: LABELS.USE_TEXT },
  { title: LABELS.SHARE_TITLE, text: LABELS.SHARE_TEXT },
  { title: LABELS.SECURITY_TITLE, text: LABELS.SECURITY_TEXT },
  { title: LABELS.RIGHTS_TITLE, text: LABELS.RIGHTS_TEXT },
  { title: LABELS.COOKIES_TITLE, text: LABELS.COOKIES_TEXT },
  { title: LABELS.CHANGES_TITLE, text: LABELS.CHANGES_TEXT },
];

export default function PrivacyPage() {
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
            href={ROUTES.PUBLIC.TERMS}
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {UI_LABELS.FOOTER.TERMS_OF_SERVICE}
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
