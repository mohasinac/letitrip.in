import React from "react";

export interface ValuePropositionProps {
  className?: string;
}

/**
 * ValueProposition Component
 *
 * Displays key value propositions in a responsive grid.
 * Used on homepage and landing pages.
 *
 * Features:
 * - Authentic products guarantee
 * - Zero customs charges
 * - Fast delivery
 * - Secure payments
 *
 * @example
 * ```tsx
 * <ValueProposition />
 * ```
 */
export function ValueProposition({ className = "" }: ValuePropositionProps) {
  return (
    <section
      id="value-proposition"
      className={`bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-3 md:p-4 lg:p-6 ${className}`}
    >
      <div className="grid grid-cols-2 md:flex md:flex-wrap justify-center items-center gap-3 md:gap-6 lg:gap-8">
        <ValuePropItem
          icon={
            <svg
              className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0"
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
          }
          text="100% Authentic Products"
          colorClass="text-green-700 dark:text-green-400"
        />
        <ValuePropItem
          icon={
            <svg
              className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          }
          text="Zero Customs Charges"
          colorClass="text-blue-700 dark:text-blue-400"
        />
        <ValuePropItem
          icon={
            <svg
              className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          }
          text="Fast India Delivery"
          colorClass="text-purple-700 dark:text-purple-400"
        />
        <ValuePropItem
          icon={
            <svg
              className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          }
          text="Secure Payments"
          colorClass="text-orange-700 dark:text-orange-400"
        />
      </div>
    </section>
  );
}

interface ValuePropItemProps {
  icon: React.ReactNode;
  text: string;
  colorClass: string;
}

function ValuePropItem({ icon, text, colorClass }: ValuePropItemProps) {
  return (
    <div
      className={`flex items-center gap-2 ${colorClass} font-medium min-h-[48px] touch-manipulation`}
    >
      {icon}
      <span className="text-xs sm:text-sm md:text-base">{text}</span>
    </div>
  );
}
