#!/usr/bin/env node
/*
 * Print the fix queue in triage order, with the severity field folded.
 *
 * WHY: `state.fixQueue` holds 123 entries and its `severity` drifted from an
 * enum into freeform prose across the run — 60+ distinct values, so it cannot
 * be sorted or grouped, which is the one thing a fix phase needs from it. This
 * folds it at read time rather than rewriting 123 entries.
 *
 * 🛑 TWO BUCKETS ARE NOT PRODUCT DEFECTS and must not be fixed as if they were:
 *   CASE     a checklist case that cannot be executed as authored (wrong role,
 *            contradictory oracles, a control that does not exist). Fix the
 *            CASE, in appkit/src/features/tester/seed-data/authored/.
 *   FIXTURE  seed data that does not exist, so cases are blocked rather than
 *            failing. Fix the SEED, and the blocked cases become runnable.
 *
 * Grouping by file matters more than severity order: several entries share one
 * root cause (field-names.ts is the common cause of the totalAmount AND
 * bidderId defects), and fixing per-file fixes them together — whereas working
 * down a severity list touches the same file three times.
 *
 * 🛑 Rule #4 still applies to every entry: RE-VERIFY against live production
 * before changing anything. These were measured across batches 1-175 and the
 * milestone deploys have shipped fixes since; an entry from batch 20 may
 * already be dead. A fix for a defect that no longer exists is pure risk.
 *
 * Usage: node scripts/test-run-triage.mjs [--sev high] [--file <substr>] [--full]
 */

import { readFileSync } from "node:fs";

const STATE = "D:/proj/letitrip.in/tester/.tester-runs/loop-state.json";
const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : null; };
const FULL = argv.includes("--full");
const WANT_SEV = opt("sev");
const WANT_FILE = opt("file");

/** Fold the drifted severity strings into five buckets. */
function fold(raw) {
  const s = String(raw ?? "").trim();
  if (/^CASE[ _-]?DEFECT/i.test(s)) return "CASE";
  if (/^FIXTURE[ _-]?GAP/i.test(s)) return "FIXTURE";
  if (/^(CRITICAL|HIGH)/i.test(s)) return "high";
  if (/^MEDIUM/i.test(s)) return "medium";
  if (/^LOW/i.test(s)) return "low";
  /* "not a defect - a correction to my own reasoning" and similar */
  if (/not a defect/i.test(s)) return "note";
  return "unclassified";
}

const ORDER = ["high", "medium", "low", "FIXTURE", "CASE", "note", "unclassified"];

const state = JSON.parse(readFileSync(STATE, "utf8"));
const queue = state.state?.fixQueue ?? state.fixQueue ?? [];

/*
 * 🛑 THE QUEUE HOLDS TWO ENTRY SHAPES, and 81 of 123 are the older one.
 *
 *   newer (batches ~167+):  { batch, case, title, detail, files, severity }
 *   older (batches 1-166):  { id, foundBy[], batches[], symptom, severity, … }
 *
 * The older shape has no `title` and no `batch`, so reading only the newer
 * field names prints "b? (untitled)" for two thirds of the queue — which is
 * what this tool did on its first run. Normalise BOTH here: an `id` slug is a
 * perfectly good title, `batches[0]` is the batch, and `foundBy` carries the
 * case ids that the newer shape puts in `case`. The older entries also spread
 * their detail across ~60 ad-hoc keys (symptom, rootCause, consequence,
 * impact, whyItMatters…), so --full falls back to `symptom` for them rather
 * than trying to enumerate the rest.
 */
const rows = queue.map((d) => ({
  batch: d.batch ?? (Array.isArray(d.batches) ? d.batches[0] : null) ?? "?",
  sev: fold(d.severity),
  title: String(
    d.title ??
      (d.id ? d.id.replace(/-/g, " ") : null) ??
      d.case ??
      "(untitled)",
  ),
  files: Array.isArray(d.files) ? d.files : [],
  case: d.case ?? (Array.isArray(d.foundBy) ? d.foundBy[0] : null),
  detail: d.detail ?? d.symptom ?? null,
  fixed: d.status === "fixed" || d.fixed === true || Boolean(d.fixedAt),
}));

const shown = rows.filter(
  (r) =>
    (!WANT_SEV || r.sev === WANT_SEV) &&
    (!WANT_FILE || r.files.some((f) => f.includes(WANT_FILE))),
);

const bySev = {};
for (const r of rows) bySev[r.sev] = (bySev[r.sev] || 0) + 1;

console.log(`fix queue: ${rows.length} entries · lastFixAtRecorded=${state.lastFixAtRecorded ?? "(unset)"}`);
console.log("folded severity:", ORDER.filter((k) => bySev[k]).map((k) => `${k} ${bySev[k]}`).join(" · "));

/* Files touched by more than one entry — fix these together. */
const fileHits = {};
for (const r of rows) for (const f of r.files) (fileHits[f] ??= []).push(r);
const shared = Object.entries(fileHits)
  .filter(([, rs]) => rs.length > 1)
  .sort((a, b) => b[1].length - a[1].length);

if (shared.length) {
  console.log(`\n── files with more than one queued defect (fix together) ──`);
  for (const [f, rs] of shared.slice(0, 12)) {
    const sevs = rs.map((r) => r.sev).join(",");
    console.log(`  ${rs.length}x  ${f}   [${sevs}]`);
  }
}

console.log(`\n── ${shown.length} entr${shown.length === 1 ? "y" : "ies"} in triage order ──`);
for (const sev of ORDER) {
  const group = shown.filter((r) => r.sev === sev);
  if (!group.length) continue;
  console.log(`\n▸ ${sev} (${group.length})`);
  for (const r of group.sort((a, b) => Number(a.batch) - Number(b.batch))) {
    const done = r.fixed ? " ✓fixed" : "";
    console.log(`  b${r.batch}${done}  ${FULL ? r.title : r.title.slice(0, 104)}`);
    if (FULL) {
      if (r.case) console.log(`        case:  ${r.case}`);
      if (r.files.length) console.log(`        files: ${r.files.join(", ")}`);
      if (r.detail) console.log(`        detail: ${String(r.detail).replace(/\s+/g, " ").slice(0, 300)}`);
    }
  }
}

console.log("\n🛑 Re-verify each one against live production before changing it (Rule #4).");
console.log("   CASE entries fix the checklist, FIXTURE entries fix the seed — neither is a product defect.");
