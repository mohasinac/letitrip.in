#!/usr/bin/env node
/**
 * audit-silent-body-parse.mjs — bans the silent `request.json().catch(...)`
 * pattern in API routes. All bodies must go through `parseJsonBody` or
 * `createRouteHandler`'s `schema` option.
 *
 * Zero baseline. Fails the Stop hook on any regression.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (p.endsWith(".ts")) out.push(p);
  }
  return out;
}

const PATTERNS = [
  /\brequest\.json\(\)\.catch\(/,
  /\breq\.json\(\)\.catch\(/,
];

const violations = [];

for (const file of walk(join(PROJECT_ROOT, "src", "app", "api"))) {
  const src = readFileSync(file, "utf8");
  const lines = src.split("\n");
  lines.forEach((line, i) => {
    if (PATTERNS.some((p) => p.test(line))) {
      violations.push(`${file}:${i + 1}  ${line.trim()}`);
    }
  });
}

// NOTE: raw `await request.json()` is allowed because the routeHandler wrapper
// catches parse errors and emits 400 VALIDATION_FAILED. The original silent
// failure pattern was `.catch(() => ({}))` which coerced bad bodies to {} —
// that's what we ban here. Routes that want explicit ValidationError on
// malformed JSON should use parseJsonBody; routes using createRouteHandler's
// schema option are already covered.

if (violations.length === 0) {
  console.log("[audit-silent-body-parse] OK — zero silent body parses.");
  process.exit(0);
}

console.error("[audit-silent-body-parse] FAIL — silent body-parse patterns found:");
for (const v of violations) console.error("  " + v);
console.error(
  `\n${violations.length} violation(s). Use parseJsonBody(request) from @mohasinac/appkit or createRouteHandler({ schema }).`,
);
process.exit(1);
