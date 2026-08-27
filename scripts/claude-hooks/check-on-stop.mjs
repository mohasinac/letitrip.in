#!/usr/bin/env node
/**
 * Claude Code Stop hook — runs the fast quality gates after each assistant turn.
 *
 * Runs:
 *   - appkit/scripts/audit-violations.mjs        (boundary check)
 *   - appkit/scripts/verify-entries.mjs          (client entry firebase-admin free)
 *   - appkit/scripts/verify-css-build.mjs        (compiled CSS class completeness)
 *   - scripts/audit-ssr-in-appkit.mjs            (route shim thresholds + sidecar + brand strings)
 *   - appkit/scripts/audit-use-client.mjs        (missing "use client" on client-hook files)
 *   - appkit/scripts/audit-double-navigation.mjs (table.set + table.setPage race condition)
 *   - scripts/audit-html-wrappers.mjs            (raw HTML instead of appkit primitives + bare divs)
 *   - scripts/audit-code-quality.mjs             (long if-else, deep nesting, large fns, repeated strings)
 *   - scripts/audit-bom.mjs                      (UTF-8 BOM characters from PowerShell encoding)
 *   - scripts/audit-sieve-constants.mjs          (raw sort/filter strings — use sortBy()/sieveFilter())
 *   - appkit/scripts/audit-repository-fields.mjs (deprecated J13 Sieve fields + wrong stats.* sort paths)
 *   - scripts/audit-suspense-boundaries.mjs      (missing <Suspense> on RSC listing page shims)
 *   - scripts/audit-auth-gates.mjs               (pushWishlistOp/checkout without useAuthGate)
 *   - scripts/audit-inline-actions.mjs           (inline action IDs/labels duplicating registry)
 *   - appkit/scripts/audit-query-provider.mjs    (component both provides QueryClientProvider and calls react-query hooks)
 *   - appkit/scripts/audit-export-paths.mjs     (broken re-exports in client.ts/index.ts/server.ts → deleted source files)
 *   - scripts/audit-dashboard-padding.mjs       (double px-4/py-* padding on dashboard pages that DashboardLayoutClient already covers)
 *   - scripts/audit-root-cause.mjs             (in-memory fallbacks, // HACK/WORKAROUND/Fallback comments, deferred TODOs in production code)
 *   - scripts/audit-gitignore.mjs             (unanchored .gitignore patterns that silently exclude nested source files)
 *   - scripts/audit-money-units.mjs           (reintroduced *Paise/InPaise identifiers or paise-scale multiply/divide-by-100 arithmetic)
 *   - scripts/audit-server-client-function-props.mjs (Server Component page.tsx passing an inline function to a Client Component)
 *   - scripts/audit-select-wrapper-classname.mjs (Select className sizing token instead of wrapperClassName)
 *   - scripts/audit-primitive-child-wrappers.mjs (a primitive's internal {children} wrapper that collapses fill children to 0x0)
 *   - scripts/audit-listing-filter-parity.mjs (SSR/client default-filter divergence on public listing pages, Root Cause #30)
 *   - scripts/audit-nav-page-wiring.mjs       (dead admin/store/user nav links — nav entry with no page.tsx, Root Cause #29)
 *   - scripts/audit-route-nav-field-constants.mjs (hardcoded routes, inline nav arrays, raw field strings, and static ROUTES.* hand-concatenated with a dynamic segment instead of a parametrized *_DETAIL route)
 *   - scripts/audit-sieve-date-fields.mjs     (Sieve field config for a Firestore Timestamp field, filterable but missing parseValue — GTE/LTE silently matches nothing)
 *   - scripts/audit-seo-canonical-host.mjs    (two owners of the canonical host disagreeing — the sitemap advertises URLs on a host that redirects)
 *   - scripts/audit-seo-sitemap-parity.mjs    (a sitemap fetcher filtering on a literal absent from its own union, or swallowing to [] unlogged)
 *
 * Baseline-drift audits: audit-ssr-in-appkit, audit-html-wrappers, audit-code-quality block
 * only when the violation count EXCEEDS the recorded baseline (regressions only).
 * audit-root-cause manages its own baseline internally (exits 1 only on regressions).
 * audit-sieve-constants manages its own baseline internally (exits 0 on no regression).
 *
 * Total runtime: ~3–5s. Heavy gates (tsc + lint) live in `npm run check`.
 *
 * Exit semantics for Claude Code Stop hook:
 *   - exit 0 → silent pass
 *   - exit 2 → blocks the stop and surfaces stderr to the model so it can fix
 *   - other  → non-blocking error shown to user
 *
 * Reads stop_hook_active from stdin to avoid infinite loops; if true, exits 0.
 */

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync, readFileSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");

