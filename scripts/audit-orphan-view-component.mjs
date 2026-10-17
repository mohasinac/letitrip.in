#!/usr/bin/env node
/**
 * audit-orphan-view-component — strict-zero, with a shrinking grandfather list.
 *
 * ## The pattern this whole rework exists because of
 *
 * A complete, working view or editor whose ONLY references are barrel files is
 * an abandoned migration: somebody built it, exported it, and never wired it
 * to a route. It reads as finished to everyone who comes after, because the
 * export is right there.
 *
 * The plan documents eight of these and enforced none. The one that prompted
 * this audit is `LotteryAdminEditView` — a complete headless lottery editor
 * with zero consumers, while `/admin/lotteries` links its rows at the PUBLIC
 * detail page. The practical consequence: lottery events can only be created
 * by `npm run seed`.
 *
 * ## What counts as a reference
 *
 * Any file that mentions the symbol and is NOT a barrel. Barrels are
 * `index.ts`, `client.ts`, `server.ts`, `server-entry.ts` and the `ui/` and
 * `components/` re-export files — they prove a component is *exported*, which
 * is precisely the thing an orphan already has.
 *
 * ## Deliberately narrow
 *
 * Only `*View` / `*EditorView` / `*Panel` components in `appkit/src/features`
 * and `appkit/src/_internal/client/features`. A primitive with no current
 * consumer is a different judgement — `RecordDetailModal` had none the day it
 * was written and three the week after. A ROUTE-BACKED view with none is not
 * ambiguous: nobody can reach it.
 *
 * Suppression: `// audit-orphan-view-ok: <reason>` in the component's own
 * file, for something genuinely staged ahead of a route that is coming.
 *
 * Exit 0 — clean.  Exit 1 — a view component nothing but a barrel mentions.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { stripComments } from "./lib/strip-comments.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const COMPONENT_ROOTS = [
  join(ROOT, "appkit", "src", "features"),
  join(ROOT, "appkit", "src", "_internal", "client", "features"),
  /*
   * The consumer side is scanned too, and it was not until 2026-09-02.
   *
   * `src/features/about/` held 8 full view components — 1564 lines — every one
   * of them a duplicate of an appkit component that every route actually
   * imports. They were structurally invisible to this audit because it only
   * ever looked inside appkit, so the very check that exists to find a view
   * with no consumer could not see a whole directory of them.
   *
   * They had also drifted: the consumer `HowReviewsWorkView` still used the old
   * `diagramS1`/`verifiedTitle` i18n keys while the live appkit one had moved to
   * `diagramStep1Badge`/`infoCard1Title`, so a grep for the broken keys landed
   * on the dead file first. That is the real cost of an orphan — not the bytes,
   * but that it answers questions wrongly. Root Cause #84: a measurement
   * narrower than the rule it feeds.
   */
  join(ROOT, "src", "features"),
];
const SCAN = [join(ROOT, "appkit", "src"), join(ROOT, "src")];
const SKIP = new Set(["node_modules", "dist", ".next", ".git", "__tests__"]);

/** Files that only prove a symbol is exported, never that it is used. */
const BARREL_NAMES = new Set(["index.ts", "index.tsx", "client.ts", "server.ts", "server-entry.ts"]);

/** Route-backed surfaces. A bare primitive is a different judgement. */
const COMPONENT_NAME = /^(?:[A-Z]\w*(?:View|EditorView|Panel))$/;

const SUPPRESS = /audit-orphan-view-ok:/;

/**
 * 🛑 EMPTY, and closed 2026-10-17. Every entry was a decision owed, and all
 * eleven were taken: `LotteryAdminSlotView` was WIRED (it shows `isBooked` and
 * the per-slot odds, which the editor's `.strict()` write shape deliberately
 * cannot express, so an admin had no surface for either), and the other ten
 * were DELETED — four superseded by consumer-side compositions that render
 * their own listing (`/user/{addresses,notifications,settings,support}`), three
 * duplicates of a wired sibling (`HowItWorksSection`, `CategoryDetailPageView`,
 * `ProductsIndexPageView`), and three speculative slot shells with no caller
 * (`SellerStoreView` + its `StoreStorefrontView` alias, `AuthStatusPanel`,
 * `DemoSeedView`, whose route was removed when seeding moved to the CLI).
 *
 * The stale check below BLOCKS, so this set cannot silently refill or rot.
 * Do not add an entry: wire it or delete it in the same change.
 */
const GRANDFATHERED = new Set([]);

function walk(dir, out = [], exts = [".ts", ".tsx"]) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (SKIP.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full, out, exts);
    else if (exts.some((x) => e.name.endsWith(x))) out.push(full);
  }
  return out;
}

const rel = (f) => relative(ROOT, f).split("\\").join("/");
const isBarrel = (f) => BARREL_NAMES.has(basename(f));

