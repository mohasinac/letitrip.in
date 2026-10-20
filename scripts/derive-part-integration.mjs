#!/usr/bin/env node
/**
 * Derive per-part INTEGRATION from the bey compositions each part appears in.
 *
 *   node scripts/derive-part-integration.mjs
 *   node scripts/derive-part-integration.mjs --explain fusion-wheel--variares
 *
 * ── WHY THIS IS DERIVED AND NOT DECLARED ──────────────────────────────────
 *
 * A part "integrates" another role when one moulding fills two stack
 * positions: `D:D` is a spin track and a performance tip in one piece,
 * `fusion-wheel--variares` is an energy ring and a fusion wheel in one piece.
 * A game needs this — a stack validator that thinks Variares leaves the ring
 * slot empty will refuse a legal build, and an exploded 3D view will show a
 * gap where a solid piece is.
 *
 * 🛑 The source does NOT state it. Measured: `Classification=` for `D:D` is
 * literally "Performance Tip", identical to a plain MFB tip, and no infobox
 * key on any of the 2,011 bey pages is mode- or integration-shaped. So the
 * only stated evidence is the SHAPE OF THE COMPOSITIONS: a 4D bey lists four
 * parts where the system's canonical stack is five, and the missing slot is
 * the one that got absorbed.
 *
 * ── THE ALGORITHM, AND THE TWO CONFOUNDS IT HAD TO SURVIVE ────────────────
 *
 * 1. Per SYSTEM, the canonical stack is every slot filled by >=60% of that
 *    system's beys (systems with <5 beys get no canon — too few to call).
 *    Derived, not declared: `4D System` comes out as face-bolt/fusion-wheel/
 *    performance-tip at 100% with energy-ring 80% and spin-track 75%, and
 *    that shortfall IS the integration showing up in its own canon.
 *
 * 2. 🛑 CONFOUND ONE — an INCOMPLETE infobox looks exactly like an
 *    integration. A first pass found 299 "integrations", and the large groups
 *    were beys like `Condorno-II` that list two parts out of five. Nothing
 *    about the part is unusual; the page is just thin. So a bey is a WITNESS
 *    only if every missing canonical slot can be attributed (step 3) — a page
 *    that is simply short leaves slots nothing can account for.
 *
 * 3. 🛑 CONFOUND TWO — adjacency decides, and stack-distance 0 is NOT
 *    integration. `light-wheel` "absorbs" `fusion-wheel` in 4 parts with 6-7
 *    witnesses each, which is a strong signal for the wrong conclusion: they
 *    are ALTERNATIVES in one role, not one piece covering two. Likewise
 *    `over-blade`/`metal-blade` vs `main-blade`. A single moulding can only
 *    absorb an ADJACENT role, so distance must be exactly 1 — and that same
 *    test kills the residual noise at the other end (`performance-tip`
 *    "absorbing" `face-bolt`, distance 7).
 *
 * 4. Of the two neighbours of a missing role, attribute to the one BELOW it.
 *    Every integrated slot the source itself names reads that way — a driver
 *    absorbs the disc above it, a bit absorbs the ratchet above it, a base
 *    absorbs the SAR above it — and the naming convention
 *    `{integrated}-integrated-{primary}` says the part is primarily the lower
 *    thing. Falls back to the neighbour above when there is nothing below.
 *
 * 5. A part integrates a role only if it is attributed in EVERY witness bey.
 *    One counter-example is enough: `fusion-wheel--jade` appears in beys that
 *    do fill the ring slot, so Jade is multi-PIECE, not integrated — which is
 *    the distinction the owner drew, recovered from data rather than typed in.
 *
 * 🛑 NO FUZZY MATCHING ANYWHERE. Joins are exact against stated names, codes
 * and aliases (see `extract-wiki-beys.mjs`) — `Dead` and `Dread` are two real
 * Gatinko bases one character apart.
 */
