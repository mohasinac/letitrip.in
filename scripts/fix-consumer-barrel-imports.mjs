#!/usr/bin/env node
/*
 * Repoint `src/`'s bare `@mohasinac/appkit` imports at the subpath that DEFINES
 * each symbol.
 *
 * 🛑 THIS WAS MEASURED AS WORTHLESS ONCE, AND THE MEASUREMENT WAS RIGHT AT THE
 * TIME. Before appkit's own barrel imports were cleaned up, resolving all 865
 * symbols to their defining modules and unioning their graphs gave 1,947
 * modules — IDENTICAL to importing the barrel. The symbols the app uses had
 * enormous graphs of their own, so pointing at them directly bought nothing.
 *
 * After fixing 79 barrel imports INSIDE appkit, the same measurement gives
 * 1,038 modules / 6.9 MB against the barrel's 1,912 / 13.2 MB — a 46%
 * reduction. The two migrations are SEQUENTIAL, not alternatives: appkit's
 * internal hygiene is what makes the consumer's worth doing.
 *
 * ── WHAT IT WILL NOT DO ─────────────────────────────────────────────────────
 *
 *   - `_internal/**` stays on the barrel. 30 of the 865 symbols live there and
 *     that boundary is enforced by appkit/scripts/audit-violations.mjs; making
 *     them deep-importable would breach it for a few modules of savings.
 *   - A symbol whose defining module cannot be resolved is left alone.
 *   - `import * as ns` and side-effect imports are left alone.
 *   - A subpath with no matching `exports` pattern is left alone — the rewrite
 *     must RESOLVE, and a path that only works in a bundler is the bug this
 *     whole effort exists to remove.
 *
 * Type-only imports stay `import type`, or the rewrite would create runtime
 * edges tsc currently elides.
 *
 * Usage:
 *   node scripts/fix-consumer-barrel-imports.mjs --dry-run
 *   node scripts/fix-consumer-barrel-imports.mjs --apply
 *
 * @tag domain:build
 * @tag layer:script
 * @tag access:node-only
 * @tag sideEffects:rewrites src/ imports when --apply
 */

import { readFileSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";

const { definingModule, maskComments, sourceFiles } = await import(
  "../appkit/scripts/lib/module-graph.mjs"
);

const APPKIT_SRC = resolve("appkit/src");
const APPKIT_INDEX = resolve(APPKIT_SRC, "index.ts");
const PKG = "@mohasinac/appkit";

const argv = process.argv.slice(2);
const APPLY = argv.includes("--apply");

/* Top-level dirs that package.json exposes as `./<dir>/*`. Anything else —
 * notably _internal — is not addressable and must stay on the barrel. */
const EXPORTED_DIRS = new Set(
  Object.keys(JSON.parse(readFileSync("appkit/package.json", "utf8")).exports)
    .filter((k) => k.endsWith("/*"))
    .map((k) => k.slice(2, -2)),
);

/** appkit/src/features/x/y.ts -> "@mohasinac/appkit/features/x/y" */
function subpathFor(absFile) {
  const rel = relative(APPKIT_SRC, absFile).split("\\").join("/").replace(/\.tsx?$/, "");
  const top = rel.split("/")[0];
  if (!EXPORTED_DIRS.has(top)) return null;
  /* `exports` maps `./dir/*` -> `./dist/dir/*.js`, so an index file must be
   * named explicitly; `./features/x` would resolve to dist/features/x.js. */
  return `${PKG}/${rel}`;
}

const IMPORT_RE = new RegExp(
  `import\\s+(type\\s+)?\\{([^}]*)\\}\\s*from\\s*"${PKG.replace("/", "\\/")}"\\s*;?`,
  "g",
);

let sites = 0;
let rewritten = 0;
let symbols = 0;
let filesChanged = 0;
const skips = new Map();
const note = (r) => skips.set(r, (skips.get(r) ?? 0) + 1);

for (const file of sourceFiles(resolve("src"))) {
  const original = readFileSync(file, "utf8");
  if (!original.includes(`from "${PKG}"`)) continue;
  const masked = maskComments(original);

  const edits = [];

  for (const m of masked.matchAll(IMPORT_RE)) {
    const [match, typeKeyword, clause] = m;
    sites += 1;

    const pieces = clause.split(",").map((p) => p.trim()).filter(Boolean);
    if (!pieces.length) continue;

    const byPath = new Map();
    const keepOnBarrel = { type: [], value: [] };

    for (const piece of pieces) {
      const isType = Boolean(typeKeyword) || /^type\s+/.test(piece);
      const bare = piece.replace(/^type\s+/, "");
      const [orig, alias] = bare.split(/\s+as\s+/).map((x) => x.trim());
      const text = alias ? `${orig} as ${alias}` : orig;

      const def = definingModule(APPKIT_INDEX, orig);
      const sub = def ? subpathFor(def.file) : null;

      if (!def) {
        note("unresolved-symbol");
        (isType ? keepOnBarrel.type : keepOnBarrel.value).push(text);
        continue;
      }
      if (!sub) {
        note("not-publicly-exported (e.g. _internal)");
        (isType ? keepOnBarrel.type : keepOnBarrel.value).push(text);
        continue;
      }

      /*
       * 🛑 Emit the DEFINING module's own name, aliased back to whatever this
       * file already calls it. A barrel may rename on re-export —
       * `export { createRouteHandler as createApiHandler }` — and the defining
       * module has never heard of the exposed name. Emitting it produced
       * "has no exported member" on every renamed symbol.
       */
      const local = def.localName ?? orig;
      const exposed = alias ?? orig;
      const emitted = local === exposed ? exposed : `${local} as ${exposed}`;

      if (!byPath.has(sub)) byPath.set(sub, { type: [], value: [] });
      (isType || def.isType ? byPath.get(sub).type : byPath.get(sub).value).push(emitted);
      symbols += 1;
    }

    if (!byPath.size) continue;

    const lines = [];
    for (const [sub, { type, value }] of [...byPath].sort()) {
      if (value.length) lines.push(`import { ${value.join(", ")} } from "${sub}";`);
      if (type.length) lines.push(`import type { ${type.join(", ")} } from "${sub}";`);
    }
    if (keepOnBarrel.value.length) lines.push(`import { ${keepOnBarrel.value.join(", ")} } from "${PKG}";`);
    if (keepOnBarrel.type.length) lines.push(`import type { ${keepOnBarrel.type.join(", ")} } from "${PKG}";`);

    edits.push({ start: m.index, end: m.index + match.length, text: lines.join("\n") });
  }

  if (!edits.length) continue;

  edits.sort((a, b) => a.start - b.start);
  let next = "";
  let cursor = 0;
  for (const e of edits) {
    next += original.slice(cursor, e.start) + e.text;
    cursor = e.end;
  }
  next += original.slice(cursor);

  rewritten += edits.length;
  filesChanged += 1;
  if (APPLY) writeFileSync(file, next, "utf8");
}

console.log(`[fix-consumer-barrel-imports] bare-barrel import sites: ${sites}`);
console.log(
  `  ${APPLY ? "rewrote" : "would rewrite"} ${rewritten} site(s) in ${filesChanged} file(s), ` +
    `${symbols} symbol(s) repointed`,
);
if (skips.size) {
  console.log("\n  left on the barrel (deliberately):");
  for (const [r, n] of [...skips].sort((a, b) => b[1] - a[1])) {
    console.log(`    ${String(n).padStart(4)}  ${r}`);
  }
}
if (!APPLY) console.log("\n(dry run — pass --apply to write)");
