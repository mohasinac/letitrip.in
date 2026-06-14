#!/usr/bin/env node
/**
 * audit-usemutation-onerror.mjs — bans `useMutation(` outside the centralized
 * `useApiMutation` wrapper. Forces every mutation through the wrapper so
 * failures auto-surface via `surfaceError` (toast + inline + reporter).
 *
 * Files that genuinely need raw useMutation (testing, scaffolding) must carry
 * a `// audit-usemutation-onerror-ok: <reason>` marker on the same line or
 * line above.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
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
function exists(p) {
  try { statSync(p); return true; } catch { return false; }
}

const ALLOW = ["useApiMutation.ts", "useApiMutation.tsx"];

const files = [
  ...walk(join(PROJECT_ROOT, "src")),
  ...walk(join(PROJECT_ROOT, "appkit", "src")),
];

const violations = [];

for (const file of files) {
  if (ALLOW.some((a) => file.endsWith(a))) continue;
  if (file.includes("node_modules") || file.includes(".next")) continue;
  if (file.includes("__tests__")) continue;

  const src = readFileSync(file, "utf8");
  const lines = src.split("\n");
  lines.forEach((line, i) => {
    if (/\buseMutation\s*\(/.test(line)) {
      const prev = i > 0 ? lines[i - 1] : "";
      if (
        /audit-usemutation-onerror-ok/.test(line) ||
        /audit-usemutation-onerror-ok/.test(prev)
      ) {
        return;
      }
      violations.push(`${file}:${i + 1}  ${line.trim()}`);
    }
  });
}

if (violations.length === 0) {
  console.log("[audit-usemutation-onerror] OK — every mutation goes through useApiMutation.");
  process.exit(0);
}

console.error("[audit-usemutation-onerror] FAIL — raw useMutation outside the wrapper:");
for (const v of violations.slice(0, 100)) console.error("  " + v);
if (violations.length > 100) console.error(`  ... and ${violations.length - 100} more`);
console.error(
  `\n${violations.length} violation(s). Use useApiMutation from @mohasinac/appkit/client instead of useMutation directly.`,
);
process.exit(1);