import fs from "node:fs";
import path from "node:path";
import {
  PART_INTEGRATED_ROLES,
  ROLE_STACK_ORDER,
  roleForSlot,
  stackIndexOfRole,
} from "./lib/part-slot-vocab.mjs";

const RESEARCH = path.resolve("docs/research");
const BEYS = path.join(RESEARCH, "bey-specs-2026-10/wiki-beys.json");
const PARTS = path.join(RESEARCH, "part-specs-2026-10/wiki-part-specs.json");
const OUT = path.join(RESEARCH, "part-specs-2026-10/part-integration.json");

/** A slot is canonical for a system when this fraction of its beys fill it. */
const CANON_FILL = 0.6;
/** Below this, a system has too few beys for a majority to mean anything. */
const CANON_MIN_BEYS = 5;

const explainArg = process.argv.indexOf("--explain");
const explainId = explainArg > -1 ? process.argv[explainArg + 1] : null;

const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const beys = readJson(BEYS);
const parts = readJson(PARTS);

// ── 1. canonical stack per system ────────────────────────────────────────────
const systems = new Map();
for (const bey of Object.values(beys)) {
  const composition = bey.composition ?? [];
  if (!composition.length || !bey.system) continue;
  if (!systems.has(bey.system)) systems.set(bey.system, { beys: 0, slots: new Map() });
  const entry = systems.get(bey.system);
  entry.beys += 1;
  for (const slot of new Set(composition.map((c) => c.slot))) {
    entry.slots.set(slot, (entry.slots.get(slot) ?? 0) + 1);
  }
}

const canonBySystem = new Map();
const canonReport = [];
for (const [system, entry] of [...systems.entries()].sort((a, b) => b[1].beys - a[1].beys)) {
  if (entry.beys < CANON_MIN_BEYS) continue;
  const canon = [...entry.slots.entries()]
    .filter(([, count]) => count / entry.beys >= CANON_FILL)
    .sort((a, b) => b[1] - a[1]);
  canonBySystem.set(system, new Set(canon.map(([slot]) => slot)));
  canonReport.push({
    system,
    beys: entry.beys,
    canon: canon.map(([slot, count]) => ({ slot, fillPct: Math.round((count / entry.beys) * 100) })),
  });
}

// ── 2-4. attribute each missing canonical slot to an adjacent part below it ──
/**
 * Which listed part, if any, can account for a slot the bey does not fill.
 *
 * 🛑 ADJACENCY IS RELATIVE TO THE SYSTEM'S OWN CANON, not to the global
 * stack. Computing it globally produced three whole groups of false
 * positives, all from one cause: HyperSphere's canon is chip -> base -> disc
 * -> driver, with no ring/wheel/weight, so `base` and `chip` ARE neighbours
 * there. Globally they are four apart, so no part could claim `base` — and
 * `disc` (globally adjacent) picked it up instead, crediting the disc with
 * absorbing a base it has nothing to do with.
 *
 * 🛑 AN OFF-CANON LISTED PART IS THE EXPLANATION, AND IT WINS. A bey that
 * lists something its system does not normally use is telling you that part
 * replaces the usual arrangement — a single-piece HyperSphere `layer` (23%,
 * off-canon) stands in for chip+base. That is a span of two, which no
 * adjacency rule should be asked to infer, and attributing it to the
 * off-canon part is both correct and the only reading supported by the page.
 */
