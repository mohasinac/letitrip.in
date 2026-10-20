#!/usr/bin/env node
/**
 * Mine the case-study corpus for PART CONFIGURATIONS — body text, by part.
 *
 *   node --max-old-space-size=3072 scripts/mine-case-study-configs.mjs
 *
 * ── 🛑 WHY THIS EXISTS: THE FIRST PASS SKIMMED ────────────────────────────
 *
 * `extract-case-study-modes.mjs` matched HEADINGS. On a 265,727-line corpus
 * that found 163 cases and I read eight of them, which is sampling, not
 * studying — and the owner said so. Everything it missed, it missed for one
 * structural reason: **the configuration is usually described in the body of a
 * part's section, not announced in a heading.** "Duo Fusion Wheel: Deliberate
 * Static Imbalance as Attack Mechanism" has no "mode" in its title at all, and
 * it is one of the configurations the owner had to tell me about.
 *
 * So this scans BODY TEXT for configuration vocabulary and attributes each hit
 * to the nearest PART declaration, which is the unit these facts belong to —
 * every single mode confirmed so far is a property of a fusion wheel or a tip.
 *
 * ── 🛑 WHAT IT IS AND IS NOT ──────────────────────────────────────────────
 *
 * It is a READING LIST, ranked, with the passage attached. It writes research
 * output and never seed data, because the corpus's mode prose has a measured
 * error rate: of everything the owner reviewed from it, four claims out of
 * four were wrong in some way — an inverted transition, a mode that was
 * actually launch spin direction, a mechanism attributed to the wrong part,
 * and a part named "Duo:Dual" when our own glossary says "Delta Drive".
 *
 * 🛑 And the reverse error is just as real: I then withheld the FS tip because
 * its direction looked inverted like Case 809's, and FS genuinely IS F:D in
 * reverse. Both failures came from deciding without reading enough. The output
 * of this script is for reading.
 *
 * Nothing here is authored automatically. `lib/bey-modes-authored.mjs` ships
 * only what carries `confirmed`.
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
 * The vocabulary a configuration is actually described in.
 *
 * 🛑 Deliberately WIDER than "mode". Every term below appears in a passage the
 * owner had to correct me on, and most of those passages never say "mode":
 * Jade is "rotated in 2 configs", Fusion is "what is up", Kreis' halves
 * "slip", Duo is "deliberate static imbalance", Phantom "can be flipped".
 *
 * 🛑 `\bmodes?\b` and not `/mode/` — "model" contains "mode" and this corpus
 * is full of "Data Model" / "Wear Model" / "State Model". That substring put
 * my first count at 692 against a real 356.
 */
const CONFIG_TERMS = [
  { re: /\bmodes?\b/i, tag: "mode", weight: 3 },
  { re: /\bconfigurations?\b|\bconfigs?\b|\bconfigured\b/i, tag: "config", weight: 3 },
  { re: /\bflipp?(ed|able|ing)?\b|\breversib(le|ly)\b|\breversed\b/i, tag: "flip", weight: 3 },
  { re: /\brotated\b|\brotat(e|ing) (?:the )?(?:wheel|wheel|frame|disc)\b/i, tag: "rotate", weight: 3 },
  { re: /\bfree[- ]spin(ning)?\b|\bslips? on each other\b|\bslipp(age|ing)\b/i, tag: "slip", weight: 2 },
  { re: /\bstatic imbalance\b|\bimbalanc(e|ed)\b|\boffset mass\b/i, tag: "imbalance", weight: 2 },
  { re: /\btwo[- ]piece\b|\bmulti[- ]piece\b|\bassembl(y|ies)\b|\bdetent/i, tag: "assembly", weight: 1 },
  { re: /\bswitch(es|ed|ing|able)?\b|\binterchangeable\b|\bchangeable\b/i, tag: "switch", weight: 2 },
  { re: /\bupside[- ]down\b|\beither way (?:round|up)\b|\bwhich (?:side|face) is up\b/i, tag: "orientation", weight: 3 },
];

/** A part declaration in this corpus's own layout, e.g. `**Fusion Wheel: Cosmic [M]**`. */
const PART_DECL =
  /\*\*(Face Bolt|Energy Ring|Clear Wheel|Crystal Wheel|Fusion Wheel|4D Metal Wheel|Metal Wheel|Metal Frame|Spin Track|Performance Tip|Bottom|Attack Ring|Weight Disk|Blade Base|Spin Gear|Layer|Disc|Driver|Ratchet|Bit|Blade|Armor|Armour)s?\s*(?::|\s*[—–-])\s*([^*\n]+)\*\*/gi;

