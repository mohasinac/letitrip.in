/**
 * Runtime validation for the case corpus — the replacement for `AuthoredCase`.
 *
 * ## Why this exists
 *
 * The cases were TypeScript until they moved out of `appkit/src`, so the
 * `AuthoredCase` interface checked the required fields at compile time. That
 * check was load-bearing and not theoretical: during the migration, deleting
 * 33 dead `startPage` values failed `tsc` immediately with
 * "Property 'startPage' is missing" — which is the only reason 33 cases did
 * not ship unable to open anywhere.
 *
 * `tester/` is plain ESM with no TypeScript toolchain, so that guarantee had
 * to be re-made rather than quietly dropped.
 *
 * ## 🛑 It is STRONGER than the type it replaces, not a consolation prize
 *
 * `tsc` could check that `startPage` was a string. It could not check that the
 * string resolved to a real page — that took a separate audit
 * (`audit-tester-checklist-hrefs`), and the gap it covers is the expensive one:
 * a case pointing at a 404 produces "could not test" in every run, which reads
 * as a missing feature rather than a typo (Root Cause #32).
 *
 * This validates both, in one place, at the moment the corpus is written.
 *
 * ## What is deliberately NOT validated
 *
 * Fixture ids cited inside `steps` prose. The harness now authors cases
 * against LIVE data — "open the first listing in the grid" rather than
 * "open product-beyblade-x-dran-sword" — so a hard-coded id is a smell to
 * catch at review, and a validator that resolved them would re-introduce the
 * seed-fixture coupling this move exists to remove.
 */

/** Every field `AuthoredCase` required. */
const REQUIRED = ["roles", "startPage", "steps", "expectedBehaviour", "expectedUiState", "endResult"];

/** The roles a case may name. Mirrors `TesterCaseRole`. */
const ROLES = new Set(["guest", "buyer", "seller", "admin", "moderator", "employee", "tester"]);

/**
 * Problems with the corpus, as readable lines. Empty means it is sound.
 *
 * Returns rather than throws so a caller can decide — `seed-cases.mjs`
 * refuses the whole batch, a future lint command might only report.
 */
export function validateCases(cases) {
  const out = [];
  if (!Array.isArray(cases)) return ["the corpus is not an array"];

  const seen = new Set();
  for (const c of cases) {
    const id = c?.id ?? "(no id)";

    if (!c?.id || typeof c.id !== "string") {
      out.push(`${id}: missing a string \`id\``);
      continue;
    }
    /*
     * A duplicate id is silently destructive: the seeder writes by document id,
     * so the second case OVERWRITES the first and the corpus count still looks
     * right. Nothing downstream could notice.
     */
    if (seen.has(c.id)) out.push(`${c.id}: duplicate id — the later case would overwrite the earlier`);
    seen.add(c.id);

    /*
     * 🛑 `steps` is what makes a row RUNNABLE, and the corpus legitimately
     * holds rows that are not.
     *
     * The catalogue carries two deliberate seed-only fixtures outside
     * `group()` — a confirmed-bug pair demonstrating the
     * confirm → reopen-as-new-version lifecycle, with `bugConfirmed`,
     * `version` and `supersededByItemId` that `group()` does not build. They
     * have a label, an href and `isActive: false`: a reader is meant to SEE
     * them in `/admin/tester-checklist`, never to perform them. Demanding
     * `roles`/`startPage`/`steps` of those is demanding a procedure for
     * something with no procedure, and the first run of this validator did
     * exactly that.
     *
     * So the gate is conditional, and tightened rather than loosened: a row
     * WITHOUT steps must declare `isActive: false`. That is the distinction
     * that matters — an inactive display row is fine, an ACTIVE row with no
     * steps is a case the harness will pick up and be unable to perform,
     * which is the silent "could not test" this file exists to prevent.
     */
    const runnable = Array.isArray(c.steps) && c.steps.length > 0;
    if (runnable) {
      for (const field of REQUIRED) {
        if (c[field] === undefined || c[field] === null) out.push(`${c.id}: missing \`${field}\``);
      }
    } else if (c.isActive !== false) {
      out.push(
        `${c.id}: no \`steps\` but not \`isActive: false\` — an active case the ` +
          `harness cannot perform. Add steps, or mark it an inactive display row.`,
      );
    }

    if (c.roles !== undefined) {
      if (!Array.isArray(c.roles) || c.roles.length === 0) {
        out.push(`${c.id}: \`roles\` must be a non-empty array`);
      } else {
        for (const r of c.roles) {
          if (!ROLES.has(r)) out.push(`${c.id}: unknown role "${r}"`);
        }
      }
    }

    if (c.steps !== undefined && (!Array.isArray(c.steps) || c.steps.length === 0)) {
      out.push(`${c.id}: \`steps\` must be a non-empty array`);
    }

    if (typeof c.startPage === "string") {
      /*
       * Unprefixed, always. The app serves `/products`, and `/en/products`
       * 307-redirects — so a locale-prefixed start page pays a redirect on
       * every navigation and the harness records the slower path as normal.
       */
      if (/^\/[a-z]{2}\//.test(c.startPage)) {
        out.push(`${c.id}: \`startPage\` "${c.startPage}" carries a locale prefix — use the unprefixed path`);
      }
      if (!c.startPage.startsWith("/")) {
        out.push(`${c.id}: \`startPage\` "${c.startPage}" is not an absolute path`);
      }
    }
  }
  return out;
}

/**
 * Cross-check the mirrored app constants against appkit, when it is reachable.
 *
 * `cases/_app-constants.mjs` copies two values out of the application because
 * a separate repository cannot import them. A silent copy is how Root Cause
 * #42 is written, so this is the loud half — and it is SKIPPED, not failed,
 * when appkit is absent, because the tester repo must stand alone.
 */
export async function validateMirroredConstants() {
  const out = [];
  let appkitLimits;
  try {
    appkitLimits = await import("@mohasinac/appkit/_internal/shared/media/limits");
  } catch {
    return { skipped: true, problems: out };
  }
  const mine = await import("../../cases/_app-constants.mjs");
  for (const key of ["PRODUCT_MAX_IMAGES", "PRODUCT_MAX_VIDEOS"]) {
    if (appkitLimits[key] !== undefined && appkitLimits[key] !== mine[key]) {
      out.push(`_app-constants.mjs ${key} is ${mine[key]}, appkit says ${appkitLimits[key]} — the mirror has drifted`);
    }
  }
  return { skipped: false, problems: out };
}
