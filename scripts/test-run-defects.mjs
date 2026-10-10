#!/usr/bin/env node
/*
 * Emit docs/TEST-RUN-DEFECTS.md — the one consolidated defect register.
 *
 * 🛑 THE GENERATED BLOCK IS REPLACED, NEVER APPENDED.
 *
 * Everything between the TEST-RUN-DEFECTS markers is rewritten on every run;
 * everything outside them is hand-written and preserved verbatim. That split is
 * the whole safety mechanism, and it exists because hand-appending rows against
 * a generator's output is what left 122 orphan rows in docs/TEST-RUN-3.md —
 * they landed OUTSIDE the markers, survived every regeneration, and became a
 * permanent second copy of the table.
 *
 * So: never hand-edit between the markers, and never move a hand-written
 * section inside them.
 *
 * Usage:
 *   node scripts/test-run-defects.mjs            write the document
 *   node scripts/test-run-defects.mjs --check    exit 1 if stale, write nothing
 *   node scripts/test-run-defects.mjs --verify   assert completeness, write nothing
 *   node scripts/test-run-defects.mjs --json     the census, for a harness
 *
 * @tag domain:tester
 * @tag layer:script
 * @tag access:node-only
 * @tag sideEffects:writes docs/TEST-RUN-DEFECTS.md
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";

import { DEFECTS_DOC, DEFECTS_DOC_TABLE_MARKER } from "./lib/test-run.mjs";
import {
  collectDefects,
  SEVERITY_ORDER,
  cell,
  sharedFiles,
  REGISTER_RUNS,
} from "./lib/defect-register.mjs";

const argv = process.argv.slice(2);
const CHECK = argv.includes("--check");
const VERIFY = argv.includes("--verify");
const JSON_OUT = argv.includes("--json");

const START = `<!-- ${DEFECTS_DOC_TABLE_MARKER}:START -->`;
const END = `<!-- ${DEFECTS_DOC_TABLE_MARKER}:END -->`;

/* ── the generated body ───────────────────────────────────────────────── */

function severityBadge(sev) {
  if (sev === "high") return "🔴 high";
  if (sev === "medium") return "🟠 medium";
  if (sev === "low") return "🟡 low";
  return sev;
}

function statusBadge(status) {
  if (status === "fixed") return "✅ fixed";
  if (status === "deferred") return "⏸ deferred";
  if (status === "pending") return "⏳ pending";
  return "⬜ open";
}

function oneLine(s, max = 400) {
  if (!s) return "—";
  const t = String(s).replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

function rowSort(a, b) {
  const si = SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity);
  if (si !== 0) return si;
  if (a.run !== b.run) return a.run < b.run ? -1 : 1;
  return (Number(a.batch) || 1e9) - (Number(b.batch) || 1e9);
}

