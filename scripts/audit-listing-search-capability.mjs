#!/usr/bin/env node
/**
 * audit-listing-search-capability — a rendered search box must be able to search.
 *
 * ## Why this exists
 *
 * `ListingViewConfig.searchPlaceholder` was REQUIRED and `DataListingView`
 * passed `onSearchChange` unconditionally, so a developer could not build a
 * listing view WITHOUT rendering a search box. `ListingToolbar` has always
 * gated the box on that prop; nothing ever declined to supply it.
 *
 * That is one structural defect, not ~39 separate mistakes. The box accepts
 * typing, `useAdminListing` puts `q` on the wire, and the endpoint ignores it —
 * so the results never change, with a 200 and nothing in any log.
 *
 * `searchPlaceholder` is optional now, and this audit blocks the two ways the
 * defect comes back.
 *
 * R1 DEAD_SEARCH_BOX
 *   A config declares search, but the endpoint it points at never reads `q`.
 *   Resolved by mapping the config's `endpoint` to the route file and grepping
 *   for a `q` read there.
 *
 * R2 PII_PARTIAL_PROMISE
 *   A placeholder promising partial matching over a field that is encrypted.
 *   Encryption and partial-match search are mutually exclusive over one field —
 *   ciphertext has no usable prefix — so those endpoints resolve an HMAC blind
 *   index and match EXACTLY. "Search by email" over that is a promise the
 *   backend cannot keep; say "exact match" or set `search.mode: "exact"`.
 *
 * Suppression: `// audit-listing-search-capability-ok: <reason>`.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const REPO_ROOT = process.cwd();
const SCAN_ROOTS = [join(REPO_ROOT, "appkit", "src"), join(REPO_ROOT, "src")];
const EXCLUDED_DIRS = new Set(["node_modules", "dist", ".next", "out", "__tests__"]);
const OK_RE = /\/\/\s*audit-listing-search-capability-ok\s*:/i;

/** Fields that are encrypted at rest — a partial-match promise over these is a lie. */
const PII_WORDS = /\b(email|phone|upi|account\s*number|ifsc|address)\b/i;

/**
 * Strict-zero. It shipped report-only with 32 findings; those are triaged (the
 * boxes were removed, since every one of those collections still lacks
 * searchTxt), so the rule now blocks rather than reports. A box that renders
 * and cannot search is the defect — re-adding one is not a regression to
 * tolerate while someone gets around to wiring it.
 */
const STRICT = process.env.MIGRATE !== "report";

function* walk(root) {
  let entries;
  try { entries = readdirSync(root, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    if (EXCLUDED_DIRS.has(e.name)) continue;
    const full = join(root, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (/\.tsx?$/.test(e.name) && !e.name.endsWith(".d.ts")) yield full;
  }
}

function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + " ".repeat(m.length - p1.length));
}

/**
 * Every `<GROUP>_ENDPOINTS` constant, resolved to its literal path.
 *
 * Built by parsing `api-endpoints.ts` rather than guessing the URL from the key
 * name. The first version tried `api/admin/{key}`, then `api/store/{key}`, then
 * `api/{key}` — so `ACCOUNT_ENDPOINTS.ORDERS` (which is `/api/user/orders`,
 * and DOES read `q`) resolved to `/api/admin/orders`, which does not, and the
 * rule reported a working search box as dead. A resolver that guesses is a
 * resolver that fabricates findings.
 */
