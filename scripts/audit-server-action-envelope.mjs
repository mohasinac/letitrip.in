#!/usr/bin/env node
/**
 * audit-server-action-envelope.mjs — every exported async from a "use server"
 * file must return Promise<ActionResult<...>> or Promise<void>. Catches the
 * "throws instead of envelope" regression introduced by ad-hoc server actions.
 *
 * Heuristic check (not a full AST walk): pulls the return-type annotation of
 * each `export async function ...` and asserts it matches the expected shape.
 * Functions without explicit return annotations are flagged for adoption.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function walk(dir, out = []) {
  if (!isDir(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (p.endsWith(".ts")) out.push(p);
  }
  return out;
}
function isDir(p) {
  try { return statSync(p).isDirectory(); } catch { return false; }
}

const dirs = [
  join(PROJECT_ROOT, "src", "actions"),
  join(PROJECT_ROOT, "appkit", "src", "_internal", "server", "features"),
];

const allFiles = [];
for (const d of dirs) walk(d, allFiles);

const ALLOWED_RETURN = /Promise<\s*(ActionResult<|void\b|null\b)/;

const violations = [];

for (const file of allFiles) {
  const src = readFileSync(file, "utf8");
  if (!src.startsWith('"use server"') && !src.startsWith("'use server'")) continue;

  // Find every `export async function NAME (...) : RETURN { ... }` declaration.
  const fnRegex = /export\s+async\s+function\s+(\w+)\s*\([^)]*\)\s*:\s*([^\{]+)\{/g;
  let m;
  while ((m = fnRegex.exec(src)) !== null) {
    const [, name, retType] = m;
    const trimmed = retType.trim();
    if (!ALLOWED_RETURN.test(trimmed)) {
      violations.push(
        `${file}  ${name}() returns ${trimmed.slice(0, 60)} — must be Promise<ActionResult<...>> or Promise<void>`,
      );
    }
  }

  // Functions WITHOUT explicit return annotation: accepted IF the body starts
  // with `return wrapAction(...)` (the inferred type is Promise<ActionResult<T>>).
  const fnNoRet = /export\s+async\s+function\s+(\w+)\s*\([^)]*\)\s*\{([\s\S]*?)^\}/gm;
  while ((m = fnNoRet.exec(src)) !== null) {
    const [, name, body] = m;
    const bodyTrimmed = body.trim();
    // Accept if the body's first non-comment statement is `return wrapAction(`
    const firstNonComment = bodyTrimmed
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l && !l.startsWith("//") && !l.startsWith("*"));
    if (firstNonComment && /^return\s+wrapAction\s*\(/.test(firstNonComment)) continue;
    violations.push(
      `${file}  ${name}() has no explicit return type AND body does not wrapAction — add Promise<ActionResult<...>> or wrapAction(...)`,
    );
  }
}

if (violations.length === 0) {
  console.log(`[audit-server-action-envelope] OK — all server actions return ActionResult or void.`);
  process.exit(0);
}

console.error("[audit-server-action-envelope] FAIL — server actions without uniform envelope:");
for (const v of violations.slice(0, 50)) console.error("  " + v);
if (violations.length > 50) console.error(`  ... and ${violations.length - 50} more`);
console.error(
  `\n${violations.length} violation(s). Wrap function bodies with wrapAction() and annotate return type as Promise<ActionResult<T>>.`,
);
process.exit(1);
