#!/usr/bin/env node
/**
 * Freeze the per-parent ancestor chains that `gen-catalogue-listings.mjs` needs.
 *
 *   node --max-old-space-size=3072 scripts/freeze-category-parent-chains.mjs
 *
 * ── 🛑 WHAT THIS IS FOR ───────────────────────────────────────────────────────
 *
 * `categorySlugs` / `categoryNames` on a catalogue listing are the LEAF plus its
 * ancestors, and the ancestors come from `parentIds`, which only exists once
 * `buildCategoryTree` has EXECUTED over `CATEGORY_FOREST`. That made the last
 * step of a pure codegen chain depend on a ~4.4 GB appkit build.
 *
 * The forest is a nested literal in two shapes (named consts carrying
 * `children: [...]`, plus `branch("id", …, [...])` calls), so a text parse of it
 * could be subtly wrong in a way the existing data would never reveal — and
 * `categorySlugs` is the field every category page matches on, so a wrong chain
 * makes a listing unreachable from its own ancestors while still rendering
 * perfectly by slug. That is Root Cause #101, on this exact field.
 *
 * So instead of re-deriving, this CACHES THE MEASUREMENT: it reads the chains
 * back out of catalogue output that a real build produced, cross-checks every
 * row against every other row for the same parent, and refuses to write if any
 * two disagree.
 *
 * ── 🛑 WHEN TO RUN IT ────────────────────────────────────────────────────────
 *
 * After any change to the FOREST's shape (a new branch, a moved line, a renamed
 * tier), from a session where a build has run and the catalogue has been
 * regenerated against the executed tree. Not after merely adding leaves — a new
 * leaf under an existing parent changes no chain.
 *
 * A NEW leaf-parent that has no listings yet cannot be frozen from output,
 * because there is no row to read. `read-generated-seed.mjs` THROWS on a
 * missing parent and names it, which is the correct outcome: somebody should
 * confirm where it sits in the forest rather than let a guess reach 1,600 rows.
 *
 * @tag domain:products
 * @tag layer:script
 * @tag access:node-only
 * @tag sideEffects:fs — writes scripts/lib/category-parent-chains.json
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = path.resolve(import.meta.dirname, "..");
/*
 * 🛑 The CHUNK FILES, not `products-catalogue-seed-data.ts` — that is now a
 * barrel of imports and holds no rows. This script's zero-guard caught the
 * switch immediately ("matched ZERO categorySlugs arrays") and refused to write
 * an empty sidecar, which is the whole reason the guard exists: an empty
 * chains file reads downstream as "no chains exist" and would have thrown on
 * every leaf-parent rather than on the one real cause.
 */
const CHUNK_DIR = path.join(ROOT, "appkit/src/seed/products-catalogue");
const FOREST = path.join(ROOT, "appkit/src/seed/_helpers/category-forest.ts");
const OUT = path.join(ROOT, "scripts/lib/category-parent-chains.json");

/**
 * A JSON string literal. 🛑 `JSON.parse`d, never hand-unescaped — a category
 * name carrying a quote or an escape is a valid JSON string and stripping the
 * outer quotes with a `.replace()` would corrupt exactly that row while looking
 * correct on the thousands that have no escape.
 */
const STR = '"((?:[^"\\\\]|\\\\.)*)"';

function stringsIn(body) {
  return [...body.matchAll(new RegExp(STR, "g"))].map((m) => JSON.parse(`"${m[1]}"`));
}

