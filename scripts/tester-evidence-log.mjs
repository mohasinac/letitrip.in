#!/usr/bin/env node
/*
 * WHY: a rolling, analysis-free record of what the tester has actually done.
 * WHAT: reads a run's verdict files and emits one Markdown section per batch,
 *       each case with its verdict and the tester's own evidence text.
 *
 * This is deliberately NOT `claude-tester-report.md`. That file is the run's
 * terminal deliverable, written once by record-verdicts.mjs behind a
 * completeness gate. Writing here instead means a mid-run snapshot can never
 * be mistaken for the finished report, and can never overwrite it.
 *
 * No interpretation, no grouping by severity, no root-causing - the verdict and
 * the evidence exactly as recorded. Analysis is a separate job.
 *
 * Usage: node scripts/tester-evidence-log.mjs [runId] [--out <path>]
 */

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const args = process.argv.slice(2);
const RUN_ID = args.find((a) => !a.startsWith("--")) ?? "sweep1";
const outIdx = args.indexOf("--out");
const OUT = outIdx >= 0 ? args[outIdx + 1] : "tester-evidence-log.md";

const RUNS = resolve("tester/.tester-runs", RUN_ID);
const VERDICTS = resolve(RUNS, "verdicts");
const BATCHES = resolve(RUNS, "batches");

if (!existsSync(VERDICTS)) {
  console.error(`no verdicts directory for run ${RUN_ID}`);
  process.exit(1);
}

const scope = existsSync(resolve(RUNS, "scope.json"))
  ? JSON.parse(readFileSync(resolve(RUNS, "scope.json"), "utf8"))
  : null;

const isControl = (id) => String(id).startsWith("control-");

/** Batch files carry the authored procedure; verdicts carry only the answer. */
function readBatch(name) {
  const p = resolve(BATCHES, name);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

const files = readdirSync(VERDICTS)
  .filter((f) => f.endsWith(".json"))
  .map((f) => ({ f, t: statSync(resolve(VERDICTS, f)).mtimeMs }))
  .sort((a, b) => a.t - b.t);

let pass = 0;
let fail = 0;
let blocked = 0;
let quarantined = 0;
const sections = [];

for (const { f, t } of files) {
  let v;
  try {
    v = JSON.parse(readFileSync(resolve(VERDICTS, f), "utf8"));
  } catch {
    sections.push(`## ${f}\n\n> ⚠ verdict file could not be parsed.\n`);
    continue;
  }

  const batch = readBatch(f);
  const caseById = new Map((batch?.cases ?? []).map((c) => [c.id, c]));
  const real = (v.verdicts ?? []).filter((x) => !isControl(x.id));
  const controls = (v.verdicts ?? [])
    .filter((x) => isControl(x.id))
    .map((x) => `${x.id.replace(`-${RUN_ID}`, "")}=${x.answer ?? "null"}`)
    .join(" ");

  if (v.quarantined) quarantined++;

  const lines = [];
  lines.push(`## ${f.replace(/\.json$/, "")}`);
  lines.push("");
  lines.push(
    `Recorded ${new Date(t).toISOString()} · ${real.length} case(s) · controls: ${controls || "none"}` +
      (v.quarantined ? " · **QUARANTINED**" : ""),
  );
  lines.push("");

  for (const x of real) {
    const c = caseById.get(x.id);
    const mark = x.answer === "yes" ? "✓ PASS" : x.answer === "no" ? "✗ FAIL" : "· BLOCKED";
    if (x.answer === "yes") pass++;
    else if (x.answer === "no") fail++;
    else blocked++;

    lines.push(`### ${mark} — ${x.label ?? c?.label ?? x.id}`);
    lines.push("");
    lines.push(`- \`${x.id}\``);
    if (c?.roles?.length) lines.push(`- roles: ${c.roles.join(", ")}`);
    if (c?.startPage) lines.push(`- start: \`${c.startPage}\``);
    if (c?.inputs && Object.keys(c.inputs).length) {
      lines.push(
        `- inputs: ${Object.entries(c.inputs)
          .map(([k, val]) => `${k}=${JSON.stringify(val)}`)
          .join(" · ")}`,
      );
    }
    const evidence = String(x.comment ?? "").trim();
    lines.push(`- **Evidence** — ${evidence || "_(none recorded)_"}`);
    if (x.screenshot) lines.push(`- screenshot: \`${x.screenshot}\``);
    if (x.screenshotUrl) lines.push(`- screenshot url: ${x.screenshotUrl}`);
    lines.push("");
  }

  sections.push(lines.join("\n"));
}

const total = scope?.batches?.length ?? "?";
const head = [
  `# Tester Evidence Log — run \`${RUN_ID}\``,
  "",
  `Generated ${new Date().toISOString()} · **${files.length} of ${total}** batches recorded`,
  "",
  `| pass | fail | blocked | quarantined batches |`,
  `|---|---|---|---|`,
  `| ${pass} | ${fail} | ${blocked} | ${quarantined} |`,
  "",
  "> Raw record of completed tests and the tester's own evidence. No analysis.",
  "> A batch absent from this file has not run yet — absence is not a pass.",
  "> The run's terminal deliverable is `claude-tester-report.md`, written only",
  "> once every scoped batch has recorded.",
  "",
  "---",
  "",
].join("\n");

writeFileSync(OUT, head + sections.join("\n---\n\n"));
console.log(
  `${OUT}: ${files.length}/${total} batches · ${pass} pass · ${fail} fail · ${blocked} blocked`,
);
