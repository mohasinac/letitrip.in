#!/usr/bin/env node
/*
 * Cluster a run's failures by ROOT CAUSE, so Phase 3 fixes causes rather than
 * symptoms.
 *
 * Usage:
 *   node scripts/triage-findings.mjs --run full0911
 *   node scripts/triage-findings.mjs --run full0911 --out docs/TRIAGE.md
 *
 * 🛑 WHY THIS EXISTS: ONE DEFECT PRODUCES MANY FAILING CASES, AND THE COUNT LIES.
 *
 * In sweep1, five separate "failures" — bundle checkout, prize-draw checkout,
 * digital-code checkout, multi-seller checkout, and the value-OTP step — were
 * ONE React #310 hoisting bug. Three more were one session-vs-document read.
 * Triaging per symptom would have meant eight changes instead of two, and six of
 * them would have been guesses at code that was already correct.
 *
 * So the unit of work in Phase 3 is a CLUSTER, not a verdict. A cluster with
 * fifteen members is not fifteen times more urgent than one with a single
 * member — it is one bug that is fifteen times more visible.
 *
 * 🛑 THIS RANKS BY BLAST RADIUS, NOT BY SEVERITY. It cannot know severity: the
 * evidence says what the tester saw, never how much it matters. A one-member
 * cluster can be the worst thing in the run (a silent money error) and a
 * fifteen-member cluster can be cosmetic. Read every cluster; use the size to
 * decide what to fix FIRST, never what to fix AT ALL.
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const arg = (name, dflt) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : dflt;
};

const RUN = arg("run");
const OUT = arg("out", RUN ? `docs/TRIAGE-${RUN}.md` : null);
if (!RUN) {
  console.error("Usage: triage-findings.mjs --run <runId> [--out <path>]");
  process.exit(2);
}

const VERDICTS = resolve(process.cwd(), "tester/.tester-runs", RUN, "verdicts");
if (!existsSync(VERDICTS)) {
  console.error(`✗ ${VERDICTS} does not exist.`);
  process.exit(2);
}

/*
 * Signature extractors, most specific first. The ORDER is the whole design: an
 * evidence string mentioning both "React error #310" and "500" belongs with the
 * #310 cluster, because the 500 is downstream noise. A flat keyword match would
 * split it across two clusters and hide that they are one bug.
 */
