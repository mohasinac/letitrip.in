#!/usr/bin/env node
/**
 * audit-no-force-dynamic — strict-zero.
 *
 * `export const dynamic = "force-dynamic"` is banned. A route-segment config
 * declares a RENDERING CONTRACT; it must never be used to silence a build
 * error.
 *
 * WHY THIS BUG CLASS IS SILENT: force-dynamic always "works". The build goes
 * green, the page renders, and nothing anywhere reports that a route which
 * could have been cached now pays a cold render and a billed invocation on
 * every request — including every crawler hit. It is the same cost Root Cause
 * #82 documents, applied one route at a time instead of all at once.
 *
 * What actually happened (2026-08-27 → 2026-09-02): `817b602df` removed an
 * `await headers()` call from `src/app/[locale]/layout.tsx` and added
 * `generateStaticParams`. That was correct, and it made the site prerender for
 * the FIRST time — so every latent unguarded `useSearchParams()` surfaced at
 * once (Root Cause #17). The response was `force-dynamic`: first on the three
 * dashboard layouts (`fccc9a539`, reverted the same day by `b2d205d55`), then
 * per-page. It reached **225 occurrences in about 48 hours**, and 197 of them
 * were provably no-ops — `admin/layout.tsx` and `store/layout.tsx` both
 * `await getServerSessionUser()`, so those two subtrees can never be static.
 *
 * The claim that drove it — "a page-level <Suspense> does not satisfy Next 16's
 * static-export check, verified, admin/moderation still failed with one in
 * place" — was a real observation with the wrong diagnosis. `getServerSessionUser`
 * wrapped `await cookies()` in a blanket try/catch, so at build time the layout
 * got `user = null` and ran its own `redirect()`. That throw is in the LAYOUT,
 * above `{children}` — no boundary below it could ever have caught it.
 *
 * THE FIX IS ALWAYS ONE OF TWO THINGS:
 *   1. a <Suspense> boundary at any ancestor of the component reading search
 *      params — the layout ones count; or
 *   2. a genuine dynamic API in the server parent (`await getServerSessionUser()`
 *      in the layout), when the subtree really is per-request.
 *
 * RULES
 *   FORCE_DYNAMIC        export const dynamic = "force-dynamic"
 *   DYNAMIC_NON_LITERAL  export const dynamic = <not a permitted literal> —
 *                        the indirection dodge (`= FORCE`, a const, a re-export)
 *   DYNAMIC_ESCAPE_HATCH revalidate = 0 / fetchCache no-store / unstable_noStore()
 *                        / connection(), inside the auth-gated subtrees only
 *   REGISTRY_STALE       a PERMITTED entry whose file no longer exists
 *
 * DYNAMIC_ESCAPE_HATCH is deliberately SCOPED, not global. Banning only the
 * `force-dynamic` spelling would measure the token rather than the behaviour —
 * the next person types `revalidate = 0`. But three public pages use
 * `revalidate = 0` as an honest "this data is live" declaration, and banning it
 * there would demand registry entries on day one, which teaches people that the
 * registry is the way through. Scoped to admin/store/user/wishlist/auth it
 * closes the evasion route exactly where evasion happens, at zero cost.
 *
 * There is deliberately NO markdown rule: a changelog entry naming the pattern
 * it removed is history, and CLAUDE.md has to write the string to document the
 * ban — a doc rule would fail on the very file that explains itself.
 *
 * No suppression marker — scripts/audit-no-suppression-comments.mjs is
 * strict-zero and forbids adding new ones. The escape hatch is PERMITTED below,
 * which is source-visible and reviewable.
 */

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { stripComments } from "./lib/strip-comments.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SKIP = new Set(["node_modules", ".next", "dist", "build", ".git", ".claude", "coverage", "__tests__"]);

/**
 * 🛑 SHIPPED EMPTY, AND SHOULD STAY THAT WAY.
 *
 * Adding an entry here is a statement that a <Suspense> boundary was tried and
 * genuinely could not work. It almost always can. If the segment really is
 * per-request, the honest declaration is a dynamic API in its server layout —
 * that is how `admin/` and `store/` stay dynamic without a single segment
 * config between them.
 *
 * Shape: { file, rule, reason }
 */
const PERMITTED = [];

/** The only values `export const dynamic` may hold. */
const ALLOWED_DYNAMIC = new Set(['"auto"', "'auto'", '"force-static"', "'force-static'", '"error"', "'error'"]);

/** Where DYNAMIC_ESCAPE_HATCH applies — the auth-gated subtrees. */
const GATED = /^src\/app\/\[locale\]\/(admin|store|user|wishlist|auth)\//;

