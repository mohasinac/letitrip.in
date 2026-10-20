/**
 * Read the GENERATED seed helpers as SOURCE TEXT, with no appkit build.
 *
 * ── 🛑 WHY THIS EXISTS: A CODEGEN STEP HAD A BUILD DEPENDENCY ──────────────
 *
 * `gen-catalogue-listings.mjs` imported seven modules from
 * `node_modules/@mohasinac/appkit/dist`, which made the LAST step of a pure
 * codegen chain require a ~4.4 GB warm / ~8.1 GB cold appkit build. Two
 * consequences, both of which actually bit:
 *
 *   1. Under a memory cap the build cannot run, so the catalogue could not be
 *      regenerated at all — and a catalogue that is not regenerated after the
 *      leaf maps grow keeps referencing ids that may no longer exist, which is
 *      exactly the `audit-category-name-mirror` failure that cost this project
 *      two false "stale dist" diagnoses in one day.
 *   2. `node_modules/.../dist` is a COPY (Root Cause #28), so even with a build
 *      it is stale until someone remembers to resync — and a concurrent session
 *      emptying `appkit/dist` mid-run produced a phantom `ERR_MODULE_NOT_FOUND`
 *      that read as a code fault.
 *
 * Every file read here is itself GENERATED and committed, so reading it as text
 * is reading the same bytes the build would compile. This is the technique
 * `gen-category-parts.mjs` already uses for its `TAKEN` id set.
 *
 * ── 🛑 EVERY STRING IS `JSON.parse`d, NEVER HAND-UNESCAPED ─────────────────
 *
 * The generators emit double-quoted, backslash-escaped literals, so a leaf
 * description containing a quote or a non-ASCII name is a valid JSON string.
 * `JSON.parse` on the matched literal is therefore EXACT. Stripping quotes with
 * a `.replace(/^"|"$/g, "")` would silently corrupt the first such row and look
 * fine on the 2,000 that have no escape.
 *
 * ── 🛑 EVERY READER HAS A ZERO-GUARD, AND THAT IS NOT DEFENSIVE PADDING ────
 *
 * A regex that matches nothing returns an empty map, and an empty map here
 * reads downstream as "this generator has no rows" rather than as a broken
 * parse. That has already happened in this codebase twice in one session (a
 * heredoc turning `\d` into `d`, and `\Z` which JavaScript does not have — the
 * latter made `prize: 0` look like a data gap for a whole run). A reader that
 * cannot find its export THROWS, naming the file and the export.
 *
 * @tag domain:products
 * @tag layer:script
 * @tag access:node-only
 * @tag sideEffects:none — pure reads
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..", "..");
const HELPERS = path.join(ROOT, "appkit/src/seed/_helpers");

/** A JSON string literal: double-quoted, backslash escapes intact. */
const STR = String.raw`"((?:[^"\\]|\\.)*)"`;

function read(file) {
  const abs = path.isAbsolute(file) ? file : path.join(HELPERS, file);
  if (!fs.existsSync(abs)) {
    throw new Error(`[read-generated-seed] missing generated file: ${abs}`);
  }
  return fs.readFileSync(abs, "utf8");
}

/**
 * Slice the balanced body of the `{ … }` or `[ … ]` that opens at `from`.
 *
 * 🛑 A bracket COUNT, not a regex. `/\{([\s\S]*)\}/` is greedy to the last
 * brace in the file and a non-greedy one stops at the first nested close — both
 * silently wrong on nested literals, and every leaf entry here is nested
 * (`extra: { aliases: [...] }`). Quotes are tracked so a brace inside a
 * description cannot unbalance the walk.
 */
function balanced(text, from, open, close) {
  let depth = 0;
  let inStr = false;
  for (let i = from; i < text.length; i++) {
    const ch = text[i];
    if (inStr) {
      if (ch === "\\") i++;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) return text.slice(from + 1, i);
    }
  }
  throw new Error("[read-generated-seed] unbalanced literal — the emit shape changed");
}

/**
 * A generated `Record<string, string>` — one `"key": "value"` per line.
 *
 * Used for `PART_CATEGORY_TO_GLOSSARY_ID`, `GENERATED_CATEGORY_IMAGES` and
 * `GENERATED_PART_COLOURS`, all three of which are flat by construction.
 */
export function readFlatStringMap(file, exportName) {
  const text = read(file);
  const at = text.indexOf(`export const ${exportName}`);
  if (at < 0) throw new Error(`[read-generated-seed] ${exportName} not found in ${file}`);
  const body = balanced(text, text.indexOf("{", at), "{", "}");
  const out = {};
  for (const m of body.matchAll(new RegExp(`${STR}\\s*:\\s*${STR}`, "g"))) {
    out[JSON.parse(`"${m[1]}"`)] = JSON.parse(`"${m[2]}"`);
  }
  if (Object.keys(out).length === 0) {
    throw new Error(
      `[read-generated-seed] ${exportName} in ${file} parsed to ZERO entries. ` +
        `An empty map reads downstream as "this generator produced nothing" — ` +
        `refusing rather than returning it.`,
    );
  }
  return out;
}

/** A generated `export const X = <number>;` — the declared leaf count. */
export function readDeclaredCount(file, exportName) {
  const m = read(file).match(new RegExp(`export const ${exportName}\\s*=\\s*(\\d+)`));
  if (!m) throw new Error(`[read-generated-seed] ${exportName} not found in ${file}`);
  return Number(m[1]);
}

