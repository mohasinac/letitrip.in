#!/usr/bin/env node
/**
 * audit-field-ui-meta — strict-zero.
 *
 * ## Why this exists
 *
 * `annotate(schema, meta)` attaches a field's section, row span and control
 * kind to the SCHEMA INSTANCE, in a WeakMap. Every zod wrapper —
 * `.optional()`, `.nullable()`, `.default()`, `.catch()` — returns a NEW
 * instance, so metadata attached before one of them is attached to an object
 * nobody ever looks up again:
 *
 *     annotate(z.string(), { section: "basics" }).optional()   // ✗ LOST
 *     annotate(z.string().optional(), { section: "basics" })   // ✓ kept
 *
 * Verified at runtime, and it fails SILENTLY: the field renders, in the
 * "advanced" fallback section, at a default width, with nothing erroring. Most
 * form fields are optional, so getting this backwards once in a schema
 * misplaces the majority of that form.
 *
 * The second rule is `section`. It is the one key no heuristic can infer —
 * whether `gstin` belongs under "Tax" or "Business details" is a product
 * decision — so it is required, and a field without one silently lands in
 * "advanced" rather than failing.
 *
 * ## What it checks
 *
 * 1. ORDERING — an `annotate(...)` call followed by `.optional()`,
 *    `.nullable()`, `.default(...)`, `.catch(...)`, `.array()`, `.min(...)`,
 *    `.max(...)` or any other chained method. The annotation must be outermost.
 * 2. SECTION — every `annotate(...)` passes a `section` key.
 * 3. NO ZOD-4 REGISTRY — `z.registry(` / `.register(` must not appear.
 *    appkit compiles against zod 3 (its own nested copy is 3.25.76 while the
 *    app is on 4.4.3), so the zod-4 registry API is not available here and a
 *    call to it would fail at build rather than at review.
 *
 * Regex over raw source, no TypeScript compiler — the house convention.
 *
 * Suppression: `// audit-field-ui-meta-ok: <reason>` on the offending line or
 * the line above. Reserve it for a genuine case where the annotated instance
 * is deliberately not the one placed in the schema shape.
 *
 * Exit 0 — clean.  Exit 1 — any violation.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { stripComments } from "./lib/strip-comments.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SCAN = [join(ROOT, "src"), join(ROOT, "appkit", "src")];
const SKIP = new Set(["node_modules", "dist", ".next", ".git", "__tests__", "coverage"]);
const EXTS = [".ts", ".tsx"];

/** The primitive's own file defines `annotate`; it is not a call site. */
const SELF = ["appkit/src/features/shell/field-ui-meta.ts"];

const SUPPRESS = /\/\/\s*audit-field-ui-meta-ok:/;

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    if (SKIP.has(name)) continue;
    const full = join(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) walk(full, out);
    else if (EXTS.some((e) => name.endsWith(e))) out.push(full);
  }
  return out;
}

const rel = (f) => relative(ROOT, f).split("\\").join("/");

/**
 * Find each `annotate(` call and return its full span, by walking braces and
 * parens with quote/comment awareness.
 *
 * A `<Tag[^>]*>`-style regex is what made `audit-select-wrapper-classname`
 * miss the cart violation — it stops at the first `>` inside an arrow function
 * and never reaches the attribute it is looking for. Same class of bug applies
 * to matching a call expression with `\([^)]*\)`, because a nested object
 * literal contains parens. Walk the characters instead.
 */
function findCalls(source, fnName) {
  const calls = [];
  const needle = `${fnName}(`;
  let i = 0;
  while ((i = source.indexOf(needle, i)) !== -1) {
    // Must be a call, not a substring of a longer identifier.
    const prev = source[i - 1];
    if (prev && /[A-Za-z0-9_$.]/.test(prev)) {
      i += needle.length;
      continue;
    }
    let depth = 0;
    let j = i + needle.length - 1;
    let quote = null;
    for (; j < source.length; j++) {
      const c = source[j];
      const p = source[j - 1];
      if (quote) {
        if (c === quote && p !== "\\") quote = null;
        continue;
      }
      if (c === '"' || c === "'" || c === "`") {
        quote = c;
        continue;
      }
      if (c === "(" || c === "[" || c === "{") depth++;
      else if (c === ")" || c === "]" || c === "}") {
        depth--;
        if (depth === 0) break;
      }
    }
    calls.push({ start: i, end: j, body: source.slice(i, j + 1) });
    i = j + 1;
  }
  return calls;
}

