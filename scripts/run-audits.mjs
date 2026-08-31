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
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// Order mirrors the legacy `check:audits` && chain.
//
// 🛑 THIS ARRAY IS THE ONLY LIST OF AUDITS.
// `scripts/claude-hooks/check-on-stop.mjs` imports it rather than repeating it.
// It used to hand-maintain its own copy, and the two drifted badly: 73 of the
// 148 registered audits had never once run in the Stop hook, including
// `pii-crypto`, `public-projection-parity`, `permission-role-mismatch` and
// `silent-degrade`. A new audit is now covered by the hook the moment it is
// registered here — that is the point.
//
// Set `slow: true` on an entry to exclude it from the per-turn hook (it still
// runs in `npm run check`). Excluding is an explicit, reviewable decision;
// inclusion is the default.
export const AUDITS = [
  // appkit's own audit suite (runs in ./appkit cwd)
  { name: "appkit", kind: "npm-prefix", prefix: "./appkit", script: "check:audits" },

  // root-side
  { name: "client-server-only-leak",         script: "scripts/audit-client-server-only-leak.mjs" },
  { name: "client-entry-in-server",          script: "scripts/audit-client-entry-in-server.mjs" },
  { name: "relative-runtime-require",        script: "scripts/audit-relative-runtime-require.mjs" },
  { name: "observability-registration",      script: "scripts/audit-observability-registration.mjs" },
  // The four root Firebase config files are GENERATED from appkit/firebase/base
  // and are also what firebase.json deploys. They were listed in .gitignore AND
  // tracked simultaneously (a no-op that trained everyone to ignore them in
  // `git status`), appkit is a submodule whose bump can change the source with
  // nothing prompting a regenerate, and no CI step diffed them. A stale copy
  // means production runs rules the source no longer says — including a
  // tightening you believed had shipped.
  { name: "firebase-rules-generated",        script: "scripts/audit-firebase-rules-generated.mjs" },
  // The other half of that check: generated-matches-source says nothing about
  // whether the live project is RUNNING it. auction-bids sat `.read: true`
  // publishing a bidder's name; committing `.read: false` changed nothing until
  // the deploy actually ran, and no diff or green build would have said so.
  { name: "firebase-rules-deployed",         script: "scripts/audit-firebase-rules-deployed.mjs" },
  // An error's own .message is written for a developer; showing it to a user is
  // at best noise and at worst a leak — a Node require stack with /var/task
  // paths was rendered inside the bid modal that way (Root Cause #86). The
  // dominant shape is an INVERTED ternary: `err instanceof Error ? err.message
  // : "<authored copy>"` shows the authored sentence only when the value is not
  // an Error, i.e. almost never. REPORT-ONLY at 73 sites; MIGRATE=strict fails.
  // Burn down risk-first (auth, money, bid, admin) then flip, the way
  // audit-silent-degrade is staged.
  { name: "raw-error-text",                  script: "scripts/audit-raw-error-text.mjs" },
  { name: "hover-reveal-pointer-events",     script: "scripts/audit-hover-reveal-pointer-events.mjs" },
  { name: "rbac-gate-staleness",             script: "scripts/audit-rbac-gate-staleness.mjs" },
  { name: "a11y",                            script: "scripts/audit-a11y.mjs" },
  { name: "color-pair-function",             script: "scripts/audit-color-pair-function.mjs" },
  { name: "ssr-in-appkit",                   script: "scripts/audit-ssr-in-appkit.mjs" },
  { name: "functions-query-indices",         script: "scripts/audit-functions-query-indices.mjs" },
  { name: "raw-sticky-toolbar",              script: "scripts/audit-raw-sticky-toolbar.mjs" },
  { name: "no-demo-seed-route",              script: "scripts/audit-no-demo-seed-route.mjs" },
  { name: "responsive-wrap",                 script: "scripts/audit-responsive-wrap.mjs" },
  { name: "card-grid-cols",                  script: "scripts/audit-card-grid-cols.mjs" },
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
  { name: "no-step-wizard",                  script: "scripts/audit-no-step-wizard.mjs" },
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
  { name: "create-affordance",               script: "scripts/audit-create-affordance.mjs" },
  { name: "dead-route-key",                  script: "scripts/audit-dead-route-key.mjs" },
  { name: "orphan-view-component",           script: "scripts/audit-orphan-view-component.mjs" },
  { name: "client-verb-match",               script: "scripts/audit-client-verb-match.mjs" },
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
  // Status colours must be used in matched pairs — chip is
  // `bg-{status}-surface + text-{status}`, overlay is
  // `bg-{status}-solid + text-{status}-on-solid`. Both the surface tint and
  // the bare status ink invert with the theme, so pairing either with a
  // literal `text-white` is invisible in exactly one theme. Also blocks
  // `danger-*` utilities, which Tailwind never generates for the consumer
  // build and therefore drops silently. Strict-zero.
  { name: "status-color-pairs",              script: "scripts/audit-status-color-pairs.mjs" },
  // Strict-zero, no suppression marker. A `hover:bg-{palette}-{50,100,200}` is a
  // theme-INVARIANT light tint — unreadable behind `dark:hover:text-*` white ink
  // in every dark theme, which is the "white background behind white text on
  // hover" report. Also blocks two competing `hover:bg-*` on one element (the
  // deleted scripts/migrate-dark-classes.mjs ORPHAN_REPLACEMENTS artifact): both
  // tie at (0,2,0) AND both carry !important under `important: true`, so
  // EMISSION ORDER decides and the hardcoded tint was emitted last and won.
  { name: "theme-invariant-hover",           script: "scripts/audit-theme-invariant-hover.mjs" },
  // Strict-zero, no suppression marker. Icon size must come from ICON_SIZE, and
  // a text character (♥/★) must never stand in for an icon inside a control —
  // no width or height utility can size one. Scoped to interactive controls;
  // decorative section art is a composition choice, not a system violation.
  { name: "icon-sizing",                     script: "scripts/audit-icon-sizing.mjs" },
  { name: "table-column-priority",           script: "scripts/audit-table-column-priority.mjs" },
  { name: "column-renderers",                script: "scripts/audit-column-renderers.mjs" },
  { name: "unvalidated-request-body",        script: "scripts/audit-unvalidated-request-body.mjs" },
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
  { name: "form-sectionised",                script: "scripts/audit-form-sectionised.mjs" },
  { name: "address-shape",                   script: "scripts/audit-address-shape.mjs" },
  { name: "nav-metadata",                    script: "scripts/audit-nav-metadata.mjs" },
  { name: "action-index",                    script: "scripts/audit-action-index.mjs" },
  { name: "quick-form-drawer-schema",        script: "scripts/audit-quick-form-drawer-schema.mjs" },
  // Every form that owns schema-driven validation must also render the
  // shared <FormErrorSummary> beside its Submit/Save button — closes the
  // "validates but never shown anywhere" gap the product-create bug exposed.
  { name: "form-error-summary",              script: "scripts/audit-form-error-summary.mjs" },
  // Catches the exact "prop received, silently discarded" bug class that
  // caused FormShell.tsx's `schema: _schema` and StepForm.tsx's dead
  // `_setFieldErrors` in the first place. Best-effort/regex-based — see the
  // script header for known limitations.
  { name: "dead-underscore-prop",            script: "scripts/audit-dead-underscore-prop.mjs" },
  // A `.safeParse(` result that's computed but never piped into
  // setFieldError/applyZodIssues/a thrown ValidationError — validation ran,
  // nothing happened with it.
  { name: "unvalidated-safeparse",           script: "scripts/audit-unvalidated-safeparse.mjs" },
  { name: "media-direct-upload",             script: "scripts/audit-media-direct-upload.mjs" },
  { name: "firestore-storage-urls",          script: "scripts/audit-firestore-storage-urls.mjs" },
  { name: "raw-img-src",                     script: "scripts/audit-raw-img-src.mjs" },
  { name: "finalize-magic-bytes",            script: "scripts/audit-finalize-magic-bytes.mjs" },
  { name: "media-ext-hmac",                  script: "scripts/audit-media-ext-hmac.mjs" },
  { name: "storage-rules-shape",             script: "scripts/audit-storage-rules-shape.mjs" },
  // W6 — error contract / silent-failure gates (workstreams 1, 3, 5)
  { name: "silent-body-parse",               script: "scripts/audit-silent-body-parse.mjs" },
  { name: "server-action-envelope",          script: "scripts/audit-server-action-envelope.mjs" },
  // Strict-zero, no suppression marker. Producer/consumer parity for the HTTP
  // ERROR envelope, both directions. Four producers emitted a body while
  // ApiClientError read three keys off it, and nobody checked they matched —
  // `api-response.ts` emitted `details` (unread) and never emitted
  // `code`/`issues`/`requestId` (read). Consequence: every createApiHandler
  // route's validation failure reached the user as a bare "Validation failed"
  // with no field name, and applyZodIssues was dead code app-wide.
  // Deliberately NOT folded into server-action-envelope above — that one is
  // designed to start failing once `success` can be dropped, i.e. it
  // self-terminates; this rule is permanent.
  { name: "api-error-envelope",              script: "scripts/audit-api-error-envelope.mjs" },
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
  // Strict-zero. A primitive's internal `{children}` wrapper must not introduce
  // a sizing context the consumer can't see — `.appkit-button__content` was
  // shrink-to-fit in both axes, so every fill child (<MediaImage>, <Image fill>,
  // absolute inset-0) collapsed to 0x0 and every image-tile button in the app
  // rendered blank. Root Cause #68.
  { name: "primitive-child-wrappers",      script: "scripts/audit-primitive-child-wrappers.mjs" },
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
  { name: "field-names-union-parity",      script: "scripts/audit-field-names-union-parity.mjs" },
  { name: "field-ui-meta",                 script: "scripts/audit-field-ui-meta.mjs" },
  // Strict-zero. `functions/lib` is a tsup snapshot that INLINES appkit at
  // build time, so rebuilding appkit/dist never updates it. A stale bundle
  // makes the deployed listingProcessor Function apply different Sieve
  // semantics than the app's own repository fallback — silently. Caused the
  // 2026-08-21 "/products returns every listing type" leak.
  { name: "functions-bundle-freshness",    script: "scripts/audit-functions-bundle-freshness.mjs" },
  // Strict-zero. Every hand-written "list all the listing types" map must
  // cover the whole ListingType union, and the maps converted to registry
  // derivations must stay derived. Ten such maps had drifted apart by
  // 2026-08-21: /products offered 4 of 9 type chips, art/stickers were absent
  // from most, and the long-dead `bundle` type was still listed in several.
  { name: "listing-type-tab-coverage",     script: "scripts/audit-listing-type-tab-coverage.mjs" },
  { name: "listing-type-view-factory",     script: "scripts/audit-listing-type-view-factory.mjs" },
  // Strict-zero. A tab the user can click that has no render branch shows a
  // blank panel — CategoryDetailTabs did exactly this for four listing types.
  { name: "tab-body-coverage",             script: "scripts/audit-tab-body-coverage.mjs" },
  // Strict-zero. A SIEVE_FIELDS entry for a field the document doesn't have
  // (matches zero rows forever), or a filter emitted on a real field that
  // SIEVE_FIELDS omits (silently dropped — `throwExceptions: false`). Both
  // were live 2026-08-21: `freeShipping` was allowlisted but isn't a field,
  // while the real `shippingPaidBy` clause the Free-shipping toggle emitted
  // was thrown away, so the toggle did nothing at all.
  { name: "sieve-field-schema-parity",     script: "scripts/audit-sieve-field-schema-parity.mjs" },
  // The per-type facets, checked at all three ends. The audit above was clean
  // while every one of them was broken on the public pages: its emitter check
  // looks for a LITERAL field in a `sieveFilter(...)` call, and these are built
  // as `sieveFilter(TYPE_FACET_FIELD[key], …)`; and `classified.meetupArea` was
  // a real field (an object), so it was not an orphan either. Neither audit can
  // see a missing composite index, which is what actually emptied the grids.
  { name: "type-facet-wiring",             script: "scripts/audit-type-facet-wiring.mjs" },
  // Two filter systems wrote the same URL keys with different separators, and
  // the coincidence that hid it (a pipe-joined string survives a comma split as
  // one element) was also what made the active-filter badge report 1 for a
  // three-value selection. Fixing either half alone would have broken the other.
  { name: "filter-value-delimiter",        script: "scripts/audit-filter-value-delimiter.mjs" },
  // Guards the SHAPE of searchTxt queries, not the presence of a fix. Two
  // fixes here were silently reverted by a rename that kept the new names and
  // restored the old logic — invisible to tsc and to any grep-for-a-symbol
  // check. Blocks array-contains-any (OR) on a search field and an `if` whose
  // body is only a comment (emits no clause, drops every filter silently).
  { name: "search-semantics",              script: "scripts/audit-search-semantics.mjs" },
  // A searchTxt migration is all-or-nothing: interface + INDEXED_FIELDS +
  // SIEVE_FIELDS + seed tokens + composite index + no PII. Any one missing
  // produces silence, not an error. MIGRATED is enforced, PENDING reported.
  { name: "searchtxt-migration",           script: "scripts/audit-searchtxt-migration.mjs" },
  // Strict-zero. Keeps two deleted footguns deleted and blocks the SHAPE of the
  // bug each caused. `addPiiIndices` returned {...source, ...indices}, so
  // spreading it over ciphertext restored the plaintext — that is how both
  // token repositories wrote every verification and reset email in CLEARTEXT,
  // invisibly, since mapDoc decrypts on read either way. The exported
  // NEWSLETTER_PII_* pair was empty with no reader while the repository's own
  // module-local copy did the work, so it read as proof of a leak that did not
  // exist. Also blocks NEW emitters of case-insensitive Sieve operators, which
  // the adapter throws on and `throwExceptions: false` turned into silence —
  // measured: a `@=*` clause first meant NOTHING was applied, so the route
  // returned the entire unfiltered collection with a 200.
  { name: "legacy-search-pii",             script: "scripts/audit-legacy-search-pii.mjs" },
  // Strict-zero. The wiring between a search box and the rows it returns.
  // `backfill-search-txt.mjs` re-implements the tokenizer and its source lists
  // (it must run against a stale appkit/dist), which makes it the one place
  // that can disagree with the write path and never be caught by tsc — it had
  // already drifted, indexing 9 of the 12 fields buildProductSearchTxt does.
  // Also blocks an executor that rebuilds a query and drops `search`: token
  // matching rides OUTSIDE `filters` because Sieve cannot express
  // array-contains, so a dropped term returns an unfiltered page with a 200.
  { name: "search-parity",                 script: "scripts/audit-search-parity.mjs" },
  // Report-only (MIGRATE=strict to fail) until the 34 findings are triaged.
  // `searchPlaceholder` was REQUIRED on ListingViewConfig and DataListingView
  // passed `onSearchChange` unconditionally, so a listing view could not be
  // built WITHOUT a search box — one structural defect, not 34 mistakes. The
  // box is opt-in now; this blocks it coming back, in both shapes: a box whose
  // endpoint never reads `q` (types, 200, nothing changes), and a placeholder
  // promising partial matching over an encrypted field, which resolves an HMAC
  // blind index and can only ever match exactly.
  { name: "listing-search-capability",     script: "scripts/audit-listing-search-capability.mjs" },
  // Strict-zero. A sort option whose field isn't `canSort: true` in the target
  // repository's SIEVE_FIELDS — sievejs drops the sort silently, so the option
  // renders and does nothing ("Featured First"/"Promoted First" were dead this
  // way). Also asserts every ListingViewConfig has sortOptions and a
  // defaultSort that is actually one of them.
  { name: "listing-sort-fields",           script: "scripts/audit-listing-sort-fields.mjs" },
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
  // Strict-zero. Two ways a private field reaches the public internet:
  // (1) a schema field triaged into neither the PUBLIC_* nor the PRIVATE_*
  // list of its adapter — new fields are private by default; (2) a raw
  // repository document passed as a prop into a Client Component, which
  // serialises it into the page's public RSC flight payload. Both were live
  // 2026-08-24: /api/site-settings was a deny-list shipping gst.gstin, the
  // full commissions model and unmasked adSettings.providerCredentials, and
  // four pages (incl. the homepage) put a decrypted Meta WhatsApp access
  // token into public HTML behind an `as unknown as` cast.
  { name: "public-projection-parity",       script: "scripts/audit-public-projection-parity.mjs" },
  // Strict-zero, no suppression marker. Sits beside public-projection-parity
  // because both are secret-exposure gates. Six rules, each written against a
  // defect found 2026-08-27: two independent `"enc:v1:"` literals, so the PII
  // and settings crypto (different separators, different field order,
  // DIFFERENT KEYS) were indistinguishable to every "is this encrypted" check;
  // a settings-key constant sitting in the PII field registry one assignment
  // away from encrypting store OAuth tokens unrecoverably; a hex key read
  // without the normalisation its sibling applies, where Buffer.from truncates
  // silently and desyncs every blind index; ciphertext interpolated into a
  // thrown error and thence into the logs; and a Firestore .update() replacing
  // a whole map that holds PII, destroying the siblings it does not mention.
  { name: "pii-crypto",                     script: "scripts/audit-pii-crypto.mjs" },
  // Strict-zero. A selectable card's primary navigation (Link href /
  // router.push / handleClick) must never be gated on whether a selection
  // callback is merely wired — only on whether a selection is actively in
  // progress. Found live in InteractiveProductCard.tsx 2026-08-20 (href
  // dropped entirely in the onSelect branch); see CLAUDE.md's Recurrent
  // Root Cause Patterns.
  { name: "selectable-card-navigation",     script: "scripts/audit-selectable-card-navigation.mjs" },
  // Report-only (run with MIGRATE=strict to fail). A dashboard listing view
  // whose rows the user can see but never OPEN — no row click, no view/edit
  // row action, no editor drawer, no row-scoped link. Two shapes: data
  // fetched then discarded (AdminCartsView rendered items.length and threw
  // items[] away) and acting blind (Approve/Reject on a catalogue submission
  // whose photos were never shown). 16 of 70 found + 7 fixed 2026-08-21.
  { name: "listing-detail-affordance",      script: "scripts/audit-listing-detail-affordance.mjs" },
  // A fetch failure converted into a VALUE the caller cannot tell from a
  // legitimately empty result — Root Cause #59's shape, where a missing
  // composite index became a bare empty grid on four SSR listing views. Owns
  // the gap left by empty-catch / console-catch / silent-fetch-catch /
  // catch-normalize, which each cover a different silent-failure shape.
  // REPORT-ONLY at 279 findings (224 swallowed fetches, 55 normalize-theatre);
  // strict-zero on day one would force a marker spray, which is the
  // anti-pattern rather than the fix (Root Cause #22). MIGRATE=strict fails.
  { name: "silent-degrade",                 script: "scripts/audit-silent-degrade.mjs" },
  // PII invariants provable from source: no empty *_PII_FIELDS, no PII-shaped
  // schema field left undeclared, and a ratchet on the 15 repositories whose
  // mapDoc decrypts unconditionally. That last one is staged, not lax: their
  // read methods are consumed by 147+ files (measured across 10 of the 15), so
  // converting them to ciphertext-by-default means triaging every call site
  // into plaintext/masked/neither. A 16th repo fails the build today.
  { name: "pii-coverage",                   script: "scripts/audit-pii-coverage.mjs" },
  // List queries belong in the listingProcessor Function, not inside Vercel's
  // 10s ceiling. 61 routes still run theirs locally — a ratchet, so a NEW one
  // fails while the backlog is burned down. Also strict on reshaping an
  // already-paginated result and reporting the survivors as `total`.
  { name: "listing-delegation",             script: "scripts/audit-listing-delegation.mjs" },
  // Every admin/seller/user dashboard listing must use the DataListingView
  // config-driven scaffold, not a hand-rolled ListingToolbar/DataTable
  // composition. 22 bypasses found + migrated 2026-08-21; see the script's
  // own header comment for the full writeup.
  { name: "listing-view-standard",          script: "scripts/audit-listing-view-standard.mjs" },
  // Guest-participation (allowGuestParticipation) must stay the single
  // source of truth for whether an event permits anonymous entries — two
  // structurally separate decision points (enterEvent()'s generic path and
  // runAssignSpinPrize()'s independent spin-wheel path) must both read it,
  // not a hardcoded per-event-type literal. See CLAUDE.md's Recurrent Root
  // Cause Patterns.
  { name: "event-guest-gate-consistency",   script: "scripts/audit-event-guest-gate-consistency.mjs" },
  // Strict-zero. A Sieve field config for a Firestore Timestamp field
  // (createdAt, auctionEndDate, expiresAt, ...) that's filterable
  // (canFilter: true) but has no `parseValue` — a GTE/LTE filter on it
  // silently matches ZERO documents (Timestamp field vs. string filter value
  // type mismatch, since sievejs's default convertValue never coerces
  // date-like strings to Date). Root cause of the "must click Show ended to
  // see live auctions" bug — see CLAUDE.md's Recurrent Root Cause Patterns.
  { name: "sieve-date-fields",              script: "scripts/audit-sieve-date-fields.mjs" },
  // The canonical host must have exactly ONE definition (appkit.config.js
  // `seo.siteUrl`); robots.txt Host/Sitemap, every sitemap <loc>, metadataBase
  // and every page canonical must derive from it. Two owners drifted in Aug
  // 2026 — the sitemap advertised 182 URLs on a host that 307-redirected and
  // the site fell out of Google, with nothing erroring. Strict-zero.
  { name: "seo-canonical-host",             script: "scripts/audit-seo-canonical-host.mjs" },
  // A sitemap section returning zero URLs is indistinguishable from a site that
  // genuinely has none of that entity. Catches a discriminator literal absent
  // from its own TS union (`categoryType == "listing"` hid ~47 category pages),
  // a catch that swallows to [] unlogged, and tester fixtures reaching the
  // public sitemap. Strict-zero.
  { name: "seo-sitemap-parity",             script: "scripts/audit-seo-sitemap-parity.mjs" },
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

// Only dispatch when run directly. `check-on-stop.mjs` imports AUDITS from this
// module, and without this guard that import would run the whole suite twice.
const invokedDirectly =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (invokedDirectly) main();