/**
 * A generated `Record<parentCategoryId, CategoryTreeNode[]>`.
 *
 * Returns only `{ id, name, description }` per leaf — 🛑 DELIBERATELY NOT the
 * whole node. `extra` is a `Partial<CategoryDocument>`, the shape that blows the
 * TS2590 union budget, and the catalogue generator reads exactly three fields
 * off a leaf (verified: `leaf.id`, `leaf.name`, `leaf.description`). Returning
 * a partial node that LOOKS complete is how a consumer comes to depend on a
 * field this reader never populated.
 *
 * `files` may be several chunks; later chunks merge over earlier ones the same
 * way the assembler's spread does.
 */
export function readLeafMap(files) {
  const leaves = {};
  let total = 0;
  for (const file of Array.isArray(files) ? files : [files]) {
    const text = read(file);
    /*
     * Parent keys only at the TOP level of the exported object. A nested
     * `"category-…":` cannot occur in a leaf literal (its keys are bare
     * identifiers — `id`, `name`, `extra`), so a quoted category key is
     * unambiguously a parent.
     */
    for (const key of text.matchAll(new RegExp(`${STR}\\s*:\\s*\\[`, "g"))) {
      const parent = JSON.parse(`"${key[1]}"`);
      if (!parent.startsWith("category-")) continue;
      const body = balanced(text, key.index + key[0].length - 1, "[", "]");
      const rows = [];
      for (const ent of body.matchAll(
        new RegExp(`id:\\s*${STR}\\s*,\\s*name:\\s*${STR}\\s*,\\s*description:\\s*${STR}`, "g"),
      )) {
        rows.push({
          id: JSON.parse(`"${ent[1]}"`),
          name: JSON.parse(`"${ent[2]}"`),
          description: JSON.parse(`"${ent[3]}"`),
        });
      }
      /*
       * 🛑 Per-parent zero-guard, not just a total. A single parent block whose
       * entries failed to match leaves the TOTAL plausible while silently
       * dropping that whole branch's listings — the failure mode that is
       * invisible in a summary line.
       */
      if (rows.length === 0) {
        throw new Error(
          `[read-generated-seed] parent "${parent}" in ${file} yielded ZERO leaves. ` +
            `The leaf literal shape changed; fix the reader rather than skipping.`,
        );
      }
      leaves[parent] = [...(leaves[parent] ?? []), ...rows];
      total += rows.length;
    }
  }
  if (total === 0) throw new Error(`[read-generated-seed] no leaves parsed from ${files}`);
  return { leaves, count: total };
}

/**
 * Ancestor chain per leaf-PARENT, leaf-first — the order `categorySlugs` stores.
 *
 * ── 🛑 WHY A FROZEN SIDECAR AND NOT A FOREST PARSE ────────────────────────
 *
 * `parentIds` is derived by `buildCategoryTree` EXECUTING over `CATEGORY_FOREST`,
 * which is a nested literal in two different shapes (named consts carrying
 * `children: [...]`, plus `branch("id", …, [...])` calls). A text parser over
 * that could be subtly wrong in a way the existing data would not reveal, and
 * `categorySlugs` is the field every category page matches on — a wrong chain
 * makes a listing unreachable from its own ancestors while rendering perfectly
 * by slug (Root Cause #101, which was exactly this field).
 *
 * So the chains are a CACHED MEASUREMENT: frozen from catalogue output that a
 * real build produced. Verified at freeze time — across 2,974 rows and 46
 * parents, ZERO rows disagreed about any parent's chain. The 47th
 * (`category-original-plastic-gen`, which had no listings because it had no
 * model children until the wiki expansion) was resolved by READING
 * `category-forest.ts:212`, where it is a sibling of
 * `category-original-spin-gear` under `branch("category-original-tops", …)` —
 * not by inferring from the shared `category-original-` name prefix.
 *
 * 🛑 A parent absent from the sidecar THROWS. Guessing a chain is the one thing
 * that must not happen here, and a new leaf-parent is a real event that
 * deserves a human deciding where it sits.
 */
export function readParentChains() {
  const abs = path.join(ROOT, "scripts/lib/category-parent-chains.json");
  const { chains } = JSON.parse(fs.readFileSync(abs, "utf8"));
  if (!chains || Object.keys(chains).length === 0) {
    throw new Error("[read-generated-seed] category-parent-chains.json has no chains");
  }
  return {
    chains,
    /**
     * `{ slugs, names }`, each `[leaf, parent, …ancestors]` — leaf-first, the
     * order `categorySlugs` / `categoryNames` store.
     */
    closureFor(leafId, leafName, parentId) {
      const tail = chains[parentId];
      if (!tail) {
        throw new Error(
          `[read-generated-seed] no ancestor chain for leaf-parent "${parentId}".\n` +
            `  It is a NEW leaf-parent. Add its chain to ` +
            `scripts/lib/category-parent-chains.json after confirming where it sits in\n` +
            `  appkit/src/seed/_helpers/category-forest.ts — do not guess, because a wrong\n` +
            `  categorySlugs chain makes every listing under it unreachable from its own\n` +
            `  ancestors while still rendering by slug.`,
        );
      }
      return { slugs: [leafId, ...tail.slugs], names: [leafName, ...tail.names] };
    },
  };
}
