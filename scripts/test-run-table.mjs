#!/usr/bin/env node
/*
 * The checklist table in docs/TEST-RUN-3.md, regenerated from disk.
 *
 * 🛑 EVERY CELL IS COMPUTED. Nothing here is typed by hand, and the whole table
 * is REPLACED on each run rather than appended to — so running it twice cannot
 * double a row, and a verdict corrected later shows its corrected value instead
 * of sitting next to the old one.
 *
 * That is the same rule as the counter block (see lib/test-run.mjs): a number
 * that exists in two places has already drifted, it just has not been noticed
 * yet. The one thing a human writes is the `reason` text, and that comes from
 * the verdict's own `comment`, which a developer reads anyway.
 *
 * Columns are the ones asked for — batch, case number, case id, name, result,
 * reason, screenshot, fix applied — plus four that earn their place:
 *   Group/Page   a case id alone does not say where you are
 *   Role         the same page behaves differently for four identities, and
 *                that difference is usually the bug
 *   Files        makes a fix reviewable without hunting through commits
 *   Re-verified  separates "fixed" from "fix re-tested", which is the whole
 *                distinction between a repair and a hypothesis
 *
 * Usage: node scripts/test-run-table.mjs [--check]
 *   --check  exit 1 if the document is out of date, writing nothing
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import {
  CHECKLIST_DOC,
  readScope,
  readBatches,
  readVerdicts,
  readFixes,
  isControlId,
  flag,
} from "./lib/test-run.mjs";

const START = "<!-- TEST-RUN-3-TABLE:START -->";
const END = "<!-- TEST-RUN-3-TABLE:END -->";

const RESULT = { yes: "✅ pass", no: "❌ fail", null: "⬜ null" };

/** Collapse a verdict comment to one scannable line. */
function reason(v) {
  const raw = String(v.comment ?? "").replace(/\s+/g, " ").trim();
  if (!raw) return "—";
  /*
   * Prefer the sentence that says what went wrong. A passing verdict's first
   * sentence is usually the observation; a failing one often opens with the
   * symptom and only later names the cause, and the cause is what a reader of
   * this table wants.
   */
  const cause = raw.match(/CAUSE:\s*([^.]+(?:\.[^.]+){0,2}\.)/);
  const text = cause ? cause[1] : raw;
  const cut = text.length > 240 ? `${text.slice(0, 237)}…` : text;
  return cut.replace(/\|/g, "\\|");
}

function shotCell(v) {
  const p = v?.evidence?.screenshot;
  if (!p) return "—";
  const rel = p.startsWith("tester/") ? `../${p}` : p;
  return `[shot](${rel})`;
}

function main() {
  const scope = readScope();
  const rows = Array.isArray(scope?.batches) ? scope.batches : [];
  const order = new Map(rows.map((r, i) => [r.key, Number(r.order ?? i)]));
  const batches = readBatches();
  const verdicts = readVerdicts();

  /* caseId -> its fix, so a row can show what was done about it. */
  const fixByCase = new Map();
  for (const f of readFixes()) fixByCase.set(f.caseId, f);

  const done = [...verdicts.keys()].sort(
    (a, b) => (order.get(a) ?? 1e9) - (order.get(b) ?? 1e9),
  );

  const lines = [
    "| Batch | # | Case id | Test | Group/Page | Role | Result | Reason | Shot | Fix applied | Files | Manual? | Re-verified |",
    "|---|---|---|---|---|---|---|---|---|---|---|---|---|",
  ];

  let batchNo = 0;
  let caseNo = 0;
  for (const key of done) {
    batchNo += 1;
    const batch = batches.get(key);
    const answers = verdicts.get(key) ?? [];
    const identity = batch?.identity ?? rows.find((r) => r.key === key)?.identity ?? "—";

    for (const a of answers) {
      if (isControlId(a.id)) continue; // controls are harness self-checks, never coverage
      caseNo += 1;
      const c = (batch?.cases ?? []).find((x) => x.id === a.id);
      const fix = fixByCase.get(a.id);
      const answer = a.answer === null || a.answer === undefined ? "null" : String(a.answer);
      /* Outer pipes to match the header — some renderers need them, and a row
         that does not line up with its header reads as a broken table. */
      lines.push(
        "| " +
        [
          batchNo,
          caseNo,
          `\`${a.id}\``,
          (c?.label ?? "—").replace(/\|/g, "\\|").slice(0, 90),
          key,
          identity,
          RESULT[answer] ?? answer,
          reason(a),
          shotCell(a),
          fix ? reason({ comment: fix.summary }) : "—",
          fix?.files?.length ? fix.files.map((f) => `\`${f.split("/").pop()}\``).join(" ") : "—",
          c?.requiresHumanChannel ? "yes" : "no",
          fix?.reverified ?? "—",
        ].join(" | ") +
        " |",
      );
    }
  }

  const table = `${START}\n\n${lines.join("\n")}\n\n${END}`;
  const doc = existsSync(CHECKLIST_DOC) ? readFileSync(CHECKLIST_DOC, "utf8") : "";

  let next;
  if (doc.includes(START) && doc.includes(END)) {
    next = doc.replace(new RegExp(`${START}[\\s\\S]*?${END}`), table);
  } else {
    next = `${doc.replace(/\s+$/, "")}\n\n## Checklist\n\n${table}\n`;
  }

  if (flag("check") === true) {
    const stale = next !== doc;
    console.log(stale ? "✗ table is out of date" : `✓ table current (${caseNo} case rows)`);
    process.exit(stale ? 1 : 0);
  }

  writeFileSync(CHECKLIST_DOC, next, "utf8");
  console.log(`✓ ${caseNo} case row(s) across ${batchNo} batch(es) → ${CHECKLIST_DOC}`);
}

main();