function renderBody(result) {
  const { rows, census } = result;
  const open = rows.filter((r) => r.status === "open" || r.status === "pending");
  const L = [];

  L.push(START);
  L.push("");
  L.push(
    "> 🛑 **GENERATED — do not hand-edit anything between the markers.** Regenerate with",
    "> `node scripts/test-run-defects.mjs`. A hand-added row lands outside the markers,",
    "> survives every regeneration and becomes a permanent second copy — that is how",
    "> `docs/TEST-RUN-3.md` acquired 122 orphan rows.",
    "",
    "> 🛑 **Rule #4 applies to every row below.** These were measured across batches",
    "> 1–255 and milestone deploys have shipped fixes since, so an entry may already be",
    "> dead. The launch review measured **6 of 7** happy-path failures already fixed and",
    "> never re-driven; `docs/TEST-RUN-3-OUTOFSCOPE.md` measured **3 of its first 10**",
    "> entries WRONG rather than merely unfixed. **Re-verify against a live run before",
    "> changing anything** — a fix for a defect that no longer exists is pure risk.",
    "",
    "> **Evidence paths are gitignored local artifacts.** `tester/.tester-runs/**` is",
    "> ignored in both this repo and the `tester` submodule, so a shot filename here",
    "> resolves only on the machine that recorded it. The written observation is the",
    "> durable evidence.",
    "",
  );

  /* ── counter ── */
  L.push("## Counts", "");
  L.push("| | |", "|---|---|");
  L.push(`| Defect rows (\`caseId\` × run) | **${census.rows}** |`);
  L.push(`| Distinct case ids | **${census.distinctCaseIds}** |`);
  L.push(
    `| Failed in BOTH runs (verdict \`no\` in each) | ${census.failedInBothRuns} |`,
  );
  L.push(
    `| Has a row in both runs (weaker — includes fix-only) | ${census.rowsInBothRuns} |`,
  );
  L.push(
    `| By run | ${REGISTER_RUNS.map((r) => `${r} ${census.byRun[r] ?? 0}`).join(" · ")} |`,
  );
  L.push(
    `| By severity | ${SEVERITY_ORDER.filter((s) => census.bySeverity[s])
      .map((s) => `${s} ${census.bySeverity[s]}`)
      .join(" · ")} |`,
  );
  L.push(
    `| By status | ${Object.entries(census.byStatus)
      .map(([k, v]) => `${k} ${v}`)
      .join(" · ")} |`,
  );
  L.push(
    `| Sources | ${Object.entries(census.perSource)
      .map(([k, v]) => `${k} ${v}`)
      .join(" · ")} |`,
  );
  L.push("");
  L.push(
    "🛑 **`unclassified` is the largest severity bucket and that is not a bug in the",
    "fold.** Those rows come from a verdict `no` answer and nothing else — nobody ever",
    "triaged them into the fix queue, so they carry no severity to fold. They are the",
    `${census.perSource["verdict:run-3"] ?? 0} + ${census.perSource["verdict:run-4"] ?? 0}`
      .concat(" verdict failures, minus the ones that were later queued."),
    "",
  );

  /* ── open first: this is what a future run consumes ── */
  L.push(`## Still open — ${open.length}`, "");
  L.push(
    "The only section a future run needs. Ordered by folded severity, then run, then",
    "batch.",
    "",
  );
  L.push("| Case id | Run | Sev | Batch | Title |");
  L.push("|---|---|---|---|---|");
  for (const r of [...open].sort(rowSort)) {
    L.push(
      `| \`${cell(r.caseId)}\` | ${r.run} | ${severityBadge(r.severity)} | ${cell(r.batch)} | ${cell(oneLine(r.title, 120))} |`,
    );
  }
  L.push("");

  /* ── shared files ── */
  const shared = sharedFiles(rows);
  if (shared.length) {
    L.push("## Fix these together", "");
    L.push(
      "Files carrying more than one OPEN defect. Grouping by file beats working down a",
      "severity list: several entries share one root cause — `field-names.ts` is the",
      "common cause of both the `totalAmount` and `bidderId` defects — and fixing",
      "per-file fixes them together, where a severity walk touches the same file three",
      "times.",
      "",
    );
    L.push("| Open defects | File |", "|---|---|");
    for (const [f, rs] of shared.slice(0, 25)) {
      L.push(`| ${rs.length} | \`${cell(f)}\` |`);
    }
    L.push("");
  }

  /* ── per-severity detail ── */
  for (const sev of SEVERITY_ORDER) {
    const group = rows.filter((r) => r.severity === sev);
    if (!group.length) continue;
    L.push(`## ${severityBadge(sev)} — ${group.length}`, "");

    if (sev === "CASE") {
      L.push(
        "🛑 **NOT product defects.** A checklist case that cannot be executed as authored",
        "— wrong role, contradictory oracles, a control that does not exist. Fix the",
        "**case**, in `appkit/src/features/tester/seed-data/authored/`.",
        "",
      );
    }
    if (sev === "FIXTURE") {
      L.push(
        "🛑 **NOT product defects.** Seed data that does not exist, so cases are blocked",
        "rather than failing. Fix the **seed**, and the blocked cases become runnable.",
        "",
      );
    }
    if (sev === "note") {
      L.push("Recorded corrections to earlier reasoning, kept so nobody repeats them.", "");
    }

    L.push("| Case id | Run | Status | Batch | Title | Detail | Files | Root cause | Sources |");
    L.push("|---|---|---|---|---|---|---|---|---|");
    for (const r of [...group].sort(rowSort)) {
      L.push(
        [
          `| \`${cell(r.caseId)}\``,
          r.run,
          statusBadge(r.status),
          cell(r.batch),
          cell(oneLine(r.title, 110)),
          cell(oneLine(r.detail)),
          r.files.length ? r.files.map((f) => `\`${cell(f)}\``).join("<br>") : "—",
          r.rootCauses.length ? r.rootCauses.map((n) => `#${n}`).join(" ") : "—",
          `${cell(r.sources.join(", "))} |`,
        ].join(" | "),
      );
    }
    L.push("");
  }

  L.push(END);
  return L.join("\n");
}

/* ── the hand-written scaffold, written once if the file is absent ────── */

