#!/usr/bin/env node
/*
 * Which shot files are CITED, and do they still resolve?
 *
 * 🛑 Run this before AND after every delete step. The count must never fall
 * unexpectedly — that is the only check standing between a cleanup and a
 * silently broken evidence trail, because nothing under tester/.tester-runs/ is
 * in git (ignored in this repo AND in the tester submodule), so a wrong delete
 * is unrecoverable.
 *
 * Cited-ness is the UNION of three sources, not just the docs:
 *   1. markdown paths in docs/*.md and claude-tester-report.md
 *   2. `evidence.screenshot` in every verdict file
 *   3. `.shot` in every fixes.jsonl row
 *
 * (2) matters because test-run-table.mjs DERIVES its links from the verdicts —
 * so a shot that is orphan in the docs today becomes cited the moment the table
 * is regenerated. Judging cited-ness from the docs alone would delete evidence
 * that the next generator run will ask for.
 *
 * Usage: node scripts/test-run-shot-census.mjs [--json]
 *
 * @tag domain:tester
 * @tag layer:script
 * @tag access:node-only
 * @tag sideEffects:none — pure reads
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, basename } from "node:path";

import { RUNS_DIR, REPO } from "./lib/test-run.mjs";

const RUNS = ["run-3", "run-4"];
const JSON_OUT = process.argv.includes("--json");

/** Every `run-N/shots/<file>.png` path mentioned in a tracked or generated doc. */
function citedInDocs() {
  const out = new Set();
  const files = [];
  const docsDir = resolve(REPO, "docs");
  if (existsSync(docsDir)) {
    for (const f of readdirSync(docsDir)) if (f.endsWith(".md")) files.push(resolve(docsDir, f));
  }
  const report = resolve(REPO, "claude-tester-report.md");
  if (existsSync(report)) files.push(report);

  const re = /run-[0-9]+\/shots\/[A-Za-z0-9._-]+\.png/g;
  for (const p of files) {
    for (const m of readFileSync(p, "utf8").matchAll(re)) out.add(m[0]);
  }
  return out;
}

/** Every `evidence.screenshot` a verdict file names. */
function citedInVerdicts() {
  const out = new Set();
  for (const run of RUNS) {
    const dir = resolve(RUNS_DIR, run, "verdicts");
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) {
      if (!f.endsWith(".json")) continue;
      let v;
      try {
        v = JSON.parse(readFileSync(resolve(dir, f), "utf8"));
      } catch {
        continue;
      }
      const answers = Array.isArray(v) ? v : Array.isArray(v?.verdicts) ? v.verdicts : [];
      for (const a of answers) {
        const s = a?.evidence?.screenshot;
        if (typeof s === "string" && s.endsWith(".png")) out.add(normalise(s, run));
      }
    }
  }
  return out;
}

/** Every `.shot` a fix ledger row names. */
function citedInFixes() {
  const out = new Set();
  for (const run of RUNS) {
    const p = resolve(RUNS_DIR, run, "fixes.jsonl");
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split("\n")) {
      if (!line.trim()) continue;
      try {
        const e = JSON.parse(line);
        if (typeof e.shot === "string" && e.shot.endsWith(".png")) out.add(normalise(e.shot, run));
      } catch {
        /* malformed rows are reported by the register, not here */
      }
    }
  }
  return out;
}

/** Reduce any spelling of a shot reference to `run-N/shots/<file>`. */
function normalise(s, run) {
  const m = /run-[0-9]+\/shots\/[A-Za-z0-9._-]+\.png/.exec(s);
  if (m) return m[0];
  return `${run}/shots/${basename(s)}`;
}

function main() {
  const docs = citedInDocs();
  const verdicts = citedInVerdicts();
  const fixes = citedInFixes();
  const cited = new Set([...docs, ...verdicts, ...fixes]);

  let onDisk = 0;
  let citedPresent = 0;
  let citedMissing = [];
  let orphan = 0;
  let orphanBytes = 0;
  let citedBytes = 0;

  const present = new Set();
  for (const run of RUNS) {
    const dir = resolve(RUNS_DIR, run, "shots");
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) {
      const rel = `${run}/shots/${f}`;
      present.add(rel);
      if (!f.endsWith(".png")) continue;
      onDisk += 1;
      const bytes = statSync(resolve(dir, f)).size;
      if (cited.has(rel)) {
        citedPresent += 1;
        citedBytes += bytes;
      } else {
        orphan += 1;
        orphanBytes += bytes;
      }
    }
  }
  citedMissing = [...cited].filter((c) => !present.has(c));

  const result = {
    citedTotal: cited.size,
    citedFromDocs: docs.size,
    citedFromVerdicts: verdicts.size,
    citedFromFixes: fixes.size,
    onDisk,
    citedPresent,
    citedMissing: citedMissing.length,
    orphan,
    citedMB: +(citedBytes / 1048576).toFixed(1),
    orphanMB: +(orphanBytes / 1048576).toFixed(1),
  };

  if (JSON_OUT) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(
    `cited ${result.citedTotal} (docs ${docs.size} · verdicts ${verdicts.size} · fixes ${fixes.size})`,
  );
  console.log(
    `on disk ${onDisk} · cited present ${citedPresent} (${result.citedMB} MB) · orphan ${orphan} (${result.orphanMB} MB)`,
  );
  if (citedMissing.length) {
    console.log(`\n🛑 ${citedMissing.length} CITED shot(s) are NOT on disk:`);
    for (const c of citedMissing.slice(0, 15)) console.log(`    ${c}`);
    if (citedMissing.length > 15) console.log(`    … and ${citedMissing.length - 15} more`);
  } else {
    console.log("\n✓ every cited shot resolves");
  }
}

main();
