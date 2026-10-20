#!/usr/bin/env node
/**
 * What drives a part's rating, and does a bey's type follow from its parts?
 *
 *   node scripts/analyse-part-ratings.mjs [--quiet]
 *
 * Reads the two committed extractions and writes
 * `docs/research/part-specs-2026-10/rating-analysis.json`. No network.
 *
 * ── 🛑 WHY THIS IS AN ANALYSIS AND NOT A MODEL ─────────────────────────────
 *
 * The 0-6 grid is the wiki's EDITORIAL JUDGEMENT, not a measurement. So the
 * question worth asking is not "what is the true attack value" but "is the
 * rating predictable from something we hold" — because where it is, the game
 * can derive a stat for a part the wiki never rated, and where it is not, a
 * derived stat would be an invention.
 *
 * Every number here is reported with its SAMPLE SIZE, and a correlation over
 * fewer than 20 pairs is suppressed rather than printed. A Pearson r on n=3
 * is noise that looks like a finding.
 *
 * 🛑 Pearson r measures a LINEAR relationship only, and says nothing about
 * cause. "Weight rating tracks mass" is a claim about the wiki's rating
 * behaviour, not about physics.
 *
 * @tag domain:parts
 * @tag layer:script
 * @tag access:build
 * @tag sideEffects:writes-docs-research
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const OUT_DIR = "docs/research/part-specs-2026-10";
const QUIET = process.argv.includes("--quiet");
const log = (...a) => {
  if (!QUIET) console.log(...a);
};

const parts = JSON.parse(fs.readFileSync(`${OUT_DIR}/wiki-part-specs.json`, "utf8"));
const beys = JSON.parse(
  fs.readFileSync("docs/research/bey-specs-2026-10/wiki-beys.json", "utf8"),
);

const MIN_N = 20;

/** Pearson r, or null when the sample is too small or has no variance. */
function pearson(pairs) {
  const n = pairs.length;
  if (n < MIN_N) return null;
  const mx = pairs.reduce((a, [x]) => a + x, 0) / n;
  const my = pairs.reduce((a, [, y]) => a + y, 0) / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (const [x, y] of pairs) {
    sxy += (x - mx) * (y - my);
    sxx += (x - mx) ** 2;
    syy += (y - my) ** 2;
  }
  if (sxx === 0 || syy === 0) return null;
  return Number((sxy / Math.sqrt(sxx * syy)).toFixed(3));
}