function main() {
  if (!fs.existsSync(DIR)) {
    console.error(`[mine-case-study-configs] no corpus at ${DIR}`);
    process.exit(2);
  }

  const findings = [];
  let filesScanned = 0;
  let paragraphs = 0;

  for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith(".md")).sort()) {
    filesScanned += 1;
    const text = fs.readFileSync(path.join(DIR, f), "utf8");

    /* Case boundaries, so a finding can be cited. */
    const caseHeads = [...text.matchAll(/^#{1,3}\s*Case\s+(\d+)\s*[—–-]\s*(.+)$/gm)];
    const caseAt = (idx) => {
      let cur = null;
      for (const h of caseHeads) {
        if (h.index > idx) break;
        cur = h;
      }
      return cur ? { n: Number(cur[1]), title: cur[2].trim() } : null;
    };

    /*
     * Part declarations, so a paragraph can be attributed to the part whose
     * section it sits in. This is the hop the heading-only pass lacked.
     */
    const parts = [...text.matchAll(PART_DECL)].map((m) => ({
      slot: m[1],
      name: m[2].trim().replace(/\s*\[[A-Z]\]\s*$/, ""),
      at: m.index,
    }));
    const partAt = (idx) => {
      let cur = null;
      for (const p of parts) {
        if (p.at > idx) break;
        cur = p;
      }
      return cur;
    };

    for (const para of text.split(/\n{2,}/)) {
      paragraphs += 1;
      if (para.length < 60 || para.length > 2600) continue;
      const tags = [];
      let score = 0;
      for (const t of CONFIG_TERMS) {
        if (t.re.test(para)) {
          tags.push(t.tag);
          score += t.weight;
        }
      }
      /*
       * Two independent signals minimum. One alone is noise — "assembly"
       * appears in every parts table in the corpus, and a lone "switch" is
       * usually a launcher. Requiring two keeps the reading list readable,
       * which is the only property that matters for a reading list.
       */
      if (tags.length < 2) continue;
      const at = text.indexOf(para);
      findings.push({
        file: f,
        case: caseAt(at)?.n ?? null,
        caseTitle: caseAt(at)?.title ?? null,
        part: partAt(at) ? `${partAt(at).slot}: ${partAt(at).name}` : null,
        tags,
        score,
        modelledValues: /\[M\]/.test(para),
        passage: para.replace(/\s+/g, " ").trim().slice(0, 900),
      });
    }
  }

  if (findings.length === 0) {
    console.error(
      "[mine-case-study-configs] ZERO findings — the corpus layout changed. Refusing to " +
        "write, which would read as 'the corpus describes no configurations'.",
    );
    process.exit(1);
  }

  findings.sort((a, b) => b.score - a.score || (a.case ?? 0) - (b.case ?? 0));

  /* Grouped by the PART, which is where these facts belong. */
  const byPart = new Map();
  for (const x of findings) {
    const k = x.part ?? "(no part section)";
    if (!byPart.has(k)) byPart.set(k, []);
    byPart.get(k).push(x);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(OUT_DIR, "case-study-config-findings.json"),
    `${JSON.stringify(
      {
        note:
          "A RANKED READING LIST of passages in the case-study corpus that describe a " +
          "part configuration, grouped by the part whose section they sit in. Body text, " +
          "not headings — the heading-only pass missed most of these because a " +
          "configuration is usually described rather than announced. NOTHING here is " +
          "seed data: this corpus's mode prose was wrong in four of four claims reviewed, " +
          "so every entry needs a human. `modelledValues` reflects the corpus's own [M] " +
          "tag. Ship only via lib/bey-modes-authored.mjs, and only with `confirmed`.",
        generatedAt: new Date().toISOString(),
        filesScanned,
        paragraphsScanned: paragraphs,
        findings: findings.length,
        distinctPartSections: byPart.size,
        tagCounts: Object.fromEntries(
          CONFIG_TERMS.map((t) => [t.tag, findings.filter((x) => x.tags.includes(t.tag)).length]),
        ),
        byPart: Object.fromEntries(
          [...byPart.entries()]
            .sort((a, b) => b[1].length - a[1].length)
            .map(([k, v]) => [k, v.slice(0, 12)]),
        ),
      },
      null,
      1,
    )}\n`,
    "utf8",
  );

  console.log(`[mine-case-study-configs] ${filesScanned} files, ${paragraphs} paragraphs`);
  console.log(`  configuration passages : ${findings.length}`);
  console.log(`  distinct part sections : ${byPart.size}`);
  for (const [t, n] of Object.entries(
    Object.fromEntries(
      CONFIG_TERMS.map((x) => [x.tag, findings.filter((y) => y.tags.includes(x.tag)).length]),
    ),
  ).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${String(n).padStart(4)}  ${t}`);
  }
  console.log("\n  top part sections by passage count:");
  for (const [k, v] of [...byPart.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 18)) {
    console.log(`    ${String(v.length).padStart(3)}  ${k.slice(0, 64)}`);
  }
  console.log(`\n-> ${OUT_DIR}/case-study-config-findings.json`);
}

main();