function attribute(missingSlot, listed, canon) {
  const missingRole = roleForSlot(missingSlot);
  if (!missingRole) return null;

  // Order the canon by the stack so "adjacent" means adjacent IN THIS SYSTEM.
  const canonOrder = [...canon]
    .map((slot) => ({ slot, role: roleForSlot(slot) }))
    .filter((s) => s.role)
    .sort((a, b) => stackIndexOfRole(a.role) - stackIndexOfRole(b.role));
  const missingIdx = canonOrder.findIndex((s) => s.slot === missingSlot);
  if (missingIdx < 0) return null;

  const offCanon = listed.filter((c) => !canon.has(c.slot) && roleForSlot(c.slot));
  if (offCanon.length === 1) return offCanon[0];
  // Several off-canon parts, or none that resolve to a role: unattributable.
  if (offCanon.length > 1) return null;

  const posOf = (c) => canonOrder.findIndex((s) => s.slot === c.slot);
  const neighbours = listed
    .map((c) => ({ ...c, pos: posOf(c) }))
    .filter((c) => c.pos >= 0 && Math.abs(c.pos - missingIdx) === 1);
  if (!neighbours.length) return null;

  // Of the two neighbours, the one BELOW — every integrated slot the source
  // itself names reads that way (a driver absorbs the disc above it).
  const below = neighbours.filter((c) => c.pos > missingIdx);
  const pick = below.length ? below : neighbours;
  // Two parts at the same distance on the same side is genuinely ambiguous —
  // say so rather than picking the first, which would silently invent a fact.
  if (pick.length !== 1) return null;
  return pick[0];
}

const usage = new Map(); // partId -> { slot, name, witnesses, attributed: Map<role, n> }
let witnessBeys = 0;
let rejectedBeys = 0;
const rejections = [];

for (const bey of Object.values(beys)) {
  const composition = bey.composition ?? [];
  if (!composition.length || !bey.system || !canonBySystem.has(bey.system)) continue;
  const canon = canonBySystem.get(bey.system);
  const filled = new Set(composition.map((c) => c.slot));
  const missing = [...canon].filter((slot) => !filled.has(slot));

  const claims = new Map(); // partId -> role[]
  let unaccounted = 0;
  for (const slot of missing) {
    const owner = attribute(slot, composition, canon);
    if (!owner) { unaccounted += 1; continue; }
    const id = owner.partId ?? `?${owner.slot}|${owner.partName}`;
    if (!claims.has(id)) claims.set(id, []);
    claims.get(id).push(roleForSlot(slot));
  }

  // A page that is merely thin leaves slots nothing can account for. One such
  // slot is enough to disqualify the bey as evidence — see CONFOUND ONE.
  if (unaccounted > 0) {
    rejectedBeys += 1;
    if (rejections.length < 40) {
      rejections.push({ bey: bey.slug ?? bey.title, system: bey.system, missing, unaccounted });
    }
    continue;
  }
  witnessBeys += 1;

  for (const c of composition) {
    const id = c.partId ?? `?${c.slot}|${c.partName}`;
    if (!usage.has(id)) {
      usage.set(id, {
        slot: c.slot,
        name: c.partName,
        resolved: Boolean(c.partId),
        witnesses: 0,
        attributed: new Map(),
        alternativeFor: new Set(),
        beys: [],
      });
    }
    const u = usage.get(id);
    u.witnesses += 1;
    if (u.beys.length < 8) u.beys.push(bey.slug ?? bey.title);
    for (const role of claims.get(id) ?? []) {
      // 🛑 A part cannot integrate its OWN role — that is the distance-0 case,
      // and it is an ALTERNATIVE rather than a merge: `bu-blade` is off-canon
      // in Dynamite Battle and stands in for `blade`, which means it FILLS
      // that position, not that one moulding covers two. Recorded as
      // `alsoFillsSlots` so a stack validator still accepts the build, but
      // kept out of `absorbs`, where it would read as a second position.
      if (role === roleForSlot(c.slot)) {
        u.alternativeFor.add(role);
        continue;
      }
      u.attributed.set(role, (u.attributed.get(role) ?? 0) + 1);
    }
  }
}

