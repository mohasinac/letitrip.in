/**
 * AdminDashboardSkeleton
 *
 * Shown while admin dashboard stats are loading.
 * Uses THEME_CONSTANTS.skeleton.* tokens.
 */

import { THEME_CONSTANTS } from "@/constants";

const { skeleton, spacing } = THEME_CONSTANTS;

export function AdminDashboardSkeleton() {
  return (
    <div
      className={spacing.stack}
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      {/* Header skeleton */}
      <div className="pb-8 mb-8 border-b border-gray-200 dark:border-gray-700">
        <div className={`${skeleton.heading} w-64 mb-3`} />
        <div className={`${skeleton.text} w-96`} />
      </div>

      {/* Stats grid skeleton — 6 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`rounded-xl border-l-4 border-l-gray-200 dark:border-l-gray-700 bg-white dark:bg-gray-900 ${spacing.padding.md}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className={`${skeleton.text} w-28 mb-3`} />
                <div className={`${skeleton.heading} w-16`} />
              </div>
              <div className={`${skeleton.base} w-10 h-10 rounded-lg`} />
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions skeleton */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className={`${skeleton.heading} w-36 mb-4`} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`${skeleton.base} h-10 rounded-lg`} />
          ))}
        </div>
      </div>

      {/* Recent activity skeleton */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className={`${skeleton.heading} w-44 mb-4`} />
        <div className={spacing.stackSmall}>
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
            >
              <div
                className={`${skeleton.base} w-10 h-10 rounded-full flex-shrink-0`}
              />
              <div className="flex-1">
                <div className={`${skeleton.text} w-32 mb-2`} />
                <div className={`${skeleton.text} w-48`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
