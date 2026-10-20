#!/usr/bin/env node
/**
 * Plastic-generation PART COMPATIBILITY, from a published community sheet.
 *
 *   PART_COMPAT_SHEET_ID=<id> node scripts/fetch-part-compatibility.mjs
 *   node scripts/fetch-part-compatibility.mjs --offline
 *
 * Writes `docs/research/part-compatibility-2026-10/compatibility.json`.
 *
 * ── 🛑 WHY THIS CANNOT BE DERIVED FROM THE DATA WE ALREADY HOLD ────────────
 *
 * Compatibility is FINER-GRAINED THAN GENERATION. Our rows carry a `system`,
 * and a system label cannot answer "does this shaft fit that base" — plastic
 * and HMS parts do not interchange, and even within plastics a given
 * base/casings/shaft triple ranges from "fits perfectly, complete free spin"
 * to "requires force to assemble and may damage the tip".
 *
 * That is measured, physical fit. It is not inferable from any field we have,
 * and guessing it would produce a build suggestion that breaks someone's
 * property.
 *
 * ── 🛑 THREE OF THE SIX TABS ARE THE SAME 145 ROWS, SORTED DIFFERENTLY ─────
 *
 * Verified rather than assumed: with each triple reduced to an order-
 * independent key, `gid=6` (shaft-first) and `gid=7` (casings-first) are
 * IDENTICAL SETS to `gid=0` (base-first). They are views for a human reading
 * the sheet. Importing all three would have tripled every combination and the
 * count — 435 — would have looked like a richer source rather than a bug.
 *
 * Real content: 144 unique base/casings/shaft, 33 base/SG/tip, 14 CEW/engine
 * gear/base = 191 combinations, plus a handful of free-text part notes.
 *
 * ── 🛑 THE VERDICT IS READ ONLY WHERE THE SHEET STATES ONE ─────────────────
 *
 * The notes are prose written by people who tried the combination. Three say
 * "Illegal" outright, which is a tournament ruling and is captured as a flag.
 * Beyond that, a handful of phrases are unambiguous enough to structure
 * ("complete free spin", "no free spin") and the rest is left as prose.
 *
 * A five-point compatibility SCORE invented from that prose would be the
 * confident-wrong-number pattern applied to whether a part physically fits —
 * so there isn't one. `advice` keeps the source's own words for traceability
 * in this research file; the site renders our own wording from the structured
 * fields beside it.
 *
 * @tag domain:parts
 * @tag layer:script
 * @tag access:build
 * @tag sideEffects:network,writes-docs-research
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const OUT_DIR = "docs/research/part-compatibility-2026-10";
const SHEET_ID = process.env.PART_COMPAT_SHEET_ID ?? "";
const OFFLINE = process.argv.includes("--offline");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

/*
 * 🛑 `gid` 6 and 7 are deliberately ABSENT — see the header. Adding one back
 * triples the row count without adding a single combination.
 */
const TABS = [
  { gid: 0, shape: ["base", "casings", "shaft"], kind: "base-casings-shaft" },
  { gid: 3, shape: ["base", "sg", "tip"], kind: "base-sg-tip" },
  { gid: 8, shape: ["cewPart", "engineGear", "base"], kind: "cew-enginegear-base" },
];
const NOTES_GID = 4;

/** A CSV line, honouring quoted fields. No dependency for 190 rows. */
function csvLine(line) {
  const out = [];
  let cur = "";
    let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (q && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else q = !q;
      continue;
    }
    if (c === "," && !q) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += c;
  }
  out.push(cur);
  return out.map((x) => x.trim());
}

