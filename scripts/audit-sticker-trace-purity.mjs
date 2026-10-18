#!/usr/bin/env node
/*
 * WHY: The sticker tracer runs the SAME algorithm in a browser (live tuning)
 *      and in a Firebase Function (full-resolution render). That is only true
 *      while the core stays free of image-codec, Node and provider imports —
 *      one `import sharp` in there and the browser bundle breaks at build time
 *      with the Turbopack `node:` failure (CLAUDE.md Root Cause #24), the live
 *      loop dies, and the cheap browser-only fallback stops being a swap.
 *
 *      The failure is not gradual. It is a production build that stops working,
 *      discovered long after the import that caused it.
 * WHAT: Strict-zero. Nothing under the core may import outside its own tree.
 *
 * No suppression marker, deliberately. There is no legitimate reason for the
 * core to reach a codec — the seam exists precisely so it does not have to —
 * and a marker here would be the one that gets used to "just quickly" add one.
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CORE = path.join(
  ROOT,
  "appkit/src/_internal/shared/features/sticker-trace",
);

/** Anything matching these is forbidden INSIDE the core. */
const FORBIDDEN = [
  { re: /\bfrom\s+["']sharp["']/, why: "sharp is a native Node binary; the browser cannot load it" },
  { re: /\bfrom\s+["']canvas["']/, why: "canvas is a Node binding; the browser has its own" },
  { re: /\bfrom\s+["']node:/, why: "a node: builtin makes the Turbopack client build fail outright (Root Cause #24)" },
  { re: /\bfrom\s+["'][^"']*\/providers\//, why: "providers/ reaches firebase-admin" },
  { re: /\bfrom\s+["'][^"']*firebase/, why: "the core must not know about Firestore or Storage" },
  { re: /\brequire\s*\(\s*["'](sharp|canvas|fs|path)["']/, why: "a runtime require of a Node module is the same leak, hidden" },
  { re: /\bdocument\.|window\./, why: "a DOM reference means this cannot run in a Function" },
];

/**
 * A relative import that climbs ABOVE the core is a leak even when the target
 * looks harmless — it is how the first codec dependency always arrives.
 * `../types` and `./trace/x` are fine; `../../anything` is not.
 */
const ESCAPES_TREE = /\bfrom\s+["'](\.\.\/){2,}/;

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith(".ts")) out.push(full);
  }
  return out;
}

if (!fs.existsSync(CORE)) {
  console.log("audit-sticker-trace-purity: core not present, nothing to check");
  process.exit(0);
}

const violations = [];

for (const file of walk(CORE)) {
  const src = fs.readFileSync(file, "utf8");
  // Strip comments first, or this audit's own documentation of what it forbids
  // trips it — the mistake audit-sieve-date-fields had to fix for the same
  // reason (its docstring example matched its own rule).
  const code = src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");

  code.split("\n").forEach((line, i) => {
    for (const { re, why } of FORBIDDEN) {
      if (re.test(line)) {
        violations.push({ file, line: i + 1, text: line.trim(), why });
      }
    }
    if (ESCAPES_TREE.test(line)) {
      violations.push({
        file,
        line: i + 1,
        text: line.trim(),
        why: "import climbs above the core tree",
      });
    }
  });
}

const rel = (f) => path.relative(ROOT, f).replace(/\\/g, "/");

if (violations.length > 0) {
  console.error(`audit-sticker-trace-purity: ${violations.length} violation(s)\n`);
  for (const v of violations) {
    console.error(`  ${rel(v.file)}:${v.line}`);
    console.error(`    ${v.text}`);
    console.error(`    -> ${v.why}\n`);
  }
  console.error("The core is shared by the browser and a Function. Put the");
  console.error("dependency behind the ImageCodec seam instead (codec.ts).");
  process.exit(1);
}

const count = walk(CORE).length;
console.log(`audit-sticker-trace-purity: clean (${count} files, no codec/node/provider imports)`);