const lineOf = (source, index) => source.slice(0, index).split("\n").length;

function isSuppressed(lines, lineNo) {
  const here = lines[lineNo - 1] ?? "";
  const above = lines[lineNo - 2] ?? "";
  return SUPPRESS.test(here) || SUPPRESS.test(above);
}

function main() {
  const violations = [];
  let annotated = 0;
  let filesWithMeta = 0;

  for (const rootDir of SCAN) {
    for (const file of walk(rootDir)) {
      const relPath = rel(file);
      if (SELF.includes(relPath)) continue;
      const raw = readFileSync(file, "utf8");
      if (!raw.includes("annotate(") && !raw.includes(".register(") && !raw.includes("z.registry(")) {
        continue;
      }
      // Comments blanked, offsets preserved — so line numbers stay exact while
      // a docstring that QUOTES the defect cannot be reported as one.
      const source = stripComments(raw);
      const lines = raw.split("\n");
      let sawAnnotate = false;

      // Rule 3 — the zod-4 registry API is unavailable in this repo.
      for (const pattern of ["z.registry(", ".register("]) {
        let at = 0;
        while ((at = source.indexOf(pattern, at)) !== -1) {
          const lineNo = lineOf(source, at);
          const line = lines[lineNo - 1] ?? "";
          // Skip comments and unrelated `.register(` (service-worker, etc.)
          if (!/^\s*(\/\/|\*|\/\*)/.test(line) && !isSuppressed(lines, lineNo)) {
            if (pattern === "z.registry(" || /\.register\(\s*ui\b/.test(line)) {
              violations.push(
                `${relPath}:${lineNo}  ZOD4_REGISTRY — \`${pattern}\` is a zod-4 API; appkit compiles ` +
                  `against zod 3. Use \`annotate(schema, meta)\`.`,
              );
            }
          }
          at += pattern.length;
        }
      }

      for (const call of findCalls(source, "annotate")) {
        annotated++;
        sawAnnotate = true;
        const lineNo = lineOf(source, call.start);
        if (isSuppressed(lines, lineNo)) continue;

        // Rule 1 — nothing may be chained onto the annotate() result.
        const after = source.slice(call.end + 1, call.end + 40);
        const chained = after.match(/^\s*\.\s*([A-Za-z_$][\w$]*)/);
        if (chained) {
          violations.push(
            `${relPath}:${lineNo}  ORDERING — \`.${chained[1]}()\` is chained onto annotate(). ` +
              `That returns a NEW schema instance and the metadata is silently lost. ` +
              `Move the wrapper inside: annotate(z.…${`.${chained[1]}()`}, { … }).`,
          );
        }

        // Rule 2 — `section` is mandatory.
        if (!/\bsection\s*:/.test(call.body)) {
          violations.push(
            `${relPath}:${lineNo}  NO_SECTION — annotate() must pass \`section\`. It is the one key ` +
              `no heuristic can infer, and without it the field lands in "advanced" silently.`,
          );
        }
      }
      if (sawAnnotate) filesWithMeta++;
    }
  }

  if (violations.length === 0) {
    console.log(
      `audit-field-ui-meta: clean ✓ (${annotated} annotate() call(s) across ${filesWithMeta} file(s))`,
    );
    process.exit(0);
  }

  console.error(`\naudit-field-ui-meta: ${violations.length} violation(s).\n`);
  console.error(
    "  Field UI metadata is keyed by SCHEMA INSTANCE. Every zod wrapper\n" +
      "  (.optional/.nullable/.default/.catch) returns a new instance, so an\n" +
      "  annotation attached before one is attached to an object nothing looks\n" +
      "  up again — the field then renders in the fallback section at a default\n" +
      "  width, with no error anywhere. Most fields are optional, so one\n" +
      "  mistake misplaces most of a form.\n",
  );
  for (const v of violations) console.error(`  - ${v}`);
  process.exit(1);
}

main();