async function main() {
  const chunkFiles = fs
    .readdirSync(CHUNK_DIR)
    .filter((f) => /^chunk\d+\.ts$/.test(f))
    /* Numeric, so chunk10 does not sort between chunk1 and chunk2. Order does
     * not change the frozen result here, but a lexical sort would make the
     * reported row ordering disagree with the barrel's. */
    .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));
  if (chunkFiles.length === 0) {
    console.error(`[freeze-chains] no chunk files in ${CHUNK_DIR} — run gen-catalogue-listings first`);
    process.exit(1);
  }
  const cat = chunkFiles.map((f) => fs.readFileSync(path.join(CHUNK_DIR, f), "utf8")).join("\n");
  const slugRows = [...cat.matchAll(/categorySlugs:\s*\[([^\]]*)\]/g)].map((m) => stringsIn(m[1]));
  const nameRows = [...cat.matchAll(/categoryNames:\s*\[([^\]]*)\]/g)].map((m) => stringsIn(m[1]));

  if (slugRows.length === 0) {
    console.error(
      "[freeze-chains] matched ZERO categorySlugs arrays. The catalogue emit shape " +
        "changed — refusing to write an empty sidecar, which would read as 'no chains exist'.",
    );
    process.exit(1);
  }
  if (slugRows.length !== nameRows.length) {
    console.error(
      `[freeze-chains] ${slugRows.length} slug arrays vs ${nameRows.length} name arrays. ` +
        "They are emitted per row and must pair; a mismatch means the rows cannot be zipped.",
    );
    process.exit(1);
  }
  console.log(`[freeze-chains] catalogue rows: ${slugRows.length}`);

  /*
   * One record per leaf-parent: the parent's own id/name followed by its
   * ancestors. Every row under that parent must produce the IDENTICAL record —
   * that cross-check is the whole reason this is trustworthy without a build,
   * so a disagreement is fatal rather than last-write-wins.
   */
  const frozen = new Map();
  const disagreements = [];
  for (let i = 0; i < slugRows.length; i++) {
    const slugs = slugRows[i];
    const names = nameRows[i];
    if (slugs.length < 2 || names.length !== slugs.length) continue;
    const parent = slugs[1];
    const rec = { slugs: slugs.slice(1), names: names.slice(1) };
    const key = JSON.stringify(rec);
    const prev = frozen.get(parent);
    if (prev === undefined) frozen.set(parent, key);
    else if (prev !== key) disagreements.push({ parent, a: prev, b: key });
  }

  console.log(`[freeze-chains] parents frozen from output: ${frozen.size}`);
  console.log(`[freeze-chains] rows disagreeing about a parent: ${disagreements.length}`);
  if (disagreements.length > 0) {
    for (const d of disagreements.slice(0, 5)) {
      console.error(`  🛑 ${d.parent}\n     ${d.a}\n     ${d.b}`);
    }
    console.error(
      "\n[freeze-chains] REFUSING to write. Two listings under one parent claim different\n" +
        "  ancestors, so the catalogue this was frozen from is itself inconsistent and\n" +
        "  picking either would bake one of them in. Regenerate the catalogue against a\n" +
        "  freshly built tree first.",
    );
    process.exit(1);
  }

  /*
   * ── The parents with no listings yet ──────────────────────────────────────
   *
   * A leaf-parent that gained children only in the latest generator run has no
   * catalogue row to read a chain from. Those are resolved by READING the
   * forest: a `line(…)`/`node(…)` sits among siblings inside one `branch(…)`,
   * and siblings share an ancestor tail by definition.
   *
   * 🛑 By READING, not by name prefix. `category-original-plastic-gen` and
   * `category-original-spin-gear` do share a prefix, and they are also genuine
   * siblings — but the prefix is a naming convention and the sibling
   * relationship is the fact, so the fact is what gets checked.
   */
  const forest = fs.readFileSync(FOREST, "utf8");

  /*
   * 🛑 CONTAINMENT, not line proximity. The first version of this picked each
   * id's "nearest preceding branch(" line and then collected siblings by line
   * GAP — which had `category-metal-string-launchers` adopting from
   * `category-burst-classic`, a different subtree entirely, and 28 others like
   * it. Trap #13: my own check was the bug, and the only reason it was caught
   * is that the adopted donors were printed and read rather than counted.
   *
   * So: walk `branch("id", name, desc, [ … ])` and record the ids declared at
   * bracket depth 1 inside that array. Those are its IMMEDIATE children, which
   * is the only relation that shares an ancestor tail — a grandchild's tail is
   * one longer, so "any id inside the span" would also be wrong.
   */
  const parentOf = new Map();
  const nameOf = new Map();
  const lineOf = new Map();
  const OPENER = new RegExp(`\\b(line|node|branch)\\(${STR}\\s*,\\s*${STR}`, "g");
  const lineAt = (idx) => forest.slice(0, idx).split("\n").length;

  for (const m of forest.matchAll(OPENER)) {
    const id = JSON.parse(`"${m[2]}"`);
    nameOf.set(id, JSON.parse(`"${m[3]}"`));
    lineOf.set(id, lineAt(m.index));
    if (m[1] !== "branch") continue;
    /* The children array is the last argument — the first `[` after the call. */
    const open = forest.indexOf("[", m.index + m[0].length);
    if (open < 0) continue;
    let depth = 0;
    let inStr = false;
    for (let i = open; i < forest.length; i++) {
      const ch = forest[i];
      if (inStr) {
        if (ch === "\\") i++;
        else if (ch === '"') inStr = false;
        continue;
      }
      if (ch === '"') inStr = true;
      else if (ch === "[" || ch === "(") depth++;
      else if (ch === "]" || ch === ")") {
        depth--;
        if (depth === 0) break;
      } else if (depth === 1) {
        /* Depth 1 inside the children array === an immediate child call. */
        const kid = forest.slice(i).match(new RegExp(`^\\b(?:line|node|branch)\\(${STR}`));
        if (kid) parentOf.set(JSON.parse(`"${kid[1]}"`), id);
      }
    }
  }

  const chains = {};
  for (const [p, k] of [...frozen.entries()].sort()) chains[p] = JSON.parse(k);

  /*
   * ── 🛑 THE PARSER IS VALIDATED BEFORE IT IS TRUSTED ───────────────────────
   *
   * 46 parents have a chain measured from a real build, so the parse has 46
   * known-good answers to be checked against. If it reproduces every one, it
   * can be believed for the ones it is needed for; if it disagrees on even one,
   * it is wrong and must not be used — "never trust a check you have not seen
   * fail" (Root Cause #87), applied to the parser rather than to an audit.
   */
  const wrong = [];
  for (const [id, rec] of Object.entries(chains)) {
    const parsed = parentOf.get(id);
    const expected = rec.slugs[1];
    if (expected && parsed !== expected) wrong.push({ id, parsed: parsed ?? "(none)", expected });
  }
  const checked = Object.values(chains).filter((r) => r.slugs.length > 1).length;
  console.log(`[freeze-chains] forest parse validated against ${checked} known chains: ${wrong.length} wrong`);
  if (wrong.length > 0) {
    for (const w of wrong.slice(0, 8)) {
      console.error(`  🛑 ${w.id}: parsed parent ${w.parsed}, build says ${w.expected}`);
    }
    console.error(
      "\n[freeze-chains] REFUSING to adopt. The forest parse disagrees with chains a real\n" +
        "  build produced, so it cannot be trusted for the parents that have no listings yet.\n" +
        "  Add those chains by hand, or regenerate this sidecar from a built tree.",
    );
    process.exit(1);
  }

  /*
   * Adopt only for parents that ACTUALLY HAVE LEAVES. A branch with no leaves
   * never reaches `slugsFor()`, so freezing a chain for it is dead weight that
   * reads as coverage — and 28 of the 29 the broken version "fixed" were
   * exactly that.
   */
  const { readLeafMap } = await import("./lib/read-generated-seed.mjs");
  const parts = readLeafMap("category-parts.ts");
  const models = readLeafMap(
    fs
      .readdirSync(path.join(ROOT, "appkit/src/seed/_helpers/category-models"))
      .filter((f) => /^chunk\d+\.ts$/.test(f))
      .sort()
      .map((f) => `category-models/${f}`),
  );
  const leafParents = new Set([...Object.keys(parts.leaves), ...Object.keys(models.leaves)]);
  console.log(`[freeze-chains] leaf-parents in the generated maps: ${leafParents.size}`);

  const adopted = [];
  for (const id of leafParents) {
    if (chains[id]) continue;
    const donorParent = parentOf.get(id);
    const donor = donorParent
      ? [...leafParents, ...Object.keys(chains)].find(
          (s) => s !== id && parentOf.get(s) === donorParent && chains[s],
        )
      : undefined;
    if (!donor) continue;
    chains[id] = {
      slugs: [id, ...chains[donor].slugs.slice(1)],
      names: [nameOf.get(id) ?? id, ...chains[donor].names.slice(1)],
    };
    adopted.push({ id, donor, branch: donorParent, line: lineOf.get(id) });
  }
  for (const a of adopted) {
    console.log(
      `[freeze-chains] ${a.id} has leaves but no listings; tail taken from ${a.donor}, ` +
        `its immediate sibling under ${a.branch} (category-forest.ts:${a.line})`,
    );
  }

  const unresolved = [...leafParents].filter((p) => !chains[p]);
  if (unresolved.length > 0) {
    console.error(`\n[freeze-chains] 🛑 ${unresolved.length} leaf-parent(s) have NO chain:`);
    for (const p of unresolved) console.error(`     ${p}`);
    console.error(
      "  Every listing under these would be unreachable from its ancestors. Resolve each\n" +
        "  against category-forest.ts before regenerating the catalogue.",
    );
    process.exit(1);
  }

  fs.writeFileSync(
    OUT,
    `${JSON.stringify(
      {
        note:
          "Per leaf-PARENT: its own id+name followed by its ancestors, leaf-first — the " +
          "order categorySlugs/categoryNames store. A CACHED MEASUREMENT frozen from " +
          "catalogue output that a real appkit build produced, NOT a re-derivation: " +
          "buildCategoryTree must EXECUTE to compute parentIds, and a text parse of the " +
          "nested forest literal could be wrong in a way the data would not reveal (Root " +
          "Cause #101 — a bad chain makes a listing unreachable from its ancestors while " +
          "rendering fine by slug). Every row under a parent was cross-checked against " +
          "every other; a disagreement refuses the write. Parents with no listings yet " +
          "take their tail from a sibling DECLARED in the same branch(). A parent missing " +
          "here throws in read-generated-seed.mjs — never guess a chain. Regenerate with " +
          "scripts/freeze-category-parent-chains.mjs after a FOREST shape change.",
        generatedAt: new Date().toISOString(),
        frozenFrom: "appkit/src/seed/products-catalogue/chunk*.ts",
        rowsVerified: slugRows.length,
        disagreements: 0,
        adoptedFromSibling: adopted,
        count: Object.keys(chains).length,
        chains,
      },
      null,
      1,
    )}\n`,
    "utf8",
  );
  console.log(`\n[freeze-chains] -> ${path.relative(ROOT, OUT)}  (${Object.keys(chains).length} parents)`);
}

await main();
