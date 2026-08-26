#!/usr/bin/env node
/**
 * audit-client-verb-match — strict-zero.
 *
 * ## The defect
 *
 * A hook or client calls `apiClient.patch(SOME_ENDPOINT, …)` at a route that
 * exports only `PUT`. Next answers **405**, and nothing catches it before a
 * user does — the endpoint constant resolves, the types line up, `tsc` is
 * happy, and the mismatch lives entirely in the gap between two files.
 *
 * Found while designing W22's store-address pages: `useUpdateAddress` calls
 * `apiClient.patch`, and `/api/store/addresses/[id]` exports `PUT` and
 * `DELETE` only. The user-side route happens to export `PATCH`, so the hook
 * has always worked — and would have 405'd the moment the store pages reused
 * it. Exactly the class of bug that only appears when a working thing is
 * pointed somewhere new.
 *
 * ## How the endpoint is resolved
 *
 * Only calls whose argument names an endpoint constant this repo can resolve
 * statically — `ADMIN_ENDPOINTS.X`, `SELLER_ENDPOINTS.X`, `ACCOUNT_ENDPOINTS.X`
 * and the `API_ROUTES.*` mirror — are checked. A template literal built at
 * runtime is skipped; guessing at it would produce noise, and this audit is
 * only worth having if every hit is real.
 *
 * Suppression: `// audit-client-verb-ok: <reason>` on the call line or the one
 * above, for a call deliberately aimed at a route defined elsewhere (a
 * Firebase Function URL, an external API).
 *
 * Exit 0 — clean.  Exit 1 — a call whose verb the target route does not export.
 */

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { stripComments } from "./lib/strip-comments.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCAN = [join(ROOT, "appkit", "src"), join(ROOT, "src")];
const API_DIR = join(ROOT, "src", "app", "api");
const SKIP = new Set(["node_modules", "dist", ".next", ".git", "__tests__"]);
const EXTS = [".ts", ".tsx"];

/** Where endpoint constants are declared. */
const ENDPOINT_FILES = [
  join(ROOT, "appkit", "src", "constants", "api-endpoints.ts"),
  join(ROOT, "src", "constants", "api.ts"),
];

const SUPPRESS = /audit-client-verb-ok:/;
const VERBS = ["post", "put", "patch", "delete"];

/**
 * 🛑 THREE LIVE 404s, found by this audit on the run that added NO_ROUTE.
 * Each is a real broken feature, not a lint nit. Grandfathered only so the
 * audit can ship green and stop NEW instances; every one is owed a fix.
 *
 * Remove an entry when its route exists — never add one.
 */
const GRANDFATHERED = new Set([
  /*
   * Empty, and it should stay that way.
   *
   * It held three entries for about an hour on 2026-08-26 — the three live
   * 404s this audit found the moment it learned to scan raw `fetch`. All
   * three are fixed: `/api/store/bids/[id]` and `/api/store/products/[id]`
   * were built, and `useResendVerification` was repointed at the client SDK
   * (its route had been deleted in the Firebase-native auth migration and was
   * never coming back — Root Cause #54).
   */
]);

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (SKIP.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (EXTS.some((x) => e.name.endsWith(x))) out.push(full);
  }
  return out;
}

const rel = (f) => relative(ROOT, f).split("\\").join("/");

/**
 * `KEY: "/api/…"` and `KEY: (id) => \`/api/…/${id}\`` out of the endpoint
 * files. The template form keeps its `${…}` markers; they become `[id]` when
 * the path is walked onto disk.
 */
