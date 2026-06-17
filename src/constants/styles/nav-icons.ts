/**
 * Per-item nav icon className tokens — extracted from the legacy
 * `THEME_CONSTANTS.colors.navIcons` map during Phase 7. The colour-per-route
 * scheme is a project-specific brand convention with no primitive variant
 * equivalent; kept as a typed map so navigation.tsx can drop the legacy
 * `THEME_CONSTANTS` import without losing the colour scheme.
 */
export const NAV_ICON_SIZE_SM = "w-4 h-4";

// audit-semantic-color-ok: decorative per-route nav icon palette (project brand convention, not status colour)
export const NAV_ICON_COLORS = {
  // audit-semantic-color-ok: decorative
  home: "text-blue-500 dark:text-blue-400",
  // audit-semantic-color-ok: decorative
  products: "text-emerald-500 dark:text-emerald-400",
  // audit-semantic-color-ok: decorative
  auctions: "text-amber-500 dark:text-amber-400",
  preOrders: "text-purple-500 dark:text-purple-400",
  categories: "text-violet-500 dark:text-violet-400",
  // audit-semantic-color-ok: decorative
  stores: "text-orange-500 dark:text-orange-400",
  // audit-semantic-color-ok: decorative
  events: "text-rose-500 dark:text-rose-400",
  blog: "text-cyan-500 dark:text-cyan-400",
  // audit-semantic-color-ok: decorative
  reviews: "text-yellow-500 dark:text-yellow-400",
  // audit-semantic-color-ok: decorative
  bundles: "text-teal-500 dark:text-teal-400",
  prizeDraws: "text-pink-500 dark:text-pink-400",
} as const;
