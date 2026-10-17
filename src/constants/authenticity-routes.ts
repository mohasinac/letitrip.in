/**
 * Paths for the authenticity checker.
 *
 * 🛑 Why these live here and not in appkit's `ROUTES` / `API_ENDPOINTS`, which is
 * where every other path in this codebase lives:
 *
 * The consumer is pinned to `@mohasinac/appkit": "^4.52.5"` from the npm
 * registry, so a path added to appkit's route map does not exist for this app
 * until appkit is rebuilt, published, and the pin moved — and publishing is a
 * deliberate, separately-requested step (Rule #10), which also forces a cold
 * Vercel build. Hardcoding the strings at each call site instead is the thing the
 * Known-TS-Patterns table bans outright.
 *
 * So: one named definition, in the consumer, imported everywhere. The anti-
 * pattern the rule targets is the *literal at the call site*, and there is none.
 *
 * 🛑 FOLLOW-UP, not a TODO to rot: when appkit is next published, move these
 * into `ROUTES.PUBLIC` / `API_ENDPOINTS` beside `TOOL_PRICE_INDEX` and delete
 * this file. Until then they must agree with the real directory names —
 * `src/app/[locale]/tools/authenticity/` and `src/app/[locale]/help/authenticity/`.
 */

/** The page. Must match `src/app/[locale]/tools/authenticity/page.tsx`. */
export const TOOL_AUTHENTICITY_PATH = "/tools/authenticity" as const;

/** The help-centre article. Must match `src/app/[locale]/help/authenticity/page.tsx`. */
export const HELP_AUTHENTICITY_PATH = "/help/authenticity" as const;

/*
 * 🛑 The API endpoint is NOT here — it is `API_ROUTES.TOOLS.AUTHENTICITY` in
 * src/constants/api.ts, which is the registry `audit-hardcoded-api-routes`
 * enforces. A second definition of it here was the first draft and the audit
 * was right to reject it: two names for one URL is how they drift.
 */
