/**
 * Themed className tokens — extracted from the legacy `THEME_CONSTANTS.themed.*`
 * during Phase 7 of the Theme/Tokens/Variants refactor. These are dark-mode-
 * aware Tailwind class pairs that map roughly to:
 *   THEMED_BG_PRIMARY    → primitive surface="muted"
 *   THEMED_BG_SECONDARY  → primitive surface="subtle"
 *   THEMED_TEXT_PRIMARY  → primitive color="default"
 *   THEMED_TEXT_SECONDARY → primitive color="muted"
 *   THEMED_BORDER        → primitive border="default"
 * They are kept as raw className strings for the residual about / track-order
 * views that still wrap content in `<Div className=…>` rather than a typed
 * primitive variant. A subsequent sweep migrates each callsite to the
 * primitive equivalent.
 */
export const THEMED_BG_PRIMARY = "bg-zinc-50 dark:bg-slate-950";
export const THEMED_BG_SECONDARY = "bg-zinc-100 dark:bg-slate-900";
export const THEMED_BORDER = "border-zinc-200 dark:border-slate-700";
export const THEMED_TEXT_PRIMARY = "text-zinc-900 dark:text-zinc-50";
export const THEMED_TEXT_SECONDARY = "text-zinc-500 dark:text-zinc-400";
// audit-semantic-color-ok: this constant IS the semantic token definition
export const THEMED_TEXT_SUCCESS = "text-emerald-600 dark:text-emerald-400";
export const FLEX_CENTER = "flex items-center justify-center";
