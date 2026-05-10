/**
 * Search Constants
 *
 * Static labels for the site-wide search overlay.
 * These are English-only strings; if i18n is added to search
 * in future, replace this with a hook that reads from translations.
 */

import type { SearchLabels } from "@mohasinac/appkit";

export const SEARCH_LABELS: SearchLabels = {
  placeholder: "Search products",
  title: "Search",
  closeAriaLabel: "Close search",
  quickLinks: "Quick links",
  searching: "Searching…",
  clearAriaLabel: "Clear search",
  ariaLabel: "Search",
  browseProducts: (query) => `Browse results for "${query}"`,
};