const ESCAPE_HATCHES = [
  {
    re: /^\s*export\s+const\s+revalidate\s*=\s*0\s*;?\s*$/,
    what: "export const revalidate = 0",
  },
  {
    re: /^\s*export\s+const\s+fetchCache\s*=\s*["'](force-no-store|only-no-store)["']/,
    what: "export const fetchCache no-store",
  },
  { re: /\bunstable_noStore\s*\(/, what: "unstable_noStore()" },
  { re: /\bconnection\s*\(\s*\)/, what: "connection()" },
];

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (SKIP.has(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(e.name) && !/\.(test|spec)\.tsx?$/.test(e.name)) out.push(p);
  }
  return out;
}

function permitted(file, rule) {
  return PERMITTED.some((p) => p.file === file && p.rule === rule);
}

function main() {
  const files = [...walk(join(ROOT, "src")), ...walk(join(ROOT, "appkit", "src"))];
  const violations = [];

  for (const p of PERMITTED) {
    if (!existsSync(join(ROOT, p.file))) {
      violations.push({
        rule: "REGISTRY_STALE",
        file: p.file,
        line: 0,
        detail: "registered in PERMITTED but the file no longer exists — remove the entry.",
      });
    }
  }

  for (const file of files) {
    const raw = readFileSync(file, "utf8");
    const rel = file.slice(ROOT.length + 1).split(sep).join("/");
    // Comments are stripped so the ~56 pages that legitimately *discuss*
    // `export const dynamic` in prose cannot false-positive.
    const lines = stripComments(raw).split(/\r?\n/);

    lines.forEach((line, i) => {
      const dyn = line.match(/^\s*export\s+const\s+dynamic\s*=\s*(.+?)\s*;?\s*$/);
      if (dyn) {
        const value = dyn[1].replace(/\s+as\s+const$/, "").trim();
        if (/^["']force-dynamic["']$/.test(value)) {
          if (!permitted(rel, "FORCE_DYNAMIC"))
            violations.push({
              rule: "FORCE_DYNAMIC",
              file: rel,
              line: i + 1,
              detail:
                "force-dynamic is banned. Wrap the client subtree in <Suspense> (a boundary in the " +
                "layout counts), or — if the segment truly is per-request — read the session in its " +
                "server layout, which is how admin/ and store/ stay dynamic with no segment config.",
            });
        } else if (!ALLOWED_DYNAMIC.has(value)) {
          if (!permitted(rel, "DYNAMIC_NON_LITERAL"))
            violations.push({
              rule: "DYNAMIC_NON_LITERAL",
              file: rel,
              line: i + 1,
              detail:
                `\`export const dynamic = ${value}\` — only "auto", "force-static" and "error" are ` +
                "allowed as literals. An indirected value hides force-dynamic from this audit.",
            });
        }
      }

      if (/^\s*export\s*\{[^}]*\bas\s+dynamic\b/.test(line) && !permitted(rel, "DYNAMIC_NON_LITERAL")) {
        violations.push({
          rule: "DYNAMIC_NON_LITERAL",
          file: rel,
          line: i + 1,
          detail: "re-exporting a binding as `dynamic` hides the segment config from this audit.",
        });
      }

      if (!GATED.test(rel)) return;
      for (const h of ESCAPE_HATCHES) {
        if (h.re.test(line) && !permitted(rel, "DYNAMIC_ESCAPE_HATCH")) {
          violations.push({
            rule: "DYNAMIC_ESCAPE_HATCH",
            file: rel,
            line: i + 1,
            detail:
              `${h.what} in an auth-gated subtree is force-dynamic by another spelling. These routes ` +
              "are already per-request because their layout reads the session; opting out of caching " +
              "again here declares nothing and hides the same bug class.",
          });
        }
      }
    });
  }

  if (violations.length === 0) {
    console.log(
      `audit-no-force-dynamic: clean ✓ (${files.length} files, PERMITTED has ${PERMITTED.length} entr${PERMITTED.length === 1 ? "y" : "ies"})`,
    );
    process.exit(0);
  }

  console.error(`audit-no-force-dynamic: ${violations.length} violation(s) found.\n`);
  console.error(
    "A route-segment config declares a rendering contract — it is not a way to silence a\n" +
      "prerender error. 225 of these accumulated in 48 hours once the site first became\n" +
      "cacheable; 197 were no-ops. The fix is a <Suspense> boundary, or a real dynamic API\n" +
      "in the server layout when the subtree genuinely is per-request.\n",
  );
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  process.exit(1);
}

main();
