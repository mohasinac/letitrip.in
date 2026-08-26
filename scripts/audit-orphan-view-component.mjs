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
];
const SCAN = [join(ROOT, "appkit", "src"), join(ROOT, "src")];
const SKIP = new Set(["node_modules", "dist", ".next", ".git", "__tests__"]);

/** Files that only prove a symbol is exported, never that it is used. */
const BARREL_NAMES = new Set(["index.ts", "index.tsx", "client.ts", "server.ts", "server-entry.ts"]);

/** Route-backed surfaces. A bare primitive is a different judgement. */
const COMPONENT_NAME = /^(?:[A-Z]\w*(?:View|EditorView|Panel))$/;

const SUPPRESS = /audit-orphan-view-ok:/;

/**
 * Orphans measured 2026-08-26. Each is a decision owed — wire it or delete it.
 * Remove an entry when it gains a real consumer; never add one.
 */
const GRANDFATHERED = new Set([
  /*
   * Measured 2026-08-26: THIRTEEN, against the eight the plan documented — and
   * the plan's list was assembled by hand, which is the argument for the audit.
   *
   * Grandfathered rather than deleted because "wire it or delete it" is a
   * product decision per component, and a wave that quietly removed thirteen
   * working views would be worse than the drift. Each is a decision owed.
   */

  // ── Wire it: a real feature with no route ────────────────────────────
  // W22 step 5d. Lottery events can currently only be created by seeding.
  "LotteryAdminEditView",
  "LotteryAdminSlotView",

  // ── Superseded: the consumer renders something else now ──────────────
  // The three store pages redirect to /store/products?listingType=X.
  "SellerAuctionsView",
  "SellerPreOrdersView",
  "SellerPrizeDrawsView",
  // The plan flags this as "confirm overlap with AdminSiteSettingsView, then
  // delete". Confirmed: nothing outside comments mentions it.
  "AdminSiteView",
  // The /demo/seed route and SeedPanel were removed; seeding is the
  // appkit-seed CLI now. This is what was left behind.
  "DemoSeedView",

  // ── Consumer-side pages render their own composition instead ─────────
  "UserAddressesView",
  "UserNotificationsView",
  "UserSettingsView",
  "UserSupportView",
  "SellerStoreView",
  "CategoryProductsView",
  "ProductsView",
  "RefundRequestView",
  "HowItWorksInfoView",
  "AuthStatusPanel",
]);

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
  for (const root of COMPONENT_ROOTS) {
    try { statSync(root); } catch { continue; }
    for (const file of walk(root)) {
      if (isBarrel(file)) continue;
      const raw = readFileSync(file, "utf8");
      if (SUPPRESS.test(raw)) continue;
      const src = stripComments(raw);
      const re = /export\s+(?:default\s+)?function\s+([A-Za-z0-9_]+)/g;
      let m;
      while ((m = re.exec(src)) !== null) {
        if (COMPONENT_NAME.test(m[1]) && !declared.has(m[1])) declared.set(m[1], rel(file));
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
  const stale = new Set(GRANDFATHERED);
  for (const [name, declPath] of declared) {
    if (referenced.has(name)) { stale.delete(name); continue; }
    if (GRANDFATHERED.has(name)) { stale.delete(name); continue; }
    violations.push(`${declPath} :: ${name} is exported and referenced ONLY by barrel files — nobody can reach it`);
  }

  if (stale.size > 0) {
    console.log("[audit-orphan-view-component] now has a real consumer — remove from GRANDFATHERED:");
    for (const n of stale) console.log(`  ✓ ${n}`);
    console.log("");
  }

  if (violations.length === 0) {
    const left = GRANDFATHERED.size - stale.size;
    console.log(
      `audit-orphan-view-component: clean ✓ (${declared.size} view component(s); ${left} orphan(s) awaiting a decision)`,
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
