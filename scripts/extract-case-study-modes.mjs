#!/usr/bin/env node
/**
 * Extract MODE candidates from the local case-study corpus — to a research
 * file, deliberately NOT into the seed.
 *
 *   node --max-old-space-size=3072 scripts/extract-case-study-modes.mjs
 *
 * ── 🛑 WHY THIS WRITES RESEARCH OUTPUT AND NOT SEED DATA ──────────────────
 *
 * The plan's item 3b measured the sourcing correctly and the measurement still
 * holds: the wiki carries ZERO mode data (0 `Modes=` fields and 1
 * `===Modes===` section across 2,248 part pages, 0 across 2,011 bey pages)
 * while this corpus mentions modes 1,290 times. So this is the only source.
 *
 * What it is NOT is a source you can transcribe unreviewed, and that was
 * measured too rather than assumed:
 *
 *   cases carrying mode content ..................... 163
 *   beys with mode content in exactly ONE case ...... 142   <- no cross-check
 *   beys cross-documented across DIFFERENT cases .... 3
 *   of those 3, contradicting their own mechanism ... 1
 *
 * 🛑 **The one contradiction is total, not marginal.** Cosmic Pegasus F:D is
 * documented twice and the two cases describe the F:D tip's transition in
 * OPPOSITE DIRECTIONS:
 *
 *   Case 809  : wide flat RUBBER (r 3-9 mm, mu 0.40) -> central BEARING
 *               (r 1.5 mm, mu 0.010). Attack -> stamina. Trigger at ~420 rad/s.
 *   Case 1824 : sharp inner POINT (r 1.5 mm) -> flat rubber OUTER ring
 *               (r 10 mm). Stamina -> attack. Trigger at 500 rad/s, and
 *               300 rad/s in the same section's own worked example.
 *
 * Plus a third threshold (94.3 rad/s) quoted in the plan. The wheel mass
 * disagrees too (43.5 g vs 32.0 g), as does the product code (BB-105 vs
 * BB-113), and Case 809 tags every value `[M]` — modelled, not measured.
 *
 * A reader cannot tell which account is right, and NEITHER CAN THIS SCRIPT.
 * Picking one would publish a coin flip as a fact on a public reference page.
 *
 * For contrast, and because it is the reason not to over-generalise: total
 * assembly MASS is 95% self-consistent here — 72 of 76 beys documented more
 * than once agree exactly. The corpus is not broadly unreliable; its mode
 * prose specifically is unverifiable at scale.
 *
 * So: every candidate is emitted with its case citation and a `crossChecked`
 * flag, and **the seed takes only what a human has read.** Root Cause #96 —
 * n=1 is not a measurement — applies to a bey as much as to a benchmark.
 *
 * 🛑 THE NUMBERS ARE DELIBERATELY NOT EXTRACTED. `BeyMode` is
 * `{ name, behaviour, trigger }` by design, with no threshold field, because
 * every threshold checked disagreed across sources. A field that does not
 * exist cannot be populated with a contested value by someone who comes later
 * and assumes the gap was an oversight.
 *
 * FACTS ONLY, and these are the owner's own analysis of their own corpus — no
 * third-party attribution question arises. The case citation is kept because a
 * claim whose derivation nobody can find is a claim nobody can correct.
 *
 * @tag domain:beys
 * @tag layer:script
 * @tag access:build
 * @tag sideEffects:writes-docs-research
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const DEFAULT_CORPUS = "C:/Users/mohsi/Downloads/Beyblade-Game-master";
const OUT_DIR = "docs/research/physics-2026-10";

function arg(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
const CORPUS = arg("--corpus", process.env.BEY_CORPUS ?? DEFAULT_CORPUS).replace(/\\/g, "/");
const DIR = path.join(CORPUS, "case study");

/**
 * 🛑 The WORD "mode", never the substring. `/mode/i` also matches "**model**",
 * and this corpus is full of "Data Model" / "Wear Model" / "State Model"
 * headings — my first count said 692 mode headings and the real figure is 356.
 * Read the match, not the count (trap #13).
 */
const MODE_WORD = /\bmodes?\b/i;
const IS_MODEL = /\bmodel/i;

/** Beys whose mode prose is self-contradictory across cases — never emitted as usable. */
const CONTESTED = new Map([
  [
    "cosmic pegasus f:d",
    "Cases 809 and 1824 describe the F:D transition in opposite directions " +
      "(rubber->bearing vs point->rubber), with three different thresholds " +
      "across them and the plan, plus disagreeing wheel mass and product code.",
  ],
]);

