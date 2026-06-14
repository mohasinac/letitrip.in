#!/usr/bin/env node
/**
 * migrate-server-actions.mjs (workstream 3 codemod)
 *
 * Walks every "use server" file under src/actions and appkit/src/_internal/server/features/<x>/actions.ts
 * and wraps each exported async function body in wrapAction(...).
 *
 * IDEMPOTENT — a second run is a no-op (skips files that already import wrapAction
 * and have wrapped bodies).
 *
 * Note: this is a heuristic codemod. After running, run tsc to surface any
 * type-mismatch sites (callers now receive ActionResult<T> instead of T directly).
 * Hand-fix the consumers — there's no safe automated rewrite for the destructure
 * pattern across 200+ call sites.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function walk(dir, out = []) {
  if (!exists(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (entry === "actions.ts" || entry.endsWith(".actions.ts")) out.push(p);
  }
  return out;
}
function exists(p) { try { statSync(p); return true; } catch { return false; } }

const files = [
  ...walk(join(PROJECT_ROOT, "src", "actions")),
  ...walk(join(PROJECT_ROOT, "appkit", "src", "_internal", "server", "features")),
];

let touched = 0;

for (const file of files) {
  let src = readFileSync(file, "utf8");
  // Must be a server-action file
  if (!/^("use server"|'use server')/.test(src)) continue;

  let mutated = false;

  // Pass 1: inject the import if missing.
  if (!/\bwrapAction\b/.test(src)) {
    // Add after the use-server directive's blank line. We don't reach into existing
    // imports — many files do `import { X } from "@mohasinac/appkit/server"` which
    // is exactly where wrapAction lives.
    const directiveMatch = src.match(/^("use server"|'use server')\s*;?\s*\n/);
    if (directiveMatch) {
      // If there's an existing import from @mohasinac/appkit/server, extend it.
      const existing = src.match(
        /import\s*\{([^}]+)\}\s*from\s*"@mohasinac\/appkit\/server"\s*;/s,
      );
      if (existing) {
        const symbols = existing[1].split(",").map((s) => s.trim()).filter(Boolean);
        if (!symbols.includes("wrapAction")) symbols.push("wrapAction");
        if (!symbols.includes("ActionResult")) symbols.push("ActionResult");
        const wasMultiline = existing[0].includes("\n");
        const sorted = symbols.sort();
        const replacement = wasMultiline
          ? `import {\n  ${sorted.join(",\n  ")},\n} from "@mohasinac/appkit/server";`
          : `import { ${sorted.join(", ")} } from "@mohasinac/appkit/server";`;
        src = src.replace(existing[0], replacement);
        mutated = true;
      } else {
        // Insert a new import line right after the directive
        const insertAt = directiveMatch.index + directiveMatch[0].length;
        src =
          src.slice(0, insertAt) +
          `import { wrapAction, type ActionResult } from "@mohasinac/appkit/server";\n` +
          src.slice(insertAt);
        mutated = true;
      }
    }
  }

  // Pass 2: rewrite each `export async function NAME(...): Promise<T> { ... }` body
  // to `: Promise<ActionResult<T>> { return wrapAction(async () => { ... old body ... }); }`
  // Conservative: only handles single-line return-type annotations and matches the
  // outermost braces by counting. Skip arrow-function exports for safety.

  function rewriteFunctions(input) {
    let cursor = 0;
    let output = "";
    // Match `export async function NAME(<params>): Promise<INNER> {`.
    // <params> may include nested parens; <INNER> may include nested angle brackets.
    // We hand-roll the parser: find "export async function NAME(", scan to matching
    // ')' for params, expect ': Promise<', scan to matching '>' for inner, expect '{'.
    const headRe = /export\s+async\s+function\s+(\w+)\s*\(/g;
    let m;
    let localChanged = false;
    while ((m = headRe.exec(input)) !== null) {
      const [headMatch, name] = m;
      const headStart = m.index;
      // After the opening '(', scan for matching ')'
      let i = headStart + headMatch.length;
      let parenDepth = 1;
      while (i < input.length && parenDepth > 0) {
        const ch = input[i];
        if (ch === "(") parenDepth++;
        else if (ch === ")") parenDepth--;
        i++;
      }
      const paramsEnd = i - 1; // points at ')'
      const params = input.slice(headStart + headMatch.length, paramsEnd);

      // Expect optional whitespace, then ': Promise<' or directly '{' (inferred return type).
      const afterParens = input.slice(i);
      const promiseM = afterParens.match(/^\s*:\s*Promise<\s*/);
      let retInner;
      let bodyStartLocal;
      if (promiseM) {
        const innerStart = i + promiseM[0].length;
        let angleDepthLocal = 1;
        let jLocal = innerStart;
        while (jLocal < input.length && angleDepthLocal > 0) {
          const ch = input[jLocal];
          if (ch === "<") angleDepthLocal++;
          else if (ch === ">") angleDepthLocal--;
          jLocal++;
        }
        const innerEndLocal = jLocal - 1;
        retInner = input.slice(innerStart, innerEndLocal);
        const restAfterInnerLocal = input.slice(jLocal);
        const braceMLocal = restAfterInnerLocal.match(/^\s*\{/);
        if (!braceMLocal) continue;
        bodyStartLocal = jLocal + braceMLocal[0].length;
      } else {
        // No explicit return type — body should be followed by '{'.
        const braceMLocal = afterParens.match(/^\s*\{/);
        if (!braceMLocal) continue;
        retInner = "unknown"; // inferred — we don't know the type, so use unknown
        bodyStartLocal = i + braceMLocal[0].length;
      }

      // Scan to matching closing brace from bodyStartLocal
      let depth = 1;
      let k = bodyStartLocal;
      while (k < input.length && depth > 0) {
        const ch = input[k];
        if (ch === "{") depth++;
        else if (ch === "}") depth--;
        k++;
      }
      const bodyEnd = k - 1;
      const body = input.slice(bodyStartLocal, bodyEnd).trim();
      const afterBody = k;

      // Skip if body already wraps with wrapAction
      if (/^return\s+wrapAction\s*\(/.test(body)) {
        output += input.slice(cursor, afterBody);
        cursor = afterBody;
        continue;
      }
      // Skip if return type is already ActionResult / void / null
      const retClean = retInner.trim();
      if (/^ActionResult</.test(retClean) || /^void\b/.test(retClean) || /^null\b/.test(retClean)) {
        output += input.slice(cursor, afterBody);
        cursor = afterBody;
        continue;
      }

      const newHead = `export async function ${name}(${params}): Promise<ActionResult<${retClean}>> {`;
      const newBody = `\n  return wrapAction(async () => {\n${body
        .split("\n")
        .map((l) => "    " + l)
        .join("\n")}\n  });\n`;
      output += input.slice(cursor, headStart);
      output += newHead + newBody + "}";
      cursor = afterBody;
      localChanged = true;
      // Continue searching after the function we just rewrote.
      headRe.lastIndex = afterBody;
    }
    output += input.slice(cursor);
    return { src: output, changed: localChanged };
  }

  const rewrite = rewriteFunctions(src);
  if (rewrite.changed) {
    src = rewrite.src;
    mutated = true;
  }

  if (mutated) {
    writeFileSync(file, src);
    touched++;
    console.log(`[migrate-server-actions] ${file.replace(PROJECT_ROOT, "").replace(/\\/g, "/")}`);
  }
}

console.log(`\n[migrate-server-actions] DONE — touched ${touched} of ${files.length} server-action files.`);
