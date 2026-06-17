/**
 * Page container className tokens — extracted from the legacy
 * `THEME_CONSTANTS.page.container.*` map during Phase 7 of the Theme/Tokens/
 * Variants refactor. Kept as raw className strings while the about/policy
 * views still wrap their layout in `<Div className=…>` rather than the
 * `<Container size=…>` primitive. A future sweep can migrate each site to
 * the primitive variant; until then this preserves the exact rendering
 * without dragging in the 33 KB legacy theme module.
 */
export const PAGE_CONTAINER = {
  /** `max-w-3xl` — blog / policy */
  sm: "max-w-3xl mx-auto px-4 sm:px-6 lg:px-8",
  /** `max-w-4xl` — contact / about */
  md: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8",
  /** `max-w-5xl` — checkout / help */
  lg: "max-w-5xl mx-auto px-4 sm:px-6 lg:px-8",
  /** `max-w-6xl` — product detail / cart */
  xl: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8",
  /** `max-w-7xl` — main content grids */
  "2xl": "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
} as const;
