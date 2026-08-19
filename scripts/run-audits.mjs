#!/usr/bin/env node
/**
 * Audit dispatcher — single entry point that replaces the 49 individual
 * `audit:*` npm script aliases and the 50-command `check:audits` chain.
 *
 * Each AUDITS entry describes one check. The runner spawns `node` for the
 * given script (or `npm` for the appkit delegate), preserves the original
 * order of the legacy `check:audits` chain, and reports pass/fail.
 *
 *   node scripts/run-audits.mjs                     # run all (fail-fast)
 *   node scripts/run-audits.mjs --all               # explicit, same as above
 *   node scripts/run-audits.mjs --all --no-fail-fast
 *   node scripts/run-audits.mjs ssr-in-appkit       # single audit by name
 *   node scripts/run-audits.mjs hex-tokens --fix    # forward --fix where supported
 *   node scripts/run-audits.mjs --list              # print registry and exit
 *
 * Passthrough: any unknown flag after the audit name is forwarded to the
 * underlying script (e.g. `--verbose`).
 */

import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// Order mirrors the legacy `check:audits` && chain. Don't reorder without
// reviewing scripts/claude-hooks/check-on-stop.mjs — that hook calls the
// underlying audit-*.mjs files directly, not this dispatcher, so the
// ordering invariant here is purely about reproducing legacy output.
const AUDITS = [
  // appkit's own audit suite (runs in ./appkit cwd)
  { name: "appkit", kind: "npm-prefix", prefix: "./appkit", script: "check:audits" },

  // root-side
  { name: "a11y",                            script: "scripts/audit-a11y.mjs" },
  { name: "color-pair-function",             script: "scripts/audit-color-pair-function.mjs" },
  { name: "ssr-in-appkit",                   script: "scripts/audit-ssr-in-appkit.mjs" },
  { name: "functions-query-indices",         script: "scripts/audit-functions-query-indices.mjs" },
  { name: "raw-sticky-toolbar",              script: "scripts/audit-raw-sticky-toolbar.mjs" },
  { name: "no-demo-seed-route",              script: "scripts/audit-no-demo-seed-route.mjs" },
  { name: "responsive-wrap",                 script: "scripts/audit-responsive-wrap.mjs" },
  { name: "og-coverage",                     script: "appkit/scripts/verify-og-coverage.mjs" },
  { name: "hex-tokens",                      script: "scripts/audit-hex-tokens.mjs", supportsFix: true },
  { name: "config-factories",                script: "scripts/audit-config-factories.mjs" },
  { name: "html-wrappers",                   script: "scripts/audit-html-wrappers.mjs" },
  { name: "bulk-action-registry",            script: "scripts/audit-bulk-action-registry.mjs" },
  { name: "listing-quick-filters",           script: "scripts/audit-listing-quick-filters.mjs" },
  { name: "content-alignment",               script: "scripts/audit-content-alignment.mjs" },
  { name: "code-quality",                    script: "scripts/audit-code-quality.mjs" },
  { name: "bom",                             script: "scripts/audit-bom.mjs" },
  { name: "suspense-boundaries",             script: "scripts/audit-suspense-boundaries.mjs" },
  { name: "auth-gates",                      script: "scripts/audit-auth-gates.mjs" },
  { name: "inline-actions",                  script: "scripts/audit-inline-actions.mjs" },
  { name: "product-form-shell",              script: "scripts/audit-product-form-shell.mjs" },
  { name: "dashboard-padding",               script: "scripts/audit-dashboard-padding.mjs" },
  { name: "user-pages-overhaul",             script: "scripts/audit-user-pages-overhaul.mjs" },
  { name: "root-cause",                      script: "scripts/audit-root-cause.mjs" },
  { name: "dark-mode",                       script: "scripts/audit-dark-mode.mjs" },
  { name: "gitignore",                       script: "scripts/audit-gitignore.mjs" },
  { name: "typography",                      script: "scripts/audit-typography.mjs" },
  { name: "inline-styles",                   script: "scripts/audit-inline-styles.mjs" },
  { name: "env-alignment",                   script: "scripts/audit-env-alignment.mjs" },
  { name: "sieve-constants",                 script: "scripts/audit-sieve-constants.mjs" },
  { name: "toast-coverage",                  script: "scripts/audit-toast-coverage.mjs" },
  { name: "auth-gate-derivation",            script: "scripts/audit-auth-gate-derivation.mjs" },
  { name: "registry-constants",              script: "scripts/audit-route-nav-field-constants.mjs" },
  { name: "nav-page-wiring",                 script: "scripts/audit-nav-page-wiring.mjs" },
  { name: "schema-base-fields",             script: "scripts/audit-schema-base-fields.mjs" },
  { name: "listing-type-imports",           script: "scripts/audit-listing-type-imports.mjs" },
  { name: "listing-type-registry-usage",    script: "scripts/audit-listing-type-registry-usage.mjs" },
  { name: "per-type-data-pattern",          script: "scripts/audit-per-type-data-pattern.mjs" },
  { name: "spinner-defaults",                script: "scripts/audit-spinner-defaults.mjs" },
  { name: "silent-fetch-catch",              script: "scripts/audit-silent-fetch-catch.mjs" },
  { name: "listing-pagesize",                script: "scripts/audit-listing-pagesize.mjs" },
  { name: "jsx-text-comments",               script: "scripts/audit-jsx-text-comments.mjs" },
  { name: "seed-external-urls",              script: "scripts/audit-seed-external-urls.mjs" },
  { name: "raw-form-input",                  script: "scripts/audit-raw-form-input.mjs" },
  { name: "sticky-offsets",                  script: "scripts/audit-sticky-offsets.mjs" },
  { name: "bottom-offset",                   script: "scripts/audit-bottom-offset.mjs" },
  { name: "firebase-alias",                  script: "scripts/audit-firebase-alias.mjs" },
  { name: "semantic-colors",                 script: "scripts/audit-semantic-colors.mjs" },
  // Verifies the built-in TS theme presets stay aligned with the matching
  // CSS blocks in `appkit/src/tokens/tokens.css`. Drift causes hydration
  // flicker because the runtime ThemeProvider writes the TS preset over the
  // CSS block on hydration.
  { name: "theme-drift",                     script: "scripts/audit-theme-drift.mjs" },
  // Icon+label nav pattern: align="end"/"center" on a flex-1 label span
  // right after a shrink-0 icon span visually separates them. Strict-zero.
  { name: "icon-label-split",                script: "scripts/audit-icon-label-split.mjs" },
  // A `.split(",").map(...).filter(Boolean)` chain rebuilding a form
  // field's array value from a comma string — use <TagInput>/
  // <PaginatedSelect multiple> instead. Strict-zero.
  { name: "comma-hack-multiselect",          script: "scripts/audit-comma-hack-multiselect.mjs" },
  // Strict-zero — all 182 pre-existing permission/roles mismatches fixed
  // 2026-08-19 (182 `permission:` lines removed across 135 files). Now
  // blocking so any new route cannot reintroduce the guaranteed-403 pattern.
  { name: "permission-role-mismatch",        script: "scripts/audit-permission-role-mismatch.mjs", env: { STRICT: "1" } },
  // Strict-zero parity between ERROR_CODES / HTTP_ERROR_CODES enum values
  // and `messages/en.json` errors.codes.* keys. UNKNOWN is the only allowed
  // JSON-only key (fallback sentinel used by error-display-map).
  { name: "error-display-i18n",              script: "scripts/audit-error-display-i18n.mjs" },
  // Strict-zero. Flags raw `html: \`<` literals outside the email primitives
  // source. Forces every email sender to compose <EmailDoc> family + serialise
  // via renderToStaticMarkup.
  { name: "email-raw-html",                  script: "scripts/audit-email-raw-html.mjs" },
  // Strict-zero. Flags raw `fetch()` calls in any file that renders <Form>.
  // The canonical pattern is useApiMutation + apiClient. Suppress with
  // `// audit-form-mutation-hook-ok: <reason>` only for genuine non-form
  // fetches (CSV blob downloads etc).
  { name: "form-mutation-hook",              script: "scripts/audit-form-mutation-hook.mjs" },
  // Catches consumer-side `className=` on appkit primitives that contains
  // a token covered by one of the primitive's own variant props. Baseline-
  // drift while the consumer sweep is in flight — current count locks
  // today; regressions block. Drive to 0 in the sweep.
  { name: "variant-prop-coverage",           script: "scripts/audit-variant-prop-coverage.mjs" },
  { name: "functions-registry-completeness", script: "scripts/audit-functions-registry-completeness.mjs" },
  { name: "payment-provider-import",         script: "scripts/audit-payment-provider-import.mjs" },
  { name: "shipping-provider-import",        script: "scripts/audit-shipping-provider-import.mjs" },
  { name: "orphan-dev-routes",               script: "scripts/audit-orphan-dev-routes.mjs" },
  { name: "checkout-bypass",                 script: "scripts/audit-checkout-bypass.mjs" },
  { name: "auth-rate-limit",                 script: "scripts/audit-auth-rate-limit.mjs" },
  { name: "inline-session-cookie",           script: "scripts/audit-inline-session-cookie.mjs" },
  { name: "inline-role-check",               script: "scripts/audit-inline-role-check.mjs" },
  { name: "route-rbac",                      script: "scripts/audit-route-rbac.mjs" },
  { name: "page-rbac",                       script: "scripts/audit-page-rbac.mjs" },
  { name: "mock-gating",                     script: "scripts/audit-mock-gating.mjs" },
  { name: "form-schema",                     script: "scripts/audit-form-schema.mjs" },
  { name: "quick-form-drawer-schema",        script: "scripts/audit-quick-form-drawer-schema.mjs" },
  { name: "media-direct-upload",             script: "scripts/audit-media-direct-upload.mjs" },
  { name: "firestore-storage-urls",          script: "scripts/audit-firestore-storage-urls.mjs" },
  { name: "raw-img-src",                     script: "scripts/audit-raw-img-src.mjs" },
  { name: "finalize-magic-bytes",            script: "scripts/audit-finalize-magic-bytes.mjs" },
  { name: "media-ext-hmac",                  script: "scripts/audit-media-ext-hmac.mjs" },
  { name: "storage-rules-shape",             script: "scripts/audit-storage-rules-shape.mjs" },
  // W6 — error contract / silent-failure gates (workstreams 1, 3, 5)
  { name: "silent-body-parse",               script: "scripts/audit-silent-body-parse.mjs" },
  { name: "server-action-envelope",          script: "scripts/audit-server-action-envelope.mjs" },
  // unknown-elimination — strict-zero. No env-var opt-out.
  { name: "catch-normalize",                 script: "appkit/scripts/audit-catch-normalize.mjs" },
  // Guards the W1-51 bug class — validator regex drifting out of sync with
  // the generateMediaFilename() dispatcher it's meant to validate.
  { name: "media-filename-generators",       script: "appkit/scripts/audit-media-filename-generators.mjs" },
  { name: "route-schema-registry",           script: "appkit/scripts/audit-route-schema-registry.mjs" },
  // unknown-leakage — strict-zero. Every `: unknown` / `Record<string, unknown>` /
  // `as unknown` outside the allowlist is a violation. Per-line `// audit-
  // unknown-ok: <reason>` markers are accepted for genuine architectural
  // entry points.
  { name: "unknown-leakage",                 script: "appkit/scripts/audit-unknown-leakage.mjs" },
  { name: "usemutation-onerror",             script: "scripts/audit-usemutation-onerror.mjs" },
  // Strict-zero. Flags page/layout files that declare "use client" but import
  // no React hook, next/navigation hook, next-intl hook, or browser global.
  // RSC pages can render Client Components without the directive.
  { name: "unnecessary-use-client",         script: "scripts/audit-unnecessary-use-client.mjs" },
  // P-1: feature-flag discipline — all FEATURE_* reads via getFlag(), route guards present
  { name: "feature-flags",                  script: "scripts/audit-feature-flags.mjs" },
  { name: "duplicate-routes",               script: "scripts/audit-duplicate-routes.mjs" },
  { name: "hardcoded-api-routes",           script: "scripts/audit-hardcoded-api-routes.mjs" },
  // P-1: no raw fetch() in UI components — use server actions or src/lib/api/ wrappers
  { name: "direct-fetch-ui",               script: "scripts/audit-direct-fetch-ui.mjs" },
  // Strict-zero: blocks every known audit suppression/escape-hatch comment marker.
  // Fix root causes instead of suppressing audits with inline markers.
  { name: "no-suppression-comments",       script: "scripts/audit-no-suppression-comments.mjs" },
  // Error-handling audits: catch {} (no binding) and .catch(console.error/warn) in server code.
  // Report mode — pre-existing catch{} violations being fixed separately.
  { name: "empty-catch",                   script: "scripts/audit-empty-catch.mjs",   env: { STRICT: "1" } },
  { name: "console-catch",                 script: "scripts/audit-console-catch.mjs", env: { STRICT: "1" } },
  // Money is stored as decimal rupees everywhere except the two Razorpay
  // boundary files — flags reintroduced *Paise/InPaise identifiers and
  // paise-scale *100/÷100 arithmetic. See CLAUDE.md's paise->rupees migration.
  { name: "money-units",                   script: "scripts/audit-money-units.mjs" },
  // Strict-zero. Flags a Server Component page.tsx passing an inline function
  // as a JSX prop to a component whose defining file is a Client Component
  // ("use client") — React Server Components cannot serialize function
  // values across that boundary. Invisible to tsc; caused the 2026-08-18
  // "Something went wrong" prod crashes (getRowHref on 7 admin/store pages).
  { name: "server-client-function-props",  script: "scripts/audit-server-client-function-props.mjs" },
  // Strict-zero. <Select className="..."> only styles the inner <select> —
  // sizing/flex-control tokens (flex-shrink-0, min-w-*, max-w-*, flex-1)
  // must go on wrapperClassName, which sizes the real flex-child wrapper div.
  // Caused the 2026-08-19 header-search-bar sizing regression.
  { name: "select-wrapper-classname",      script: "scripts/audit-select-wrapper-classname.mjs" },
  // Strict-zero. SSR/client default-filter divergence on public listing pages
  // (Root Cause #30) — staleTime:Infinity freezes SSR initialData forever if
  // the SSR filter-builder doesn't mirror the client's default toggle state.
  { name: "listing-filter-parity",         script: "scripts/audit-listing-filter-parity.mjs" },
  // Strict-zero. Tester QA checklist seed data `href` fields are bare
  // strings with no compile-time tie to real routes — route renames/
  // relocations/deletions silently rot the tester's deep links
  // (Root Cause #31).
  { name: "tester-checklist-hrefs",        script: "scripts/audit-tester-checklist-hrefs.mjs" },
  // Strict-zero. A filter-chip `id` in filter-tabs.ts that doesn't match
  // any value its target Firestore field can hold — the chip silently
  // returns zero rows forever. Found live in 8+ places in one sweep
  // (2026-08-19); see CLAUDE.md's Recurrent Root Cause Patterns.
  { name: "filter-tab-enums",              script: "scripts/audit-filter-tab-enums.mjs" },
  // Strict-zero. A Firestore-trigger handler's local shadow type (e.g.
  // `NewOrder`) with a field name that doesn't exist on the real document —
  // every read of that field is `undefined` at runtime. Caught the
  // 2026-08-19 onOrderCreate bug (WhatsApp announcements always read "A
  // customer" / "₹0") after the fact; this audit prevents a recurrence.
  { name: "function-trigger-shadow-types",  script: "scripts/audit-function-trigger-shadow-types.mjs" },
  // Strict-zero. A field accepted by an admin PATCH schema but missing from
  // the sibling LIST endpoint's hand-rolled serializer — the write succeeds
  // but list-backed editors reseed from a stale/default value and silently
  // overwrite real data on the next save. Found live in users (isTester/
  // canTestAdmin) and stores (isVerified/isFeatured/capabilities) 2026-08-19.
  { name: "list-serializer-parity",         script: "scripts/audit-list-serializer-parity.mjs" },
  // Strict-zero. A selectable card's primary navigation (Link href /
  // router.push / handleClick) must never be gated on whether a selection
  // callback is merely wired — only on whether a selection is actively in
  // progress. Found live in InteractiveProductCard.tsx 2026-08-20 (href
  // dropped entirely in the onSelect branch); see CLAUDE.md's Recurrent
  // Root Cause Patterns.
  { name: "selectable-card-navigation",     script: "scripts/audit-selectable-card-navigation.mjs" },
  // Guest-participation (allowGuestParticipation) must stay the single
  // source of truth for whether an event permits anonymous entries — two
  // structurally separate decision points (enterEvent()'s generic path and
  // runAssignSpinPrize()'s independent spin-wheel path) must both read it,
  // not a hardcoded per-event-type literal. See CLAUDE.md's Recurrent Root
  // Cause Patterns.
  { name: "event-guest-gate-consistency",   script: "scripts/audit-event-guest-gate-consistency.mjs" },

];
function parseArgs(argv) {
  const args = argv.slice(2);
  const flags = { all: false, list: false, fix: false, failFast: true };
  const passthrough = [];
  let name = null;

  for (const arg of args) {
    if (arg === "--all") flags.all = true;
    else if (arg === "--list") flags.list = true;
    else if (arg === "--fix") flags.fix = true;
    else if (arg === "--no-fail-fast") flags.failFast = false;
    else if (arg.startsWith("--")) passthrough.push(arg);
    else if (!name) name = arg;
    else passthrough.push(arg);
  }

  if (!name && !flags.list) flags.all = true;
  return { name, flags, passthrough };
}

