#!/usr/bin/env node
/**
 * One-time codemod (workstream 1 sweep):
 *
 *   await request.json().catch(() => ({}))
 *   (await request.json().catch(() => ({}))) as <Type>
 *   await request.json().catch(() => null)
 *     →   await parseJsonBody(request)            (or parseJsonBody<T>(request))
 *
 * Also injects `import { parseJsonBody } from "@mohasinac/appkit"` if missing.
 * Targets every `src/app/api/**\/route.ts` file.
 *
 * Idempotent — re-runs are no-ops once the migration has landed.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (entry === "route.ts") out.push(p);
  }
  return out;
}

const files = walk(join(PROJECT_ROOT, "src", "app", "api"));

let changedFiles = 0;
let totalReplacements = 0;

for (const file of files) {
  let src = readFileSync(file, "utf8");
  const original = src;
  let replacements = 0;

  // Pattern A: `(await request.json().catch(() => ({}))) as TypeAssertion`
  src = src.replace(
    /\(\s*await\s+request\.json\(\)\.catch\(\s*\(\s*\)\s*=>\s*\(\{\}\)\s*\)\s*\)\s*as\s+([A-Za-z_$][\w$\.<>,\s\[\]\{\}:|&'"`?]+)/g,
    (_m, typeArg) => {
      replacements++;
      const trimmed = typeArg.trim();
      return `await parseJsonBody<${trimmed}>(request)`;
    },
  );

  // Pattern B: plain `await request.json().catch(() => ({}))` (no cast)
  src = src.replace(
    /await\s+request\.json\(\)\.catch\(\s*\(\s*\)\s*=>\s*\(\{\}\)\s*\)/g,
    () => {
      replacements++;
      return "await parseJsonBody(request)";
    },
  );

  // Pattern C: `await request.json().catch(() => null)` — preserve nullable semantics
  // by passing { allowEmpty: true } and threading null through type inference
  src = src.replace(
    /await\s+request\.json\(\)\.catch\(\s*\(\s*\)\s*=>\s*null\s*\)/g,
    () => {
      replacements++;
      return "await parseJsonBody(request, { allowEmpty: true })";
    },
  );

  // Pattern D: req.json().catch(() => ({}))  (a few dev mock routes use this)
  src = src.replace(
    /await\s+req\.json\(\)\.catch\(\s*\(\s*\)\s*=>\s*\(\{\}\)\s*\)/g,
    () => {
      replacements++;
      return "await parseJsonBody(req)";
    },
  );

  // If file already uses parseJsonBody (re-run after partial migration), still ensure import exists
  const usesIt = /\bparseJsonBody\s*[<(]/.test(src);
  if (replacements === 0 && !usesIt) continue;

  // Add the import if missing. The check below tests whether `parseJsonBody` is
  // listed in any `from "@mohasinac/appkit"` import block — NOT whether it's referenced
  // in the code (the codemod just inserted those references).
  const hasImport = /import\s*\{[^}]*\bparseJsonBody\b[^}]*\}\s*from\s*"@mohasinac\/appkit"/s.test(src);
  if (!hasImport) {
    const multilineAppkitImport = src.match(
      /import\s*\{([^}]+)\}\s*from\s*"@mohasinac\/appkit"\s*;/s,
    );
    if (multilineAppkitImport) {
      const symbols = multilineAppkitImport[1]
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (!symbols.includes("parseJsonBody")) {
        symbols.push("parseJsonBody");
        const sorted = symbols.sort();
        // Preserve multi-line style if original was multi-line
        const wasMultiline = multilineAppkitImport[0].includes("\n");
        const replacement = wasMultiline
          ? `import {\n  ${sorted.join(",\n  ")},\n} from "@mohasinac/appkit";`
          : `import { ${sorted.join(", ")} } from "@mohasinac/appkit";`;
        src = src.replace(multilineAppkitImport[0], replacement);
      }
    } else {
      const lastImportMatch = [...src.matchAll(/^import\s[\s\S]+?;$/gm)].pop();
      if (lastImportMatch) {
        const insertAt = lastImportMatch.index + lastImportMatch[0].length;
        src =
          src.slice(0, insertAt) +
          `\nimport { parseJsonBody } from "@mohasinac/appkit";` +
          src.slice(insertAt);
      } else {
        src = `import { parseJsonBody } from "@mohasinac/appkit";\n${src}`;
      }
    }
  }

  if (src !== original) {
    writeFileSync(file, src);
    changedFiles++;
    totalReplacements += replacements;
    const importAdded = !original.includes("parseJsonBody") && src.includes("parseJsonBody");
    console.log(
      `[migrate-body-parse] ${file.replace(PROJECT_ROOT + "/", "").replace(PROJECT_ROOT + "\\", "")} — ${replacements} replacement(s)${importAdded ? " + import added" : ""}`,
    );
  }
}

console.log(
  `\n[migrate-body-parse] DONE — ${totalReplacements} replacements across ${changedFiles} files`,
);