// ── 5. integrate only when attributed in EVERY witness ───────────────────────
const derived = {};
const nearMisses = [];
for (const [id, u] of usage) {
  if (!u.resolved) continue;
  const own = roleForSlot(u.slot);
  if (!own) continue;
  const always = [...u.attributed.entries()].filter(([, n]) => n === u.witnesses).map(([r]) => r);
  const sometimes = [...u.attributed.entries()].filter(([, n]) => n > 0 && n < u.witnesses);
  if (sometimes.length) {
    nearMisses.push({
      partId: id,
      witnesses: u.witnesses,
      // The counter-examples are the point: this is how Jade is told apart
      // from Variares, and it is stated data doing the telling.
      notAlways: sometimes.map(([role, n]) => ({ role, inBeys: n })),
    });
  }
  if (!always.length && !u.alternativeFor.size) continue;
  derived[id] = {
    slot: u.slot,
    role: own,
    integratedRoles: [...new Set([own, ...always])].sort(
      (a, b) => ROLE_STACK_ORDER.indexOf(a) - ROLE_STACK_ORDER.indexOf(b),
    ),
    absorbs: always.sort((a, b) => ROLE_STACK_ORDER.indexOf(a) - ROLE_STACK_ORDER.indexOf(b)),
    witnesses: u.witnesses,
    witnessBeys: u.beys,
    ...(u.alternativeFor.size ? { alternativeFor: [...u.alternativeFor] } : {}),
  };
}

// Parts whose SLOT already names the merge need no witnesses at all.
let fromClassification = 0;
for (const [partId, part] of Object.entries(parts)) {
  const bySlot = PART_INTEGRATED_ROLES[part.slot];
  if (!bySlot) continue;
  if (derived[partId]) continue;
  fromClassification += 1;
  derived[partId] = {
    slot: part.slot,
    role: roleForSlot(part.slot),
    integratedRoles: [...bySlot].sort(
      (a, b) => ROLE_STACK_ORDER.indexOf(a) - ROLE_STACK_ORDER.indexOf(b),
    ),
    absorbs: bySlot.filter((r) => r !== roleForSlot(part.slot)),
    witnesses: 0,
    source: "classification",
  };
}

if (explainId) {
  const u = usage.get(explainId);
  console.log(`\n--explain ${explainId}`);
  if (!u) {
    console.log("  not seen in any witness bey");
  } else {
    console.log(`  slot ${u.slot}  role ${roleForSlot(u.slot)}  witnesses ${u.witnesses}`);
    console.log(`  attributed: ${[...u.attributed.entries()].map(([r, n]) => `${r} in ${n}/${u.witnesses}`).join(", ") || "(none)"}`);
    console.log(`  witness beys: ${u.beys.join(", ")}`);
  }
  console.log(`  verdict: ${derived[explainId] ? JSON.stringify(derived[explainId].integratedRoles) : "not integrated"}\n`);
}

const byPair = new Map();
for (const d of Object.values(derived)) {
  if (!d.absorbs?.length) continue;
  const key = `${d.role} + ${d.absorbs.join("+")}`;
  byPair.set(key, (byPair.get(key) ?? 0) + 1);
}

const report = {
  generatedAt: new Date().toISOString(),
  canonFillThreshold: CANON_FILL,
  systemsWithACanon: canonBySystem.size,
  witnessBeys,
  rejectedBeys,
  integratedParts: Object.keys(derived).length,
  fromClassification,
  fromWitnesses: Object.keys(derived).length - fromClassification,
  byPair: [...byPair.entries()].sort((a, b) => b[1] - a[1]).map(([pair, parts]) => ({ pair, parts })),
  nearMisses: nearMisses.slice(0, 30),
  canon: canonReport,
  sampleRejections: rejections,
};

fs.writeFileSync(OUT, `${JSON.stringify({ report, parts: derived }, null, 2)}\n`);

console.log(`systems with a canonical stack : ${canonBySystem.size}`);
console.log(`witness beys / rejected        : ${witnessBeys} / ${rejectedBeys}`);
console.log(`integrated parts               : ${Object.keys(derived).length}  (${report.fromWitnesses} derived + ${fromClassification} by classification)`);
console.log(`counter-exampled (NOT integrated): ${nearMisses.length}`);
console.log("\nby role pair:");
for (const { pair, parts: n } of report.byPair) console.log(`  ${String(n).padStart(4)}  ${pair}`);
console.log(`\nwrote ${path.relative(process.cwd(), OUT)}`);
