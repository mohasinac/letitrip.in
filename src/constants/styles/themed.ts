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
export const THEMED_BG_PRIMARY = "bg-[var(--appkit-color-bg)]";
export const THEMED_BG_SECONDARY = "bg-[var(--appkit-color-surface)]";
export const THEMED_BORDER = "border-[var(--appkit-color-border)]";
export const THEMED_TEXT_PRIMARY = "text-[var(--appkit-color-text)]";
export const THEMED_TEXT_SECONDARY = "text-[var(--appkit-color-text-muted)]";
export const THEMED_TEXT_SUCCESS = "text-success";
export const FLEX_CENTER = "flex items-center justify-center";