function printList() {
  const widest = Math.max(...AUDITS.map((a) => a.name.length));
  for (const a of AUDITS) {
    const target = a.kind === "npm-prefix" ? `npm --prefix ${a.prefix} run ${a.script}` : `node ${a.script}`;
    const fix = a.supportsFix ? " (supports --fix)" : "";
    console.log(`  ${a.name.padEnd(widest)}  ${target}${fix}`);
  }
}

function runAudit(audit, { fix, passthrough }) {
  const extra = [...passthrough];
  if (fix && audit.supportsFix) extra.push("--fix");

  let cmd, args, opts;
  if (audit.kind === "npm-prefix") {
    cmd = process.platform === "win32" ? "npm.cmd" : "npm";
    args = ["--prefix", audit.prefix, "run", audit.script, ...(extra.length ? ["--", ...extra] : [])];
    // Node 20+ requires shell:true to spawn .cmd/.bat on Windows.
    opts = { cwd: ROOT, stdio: "inherit", shell: process.platform === "win32" };
  } else {
    cmd = process.execPath;
    args = [audit.script, ...extra];
    const env = audit.env ? { ...process.env, ...audit.env } : process.env;
    opts = { cwd: ROOT, stdio: "inherit", env };
  }

  const t0 = Date.now();
  const res = spawnSync(cmd, args, opts);
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

  if (res.error) {
    console.error(`  ✗ ${audit.name} — spawn error: ${res.error.message}`);
    return { ok: false, code: 1, elapsed };
  }
  return { ok: res.status === 0, code: res.status ?? 1, elapsed };
}

function main() {
  const { name, flags, passthrough } = parseArgs(process.argv);

  if (flags.list) {
    printList();
    process.exit(0);
  }

  // Single audit by name
  if (name && !flags.all) {
    const audit = AUDITS.find((a) => a.name === name);
    if (!audit) {
      console.error(`✗ Unknown audit: ${name}`);
      console.error(`Run "node scripts/run-audits.mjs --list" to see available audits.`);
      process.exit(2);
    }
    const { ok, code } = runAudit(audit, { fix: flags.fix, passthrough });
    process.exit(ok ? 0 : code);
  }

  // All audits
  const failures = [];
  for (const audit of AUDITS) {
    const { ok, code, elapsed } = runAudit(audit, { fix: flags.fix, passthrough });
    if (!ok) {
      failures.push({ name: audit.name, code });
      console.error(`✗ ${audit.name} failed (${elapsed}s, exit ${code})`);
      if (flags.failFast) {
        process.exit(code || 1);
      }
    }
  }

  if (failures.length) {
    console.error(`\n${failures.length} audit(s) failed: ${failures.map((f) => f.name).join(", ")}`);
    process.exit(failures[0].code || 1);
  }
}

main();