function main() {
  if (!fs.existsSync(DIR)) {
    console.error(
      `[extract-case-study-modes] no corpus at ${DIR}\n  pass --corpus <path> or set BEY_CORPUS.`,
    );
    process.exit(2);
  }

  const candidates = [];
  let filesScanned = 0;
  let caseCount = 0;

  for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith(".md")).sort()) {
    filesScanned += 1;
    const text = fs.readFileSync(path.join(DIR, f), "utf8");
    const heads = [...text.matchAll(/^#{1,3}\s*Case\s+(\d+)\s*[—–-]\s*(.+)$/gm)];
    for (let k = 0; k < heads.length; k++) {
      caseCount += 1;
      const seg = text.slice(heads[k].index, k + 1 < heads.length ? heads[k + 1].index : text.length);
      const modeHeads = [...seg.matchAll(/^#{2,4}\s*(.+)$/gm)]
        .map((m) => m[1].trim())
        .filter((h) => MODE_WORD.test(h) && !IS_MODEL.test(h));
      if (modeHeads.length === 0) continue;

      /*
       * The bey: its explicit `**Beyblade:**` field when present, else the case
       * title with the corpus's own `[GIMMICK]` / `[SPECIAL MOVE]` prefix and
       * trailing clause stripped. The explicit field is preferred because a
       * title is editorial and often names the PART under discussion.
       */
      const explicit = seg.match(/\*\*Beyblade:\*\*\s*([^(\n|]+)/);
      const title = heads[k][2]
        .replace(/^\[?(GIMMICK|SPECIAL(\s+MOVE)?)\]?:?\s*/i, "")
        .split(/\s+[—–]\s+/)[0]
        .trim();
      const bey = (explicit ? explicit[1] : title).trim().replace(/\s+/g, " ");

      /*
       * 🛑 A SPECIAL MOVE IS NOT A MODE. The corpus's `[SPECIAL MOVE]` cases
       * are anime finishers carrying game-engine values (`fieldRadius: 200px`,
       * `BASE_DAMAGE`, phase timings) — Case 654's "Armageddon" is a 200 px
       * proximity-damage field, not a configuration of the physical top.
       * Folding those into `modes[]` would put combat scripting on a reference
       * page as though it were a property of the product.
       */
      const isSpecialMove = /^\[?SPECIAL(\s+MOVE)?\]?/i.test(heads[k][2]);

      candidates.push({
        bey,
        case: Number(heads[k][1]),
        file: f,
        modeHeadings: modeHeads,
        kind: isSpecialMove ? "special-move" : "gimmick",
        /* `[M]` is the corpus's own "modelled, not measured" tag. */
        allValuesModelled: /\[M\]/.test(seg),
      });
    }
  }

  if (candidates.length === 0) {
    console.error(
      "[extract-case-study-modes] matched ZERO mode candidates — the heading shape " +
        "changed. Refusing to write, which would read as 'the corpus documents no modes'.",
    );
    process.exit(1);
  }

  /* Cross-check: the same bey reached from two DIFFERENT cases. */
  const byBey = new Map();
  for (const c of candidates) {
    const key = c.bey.toLowerCase();
    if (!byBey.has(key)) byBey.set(key, new Set());
    byBey.get(key).add(c.case);
  }

  const rows = candidates
    .filter((c) => c.kind !== "special-move")
    .map((c) => {
      const key = c.bey.toLowerCase();
      const cases = [...byBey.get(key)];
      const contested = CONTESTED.get(key);
      return {
        ...c,
        crossChecked: cases.length > 1,
        otherCases: cases.filter((n) => n !== c.case),
        ...(contested ? { contested, usable: false } : { usable: true }),
      };
    });

  const specialMoves = candidates.filter((c) => c.kind === "special-move").length;
  const singleSourced = rows.filter((r) => !r.crossChecked).length;

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(OUT_DIR, "case-study-mode-candidates.json"),
    `${JSON.stringify(
      {
        note:
          "MODE CANDIDATES, not mode data. Every row is a pointer into the case-study " +
          "corpus for a human to read; nothing here is seeded automatically. `usable: " +
          "false` means the corpus contradicts itself about that bey (see `contested`). " +
          "`crossChecked: false` means exactly one case documents it, so no " +
          "disagreement could have been detected — which is the state of 142 of them. " +
          "`allValuesModelled` reflects the corpus's own [M] tag: modelled, not " +
          "measured. Numbers are deliberately absent; every threshold cross-checked " +
          "disagreed across sources, so BeyMode carries name/behaviour/trigger only.",
        generatedAt: new Date().toISOString(),
        filesScanned,
        casesScanned: caseCount,
        candidates: rows.length,
        specialMovesExcluded: specialMoves,
        distinctBeys: byBey.size,
        singleSourced,
        contested: [...CONTESTED.keys()],
        rows,
      },
      null,
      1,
    )}\n`,
    "utf8",
  );

  console.log(`[extract-case-study-modes] ${filesScanned} files, ${caseCount} cases`);
  console.log(`  mode candidates (gimmick)      : ${rows.length}`);
  console.log(`  special moves EXCLUDED         : ${specialMoves}`);
  console.log(`  distinct beys                  : ${byBey.size}`);
  console.log(`  single-sourced (no cross-check): ${singleSourced}`);
  console.log(`  🛑 contested, not usable       : ${[...CONTESTED.keys()].join(", ")}`);
  console.log(`\n-> ${OUT_DIR}/case-study-mode-candidates.json`);
}

main();
