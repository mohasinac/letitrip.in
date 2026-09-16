import { readFileSync, readdirSync, writeFileSync } from "fs";

const RUN = process.argv[2] ?? "run-1789432098900";
const dir = `tester/.tester-runs/${RUN}/verdicts`;

const rows = [];
for (const f of readdirSync(dir)) {
  if (!f.endsWith(".json")) continue;
  let parsed;
  try { parsed = JSON.parse(readFileSync(`${dir}/${f}`, "utf8")); } catch { continue; }
  const verdicts = Array.isArray(parsed) ? parsed : parsed.verdicts ?? [];
  for (const v of verdicts) {
    if (!v?.id || v.id.startsWith("control-")) continue;
    if (v.answer !== "no") continue;
    const c = (v.comment ?? "").replace(/\s+/g, " ").trim();
    rows.push({
      id: v.id.replace(/^checklist-/, ""),
      batch: f.replace(/\.json$/, ""),
      symptom: c.slice(0, 200),
    });
  }
}

// keyword buckets to surface SHARED causes across page boundaries
const BUCKETS = {
  "cart-line-destroyed": /destroy|deleted server-side when \/cart|does not survive/i,
  "guest-price-leak": /price gate|Sign in to see price|gated/i,
  "count-mismatch": /badge|count|disagree|over-count|mismatch/i,
  "search-inert": /search does nothing|does not filter|returns all|zzzznope returns/i,
  "facet-inert": /facet is INERT|facet.*not exist|filter.*no effect|inert/i,
  "blank-page": /NO CONTENT|renders nothing|blank|zero cards|empty region/i,
  "totals-disagree": /totals|summary does not|does not recalculate|order does not/i,
  "missing-cta": /NO CALL TO ACTION|no CTA|zero anchors/i,
  "404-or-missing": /404|not found|does not exist/i,
  "save-not-persisted": /not persist|reverted|unchanged after reload/i,
};

const tally = {};
for (const r of rows) {
  let hit = "other";
  for (const [name, re] of Object.entries(BUCKETS)) {
    if (re.test(r.symptom)) { hit = name; break; }
  }
  (tally[hit] ??= []).push(r);
}

const out = [];
out.push(`# ${rows.length} failures, bucketed by symptom shape\n`);
for (const [name, list] of Object.entries(tally).sort((a, b) => b[1].length - a[1].length)) {
  out.push(`\n## ${name} — ${list.length}\n`);
  for (const r of list) out.push(`- **${r.id}**\n  ${r.symptom}`);
}
writeFileSync("docs/FAILURES-bucketed.md", out.join("\n"));

console.log(`${rows.length} failures`);
for (const [name, list] of Object.entries(tally).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`  ${String(list.length).padStart(3)}  ${name}`);
}