async function tabCsv(gid, rawDir) {
  const cached = path.join(rawDir, `gid${gid}.csv`);
  if (OFFLINE || !SHEET_ID) {
    if (!fs.existsSync(cached)) {
      console.error(
        `[compat] no cache for gid=${gid}. Set PART_COMPAT_SHEET_ID and run online.`,
      );
      process.exit(2);
    }
    return fs.readFileSync(cached, "utf8");
  }
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;
  const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for gid=${gid}`);
  const text = await res.text();
  fs.writeFileSync(cached, text, "utf8");
  return text;
}

/** Only what the prose states unambiguously. Everything else stays prose. */
function readVerdict(note) {
  const n = String(note ?? "");
  const lower = n.toLowerCase();
  const v = {};
  /* A tournament ruling, stated outright on 3 rows. */
  if (/\billegal\b/i.test(n)) v.illegal = true;
  /*
   * 🛑 Order matters: "no free spin" contains "free spin". Testing the
   * positive first would read every negative row as a positive one.
   */
  if (/no free spin|not free/.test(lower)) v.freeSpin = false;
  else if (/complete free spin|free spin|spins? freely/.test(lower)) v.freeSpin = true;
  if (/may damage|damages|risks (pulling|damag)|places stress/.test(lower)) v.riskOfDamage = true;
  if (/requires force|difficult to (put|assemble)/.test(lower)) v.hardToAssemble = true;
  if (/fits perfectly/.test(lower)) v.fitsPerfectly = true;
  return v;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const rawDir = path.join(OUT_DIR, "raw");
  fs.mkdirSync(rawDir, { recursive: true });

  const combos = [];
  const seen = new Set();
  let duplicateRows = 0;
  const byKind = {};

  for (const tab of TABS) {
    const csv = await tabCsv(tab.gid, rawDir);
    const lines = csv.split(/\r?\n/).filter((l) => l.trim());
    const rows = lines.slice(1).map(csvLine);
    let kept = 0;
    for (const r of rows) {
      const parts = tab.shape.map((_, i) => r[i] ?? "");
      if (parts.some((x) => !x)) continue;
      /* Order-independent key: the same triple listed in another order is the
       * same physical combination. */
      const key = `${tab.kind}:${parts
        .map((x) => x.toLowerCase().replace(/[^a-z0-9]/g, ""))
        .sort()
        .join("|")}`;
      if (seen.has(key)) {
        duplicateRows += 1;
        continue;
      }
      seen.add(key);
      const advice = r[tab.shape.length] ?? "";
      const row = { kind: tab.kind };
      tab.shape.forEach((name, i) => {
        row[name] = parts[i];
      });
      const verdict = readVerdict(advice);
      if (Object.keys(verdict).length) row.verdict = verdict;
      /* The source's own words, kept in the RESEARCH file for traceability.
       * The site renders our wording from `verdict`, not this. */
      if (advice) row.advice = advice;
      combos.push(row);
      kept += 1;
    }
    byKind[tab.kind] = kept;
  }

  /* Free-text part notes — one per line, no triple to key on. */
  let partNotes = [];
  try {
    const csv = await tabCsv(NOTES_GID, rawDir);
    partNotes = csv
      .split(/\r?\n/)
      .map((l) => csvLine(l)[0] ?? "")
      .map((x) => x.trim())
      .filter((x) => x && x.length > 12);
  } catch {
    /* A missing notes tab is not a failed run. */
  }

  const illegal = combos.filter((c) => c.verdict?.illegal).length;
  const report = {
    note:
      "Plastic-generation part compatibility from a published community sheet. " +
      "Compatibility is finer-grained than generation and is measured physical " +
      "fit — it is not inferable from any field we hold, and guessing it would " +
      "produce a build suggestion that breaks someone's property. Three of the " +
      "sheet's six tabs are the SAME 145 rows sorted differently (verified by " +
      "order-independent key), so only the three distinct shapes are read. A " +
      "verdict is structured only where the prose states one; no compatibility " +
      "SCORE is invented from the notes.",
    sheetTabsRead: TABS.map((t) => `gid=${t.gid} (${t.kind})`),
    sheetTabsSkippedAsSortedDuplicates: ["gid=6", "gid=7"],
    combinations: combos.length,
    byKind,
    duplicateRowsDropped: duplicateRows,
    flaggedIllegal: illegal,
    withAVerdict: combos.filter((c) => c.verdict).length,
    partNotes,
    combos,
  };

  fs.writeFileSync(
    path.join(OUT_DIR, "compatibility.json"),
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8",
  );

  console.log(`[compat] ${combos.length} unique combinations`);
  for (const [k, n] of Object.entries(byKind)) console.log(`  ${k.padEnd(24)} ${n}`);
  console.log(`  duplicate rows dropped:  ${duplicateRows}`);
  console.log(`  with a structured verdict: ${report.withAVerdict}`);
  console.log(`  flagged illegal:         ${illegal}`);
  console.log(`  free-text part notes:    ${partNotes.length}`);
}

main().catch((err) => {
  console.error(`[compat] ${err.message}`);
  process.exit(1);
});