function parseEndpoints() {
  /*
   * Keyed `OBJECT.KEY`, never the bare key.
   *
   * `PROFILE` exists in THREE endpoint objects — ACCOUNT (/api/user/profile),
   * the store mirror (/api/store/profile), and an alias. A flat map keyed on
   * the bare name lets the last one win, which is exactly how the first run of
   * this audit produced a confident false positive against
   * `ScamAwarenessModal`: it calls `ACCOUNT_ENDPOINTS.PROFILE` and was
   * resolved against the STORE route.
   *
   * An audit that is wrong about which route it checked is worse than one that
   * skips the call.
   */
  const map = new Map();
  for (const file of ENDPOINT_FILES) {
    if (!existsSync(file)) continue;
    const src = stripComments(readFileSync(file, "utf8"));
    let current = null;
    for (const line of src.split("\n")) {
      const decl = line.match(/^(?:export\s+)?const\s+([A-Z][A-Z0-9_]*)\s*(?::[^=]*)?=\s*\{/);
      if (decl) { current = decl[1]; continue; }
      // A nested group inside one object, e.g. API_ROUTES.ACCOUNT = { … }.
      const nested = line.match(/^\s{2}([A-Z][A-Z0-9_]*):\s*\{/);
      if (nested && current) { current = `${current.split(".")[0]}.${nested[1]}`; continue; }
      if (!current) continue;
      const lit = line.match(/^\s*(\w+):\s*"(\/api\/[^"]*)"/);
      if (lit) { map.set(`${current}.${lit[1]}`, lit[2]); continue; }
      const tpl = line.match(/^\s*(\w+):\s*\([^)]*\)\s*=>\s*`(\/api\/[^`]*)`/);
      if (tpl) map.set(`${current}.${tpl[1]}`, tpl[2]);
    }
  }
  return map;
}

/** `/api/store/addresses/${id}` → src/app/api/store/addresses/[id]/route.ts */
function routeFileFor(apiPath) {
  const segments = apiPath
    .replace(/^\/api\//, "")
    .split("/")
    .filter(Boolean)
    .map((s) => (s.includes("${") ? null : s));
  let dir = API_DIR;
  for (const seg of segments) {
    if (seg === null) {
      // A dynamic segment — take the single [param] child if there is one.
      let children;
      try { children = readdirSync(dir, { withFileTypes: true }); } catch { return null; }
      const dyn = children.filter((c) => c.isDirectory() && c.name.startsWith("["));
      if (dyn.length !== 1) return null;
      dir = join(dir, dyn[0].name);
      continue;
    }
    const next = join(dir, seg);
    if (!existsSync(next)) return null;
    dir = next;
  }
  const route = join(dir, "route.ts");
  return existsSync(route) ? route : null;
}

function main() {
  try { statSync(API_DIR); } catch {
    console.log("audit-client-verb-match: no API directory — skipped");
    process.exit(0);
  }

  const endpoints = parseEndpoints();
  const exportedVerbs = new Map(); // routeFile -> Set<VERB>
  const violations = [];
  const stale = new Set(GRANDFATHERED);
  let checked = 0;

  for (const root of SCAN) {
    try { statSync(root); } catch { continue; }
    for (const file of walk(root)) {
      const raw = readFileSync(file, "utf8");
      const lines = raw.split("\n");
      const src = stripComments(raw);
      // Cheap pre-filter. It must name BOTH call shapes: keying it on
      // `apiClient` alone skipped every raw-`fetch` file before the scan below
      // ever ran, which is how `SellerBidsView`'s dead DELETE survived the
      // first version of this audit.
      if (
        !/apiClient\s*\.\s*(?:post|put|patch|delete)\s*\(/.test(src) &&
        !/fetch\s*\(/.test(src)
      ) continue;

      /*
       * `apiClient.verb(ENDPOINT…)` and raw `fetch(ENDPOINT…, { method })`.
       *
       * Scanning only `apiClient` missed a live bug: `SellerBidsView`'s bulk
       * cancel calls `fetch(SELLER_ENDPOINTS.BID_BY_ID(id), {method:"DELETE"})`
       * at a route that does not exist at all, so it fails every time. An
       * audit that covers one of the two ways this codebase makes a request
       * covers the wrong half of the problem.
       */
      const calls = [];
      const apiRe = /apiClient\s*\.\s*(post|put|patch|delete)\s*\(\s*([A-Z_]+)\.(\w+)/g;
      let mm;
      while ((mm = apiRe.exec(src)) !== null) {
        calls.push({ index: mm.index, verb: mm[1], obj: mm[2], key: mm[3] });
      }
      const fetchRe =
        /fetch\s*\(\s*([A-Z_]+)\.(\w+)\s*\([^)]*\)\s*,\s*\{[^}]*?method\s*:\s*["'](POST|PUT|PATCH|DELETE)["']/g;
      while ((mm = fetchRe.exec(src)) !== null) {
        calls.push({ index: mm.index, verb: mm[3].toLowerCase(), obj: mm[1], key: mm[2] });
      }

      for (const m of calls) {
        const { verb, obj, key } = m;
        // Try the exact object first; fall back to a unique suffix match so a
        // nested group (API_ROUTES.ACCOUNT.PROFILE) still resolves. Ambiguity
        // is a SKIP, never a guess.
        let apiPath = endpoints.get(`${obj}.${key}`);
        if (!apiPath) {
          const hits = [...endpoints].filter(([k]) => k.endsWith(`.${obj}.${key}`));
          if (hits.length === 1) apiPath = hits[0][1];
        }
        if (!apiPath) continue; // not statically resolvable — skip, don't guess

        const routeFile = routeFileFor(apiPath);
        const lineNo = src.slice(0, m.index).split("\n").length;
        if (SUPPRESS.test(lines[lineNo - 1] ?? "") || SUPPRESS.test(lines[lineNo - 2] ?? "")) continue;

        const gfKey = `${rel(file)}::${verb.toUpperCase()}::${obj}.${key}`;
        if (!routeFile) {
          if (GRANDFATHERED.has(gfKey)) { stale.delete(gfKey); continue; }
          /*
           * NO_ROUTE — the endpoint constant resolves to a path with no
           * route file behind it. Every such call is a 404, permanently.
           *
           * This is the API-side mirror of `audit-dead-route-key`'s NO_PAGE,
           * and it is how `SellerBidsView`'s bulk cancel shipped: the
           * constant `SELLER_ENDPOINTS.BID_BY_ID` exists, so the call
           * compiles and reads as correct, and `/api/store/bids/[id]` was
           * never built.
           */
          checked++;
          violations.push(
            `${rel(file)}:${lineNo} :: ${verb.toUpperCase()} ${obj}.${key} -> "${apiPath}" ` +
              `has NO route file — every call 404s`,
          );
          continue;
        }

        if (!exportedVerbs.has(routeFile)) {
          const routeSrc = stripComments(readFileSync(routeFile, "utf8"));
          const found = new Set();
          for (const v of VERBS) {
            if (new RegExp(`export\\s+const\\s+${v.toUpperCase()}\\b`).test(routeSrc)) found.add(v);
          }
          exportedVerbs.set(routeFile, found);
        }
        const verbs = exportedVerbs.get(routeFile);
        if (verbs.size === 0) continue; // re-exported handler shape — cannot tell

        checked++;
        if (!verbs.has(verb)) {
          violations.push(
            `${rel(file)}:${lineNo} :: apiClient.${verb}(${key}) -> ${rel(routeFile)} ` +
              `exports only ${[...verbs].map((v) => v.toUpperCase()).join("/")} — this is a 405`,
          );
        }
      }
    }
  }

  if (stale.size > 0) {
    console.log("[audit-client-verb-match] route now exists — remove from GRANDFATHERED:");
    for (const k of stale) console.log(`  ✓ ${k}`);
    console.log("");
  }

  if (violations.length === 0) {
    const left = GRANDFATHERED.size - stale.size;
    console.log(
      `audit-client-verb-match: clean ✓ (${checked} resolvable call(s); ${left} known 404(s) awaiting a route)`,
    );
    process.exit(0);
  }

  console.error("\n[audit-client-verb-match] STRICT-ZERO violation(s):\n");
  for (const v of violations) console.error(`  - ${v}`);
  console.error(
    "\nThe endpoint constant resolves, the types line up, tsc is happy — and the\n" +
      "request 405s. Either add the verb to the route or change the call.\n",
  );
  console.error(`Total: ${violations.length}\n`);
  process.exit(1);
}

main();
