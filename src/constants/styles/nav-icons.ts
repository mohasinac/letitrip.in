/**
 * Per-item nav icon className tokens — extracted from the legacy
 * `THEME_CONSTANTS.colors.navIcons` map during Phase 7. The colour-per-route
 * scheme is a project-specific brand convention with no primitive variant
 * equivalent; kept as a typed map so navigation.tsx can drop the legacy
 * `THEME_CONSTANTS` import without losing the colour scheme.
 */
export const NAV_ICON_SIZE_SM = "w-4 h-4";

export const NAV_ICON_COLORS = {
  home: "text-info",
  products: "text-success",
  auctions: "text-warning",
  preOrders: "text-[var(--appkit-color-primary)]",
  categories: "text-[var(--appkit-color-primary)]",
  stores: "text-warning",
  events: "text-error",
  blog: "text-info",
  reviews: "text-warning",
  bundles: "text-success",
  prizeDraws: "text-[var(--appkit-color-secondary)]",
} as const;
