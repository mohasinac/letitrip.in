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

/** Report-only until the known dead boxes are triaged; MIGRATE=strict to fail. */
const STRICT = process.env.MIGRATE === "strict";

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

    // The placeholder that declares the box.
    const m = src.match(/searchPlaceholder[:=]\s*["'`]([^"'`]+)["'`]/);
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

if (findings.length > 0) {
  const label = STRICT ? "FAIL" : "report-only";
  console.error(`[audit-listing-search-capability] ${findings.length} finding(s) — ${label}:\n`);
  for (const f of findings) {
    console.error(`  ${f.rel}:${f.line}  [${f.rule}]`);
    console.error(`    ${f.msg}\n`);
  }
  console.error("Suppression: // audit-listing-search-capability-ok: <reason>");
  if (STRICT) process.exit(1);
  console.error("Run with MIGRATE=strict to fail once these are triaged.\n");
  process.exit(0);
}

console.log("[audit-listing-search-capability] OK — 0 findings");
