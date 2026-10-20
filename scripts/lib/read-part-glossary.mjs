/**
 * Read the part glossary from the SHIPPED seed source — no appkit build.
 *
 * ── 🛑 WHY NOT `import("appkit/dist/…")`, WHICH IS WHAT THIS REPLACES ──────
 *
 * `gen-category-parts.mjs` used to import the built module, and its comment
 * gave a fair reason: the seed is emitted in five chunks, so "parsing that
 * back out of TypeScript means re-implementing a chunk-aware reader and
 * getting the bracket walk right; importing the built module is exact and
 * cannot drift from what appkit actually exports."
 *
 * Right about exactness, wrong about the cost — and wrong that it needs a
 * bracket walk. `generate-parts-seed.mjs` writes each chunk body as raw
 * `JSON.stringify(rows, null, 2)` output, so the array literal IS valid JSON.
 * `JSON.parse` over it is exact by construction, not a heuristic.
 *
 * What the dist import cost, both measured 2026-10-20:
 *
 *   · **It needs a build.** An appkit build is 4,424 MB warm and ~8,100 MB
 *     cold, so a pure codegen step — research JSON in, TS out, no types
 *     involved anywhere — could not run under a 4 GB memory cap at all.
 *   · **`appkit/dist` is shared mutable state.** A parallel session's build
 *     emptied it mid-run: `dist` held ZERO files and the generator died on
 *     `ERR_MODULE_NOT_FOUND` for data sitting uncompiled in this repo.
 *     `appkit/scripts/fix-esm-extensions.mjs` exists because a half-written
 *     dist is a routine state here, not an exotic one.
 *
 * 🛑 This reads the file the app SHIPS, so it cannot disagree with it. That is
 * a stronger guarantee than the dist import had, which could disagree the
 * moment dist went stale — the documented Windows gotcha the old comment was
 * itself warning about two lines further down.
 *
 * @tag domain:parts
 * @tag layer:script
 * @tag access:build
 * @tag sideEffects:none
 */
import fs from "node:fs";
import path from "node:path";

/**
 * Every `Partial<PartGlossaryDocument>` row, in chunk order.
 *
 * Throws rather than returning a short list: a caller that generates category
 * leaves from a truncated glossary emits a tree missing pages, and nothing
 * downstream can tell that apart from a genuinely smaller catalogue.
 */
export function readPartGlossary(root) {
  const dir = path.join(root, "appkit/src/seed/part-glossary");
  if (!fs.existsSync(dir)) {
    throw new Error(
      `No part-glossary chunks at ${path.relative(root, dir)}. ` +
        `Run: node scripts/generate-parts-seed.mjs`,
    );
  }
  const files = fs
    .readdirSync(dir)
    .filter((f) => /^chunk\d+\.ts$/.test(f))
    /* Numeric sort — `chunk10` must not land between `chunk1` and `chunk2`,
     * which is what a lexicographic sort does and what would silently reorder
     * the glossary once the count passes ten. */
    .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));

  if (!files.length) throw new Error(`No chunkN.ts files in ${path.relative(root, dir)}.`);

  const rows = [];
  for (const f of files) {
    const text = fs.readFileSync(path.join(dir, f), "utf8");
    /*
     * The body runs from the array literal's `[` to the LAST `]` in the file.
     * `lastIndexOf` rather than a matching-bracket scan because the chunk is
     * machine-written with exactly one top-level array and nothing after it —
     * and if that ever stops being true, `JSON.parse` fails loudly here rather
     * than returning a partial list.
     */
    const open = text.indexOf("= [");
    const close = text.lastIndexOf("]");
    if (open < 0 || close < open) {
      throw new Error(`${f}: no array literal found — did the emitter change shape?`);
    }
    let parsed;
    try {
      parsed = JSON.parse(text.slice(open + 2, close + 1));
    } catch (err) {
      throw new Error(
        `${f}: body is not valid JSON (${err.message}). ` +
          `generate-parts-seed.mjs must keep emitting raw JSON.stringify output.`,
      );
    }
    if (!Array.isArray(parsed)) throw new Error(`${f}: parsed body is not an array.`);
    rows.push(...parsed);
  }
  return rows;
}
