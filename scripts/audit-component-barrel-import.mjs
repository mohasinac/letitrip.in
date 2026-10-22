#!/usr/bin/env node
/**
 * audit-component-barrel-import.mjs — nothing imports the `@/components`
 * barrel; every import names the module that DEFINES the symbol.
 *
 * ## 🛑 CORRECTED 2026-10-22, within the hour of first writing this
 *
 * The first version of this file justified the rule with the 401
 * provider-registry hazard CLAUDE.md records for `@/constants` — a second
 * appkit instance under the client condition with an empty provider registry,
 * measured as ten 401s out of ten on `/api/payment/create-order`. **That
 * mechanism does not apply to this barrel, and I asserted it without checking
 * that it did.** Two measurements settle it:
 *
 *   1. **26 of the 28 re-exported modules are themselves `"use client"`.** A
 *      Server Component importing one is the ORDINARY RSC boundary — Next.js
 *      places it in the client graph, which is where the client entry belongs.
 *      That is not a second instantiation; it is how the App Router works.
 *   2. **`src/constants/navigation.tsx`'s only import from the client entry is
 *      `import type`**, which the compiler ERASES. So `@/constants` does not
 *      carry that mechanism either — it was fixed at the source, and the fix is
 *      documented in that file (runtime values come from the BARE entry, types
 *      stay type-only). The remaining string match is a type import.
 *
 * This is the mistake the repo keeps paying for, one layer out: inheriting a
 * documented mechanism and applying it to a different subject without
 * re-measuring. Root Cause #106's whole lesson is that an exemption list or a
 * cascade rule quoted from the spec is a CLAIM, not a check — and so is a
 * failure mode quoted from another audit's docstring.
 *
 * ## The real reason, which is sufficient on its own
 *
 * **Root Cause #18: import the module that defines the symbol.** A barrel
 * import drags all 28 modules' import graphs into the compilation unit of
 * whatever touched it, for one symbol. `"sideEffects": false` lets a bundler
 * eliminate the unused ones, but only after they have been PARSED — and build
 * memory scales with the parsed module graph, which is the binding constraint
 * on this project's deploys (a cold build sits at a ~1.1% margin against
 * Hobby's 8 GB, and 715 of 1,099 source files importing one fat barrel is
 * exactly what Root Cause #18's Phase 11 deep-import migration exists to
 * undo).
 *
 * Measured 2026-10-22: **42 files imported this barrel**, all but two of them
 * `page.tsx` server entries. All 42 now name their defining module.
 *
 * ## What it does NOT flag
 *
 * A DEEP import — `@/components/faq/FAQPageClient` — is the correct form and is
 * never flagged. Only the barrel is the subject.
 *
 * ## `@/constants` is NOT policed here
 *
 * It has the same barrel-weight argument and **395 violations across 382
 * files, 267 of them API routes** — measured by registering it and running
 * this rule once. It is left out deliberately: an audit that fails on a
 * 382-file migration nobody has been asked to do is one people disable, along
 * with its true findings. Recording the number is the useful half — the
 * governing plan called it "several existing API routes".
 *
 * 🛑 And note what the correction above means for that number: those 395 are
 * barrel-weight findings, **not** 401 hazards. Do not quote them as a security
 * exposure.
 *
 * Strict zero. No suppression marker: there is always a deep import that does
 * the same job.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

/**
 * The barrels whose import is a build-weight regression.
 *
 * 🛑 A barrel named here that no longer exists must FAIL rather than be
 * skipped — a stale registration silently stops checking the thing it names
 * while the audit keeps printing OK (Root Cause #56/#84).
 */
const BARRELS = [
  { spec: "@/components", file: "src/components/index.ts", dir: "src/components" },
];

function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === ".next") continue;
      out.push(...walk(full));
    } else if (/\.(ts|tsx)$/.test(e.name)) {
      out.push(full);
    }
  }
  return out;
}


/**
 * A multi-line `import type { … } from "…/client"` puts the specifier on a
 * later line than the `import type` keyword, so a per-line test alone would
 * misread it as a value import. Blocks are joined before testing.
 */
function clientImportKind(src) {
  const joined = src.replace(/\r?\n/g, " ");
  const valueImport = /import\s+(?!type\b)[^;]*?from\s*["']@mohasinac\/appkit\/client["']/.test(
    joined,
  );
  return valueImport ? "value" : /@mohasinac\/appkit\/client/.test(joined) ? "type-only" : "none";
}

const violations = [];

for (const barrel of BARRELS) {
  const barrelAbs = join(ROOT, barrel.file);
  if (!existsSync(barrelAbs)) {
    violations.push({
      file: barrel.file,
      line: 0,
      rule: "STALE_BARREL_REGISTRATION",
      snippet: "(registered barrel does not exist)",
      hint:
        "This barrel is registered in BARRELS and is gone. Remove the entry, or point it\n" +
        "      at the file's new home — a stale registration stops checking the thing it\n" +
        "      names while the audit still reports clean.",
    });
    continue;
  }

  /*
   * Describe the barrel honestly in the summary: how many modules it pulls in,
   * and how many of those reach the client entry for VALUES rather than types.
   * The second number exists so nobody re-derives the overclaim this audit was
   * corrected for.
   */
  const barrelSrc = readFileSync(barrelAbs, "utf8");
  const reexported = [...barrelSrc.matchAll(/from\s*"\.\/([^"]+)"/g)].map((m) => m[1]);
  let valueReaching = 0;
  for (const mod of reexported) {
    for (const ext of [".tsx", ".ts", "/index.tsx", "/index.ts"]) {
      const cand = join(ROOT, barrel.dir, mod + ext);
      if (!existsSync(cand)) continue;
      if (clientImportKind(readFileSync(cand, "utf8")) === "value") valueReaching++;
      break;
    }
  }
  barrel.valueReaching = valueReaching;
  barrel.reexportCount = reexported.length;

  const importRe = new RegExp(`from\\s*["']${barrel.spec.replace("/", "\\/")}["']`);
  for (const file of walk(join(ROOT, "src"))) {
    const rel = relative(ROOT, file).split(sep).join("/");
    if (rel === barrel.file) continue;
    const src = readFileSync(file, "utf8");
    if (!importRe.test(src)) continue;
    src.split(/\r?\n/).forEach((line, i) => {
      if (!importRe.test(line)) return;
      violations.push({
        file: rel,
        line: i + 1,
        rule: "CLIENT_BARREL_IMPORT",
        snippet: line.trim().slice(0, 120),
        hint:
          `${barrel.spec} re-exports ${barrel.reexportCount} modules, and this import drags\n` +
          "      every one of their import graphs into this file's compilation unit for the sake\n" +
          "      of one symbol. Tree-shaking removes the unused ones only AFTER parsing them, and\n" +
          "      build memory scales with the parsed graph (Root Cause #18).\n" +
          "      Import the DEFINING module instead, e.g.\n" +
          `      import { X } from "${barrel.spec}/path/to/X";`,
      });
    });
  }
}

violations.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);

if (violations.length > 0) {
  console.error(`[audit-component-barrel-import] FAIL: ${violations.length} violation(s).\n`);
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  [${v.rule}]`);
    console.error(`      ${v.snippet}`);
    console.error(`      ${v.hint}\n`);
  }
  process.exit(1);
}

const summary = BARRELS.filter((b) => b.reexportCount !== undefined)
  .map(
    (b) =>
      `${b.spec} re-exports ${b.reexportCount} module(s), ${b.valueReaching} importing appkit/client for values`,
  )
  .join("; ");
console.log(`[audit-component-barrel-import] OK: 0 violations (${summary}).`);