const mean = (xs) =>
  xs.length ? Number((xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(2)) : null;

const AXES = [
  "attack", "defense", "stamina", "weight", "speed", "burst",
  "dash", "burstResistance", "power", "height", "runTime",
];

/* ── 1. Does mass drive the WEIGHT rating? ────────────────────────────────── */
const massVsRating = {};
for (const axis of AXES) {
  const pairs = [];
  for (const p of Object.values(parts)) {
    const r = p.ratings?.[axis];
    if (typeof r !== "number" || typeof p.weightG !== "number") continue;
    pairs.push([p.weightG, r]);
  }
  const r = pearson(pairs);
  if (r !== null) massVsRating[axis] = { r, n: pairs.length };
}

/* ── 2. The rating PROFILE of each slot ───────────────────────────────────── */
const bySlot = {};
for (const p of Object.values(parts)) {
  if (!p.ratings) continue;
  (bySlot[p.slot] ??= []).push(p);
}
const slotProfiles = {};
for (const [slot, rows] of Object.entries(bySlot)) {
  if (rows.length < 8) continue;
  const prof = { n: rows.length };
  for (const axis of AXES) {
    const vals = rows.map((r) => r.ratings[axis]).filter((v) => typeof v === "number");
    if (vals.length >= 5) prof[axis] = { mean: mean(vals), n: vals.length };
  }
  const massed = rows.map((r) => r.weightG).filter((v) => typeof v === "number");
  if (massed.length >= 5) prof.weightG = { mean: mean(massed), n: massed.length };
  slotProfiles[slot] = prof;
}

/* ── 3. Does a part's declared TYPE match its highest rating? ─────────────── */
const TYPE_AXIS = { Attack: "attack", Defense: "defense", Stamina: "stamina" };
let typeChecked = 0;
let typeAgrees = 0;
const typeDetail = {};
for (const p of Object.values(parts)) {
  const axis = TYPE_AXIS[p.partType];
  if (!axis || !p.ratings) continue;
  const vals = AXES.map((a) => [a, p.ratings[a]]).filter(([, v]) => typeof v === "number");
  if (vals.length < 3) continue;
  const top = vals.reduce((a, b) => (b[1] > a[1] ? b : a));
  typeChecked += 1;
  const agrees = top[0] === axis || p.ratings[axis] === top[1];
  if (agrees) typeAgrees += 1;
  const d = (typeDetail[p.partType] ??= { checked: 0, agrees: 0 });
  d.checked += 1;
  if (agrees) d.agrees += 1;
}

/* ── 4. Does a BEY's type follow from its parts' ratings? ─────────────────── */
/*
 * 🛑 The join is EXACT: a part id is `${slot}--${slugTail(name)}`, and the
 * composition states both halves. No fuzzy matching — `Dead` and `Dread` are
 * two distinct Gatinko bases one character apart, so an edit-distance join on
 * this corpus is disqualified outright.
 */
const slugTail = (s) =>
  String(s)
    .trim()
    .replace(/['’]\s*$/, "-dash")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

let beysWithType = 0;
let beysJoined = 0;
let beyAgrees = 0;
const beyDetail = {};
let partsLookedUp = 0;
let partsFound = 0;

for (const b of Object.values(beys)) {
  const axis = TYPE_AXIS[b.type];
  if (!axis || !b.composition?.length) continue;
  beysWithType += 1;

  const summed = {};
  let found = 0;
  for (const c of b.composition) {
    partsLookedUp += 1;
    const row = parts[`${c.slot}--${slugTail(c.partName)}`];
    if (!row?.ratings) continue;
    partsFound += 1;
    found += 1;
    for (const a of AXES) {
      const v = row.ratings[a];
      if (typeof v === "number") summed[a] = (summed[a] ?? 0) + v;
    }
  }
  /* A bey whose parts we cannot rate tells us nothing either way. */
  if (found < 2 || !Object.keys(summed).length) continue;
  beysJoined += 1;

  const ranked = Object.entries(summed).sort((a, b2) => b2[1] - a[1]);
  const agrees = ranked[0][0] === axis;
  if (agrees) beyAgrees += 1;
  const d = (beyDetail[b.type] ??= { joined: 0, agrees: 0 });
  d.joined += 1;
  if (agrees) d.agrees += 1;
}

const report = {
  note:
    "Written by scripts/analyse-part-ratings.mjs. The 0-6 grid is the wiki's " +
    "editorial judgement, not a measurement, so this asks whether a rating is " +
    "PREDICTABLE from data we hold — where it is, a stat can be derived for an " +
    "unrated part; where it is not, deriving one would be an invention. Every " +
    "figure carries its sample size and a correlation under n=20 is suppressed. " +
    "Pearson r is linear-only and implies nothing about cause.",
  minSampleForCorrelation: MIN_N,
  partsWithRatings: Object.values(parts).filter((p) => p.ratings).length,
  partsWithMass: Object.values(parts).filter((p) => typeof p.weightG === "number").length,
  massVsRating,
  slotProfiles,
  declaredTypeVsTopRating: {
    checked: typeChecked,
    agrees: typeAgrees,
    rate: typeChecked ? Number((typeAgrees / typeChecked).toFixed(3)) : null,
    byType: typeDetail,
  },
  beyTypeFromComposition: {
    beysWithAType: beysWithType,
    beysJoinable: beysJoined,
    agrees: beyAgrees,
    rate: beysJoined ? Number((beyAgrees / beysJoined).toFixed(3)) : null,
    byType: beyDetail,
    compositionJoinRate: partsLookedUp
      ? Number((partsFound / partsLookedUp).toFixed(3))
      : null,
    partsLookedUp,
    partsFound,
  },
};

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(
  path.join(OUT_DIR, "rating-analysis.json"),
  `${JSON.stringify(report, null, 2)}\n`,
  "utf8",
);

log(`parts with ratings: ${report.partsWithRatings}   with mass: ${report.partsWithMass}`);
log(`\n=== mass vs each rating axis (Pearson r, n>=${MIN_N}) ===`);
for (const [a, v] of Object.entries(massVsRating).sort((x, y) => Math.abs(y[1].r) - Math.abs(x[1].r))) {
  log(`  ${a.padEnd(16)} r=${String(v.r).padStart(6)}   n=${v.n}`);
}
log(`\n=== slot rating profile (mean), biggest slots ===`);
const top = Object.entries(slotProfiles).sort((a, b) => b[1].n - a[1].n).slice(0, 10);
log(`  ${"slot".padEnd(18)}${"n".padStart(4)}${"atk".padStart(6)}${"def".padStart(6)}${"sta".padStart(6)}${"wt".padStart(6)}${"massG".padStart(8)}`);
for (const [slot, p] of top) {
  log(
    `  ${slot.padEnd(18)}${String(p.n).padStart(4)}` +
      `${String(p.attack?.mean ?? "-").padStart(6)}` +
      `${String(p.defense?.mean ?? "-").padStart(6)}` +
      `${String(p.stamina?.mean ?? "-").padStart(6)}` +
      `${String(p.weight?.mean ?? "-").padStart(6)}` +
      `${String(p.weightG?.mean ?? "-").padStart(8)}`,
  );
}
log(`\n=== a part's declared type vs its own top rating ===`);
log(`  ${typeAgrees}/${typeChecked} agree (${Math.round((typeAgrees / Math.max(1, typeChecked)) * 100)}%)`);
for (const [t, d] of Object.entries(typeDetail)) {
  log(`    ${t.padEnd(10)} ${d.agrees}/${d.checked}`);
}
log(`\n=== a BEY's type vs the sum of its parts' ratings ===`);
log(`  composition join rate: ${partsFound}/${partsLookedUp} parts resolved to a rated row`);
log(`  ${beyAgrees}/${beysJoined} beys agree (${Math.round((beyAgrees / Math.max(1, beysJoined)) * 100)}%)  of ${beysWithType} with a type`);
for (const [t, d] of Object.entries(beyDetail)) {
  log(`    ${t.padEnd(10)} ${d.agrees}/${d.joined}`);
}
