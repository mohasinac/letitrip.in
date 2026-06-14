#!/usr/bin/env node
/**
 * migrate-usemutation.mjs (workstream 5 codemod)
 *
 * Replaces `useMutation(...)` calls with `useApiMutation(...)` so every
 * mutation auto-surfaces failure via the centralized error router.
 *
 * Migration is conservative:
 *  - Only touches files that import `useMutation` from "@tanstack/react-query".
 *  - Rewrites the import: drops `useMutation`, adds `useApiMutation` from
 *    "@mohasinac/appkit/client".
 *  - Renames every `useMutation(` call site to `useApiMutation(`.
 *
 * IDEMPOTENT — safe to re-run; files already migrated are skipped.
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
    else if (p.endsWith(".ts") || p.endsWith(".tsx")) out.push(p);
  }
  return out;
}
function exists(p) { try { statSync(p); return true; } catch { return false; } }

const files = [
  ...walk(join(PROJECT_ROOT, "src")),
  ...walk(join(PROJECT_ROOT, "appkit", "src")),
];

let touched = 0;

for (const file of files) {
  if (file.includes("node_modules") || file.includes(".next")) continue;
  if (file.includes("__tests__")) continue;
  if (file.endsWith("useApiMutation.ts") || file.endsWith("useApiMutation.tsx")) continue;
  if (file.endsWith("useApiQuery.ts") || file.endsWith("useApiQuery.tsx")) continue;

  let src = readFileSync(file, "utf8");
  if (!/\buseMutation\s*\(/.test(src)) continue;
  // Skip files that don't import useMutation from react-query
  if (!/from\s*"@tanstack\/react-query"/.test(src)) continue;

  const original = src;

  // 1. Strip useMutation from the @tanstack/react-query import (preserve other names).
  src = src.replace(
    /import\s*\{([^}]+)\}\s*from\s*"@tanstack\/react-query"\s*;/s,
    (match, syms) => {
      const symbols = syms.split(",").map((s) => s.trim()).filter(Boolean);
      const remaining = symbols.filter((s) => {
        const bare = s.replace(/^type\s+/, "").trim();
        return bare !== "useMutation";
      });
      if (remaining.length === symbols.length) return match; // useMutation not in this list
      if (remaining.length === 0) return ""; // drop the whole import
      return `import { ${remaining.join(", ")} } from "@tanstack/react-query";`;
    },
  );

  // 2. Add import for useApiMutation from @mohasinac/appkit/client (extend existing block if present).
  if (!/\buseApiMutation\b/.test(src)) {
    const existing = src.match(
      /import\s*\{([^}]+)\}\s*from\s*"@mohasinac\/appkit\/client"\s*;/s,
    );
    if (existing) {
      const symbols = existing[1].split(",").map((s) => s.trim()).filter(Boolean);
      if (!symbols.includes("useApiMutation")) symbols.push("useApiMutation");
      const wasMultiline = existing[0].includes("\n");
      const sorted = symbols.sort();
      const replacement = wasMultiline
        ? `import {\n  ${sorted.join(",\n  ")},\n} from "@mohasinac/appkit/client";`
        : `import { ${sorted.join(", ")} } from "@mohasinac/appkit/client";`;
      src = src.replace(existing[0], replacement);
    } else {
      // Add a new import line at the top, after any leading "use client" or comments.
      const headerMatch = src.match(/^(?:"use client"\s*;?\s*\n+)?/);
      const insertAt = headerMatch ? headerMatch[0].length : 0;
      src =
        src.slice(0, insertAt) +
        `import { useApiMutation } from "@mohasinac/appkit/client";\n` +
        src.slice(insertAt);
    }
  }

  // 3. Rename call sites: `useMutation(` → `useApiMutation(`.
  src = src.replace(/\buseMutation\s*\(/g, "useApiMutation(");

  if (src !== original) {
    writeFileSync(file, src);
    touched++;
    console.log(`[migrate-usemutation] ${file.replace(PROJECT_ROOT, "").replace(/\\/g, "/")}`);
  }
}

console.log(`\n[migrate-usemutation] DONE — touched ${touched} files.`);
