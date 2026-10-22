/*
 * Append-only JSONL ledgers for things found during authoring that must NOT be acted
 * on now.
 *
 * 🛑 WHY A LEDGER AND NOT A FIX
 *
 * The pipeline is author → sweep → consolidate → fix once. Fixing a bug the moment
 * an author trips over it is the failure mode the whole plan exists to stop: every
 * fix invalidates part of the sweep behind it, so the sweep never converges and the
 * work is endless.
 *
 * But the alternative — noticing and saying nothing — loses the finding. An author
 * who opens a broken page has information nobody else will have again cheaply, and
 * a console message that scrolls past in a 30-minute unattended run is gone.
 *
 * So: record it, keep authoring the procedure for what SHOULD happen, and let Phase C
 * triage the ledger alongside the sweep's own failures as one set.
 *
 * JSONL because it is append-only by nature: two concurrent writers cannot corrupt
 * each other's lines, and a partial write costs one entry rather than the file.
 */

import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

/** Where each ledger lives, relative to the consumer repo root. */
export const LEDGERS = Object.freeze({
  /** A fixture the case needs that the seed does not have. Closed in Phase A4. */
  fixtures: "tester/.tester-runs/fixture-requests.jsonl",
  /** A real product defect seen while authoring. Triaged in Phase C, fixed in D. */
  defects: "tester/.tester-runs/defects.jsonl",
});

/**
 * Append entries, stamping each with its ledger and source.
 *
 * `at` is caller-supplied rather than `Date.now()` so a seeding script can record
 * when something was actually FOUND rather than when it was transcribed — several
 * of the first entries predate the ledger by hours.
 */
export function appendLedger(repoRoot, ledger, entries, { source = "authoring", at = null } = {}) {
  const rows = Array.isArray(entries) ? entries : [entries];
  if (!rows.length) return 0;

  const path = resolve(repoRoot, LEDGERS[ledger] ?? ledger);
  mkdirSync(dirname(path), { recursive: true });

  const lines = rows.map((r) => JSON.stringify({ source, ...(at ? { at } : {}), ...r })).join("\n");
  // Leading newline only when the file exists and does not already end in one —
  // an appended line that lands mid-row makes both rows unparseable.
  const needsNl = existsSync(path) && !readFileSync(path, "utf8").endsWith("\n");
  appendFileSync(path, (needsNl ? "\n" : "") + lines + "\n");
  return rows.length;
}

/** Read a ledger back. Unparseable lines are REPORTED, never silently dropped. */
export function readLedger(repoRoot, ledger) {
  const path = resolve(repoRoot, LEDGERS[ledger] ?? ledger);
  if (!existsSync(path)) return { entries: [], malformed: [] };

  const entries = [];
  const malformed = [];
  for (const [i, line] of readFileSync(path, "utf8").split("\n").entries()) {
    if (!line.trim()) continue;
    try {
      entries.push(JSON.parse(line));
    } catch {
      // A dropped line is a lost defect, and losing one silently is exactly what
      // the ledger exists to prevent. Surface it so the reader can recover it by hand.
      malformed.push({ line: i + 1, text: line.slice(0, 120) });
    }
  }
  return { entries, malformed };
}