const SIGNATURES = [
  // A React minified error number is the strongest signal available — it names
  // one specific invariant violation, and every case that hits it shares a cause.
  { re: /React (?:minified )?error #(\d+)/i, label: (m) => `react-#${m[1]}` },
  { re: /Minified React error #(\d+)/i, label: (m) => `react-#${m[1]}` },
  // Node/bundler faults name a module; that module IS the cluster.
  { re: /MODULE_NOT_FOUND.*?['"]([^'"]+)['"]/is, label: (m) => `module-not-found:${m[1]}` },
  { re: /Cannot find module ['"]([^'"]+)['"]/i, label: (m) => `module-not-found:${m[1]}` },
  // A server error code from the app's own envelope.
  { re: /\b(FAILED_PRECONDITION|PERMISSION_DENIED|INVALID_ARGUMENT|UNAUTHENTICATED|INSUFFICIENT_STOCK|MIME_MISMATCH|WISHLIST_FULL|CART_LANE_BLOCKED)\b/, label: (m) => `code:${m[1]}` },
  // HTTP status against a route — group by status AND path prefix, since a 500
  // on /api/media and a 500 on /api/cart are unrelated.
  { re: /\b(4\d\d|5\d\d)\b[^\n]{0,80}?(\/api\/[a-z0-9/_\-[\]]+)/i, label: (m) => `http-${m[1]}:${m[2].replace(/\[[^\]]+\]/g, "*")}` },
  { re: /(\/api\/[a-z0-9/_\-[\]]+)[^\n]{0,80}?\b(4\d\d|5\d\d)\b/i, label: (m) => `http-${m[2]}:${m[1].replace(/\[[^\]]+\]/g, "*")}` },
  // Hydration is its own family and is worth seeing as one row.
  { re: /hydrat(?:ion|ed)/i, label: () => "hydration-mismatch" },
  // A blocked case naming what blocked it is a DEPENDENCY, not a defect. Kept
  // separate so it never inflates a real cluster.
  { re: /blocked by ([a-z0-9/_-]+)/i, label: (m) => `blocked-by:${m[1]}` },
];

/** Fall back to the page, which is at least a real locus. */
function fallbackSignature(v, batchKey) {
  return `page:${batchKey.split("--")[0]}`;
}

/*
 * 🛑 `evidence` IS AN OBJECT, AND THE NARRATIVE IS IN `comment`.
 *
 * The first cut of this file did `String(v.evidence ?? v.note ?? "")`, which
 * stringifies to "[object Object]" — so every regex below matched nothing and
 * all 154 sweep1 verdicts fell through to the `page:` fallback. The tool
 * produced a plausible-looking document with fifteen clusters and had in fact
 * clustered on nothing at all.
 *
 * The real shape, from a verdict on disk:
 *   { id, answer, comment, label, href,
 *     evidence: { screenshot, status, observed, reloadChecked } }
 *
 * `comment` is where the tester writes what happened, so it is the primary
 * haystack; `evidence.status` carries the HTTP code and `evidence.observed` the
 * rendered state. `label` is the case's own assertion, included last so a case
 * merely *mentioning* a route does not outrank real evidence.
 */
function haystack(v) {
  const e = v.evidence && typeof v.evidence === "object" ? v.evidence : {};
  return [
    v.comment,
    e.status,
    e.observed,
    e.error,
    e.console,
    typeof v.evidence === "string" ? v.evidence : null,
    v.note,
    v.href,
    v.label,
  ]
    .filter((x) => typeof x === "string" && x.trim())
    .join("\n");
}

function signatureFor(v, batchKey) {
  const hay = haystack(v);
  for (const s of SIGNATURES) {
    const m = hay.match(s.re);
    if (m) return s.label(m);
  }
  return fallbackSignature(v, batchKey);
}

const clusters = new Map();
let files = 0;
let totalVerdicts = 0;
let quarantined = 0;
const answered = { yes: 0, no: 0, null: 0 };

for (const f of readdirSync(VERDICTS).filter((x) => x.endsWith(".json"))) {
  files++;
  let doc;
  try {
    doc = JSON.parse(readFileSync(resolve(VERDICTS, f), "utf8"));
  } catch {
    console.error(`  ! unparseable verdict file: ${f}`);
    continue;
  }
  if (doc.quarantined) quarantined++;
  const batchKey = f.replace(/\.json$/, "").split("__").join("/");
  for (const v of doc.verdicts ?? []) {
    if (String(v.id).startsWith("control-")) continue;
    totalVerdicts++;
    if (v.answer === "yes") answered.yes++;
    else if (v.answer === "no") answered.no++;
    else answered.null++;
    // Only failures and blocks are triaged. A pass has no cause to find.
    if (v.answer === "yes") continue;
    const sig = signatureFor(v, batchKey);
    const key = `${v.answer === "no" ? "FAIL" : "BLOCKED"}::${sig}`;
    if (!clusters.has(key)) clusters.set(key, { kind: v.answer === "no" ? "FAIL" : "BLOCKED", sig, members: [] });
    clusters.get(key).members.push({
      id: v.id,
      batch: batchKey,
      quarantined: Boolean(doc.quarantined),
      evidence: haystack(v).replace(/\s+/g, " ").slice(0, 300),
    });
  }
}

const ordered = [...clusters.values()].sort(
  (a, b) => (a.kind === b.kind ? b.members.length - a.members.length : a.kind === "FAIL" ? -1 : 1),
);
const fails = ordered.filter((c) => c.kind === "FAIL");
const blocks = ordered.filter((c) => c.kind === "BLOCKED");

const lines = [];
lines.push(`# Triage — run \`${RUN}\``);
lines.push("");
lines.push(`Generated ${new Date().toISOString()} from ${files} verdict file(s).`);
lines.push("");
lines.push(
  "**Ranked by blast radius, not severity.** Cluster size says how many cases one",
  "defect touched — never how much it matters. A one-member cluster can be the",
  "worst thing here. Use size to order the work, never to skip a row.",
);
lines.push("");
lines.push(`| | count |`, `|---|---|`);
lines.push(`| verdicts (controls excluded) | ${totalVerdicts} |`);
lines.push(`| pass | ${answered.yes} |`);
lines.push(`| fail | ${answered.no} |`);
lines.push(`| blocked / could-not-test | ${answered.null} |`);
lines.push(`| distinct FAIL causes | ${fails.length} |`);
lines.push(`| distinct BLOCKED causes | ${blocks.length} |`);
lines.push(`| quarantined batches | ${quarantined} |`);
lines.push("");

if (quarantined) {
  lines.push(
    `> 🛑 ${quarantined} batch(es) are QUARANTINED — they failed a calibration control,`,
    "> so every verdict in them is untrusted and must be re-run, not triaged.",
    "",
  );
}

/*
 * 🛑 A `page:` HEADING IS NOT A CAUSE — SAYING OTHERWISE WOULD BE THE WORST
 * OUTPUT THIS TOOL COULD PRODUCE.
 *
 * Signature clusters (`react-#310`, `http-500:/api/x`) are genuine shared
 * causes: fix one thing, every member flips. A `page:` cluster is only a
 * LOCUS — sweep1's 8-member `page:buying/product-detail` row is eight unrelated
 * defects (a placeholder fallback, a lightbox size, a group widget, sandbox
 * visibility) that happen to share a URL. Presenting those as one defect would
 * invite exactly the mistake this file exists to prevent, in reverse: merging
 * eight real bugs into one and fixing seven of them by accident, or not at all.
 */
const causeNote = [
  "A heading prefixed with a signature (`react-#310`, `http-500:/api/…`, `code:…`)",
  "IS one shared cause — fix it once and every member should flip.",
  "",
  "A heading prefixed `page:` is **not** a cause. It is a locus: these cases",
  "failed on the same page and had no common signature in their evidence, so they",
  "are most likely unrelated defects grouped for reading convenience. Triage those",
  "individually.",
].join("\n");

for (const [title, group, note] of [
  ["Failures, by cause", fails, causeNote],
  [
    "Blocked, by cause",
    blocks,
    "These are mostly DEPENDENCIES, not defects — a case blocked by another bug is\nnot its own bug. A `blocked-by:` cluster should disappear when its named cause\nis fixed; if it does not, the block had a second reason.",
  ],
]) {
  lines.push(`## ${title}`, "", note, "");
  if (!group.length) {
    lines.push("_none_", "");
    continue;
  }
  for (const c of group) {
    lines.push(`### \`${c.sig}\` — ${c.members.length} case(s)`);
    lines.push("");
    const spread = [...new Set(c.members.map((m) => m.batch))];
    lines.push(`Spans ${spread.length} batch(es): ${spread.slice(0, 8).map((s) => `\`${s}\``).join(", ")}${spread.length > 8 ? ` …+${spread.length - 8}` : ""}`);
    lines.push("");
    for (const m of c.members.slice(0, 12)) {
      lines.push(`- \`${m.id}\`${m.quarantined ? " **(quarantined)**" : ""} — ${m.evidence || "_no evidence recorded_"}`);
    }
    if (c.members.length > 12) lines.push(`- _…and ${c.members.length - 12} more_`);
    lines.push("");
    /*
     * The re-run command, emitted rather than reconstructed by hand.
     *
     * Phase 3 step 11 is "re-run only the batches whose cases were fixed" — and
     * a FIXED row that does not flip to pass is a regression, meaning the fix did
     * not do what it claims. That check is only worth anything if it is trivial
     * to run, so the exact invocation lives next to the finding instead of being
     * derived from a list of case ids at the moment someone is tired.
     *
     * The batches must be released from the ledger first: they are already
     * consolidated, so the pool would otherwise skip every one of them and report
     * a clean run having executed nothing.
     */
    if (c.kind === "FAIL") {
      lines.push("<details><summary>re-run these batches after fixing</summary>", "");
      lines.push("```bash");
      lines.push(`# release them first — they are already consolidated and would otherwise be skipped`);
      for (const s of spread) {
        lines.push(`node tester/scripts/release-batch.mjs --run ${RUN} --batch ${s}`);
      }
      lines.push(`node tester/scripts/pool.mjs --run ${RUN} --workers ${Math.min(3, spread.length)}`);
      lines.push("```", "", "</details>", "");
    }
  }
}

if (OUT) {
  writeFileSync(resolve(process.cwd(), OUT), lines.join("\n"));
  console.log(`wrote ${OUT}`);
}
console.log(
  `${totalVerdicts} verdicts · ${answered.yes} pass / ${answered.no} fail / ${answered.null} blocked · ` +
    `${fails.length} distinct fail cause(s), ${blocks.length} distinct block cause(s)`,
);