function scaffold(body) {
  return [
    "# Test-run defect register",
    "",
    "> One file, two zones. Everything **outside** the generated markers is",
    "> hand-written and survives regeneration; everything **inside** them is derived",
    "> from `tester/.tester-runs/` and is replaced wholesale on every run.",
    "",
    "<!-- Hand-written sections live here, above the generated block. -->",
    "",
    body,
    "",
  ].join("\n");
}

/* ── main ─────────────────────────────────────────────────────────────── */

function verify(result) {
  const { rows, census, unresolved, malformed, queueOrphans } = result;
  const problems = [];

  if (malformed.length) {
    problems.push(`${malformed.length} malformed JSONL line(s) — a dropped line is a lost defect`);
    for (const m of malformed) problems.push(`    ${m.path}:${m.line} ${m.text}`);
  }

  /*
   * 🛑 The subset relation, asserted rather than assumed.
   *
   * `test-run-triage.mjs` reads `state.state.fixQueue` (129 entries) while the
   * top-level `fixQueue` holds 178. Top-level is a strict superset today. If
   * that ever inverts, this register is silently dropping the 129 — the exact
   * failure it was written to fix.
   */
  if (queueOrphans.length) {
    problems.push(
      `${queueOrphans.length} entries in state.fixQueue are NOT in the top-level fixQueue — ` +
        "the superset relation has inverted and the register is dropping them",
    );
  }

  const notInUniverse = rows.filter((r) => !r.inUniverse);
  const unkeyed = notInUniverse.filter((r) => r.caseId.startsWith("unkeyed:"));
  const phantom = notInUniverse.filter((r) => !r.caseId.startsWith("unkeyed:"));
  if (phantom.length) {
    problems.push(
      `${phantom.length} row(s) carry a case id that no batch file defines: ` +
        phantom.slice(0, 5).map((r) => r.caseId).join(", "),
    );
  }

  console.log(`rows ${census.rows} · distinct case ids ${census.distinctCaseIds} · universe ${census.universeSize}`);
  console.log(
    "per source:",
    Object.entries(census.perSource).map(([k, v]) => `${k} ${v}`).join(" · "),
  );
  console.log(`failed in both runs (verdict no in BOTH): ${census.failedInBothRuns}`);
  console.log(`severity: ${SEVERITY_ORDER.filter((s) => census.bySeverity[s]).map((s) => `${s} ${census.bySeverity[s]}`).join(" · ")}`);
  console.log(`status: ${Object.entries(census.byStatus).map(([k, v]) => `${k} ${v}`).join(" · ")}`);

  if (unresolved.length) {
    console.log(
      `\n${unresolved.length} source key(s) are not checklist ids — KEPT as \`unkeyed:\` rows, not dropped:`,
    );
    for (const u of unresolved) console.log(`    ${u.source}  ${u.raw}`);
  }
  if (unkeyed.length) console.log(`\n${unkeyed.length} unkeyed row(s) in the register.`);

  if (problems.length) {
    console.error(`\n✗ ${problems.length} problem(s):`);
    for (const p of problems) console.error(`  ${p}`);
    return false;
  }
  console.log("\n✓ register complete — every source key is represented, nothing dropped.");
  return true;
}

function main() {
  const result = collectDefects();

  if (JSON_OUT) {
    console.log(JSON.stringify(result.census, null, 2));
    return;
  }

  if (VERIFY) {
    process.exit(verify(result) ? 0 : 1);
  }

  const body = renderBody(result);

  const existing = existsSync(DEFECTS_DOC) ? readFileSync(DEFECTS_DOC, "utf8") : null;
  let next;
  if (existing && existing.includes(START) && existing.includes(END)) {
    const head = existing.slice(0, existing.indexOf(START));
    const tail = existing.slice(existing.indexOf(END) + END.length);
    next = head + body + tail;
  } else if (existing) {
    console.error(
      `✗ ${DEFECTS_DOC} exists but has no ${DEFECTS_DOC_TABLE_MARKER} markers.\n` +
        "  Refusing to overwrite hand-written content. Add the markers where the generated\n" +
        "  block belongs, or delete the file to regenerate the scaffold.",
    );
    process.exit(2);
  } else {
    next = scaffold(body);
  }

  if (CHECK) {
    if (existing === next) {
      console.log("✓ defect register current");
      return;
    }
    console.error("✗ defect register STALE — run `node scripts/test-run-defects.mjs`");
    process.exit(1);
  }

  if (existing === next) {
    console.log("✓ defect register already current — nothing written");
    return;
  }
  writeFileSync(DEFECTS_DOC, next, "utf8");
  console.log(
    `✓ wrote ${DEFECTS_DOC} — ${result.census.rows} rows, ${result.census.distinctCaseIds} distinct case ids`,
  );
}

main();
