#!/usr/bin/env node
/*
 * appkit's public barrels must NOT re-export seed data.
 *
 * ── WHY THIS EXISTS, AND WHY THE REGRESSION WOULD BE INVISIBLE ──────────────
 *
 * Measured 2026-10-21: `appkit/src/seed/` plus `features/tester/seed-data/` is
 * **21.4 MB across ~655,000 lines — 61% of appkit's source bytes** — in 10% of
 * its files. Three generated corpora account for 14.8 MB of it
 * (`part-glossary` 5.7 MB, `products-catalogue` 5.3 MB across 19 chunks,
 * `beys` 3.8 MB).
 *
 * `appkit/src/index.ts` used to re-export all of it. 197 of the consumer's
 * 1,201 `src/` files import that bare barrel, so **every one of those 655,000
 * lines was parsed on every build** — to produce nothing, because the app
 * imports zero seed symbols. Tree-shaking does not help: Root Cause #24 states
 * the mechanism in its own words — *"Turbopack resolves a module's full static
 * import graph before any tree-shaking pass."* The bytes are dropped from the
 * OUTPUT, after being read.
 *
 * The fix was a `"./seed"` subpath that `seed-cli.mjs` imports directly.
 *
 * 🛑 THE REVERSION IS BOTH LIKELY AND SILENT, WHICH IS THE ENTIRE POINT OF
 * THIS AUDIT. CLAUDE.md's own seed-wiring note lists four edits needed to add
 * a collection, and the fourth is "export it from `appkit/src/index.ts`" —
 * because before the subpath existed, omitting that made the loader print
 * `▌ X — no seed data, skipping` and **exit 0** (Root Cause #90). So the next
 * person adding a collection will hit a silent skip, find that instruction,
 * follow it, and put 20 MB back into every build. Nothing else would notice:
 * tsc is happy, the app still works, only the build gets slower.
 *
 * ── WHAT IS CHECKED ─────────────────────────────────────────────────────────
 *
 * A re-export in `index.ts` / `client.ts` / `server.ts` whose SPECIFIER
 * resolves into the seed tree. Specifier-based, not symbol-name-based: a rule
 * keyed on identifiers ending in `SeedData` would miss `ADDRESS_FIXTURES`,
 * `DEFAULT_CATEGORIES` and `SEED_COLLECTION_PURPOSE`, all of which were in the
 * barrel before the split.
 *
 * `client.ts` is checked even though it never carried seed: a client bundle is
 * the one place this would be worse than slow.
 *
 * ── WHAT IS DELIBERATELY NOT FLAGGED ────────────────────────────────────────
 *
 * `export type` / `import type` of a seed TYPE. Types are erased by the
 * compiler and carry no bytes into any graph, and the tester feature
 * legitimately shares shapes. The check is for VALUE re-exports only.
 *
 * No suppression marker. A barrel either re-exports the corpus or it does not.
 */

import fs from "node:fs";
import path from "node:path";

const BARRELS = ["index.ts", "client.ts", "server.ts"];
const APPKIT_SRC = path.resolve("appkit/src");

/** Specifiers that resolve into the seed tree. */
const SEED_SPECIFIER = /^\.{1,2}\/(?:[^"'`]*\/)?(?:seed|seed-data)(?:\/|$)/;

const findings = [];
let scanned = 0;

for (const barrel of BARRELS) {
  const abs = path.join(APPKIT_SRC, barrel);
  if (!fs.existsSync(abs)) continue;
  scanned++;

  const lines = fs.readFileSync(abs, "utf8").split("\n");
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed.startsWith("export")) return;
    // `export type { … } from` and `export { type X } from` carry no runtime bytes.
    if (/^export\s+type\s/.test(trimmed)) return;

    const m = trimmed.match(/\bfrom\s*["'`]([^"'`]+)["'`]/);
    if (!m) return;
    if (!SEED_SPECIFIER.test(m[1])) return;

    findings.push({ barrel, line: i + 1, specifier: m[1], text: trimmed.slice(0, 100) });
  });
}

console.log(`[audit-barrel-no-seed] ${scanned} barrel(s) scanned in appkit/src`);

if (findings.length) {
  console.error(
    `\n✗ ${findings.length} seed re-export(s) in appkit's public barrel(s):\n`,
  );
  for (const f of findings) {
    console.error(`    appkit/src/${f.barrel}:${f.line}  → ${f.specifier}`);
    console.error(`      ${f.text}`);
  }
  console.error(
    "\n  This puts ~21 MB / 655k lines of seed fixtures back into the module graph\n" +
      "  of every consumer that imports the bare `@mohasinac/appkit` — parsed on\n" +
      "  every build to produce nothing. Turbopack reads the full import graph\n" +
      "  BEFORE tree-shaking, so `sideEffects` does not save you (Root Cause #24).\n" +
      "\n" +
      "  Seed data is reached through the `\"./seed\"` subpath export instead:\n" +
      "\n" +
      "      import { … } from \"@mohasinac/appkit/seed\";\n" +
      "\n" +
      "  🛑 If you landed here after a collection silently printed\n" +
      "  `no seed data, skipping` and exiting 0 — that is Root Cause #90, and the\n" +
      "  fix is to export it from `appkit/src/seed/index.ts`, NOT from the outer\n" +
      "  barrel. `seed-cli.mjs` imports the subpath and spreads it over the main\n" +
      "  barrel, so the loader sees it either way.",
  );
  process.exit(1);
}

console.log("✓ appkit's public barrels carry no seed re-exports");
