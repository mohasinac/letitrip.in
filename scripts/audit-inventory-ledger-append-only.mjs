#!/usr/bin/env node
/**
 * audit-inventory-ledger-append-only — the ledger stays evidence.
 *
 * `InventoryMovementsRepository` overrides `update` and `delete` to throw, so
 * nobody can edit a movement THROUGH the repository. This blocks the other
 * direction: a caller reaching past it to the raw collection.
 *
 * ── 🛑 WHY A COMMENT IS NOT ENOUGH ────────────────────────────────────────
 *
 * A Firestore `update()` on a movement row succeeds silently. There is no
 * error, no log, and no test — the row that used to prove where an item went
 * now proves something else, and the person who changed it never finds out.
 * That is the whole reason the collection is append-only, and a convention
 * cannot hold it: one `db.collection("inventoryMovements").doc(id).update(…)`
 * written in good faith by someone fixing a typo defeats it permanently,
 * because the previous value is gone.
 *
 * ── WHAT IS ALLOWED ───────────────────────────────────────────────────────
 *
 * R1  No `.update(`, `.set(`, `.delete(` on the movements collection outside
 *     the two files named below.
 * R2  The repository must still override BOTH `update` and `delete`. Deleting
 *     an override is how this guarantee would quietly end, and R1 would not
 *     notice — every caller would keep using the repository and start
 *     succeeding.
 *
 * Two files may write it:
 *   · `inventory-movements.repository.ts`  — `append`, and the two throwers
 *   · `inventory-placements.repository.ts` — `appendMovement`, which writes
 *     the ledger row INSIDE the placement transaction. That is not a loophole
 *     but the point: a placement changed without a movement is stock that
 *     teleported, so the two writes must be atomic, and the repository's own
 *     `append` is not transaction-aware.
 *
 * 🛑 NO SUPPRESSION MARKER. `audit-no-suppression-comments` blocks 24 of them
 * already, and the argument there applies doubly here: a marker on a ledger
 * edit is a signed note saying the evidence was altered deliberately.
 *
 * Exit: 0 clean, 1 violations.
 *
 * @tag domain:inventory
 * @tag layer:script
 * @tag access:node-only
 * @tag sideEffects:none
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const MOVEMENTS_REPO =
  "appkit/src/features/inventory/repository/inventory-movements.repository.ts";
const PLACEMENTS_REPO =
  "appkit/src/features/inventory/repository/inventory-placements.repository.ts";
const ALLOWED = new Set([MOVEMENTS_REPO, PLACEMENTS_REPO]);

/** The collection name, and the constant that holds it. */
const NEEDLES = ["inventoryMovements", "INVENTORY_MOVEMENTS_COLLECTION"];
const WRITES = /\.(update|set|delete)\s*\(/;

const files = [];
function walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const e of entries) {
    const p = join(dir, e);
    let st;
    try {
      st = statSync(p);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      if (["node_modules", "dist", ".next", ".git"].includes(e)) continue;
      walk(p);
    } else if (/\.(ts|tsx|mjs)$/.test(e)) files.push(p);
  }
}
walk(join(ROOT, "appkit", "src"));
walk(join(ROOT, "src"));
walk(join(ROOT, "functions", "src"));

const violations = [];

for (const abs of files) {
  const rel = relative(ROOT, abs).replace(/\\/g, "/");
  if (ALLOWED.has(rel)) continue;
  if (rel.endsWith("scripts/audit-inventory-ledger-append-only.mjs")) continue;

  const src = readFileSync(abs, "utf8");
  if (!NEEDLES.some((n) => src.includes(n))) continue;

  src.split("\n").forEach((line, i) => {
    // Comments are not writes. A `*`-prefixed line is inside a block comment.
    const t = line.trim();
    if (t.startsWith("//") || t.startsWith("*") || t.startsWith("/*")) return;
    if (!WRITES.test(line)) return;
    if (!NEEDLES.some((n) => line.includes(n))) return;
    violations.push({
      rule: "LEDGER_WRITE_OUTSIDE_REPOSITORY",
      file: rel,
      line: i + 1,
      text: t.slice(0, 120),
    });
  });
}

// R2 — the overrides must still be there.
const repoAbs = join(ROOT, MOVEMENTS_REPO);
let repoSrc = "";
try {
  repoSrc = readFileSync(repoAbs, "utf8");
} catch {
  violations.push({
    rule: "LEDGER_REPOSITORY_MISSING",
    file: MOVEMENTS_REPO,
    line: 0,
    text: "the movements repository is gone — the append-only guarantee has no implementation",
  });
}
if (repoSrc) {
  for (const method of ["update", "delete"]) {
    const has = new RegExp(`override\\s+async\\s+${method}\\s*\\(`).test(repoSrc);
    if (!has) {
      violations.push({
        rule: "LEDGER_OVERRIDE_REMOVED",
        file: MOVEMENTS_REPO,
        line: 0,
        text:
          `\`override async ${method}()\` is gone, so BaseRepository.${method} is ` +
          `reachable again and every existing caller would silently start succeeding`,
      });
    }
  }
}

if (violations.length === 0) {
  console.log("audit-inventory-ledger-append-only: clean ✓");
  process.exit(0);
}

console.error(
  `\naudit-inventory-ledger-append-only: ${violations.length} violation(s)\n`,
);
for (const v of violations) {
  console.error(`  ✗ ${v.rule}`);
  console.error(`    ${v.file}${v.line ? `:${v.line}` : ""}`);
  console.error(`    ${v.text}\n`);
}
console.error(
  "  The ledger is append-only. Record a correcting `adjust` movement rather\n" +
    "  than editing history — a Firestore update on a movement row succeeds\n" +
    "  silently, and the previous value is gone.\n",
);
process.exit(1);