// Read hook input from stdin to detect re-entry; bail if Claude is already
// responding to a previous block from this same hook.
let payload = {};
try {
  const raw = readFileSync(0, "utf8");
  if (raw.trim()) payload = JSON.parse(raw);
} catch {
  // No stdin or non-JSON; treat as empty payload.
}
if (payload.stop_hook_active === true) process.exit(0);

const checks = [
  {
    label: "audit-violations",
    cmd: "node",
    args: ["scripts/audit-violations.mjs"],
    cwd: join(ROOT, "appkit"),
  },
  {
    label: "verify-entries",
    cmd: "node",
    args: ["scripts/verify-entries.mjs"],
    cwd: join(ROOT, "appkit"),
  },
  {
    label: "verify-css-build",
    cmd: "node",
    args: ["scripts/verify-css-build.mjs"],
    cwd: join(ROOT, "appkit"),
  },
  {
    label: "audit-ssr-in-appkit",
    cmd: "node",
    args: ["scripts/audit-ssr-in-appkit.mjs"],
    cwd: ROOT,
  },
  {
    label: "verify-og-coverage",
    cmd: "node",
    args: ["appkit/scripts/verify-og-coverage.mjs"],
    cwd: ROOT,
  },
  {
    label: "audit-use-client",
    cmd: "node",
    args: ["scripts/audit-use-client.mjs"],
    cwd: join(ROOT, "appkit"),
  },
  {
    label: "audit-double-navigation",
    cmd: "node",
    args: ["scripts/audit-double-navigation.mjs"],
    cwd: join(ROOT, "appkit"),
  },
  {
    label: "audit-html-wrappers",
    cmd: "node",
    args: ["scripts/audit-html-wrappers.mjs"],
    cwd: ROOT,
  },
  {
    label: "audit-code-quality",
    cmd: "node",
    args: ["scripts/audit-code-quality.mjs"],
    cwd: ROOT,
  },
  {
    label: "audit-bom",
    cmd: "node",
    args: ["scripts/audit-bom.mjs"],
    cwd: ROOT,
  },
  {
    label: "audit-sieve-constants",
    cmd: "node",
    args: ["scripts/audit-sieve-constants.mjs"],
    cwd: ROOT,
  },
  {
    label: "audit-schema-base-fields",
    cmd: "node",
    args: ["scripts/audit-schema-base-fields.mjs"],
    cwd: ROOT,
  },
  {
    label: "audit-listing-type-imports",
    cmd: "node",
    args: ["scripts/audit-listing-type-imports.mjs"],
    cwd: ROOT,
  },
  {
    label: "audit-listing-type-registry-usage",
    cmd: "node",
    args: ["scripts/audit-listing-type-registry-usage.mjs"],
    cwd: ROOT,
  },
  {
    label: "audit-per-type-data-pattern",
    cmd: "node",
    args: ["scripts/audit-per-type-data-pattern.mjs"],
    cwd: ROOT,
  },
  {
    label: "audit-repository-fields",
    cmd: "node",
    args: ["appkit/scripts/audit-repository-fields.mjs"],
    cwd: ROOT,
  },
  {
    label: "audit-suspense-boundaries",
    cmd: "node",
    args: ["scripts/audit-suspense-boundaries.mjs"],
    cwd: ROOT,
  },
  {
    label: "audit-auth-gates",
    cmd: "node",
    args: ["scripts/audit-auth-gates.mjs"],
    cwd: ROOT,
  },
  {
    label: "audit-inline-actions",
    cmd: "node",
    args: ["scripts/audit-inline-actions.mjs"],
    cwd: ROOT,
  },
  {
    label: "audit-query-provider",
    cmd: "node",
    args: ["scripts/audit-query-provider.mjs"],
    cwd: join(ROOT, "appkit"),
  },
  {
    label: "audit-export-paths",
    cmd: "node",
    args: ["scripts/audit-export-paths.mjs"],
    cwd: join(ROOT, "appkit"),
  },
  {
    label: "audit-dashboard-padding",
    cmd: "node",
    args: ["scripts/audit-dashboard-padding.mjs"],
    cwd: ROOT,
  },
  {
    label: "audit-root-cause",
    cmd: "node",
    args: ["scripts/audit-root-cause.mjs"],
    cwd: ROOT,
  },
  {
    label: "audit-no-suppression-comments",
    cmd: "node",
    args: ["scripts/audit-no-suppression-comments.mjs"],
    cwd: ROOT,
  },
  {
    label: "audit-gitignore",
    cmd: "node",
    args: ["scripts/audit-gitignore.mjs"],
    cwd: ROOT,
  },
  {
    label: "audit-typography",
    cmd: "node",
    args: ["scripts/audit-typography.mjs"],
    cwd: ROOT,
  },
  {
    label: "audit-inline-styles",
    cmd: "node",
    args: ["scripts/audit-inline-styles.mjs"],
    cwd: ROOT,
  },
  {
    label: "audit-select-wrapper-classname",
    cmd: "node",
    args: ["scripts/audit-select-wrapper-classname.mjs"],
    cwd: ROOT,
  },
  {
    label: "audit-client-entry-in-server",
    cmd: "node",
    args: ["scripts/audit-client-entry-in-server.mjs"],
    cwd: ROOT,
  },
  {
    label: "audit-primitive-child-wrappers",
    cmd: "node",
    args: ["scripts/audit-primitive-child-wrappers.mjs"],
    cwd: ROOT,
  },
  {
    label: "audit-jsx-text-comments",
    cmd: "node",
    args: ["scripts/audit-jsx-text-comments.mjs"],
    cwd: ROOT,
  },
  {
    label: "audit-seed-external-urls",
    cmd: "node",
    args: ["scripts/audit-seed-external-urls.mjs"],
    cwd: ROOT,
  },
  {
    label: "audit-raw-form-input",
    cmd: "node",
    args: ["scripts/audit-raw-form-input.mjs"],
    cwd: ROOT,
  },
  {
    label: "audit-hex-tokens",
    cmd: "node",
    args: ["scripts/audit-hex-tokens.mjs"],
    cwd: ROOT,
  },
  {
    label: "audit-semantic-colors",
    cmd: "node",
    args: ["scripts/audit-semantic-colors.mjs"],
    cwd: ROOT,
  },
  {
    // Verifies the TS theme presets (`default-light.ts`, `default-dark.ts`)
    // stay aligned with the matching CSS blocks in `tokens.css`. Drift causes
    // hydration flicker.
    label: "audit-theme-drift",
    cmd: "node",
    args: ["scripts/audit-theme-drift.mjs"],
    cwd: ROOT,
  },
  {
    // WCAG contrast check across every built-in theme's text/background
    // token pairings — catches the class of bug where a theme ships with
    // technically-valid-but-illegible color pairs (e.g. low-contrast footer
    // links).
    label: "audit-a11y",
    cmd: "node",
    args: ["scripts/audit-a11y.mjs"],
    cwd: ROOT,
  },
  {
    // Composite-index coverage for server-side job/function/action queries —
    // the blind spot audit-listing-indices.mjs's own doc comment names
    // ("server jobs / fan-out NOT scanned"). Catches FAILED_PRECONDITION
    // crashes in Cloud Functions and server actions before they ship.
    label: "audit-functions-query-indices",
    cmd: "node",
    args: ["scripts/audit-functions-query-indices.mjs"],
    cwd: ROOT,
  },
  {
    // Hand-rolled `sticky ... top-[...]` className outside StickyToolbar.tsx
    // itself — blocks a regression back to the 34-site duplication this
    // session consolidated into one primitive (with a mobile-dismiss control
    // hand-rolled copies never had).
    label: "audit-raw-sticky-toolbar",
    cmd: "node",
    args: ["scripts/audit-raw-sticky-toolbar.mjs"],
    cwd: ROOT,
  },
  {
    // Blocks the deleted seed panel (SeedPanel component + /api/demo/seed
    // route, Phase 4) from silently coming back.
    label: "audit-no-demo-seed-route",
    cmd: "node",
    args: ["scripts/audit-no-demo-seed-route.mjs"],
    cwd: ROOT,
  },
  {
    // Icon+label nav pattern: align="end"/"center" on a flex-1 label span
    // right after a shrink-0 icon span visually separates them.
    label: "audit-icon-label-split",
    cmd: "node",
    args: ["scripts/audit-icon-label-split.mjs"],
    cwd: ROOT,
  },
  {
    // A `.split(",").map(...).filter(Boolean)` chain rebuilding a form
    // field's array value from a comma string — use <TagInput>/
    // <PaginatedSelect multiple> instead.
    label: "audit-comma-hack-multiselect",
    cmd: "node",
    args: ["scripts/audit-comma-hack-multiselect.mjs"],
    cwd: ROOT,
  },
  {
    // Strict-zero parity between ERROR_CODES / HTTP_ERROR_CODES enum values
    // and `messages/en.json` errors.codes.* keys.
    label: "audit-error-display-i18n",
    cmd: "node",
    args: ["scripts/audit-error-display-i18n.mjs"],
    cwd: ROOT,
  },
  {
    // Strict-zero. Flags raw `html: \`<` literals outside the email primitives
    // source. Phase 11 (2026-06-17) rewrote every sender to compose <EmailDoc>
    // family primitives + serialise via renderToStaticMarkup.
    label: "audit-email-raw-html",
    cmd: "node",
    args: ["scripts/audit-email-raw-html.mjs"],
    cwd: ROOT,
  },
  {
    // Strict-zero. Flags raw fetch() calls in <Form>-rendering files.
    label: "audit-form-mutation-hook",
    cmd: "node",
    args: ["scripts/audit-form-mutation-hook.mjs"],
    cwd: ROOT,
  },
  {
    // Catches consumer-side `className=` on appkit primitives that maps to
    // a variant prop. Baseline-drift; regressions block until the sweep
    // drives the count down.
    label: "audit-variant-prop-coverage",
    cmd: "node",
    args: ["scripts/audit-variant-prop-coverage.mjs"],
    cwd: ROOT,
  },
  {
    label: "audit-listing-pagesize",
    cmd: "node",
    args: ["scripts/audit-listing-pagesize.mjs"],
    cwd: ROOT,
  },
  {
    label: "audit-sticky-offsets",
    cmd: "node",
    args: ["scripts/audit-sticky-offsets.mjs"],
    cwd: ROOT,
  },
  {
    label: "audit-firebase-alias",
    cmd: "node",
    args: ["scripts/audit-firebase-alias.mjs"],
    cwd: ROOT,
  },
  // ── Strict-zero audits added in the Functions Registry + Provider Abstraction
  // + Auth/RBAC + Forms + Media + Mocks sprint ──────────────────────────────
  { label: "audit-functions-registry-completeness", cmd: "node", args: ["scripts/audit-functions-registry-completeness.mjs"], cwd: ROOT },
  { label: "audit-payment-provider-import", cmd: "node", args: ["scripts/audit-payment-provider-import.mjs"], cwd: ROOT },
  { label: "audit-shipping-provider-import", cmd: "node", args: ["scripts/audit-shipping-provider-import.mjs"], cwd: ROOT },
  { label: "audit-orphan-dev-routes", cmd: "node", args: ["scripts/audit-orphan-dev-routes.mjs"], cwd: ROOT },
  { label: "audit-checkout-bypass", cmd: "node", args: ["scripts/audit-checkout-bypass.mjs"], cwd: ROOT },
  { label: "audit-auth-rate-limit", cmd: "node", args: ["scripts/audit-auth-rate-limit.mjs"], cwd: ROOT },
  { label: "audit-inline-session-cookie", cmd: "node", args: ["scripts/audit-inline-session-cookie.mjs"], cwd: ROOT },
  { label: "audit-inline-role-check", cmd: "node", args: ["scripts/audit-inline-role-check.mjs"], cwd: ROOT },
  { label: "audit-route-rbac", cmd: "node", args: ["scripts/audit-route-rbac.mjs"], cwd: ROOT },
  { label: "audit-page-rbac", cmd: "node", args: ["scripts/audit-page-rbac.mjs"], cwd: ROOT },
  { label: "audit-mock-gating", cmd: "node", args: ["scripts/audit-mock-gating.mjs"], cwd: ROOT },
  { label: "audit-form-schema", cmd: "node", args: ["scripts/audit-form-schema.mjs"], cwd: ROOT },
  { label: "audit-quick-form-drawer-schema", cmd: "node", args: ["scripts/audit-quick-form-drawer-schema.mjs"], cwd: ROOT },
  { label: "audit-media-direct-upload", cmd: "node", args: ["scripts/audit-media-direct-upload.mjs"], cwd: ROOT },
  { label: "audit-firestore-storage-urls", cmd: "node", args: ["scripts/audit-firestore-storage-urls.mjs"], cwd: ROOT },
  { label: "audit-raw-img-src", cmd: "node", args: ["scripts/audit-raw-img-src.mjs"], cwd: ROOT },
  { label: "audit-finalize-magic-bytes", cmd: "node", args: ["scripts/audit-finalize-magic-bytes.mjs"], cwd: ROOT },
  { label: "audit-storage-rules-shape", cmd: "node", args: ["scripts/audit-storage-rules-shape.mjs"], cwd: ROOT },
  { label: "audit-unnecessary-use-client", cmd: "node", args: ["scripts/audit-unnecessary-use-client.mjs"], cwd: ROOT },
  // ── P-1: feature-flag discipline (strict-zero) ───────────────────────────
  { label: "audit-feature-flags",   cmd: "node", args: ["scripts/audit-feature-flags.mjs"],   cwd: ROOT },
  { label: "audit-direct-fetch-ui", cmd: "node", args: ["scripts/audit-direct-fetch-ui.mjs"], cwd: ROOT },
  // ── Error-handling discipline: no `catch {}` (no binding) or `.catch(console.error)` ─
  { label: "audit-empty-catch",   cmd: "node", args: ["scripts/audit-empty-catch.mjs"],   cwd: ROOT, env: { STRICT: "1" } },
  { label: "audit-console-catch", cmd: "node", args: ["scripts/audit-console-catch.mjs"], cwd: ROOT, env: { STRICT: "1" } },
  // ── Money is decimal rupees everywhere except the two Razorpay boundary files ─
  { label: "audit-money-units", cmd: "node", args: ["scripts/audit-money-units.mjs"], cwd: ROOT },
  { label: "audit-server-client-function-props", cmd: "node", args: ["scripts/audit-server-client-function-props.mjs"], cwd: ROOT },
  // ── SSR/client default-filter divergence on public listing pages (Root Cause #30) ─
  { label: "audit-listing-filter-parity", cmd: "node", args: ["scripts/audit-listing-filter-parity.mjs"], cwd: ROOT },
  // ── Dead admin/store/user nav links — nav entry with no page.tsx behind it (Root Cause #29) ─
  { label: "audit-nav-page-wiring", cmd: "node", args: ["scripts/audit-nav-page-wiring.mjs"], cwd: ROOT },
  // ── Hardcoded routes, inline nav arrays, raw field strings, and static ROUTES.*
  //    concatenated with a dynamic segment instead of a parametrized *_DETAIL route
  //    (the admin dashboard "Recent Orders" 404, 2026-08-19) ─
  { label: "audit-route-nav-field-constants", cmd: "node", args: ["scripts/audit-route-nav-field-constants.mjs"], cwd: ROOT },
  // ── A Sieve field config for a Firestore Timestamp field that's filterable
  //    but missing parseValue — GTE/LTE silently matches zero documents
  //    (Timestamp-vs-string type mismatch). Root cause of the "must click
  //    Show ended to see live auctions" bug, 2026-08-20 ─
  { label: "audit-sieve-date-fields", cmd: "node", args: ["scripts/audit-sieve-date-fields.mjs"], cwd: ROOT },
  // ── The canonical host drifting between its two owners, and a sitemap section
  //    silently returning zero URLs. Both are invisible at runtime — the only
  //    symptom is Google slowly dropping the site, which is what happened in
  //    August 2026. Cheap enough to run per-turn. ─
  { label: "audit-seo-canonical-host", cmd: "node", args: ["scripts/audit-seo-canonical-host.mjs"], cwd: ROOT },
  { label: "audit-seo-sitemap-parity", cmd: "node", args: ["scripts/audit-seo-sitemap-parity.mjs"], cwd: ROOT },
  // ── A "use client" file whose import graph transitively reaches "server-only"
  //    (directly, or via the bare "@mohasinac/appkit" package) — the exact bug
  //    class that broke the webpack production build, 2026-08-20 ─
  { label: "audit-client-server-only-leak", cmd: "node", args: ["scripts/audit-client-server-only-leak.mjs"], cwd: ROOT },
  // ── opacity-0 hover-reveal without pointer-events-none silently swallows
  //    mobile taps (no :hover on touch) — "cards don't open on mobile", 2026-08-20 ─
  { label: "audit-hover-reveal-pointer-events", cmd: "node", args: ["scripts/audit-hover-reveal-pointer-events.mjs"], cwd: ROOT },
  // ── a component's own RBAC gate trusts the cached SessionContext field
  //    instead of its own data fetch's live 403 — up to 5 min stale after an
  //    admin grants/revokes access, 2026-08-20 (TesterHubView) ─
  { label: "audit-rbac-gate-staleness", cmd: "node", args: ["scripts/audit-rbac-gate-staleness.mjs"], cwd: ROOT },
];

