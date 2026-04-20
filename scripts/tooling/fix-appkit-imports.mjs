/**
 * Rewrites all deep @mohasinac/appkit/* subpath imports to flat barrels:
 *   @mohasinac/appkit/features/*  → @mohasinac/appkit  (server RSCs)
 *   @mohasinac/appkit/ui          → @mohasinac/appkit
 *   @mohasinac/appkit/constants   → @mohasinac/appkit
 *   @mohasinac/appkit/validation  → @mohasinac/appkit
 *   @mohasinac/appkit/react       → @mohasinac/appkit/client (hooks/providers are client-only)
 *   @mohasinac/appkit/providers/firebase-client → @mohasinac/appkit/client
 *
 * Client-only symbols that end up in the flat @mohasinac/appkit import are left
 * as-is because server.ts re-exports them too (they are isomorphic wrappers).
 *
 * Run: node scripts/tooling/fix-appkit-imports.mjs
 */
import { readdirSync, statSync, readFileSync, writeFileSync } from "fs";
import { join, extname } from "path";

const SRC = new URL("../../src", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");

// Subpaths that should resolve to the flat @mohasinac/appkit barrel
const TO_MAIN = [
  /^@mohasinac\/appkit\/features\//,
  /^@mohasinac\/appkit\/ui$/,
  /^@mohasinac\/appkit\/constants$/,
  /^@mohasinac\/appkit\/validation$/,
];

// Subpaths that should resolve to @mohasinac/appkit/client
const TO_CLIENT = [
  /^@mohasinac\/appkit\/react$/,
  /^@mohasinac\/appkit\/providers\/firebase-client$/,
];

function walk(dir) {
  const entries = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) entries.push(...walk(full));
    else if ([".ts", ".tsx"].includes(extname(name))) entries.push(full);
  }
  return entries;
}

// Merge import lines that have the same target path
// e.g. two consecutive `import { A } from "@mohasinac/appkit"` become one
function mergeImports(source) {
  // Match named import lines (handles multi-line imports spanning lines with { ... })
  // We do a line-by-line pass collecting contiguous import groups by path
  const lines = source.split("\n");
  const result = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    // Single-line named import: import { ... } from "..."
    const single = line.match(/^(import\s+(?:type\s+)?)\{([^}]+)\}\s+from\s+("(?:[^"]+)"|'(?:[^']+)')/);
    if (single) {
      const prefix = single[1];
      const isType = /^import\s+type\s+/.test(prefix);
      const path = single[3];
      // Collect all consecutive imports from the same path
      let names = single[2];
      let j = i + 1;
      while (j < lines.length) {
        const next = lines[j];
        const nextMatch = next.match(/^import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+("(?:[^"]+)"|'(?:[^']+)')/);
        if (nextMatch && nextMatch[2] === path) {
          const nextIsType = /^import\s+type\s+/.test(next);
          if (nextIsType === isType) {
            names += ", " + nextMatch[1];
            j++;
            continue;
          }
        }
        break;
      }
      if (j > i + 1) {
        // Deduplicate and sort names
        const unique = [...new Set(names.split(",").map(n => n.trim()).filter(Boolean))].sort();
        result.push(`${prefix}{ ${unique.join(", ")} } from ${path}`);
        i = j;
        continue;
      }
    }
    result.push(line);
    i++;
  }
  return result.join("\n");
}

let totalFiles = 0;
let totalChanges = 0;

for (const file of walk(SRC)) {
  const original = readFileSync(file, "utf8");
  let source = original;

  // Replace import paths
  source = source.replace(
    /from\s+("(@mohasinac\/appkit\/[^"]+)"|'(@mohasinac\/appkit\/[^']+)')/g,
    (match, _quoted, dq, sq) => {
      const path = dq || sq;
      const quote = dq ? '"' : "'";
      if (TO_MAIN.some(r => r.test(path))) {
        return `from ${quote}@mohasinac/appkit${quote}`;
      }
      if (TO_CLIENT.some(r => r.test(path))) {
        return `from ${quote}@mohasinac/appkit/client${quote}`;
      }
      return match;
    }
  );

  if (source !== original) {
    writeFileSync(file, source, "utf8");
    totalFiles++;
    totalChanges++;
    console.log("Updated:", file.replace(SRC, "src"));
  }
}

console.log(`\nDone. Updated ${totalFiles} files.`);