const ENDPOINT_MAP = (() => {
  const file = join(REPO_ROOT, "appkit", "src", "constants", "api-endpoints.ts");
  const map = new Map();
  let src = "";
  try { src = stripComments(readFileSync(file, "utf8")); } catch { return map; }

  for (const m of src.matchAll(/export const ([A-Z0-9_]+_ENDPOINTS)\s*=\s*\{/g)) {
    const group = m[1];
    // Slice to the matching close brace so keys are attributed to their group.
    let depth = 0, i = src.indexOf("{", m.index);
    const start = i;
    for (; i < src.length; i++) {
      if (src[i] === "{") depth++;
      else if (src[i] === "}") { depth--; if (depth === 0) break; }
    }
    const body = src.slice(start, i);
    for (const k of body.matchAll(/([A-Z0-9_]+):\s*["'`](\/api\/[^"'`?]+)["'`]/g)) {
      map.set(`${group}.${k[1]}`, k[2]);
    }
  }
  return map;
})();

/** Map an endpoint expression to its route file, or null if it cannot be resolved. */
function routeFileFor(endpointExpr) {
  const literal =
    endpointExpr.match(/["'`](\/api\/[^"'`?]+)["'`]/)?.[1] ??
    ENDPOINT_MAP.get(endpointExpr.match(/([A-Z0-9_]+_ENDPOINTS\.[A-Z0-9_]+)/)?.[1] ?? "");
  if (!literal) return null;
  const p = join(REPO_ROOT, "src", "app", literal.replace(/^\//, ""), "route.ts");
  return existsSync(p) ? p : null;
}

/** Does this route read a search term at all? */
function routeReadsQ(file) {
  const src = stripComments(readFileSync(file, "utf8"));
  return (
    /["'`]q["'`]/.test(src) ||
    /\bsearch\b/.test(src) ||
    /\bsearchTerm\b/.test(src)
  );
}

const findings = [];
for (const root of SCAN_ROOTS) {
  for (const file of walk(root)) {
    const rel = relative(REPO_ROOT, file).replace(/\\/g, "/");
    const raw = readFileSync(file, "utf8");
    if (!/searchPlaceholder|search:\s*\{/.test(raw)) continue;
    const lines = raw.split(/\r?\n/);
    const src = stripComments(raw);

    // The placeholder that declares the box — in EITHER spelling.
    //
    // 🛑 This used to match only the bare `searchPlaceholder` key. A view that
    // upgraded to the richer `search: { placeholder, mode, fields }` capability
    // therefore stopped matching here and was skipped ENTIRELY — every rule
    // below, including the strict ones, silently stopped applying to it.
    //
    // That was found the same hour eleven views were migrated: the audit
    // reported "0 blocking" partly because it had stopped looking at exactly
    // the files that had just changed. Adopting the better-typed API removed
    // you from the checks. Same family as every other bug in this migration —
    // a check that reports OK because it stopped checking.
    const m =
      src.match(/searchPlaceholder[:=]\s*["'`]([^"'`]+)["'`]/) ??
      src.match(/search:\s*\{[\s\S]{0,200}?placeholder:\s*["'`]([^"'`]+)["'`]/);
    if (!m) continue;
    const placeholder = m[1];
    const line = src.slice(0, m.index).split(/\r?\n/).length;
    if (OK_RE.test(lines[line - 1] ?? "") || OK_RE.test(lines[line - 2] ?? "")) continue;

    const ep = src.match(/endpoint:\s*([^,\n]+)/);
    if (!ep) continue;
    const routeFile = routeFileFor(ep[1]);
    if (!routeFile) continue;
    const routeSrc = stripComments(readFileSync(routeFile, "utf8"));

    // R2 — a partial-match promise the ENDPOINT cannot keep.
    //
    // Judged by mechanism, not by wording. A blind-index lookup
    // (`piiBlindIndex(q)` / `emailIndex==`) is exact by construction: ciphertext
    // has no usable prefix. But in-memory filtering AFTER `mapDoc` has decrypted
    // — `(u.email ?? "").toLowerCase().includes(q)`, which is what
    // /api/admin/team does — is genuinely partial, and flagging it would be
    // telling correct code it is wrong. An earlier version of this rule matched
    // the placeholder text alone and did exactly that.
    const declaresExact =
      /mode:\s*["'`]exact["'`]/.test(src) || /exact/i.test(placeholder);
    const exactByBlindIndex = /piiBlindIndex\s*\(/.test(routeSrc);
    const partialInMemory = /\.includes\(\s*q\b|\.toLowerCase\(\)\.includes/.test(routeSrc);
    if (
      PII_WORDS.test(placeholder) &&
      !declaresExact &&
      exactByBlindIndex &&
      !partialInMemory
    ) {
      findings.push({
        rel, line, rule: "PII_PARTIAL_PROMISE",
        msg: `"${placeholder}" promises matching over a field this endpoint resolves through ` +
             `an HMAC blind index — that matches EXACTLY, never partially. Say so, or set ` +
             `search.mode: "exact".`,
      });
    }

    // R3 — a box must declare what it matches.
    //
    // Without `fields`, R4 below has nothing to check and R2 falls back to
    // guessing from placeholder wording. Two placeholders shipped this
    // session's earlier pass reading "Search reviews, products, or seller
    // names" and "Search stores, payout IDs, or order groups" over endpoints
    // that matched a single exact blind-indexed value each — six promised
    // fields, none of them matchable. Nothing could catch that while `fields`
    // was optional, because there was nothing to compare the prose against.
    const declaresFields = /fields:\s*\[/.test(src);
    if (!declaresFields) {
      findings.push({
        rel, line, rule: "UNDECLARED_SEARCH_FIELDS",
        msg: `renders a search box but does not declare \`search.fields\`. Name the fields ` +
             `the endpoint actually matches, so the placeholder can be checked against them ` +
             `instead of taken on trust.`,
      });
    }

    // R4 — an exact search must never be debounced.
    //
    // An exact search resolves a blind index or a whole-value equality, so
    // every keystroke before the last is a query GUARANTEED to match nothing.
    // The user watches "no results" while typing a value that is present, and
    // each intermediate round trip is a billed read. DataListingView also
    // forces "enter" at runtime; this catches it at author time, where the
    // mistake is legible.
    if (/mode:\s*["'`]exact["'`]/.test(src) && /commit:\s*["'`]debounce["'`]/.test(src)) {
      findings.push({
        rel, line, rule: "DEBOUNCED_EXACT_SEARCH",
        msg: `pairs \`mode: "exact"\` with \`commit: "debounce"\`. Every keystroke before the ` +
             `last is a query that cannot match — "no results" while typing a value that ` +
             `exists, once per character, each one a billed read. Exact search commits on Enter.`,
      });
    }

    // R1 — the endpoint must read the term.
    if (!routeReadsQ(routeFile)) {
      findings.push({
        rel, line, rule: "DEAD_SEARCH_BOX",
        msg: `renders a search box, but ${relative(REPO_ROOT, routeFile).replace(/\\/g, "/")} ` +
             `never reads a search term. Typing changes nothing, with a 200. Either wire the ` +
             `endpoint or drop searchPlaceholder — the box is opt-in now.`,
      });
    }
  }
}

/**
 * R3 is staged, the other three are not.
 *
 * R1/R2/R4 are each provable from one file: the endpoint reads `q` or it does
 * not; the route calls `piiBlindIndex` or it does not; the config pairs exact
 * with debounce or it does not. Those fail immediately.
 *
 * R3 asks an author to NAME the fields their endpoint matches, and 16 views
 * have not yet. Failing them today would push someone to satisfy the rule by
 * guessing a plausible `fields` list — which is worse than the gap, because
 * R2 then checks the placeholder against fiction and reports OK. The two
 * placeholders this session found lying ("Search reviews, products, or seller
 * names" over an exact reviewer-name blind index) are exactly what a guessed
 * list would have blessed.
 *
 * So R3 reports until the 16 are triaged against their real routes, then
 * moves into STAGED_RULES' complement. `MIGRATE=strict` fails on everything.
 */
const STAGED_RULES = new Set(["UNDECLARED_SEARCH_FIELDS"]);
const FORCE_ALL = process.env.MIGRATE === "strict";

const blocking = findings.filter((f) => FORCE_ALL || !STAGED_RULES.has(f.rule));
const staged = findings.filter((f) => !FORCE_ALL && STAGED_RULES.has(f.rule));

if (findings.length > 0) {
  const out = blocking.length > 0 ? console.error : console.log;
  out(
    `[audit-listing-search-capability] ${blocking.length} blocking, ` +
    `${staged.length} staged (R3 UNDECLARED_SEARCH_FIELDS):\n`,
  );
  for (const f of [...blocking, ...staged]) {
    const tag = STAGED_RULES.has(f.rule) && !FORCE_ALL ? " (staged)" : "";
    out(`  ${f.rel}:${f.line}  [${f.rule}]${tag}`);
    out(`    ${f.msg}\n`);
  }
  out("Suppression: // audit-listing-search-capability-ok: <reason>");
  if (STRICT && blocking.length > 0) process.exit(1);
  if (staged.length > 0) {
    out(`\n  ${staged.length} staged finding(s) do not fail the run yet. Declare each ` +
        `view's real \`search.fields\` — read the route, do not guess — then delete ` +
        `UNDECLARED_SEARCH_FIELDS from STAGED_RULES.`);
  }
  process.exit(0);
}

console.log("[audit-listing-search-capability] OK — 0 findings");