function main() {
  // 1. Every exported *View / *Panel, and the file that declares it.
  const declared = new Map(); // name -> relPath
  /*
   * Second and later declarations of the SAME name are recorded rather than
   * dropped. `!declared.has(name)` alone made a shadow copy invisible by
   * construction: appkit is scanned first, so the consumer duplicate silently
   * lost the race and this audit reported the name as healthy. That is how
   * `src/features/about/` kept 8 duplicate views — every route importing the
   * appkit one — while the check that exists to find unreachable views passed.
   */
  const shadows = []; // { name, declPath, shadowPath }
  for (const root of COMPONENT_ROOTS) {
    try { statSync(root); } catch { continue; }
    for (const file of walk(root)) {
      if (isBarrel(file)) continue;
      const raw = readFileSync(file, "utf8");
      if (SUPPRESS.test(raw)) continue;
      const src = stripComments(raw);
      /*
       * `async` is part of the pattern. Without it this regex matched only
       * `export function` / `export default function`, so every `export async
       * function XView()` — i.e. every async server view, 59 files' worth —
       * was invisible to an audit whose entire job is finding unreachable
       * views. Root Cause #84 again: the rule was narrower than it read.
       */
      const re = /export\s+(?:default\s+)?(?:async\s+)?function\s+([A-Za-z0-9_]+)/g;
      let m;
      while ((m = re.exec(src)) !== null) {
        if (!COMPONENT_NAME.test(m[1])) continue;
        if (declared.has(m[1])) {
          if (declared.get(m[1]) !== rel(file))
            shadows.push({ name: m[1], declPath: declared.get(m[1]), shadowPath: rel(file) });
          continue;
        }
        declared.set(m[1], rel(file));
      }
    }
  }

  // 2. Non-barrel references anywhere in either tree.
  const referenced = new Set();
  for (const root of SCAN) {
    try { statSync(root); } catch { continue; }
    for (const file of walk(root, [], [".ts", ".tsx"])) {
      if (isBarrel(file)) continue;
      const relPath = rel(file);
      const src = stripComments(readFileSync(file, "utf8"));
      for (const [name, declPath] of declared) {
        if (relPath === declPath) continue; // its own file is not a consumer
        if (referenced.has(name)) continue;
        if (new RegExp(`\\b${name}\\b`).test(src)) referenced.add(name);
      }
    }
  }

  const violations = [];
  for (const s of shadows) {
    violations.push(
      `${s.shadowPath} :: ${s.name} is a SHADOW of ${s.declPath} — two components with one name. ` +
        "Every importer resolves to exactly one of them, so the other is unreachable and will drift silently.",
    );
  }
  /*
   * Three outcomes per grandfathered name, and conflating them is how the
   * count lied. The previous shape deleted from `stale` in BOTH loop branches,
   * so `stale` ended up meaning "no longer declared" while the message said
   * "now has a real consumer" — and `left` counted every still-declared entry
   * as an orphan whether or not it had since been wired. Measured 2026-10-17:
   * it reported 11 awaiting a decision when three of the names had no file at
   * all. Separate the cases and each number says what it means.
   */
  const staleWired = [];  // grandfathered, declared, and now reachable
  const staleGone = new Set(GRANDFATHERED); // grandfathered with no declaration
  let stillOrphaned = 0;
  for (const [name, declPath] of declared) {
    const isGrandfathered = GRANDFATHERED.has(name);
    if (isGrandfathered) staleGone.delete(name);
    if (referenced.has(name)) {
      if (isGrandfathered) staleWired.push(name);
      continue;
    }
    if (isGrandfathered) { stillOrphaned++; continue; }
    violations.push(`${declPath} :: ${name} is exported and referenced ONLY by barrel files — nobody can reach it`);
  }

  /*
   * A stale entry BLOCKS. The registry is a list of decisions owed, so an
   * entry naming a file that no longer exists, or a view that has since been
   * wired, is not a harmless leftover — it is the registry asserting something
   * untrue, and it is exactly what hid the three deleted Seller*Views.
   */
  for (const n of staleWired)
    violations.push(`${n} :: has a real consumer now — remove it from GRANDFATHERED in this file`);
  for (const n of staleGone)
    violations.push(`${n} :: is in GRANDFATHERED but is declared nowhere — the component is gone; remove the entry`);

  if (violations.length === 0) {
    console.log(
      `audit-orphan-view-component: clean ✓ (${declared.size} view component(s); ${stillOrphaned} orphan(s) awaiting a decision)`,
    );
    process.exit(0);
  }

  console.error("\n[audit-orphan-view-component] STRICT-ZERO violation(s):\n");
  for (const v of violations) console.error(`  - ${v}`);
  console.error(
    "\nA complete view nothing renders is an abandoned migration — it reads as\n" +
      "finished because the export is right there. Wire it to a route, or delete\n" +
      "it. An export is not a consumer.\n",
  );
  console.error(`Total: ${violations.length}\n`);
  process.exit(1);
}

main();
