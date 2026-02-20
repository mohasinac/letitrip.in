import { THEME_CONSTANTS, UI_LABELS } from "@/constants";

const LABELS = UI_LABELS.ORDER_SUCCESS_PAGE;
const { themed, spacing, typography, borderRadius } = THEME_CONSTANTS;

export function OrderSuccessHero() {
  return (
    <div
      className={`${themed.bgSecondary} ${borderRadius.xl} p-8 text-center ${spacing.stack} mb-6`}
    >
      <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
        <svg
          className="w-10 h-10 text-green-600 dark:text-green-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h1 className={`${typography.h2} ${themed.textPrimary}`}>
        {LABELS.TITLE}
      </h1>
      <p className={themed.textSecondary}>{LABELS.SUBTITLE}</p>
      <p className={`text-sm ${themed.textSecondary}`}>{LABELS.EMAIL_SENT}</p>
    </div>
  );
}