// Baseline violation counts — strict-zero. All three audits verified clean ✓
// on 2026-06-13; prior stale baselines (8 / 305 / 450) would have absorbed
// regressions silently. Any new violation now fails the gate.
const SSR_BASELINE = 0;
const HTML_WRAPPERS_BASELINE = 0;
const CODE_QUALITY_BASELINE = 0;

const failures = [];

for (const check of checks) {
  if (!existsSync(join(check.cwd, check.args[0]))) {
    failures.push({ label: check.label, output: `script not found: ${check.args[0]}` });
    continue;
  }
  const spawnEnv = check.env ? { ...process.env, ...check.env } : process.env;
  const result = spawnSync(check.cmd, check.args, {
    cwd: check.cwd,
    encoding: "utf8",
    shell: false,
    env: spawnEnv,
  });
  if (result.status === 0) continue;

  // Baseline-drift audits: only block on regressions, not on existing violations.
  const BASELINE_AUDITS = {
    "audit-ssr-in-appkit": SSR_BASELINE,
    "audit-html-wrappers": HTML_WRAPPERS_BASELINE,
    "audit-code-quality": CODE_QUALITY_BASELINE,
  };
  if (check.label in BASELINE_AUDITS) {
    const baseline = BASELINE_AUDITS[check.label];
    const out = (result.stdout || "") + (result.stderr || "");
    const m = out.match(/(\d+)\s+violation\(s\) found/);
    if (m) {
      const count = Number(m[1]);
      if (count <= baseline) continue;
      failures.push({
        label: check.label,
        output: `${count} violations (baseline ${baseline} — regression of ${count - baseline}).\n\n${out}`,
      });
      continue;
    }
  }
  failures.push({
    label: check.label,
    output: (result.stdout || "") + (result.stderr || ""),
  });
}

if (failures.length === 0) process.exit(0);

const banner =
  "\n========================================================\n" +
  "Quality gate failure — fix before reporting work complete.\n" +
  "Run `npm run check` locally for the full set including tsc + lint.\n" +
  "========================================================\n";

process.stderr.write(banner);
for (const f of failures) {
  process.stderr.write(`\n[${f.label}]\n${f.output}\n`);
}
process.exit(2);
