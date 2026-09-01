#!/usr/bin/env node
/**
 * audit-delegation-drops-options — strict-zero.
 *
 * A one-line wrapper that forwards fewer arguments than its delegate accepts.
 *
 * ## Why this exists
 *
 * `StoreRepository.listStores(model, activeOnly, opts?)` implements the full
 * `searchTxt` query — plan the terms, `array-contains` the head, refine the
 * rest. `listAllStores(model)` is its admin-facing wrapper, and its entire body
 * was:
 *
 *     return this.listStores(model, false);
 *
 * No `opts`. So the admin store list had no way to REACH the search its own
 * repository already implemented, and both it and the public store action fell
 * back to `storeName_=${q}` — a STARTS-WITH match on the name alone. "Beyblade
 * Arena" was unfindable by "arena", and every word of every store description
 * was unsearchable. The feature was written, tested, indexed and unreachable.
 *
 * Nothing flagged it. The wrapper compiles, the delegate's parameter is
 * optional, and both are correct in isolation — the defect exists only in the
 * gap between them, which is exactly the shape no type checker looks at.
 *
 * ## What it flags
 *
 * A method or function whose body is a SINGLE `return <target>(...)` where
 * `<target>` is declared in the same file and takes more parameters than the
 * wrapper passes — and where the dropped parameter is an options-shaped one
 * (`opts`, `options`, or an inline object type).
 *
 * ## Why "options-shaped" and not every dropped parameter
 *
 * A wrapper that pins a parameter is the whole point of wrapping —
 * `listAllStores` passing `false` for `activeOnly` is not a bug, it is the
 * distinction the wrapper exists to make. What is never deliberate is silently
 * discarding the caller's OPTIONS, because there is no value being pinned: the
 * capability simply becomes unreachable.
 *
 * Suppression: `// audit-delegation-drops-options-ok: <reason>`.
 *
 * Exit 0 — clean.  Exit 1 — a wrapper that hides part of its delegate.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SCAN_ROOTS = [join(ROOT, "appkit", "src"), join(ROOT, "src")];
const SKIP_DIRS = new Set(["node_modules", "dist", ".next", "out", "__tests__", "coverage"]);
const OK_RE = /\/\/\s*audit-delegation-drops-options-ok\s*:/i;

/** A parameter whose loss removes a capability rather than pinning a value. */
const OPTIONS_PARAM_RE = /^\s*(opts|options|opt)\s*\??\s*:/;

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(name)) out.push(full);
  }
  return out;
}

function blankOut(match) {
  return match.replace(/[^\n]/g, " ");
}

/** Blank comments so line numbers survive. */
function strip(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, blankOut).replace(/^\s*\/\/.*$/gm, blankOut);
}

/** Split a parameter list on top-level commas. */
function splitParams(text) {
  const out = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if ("([{<".includes(ch)) depth++;
    else if (")]}>".includes(ch)) depth--;
    else if (ch === "," && depth === 0) {
      out.push(text.slice(start, i));
      start = i + 1;
    }
  }
  const tail = text.slice(start);
  if (tail.trim()) out.push(tail);
  return out;
}

function matchingParen(src, openIdx) {
  let depth = 0;
  for (let i = openIdx; i < src.length; i++) {
    if (src[i] === "(") depth++;
    else if (src[i] === ")") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/** Every `name(params)` declaration in the file, with its parameter list. */
function declarations(src) {
  const map = new Map();
  const re = /(?:^|\n)\s*(?:export\s+)?(?:public\s+|private\s+|protected\s+)?(?:override\s+)?(?:async\s+)?(?:function\s+)?([A-Za-z_$][\w$]*)\s*\(/g;
  for (const m of re.exec ? [...src.matchAll(re)] : []) {
    const open = src.indexOf("(", m.index + m[0].length - 1);
    const close = matchingParen(src, open);
    if (close === -1) continue;
    const params = splitParams(src.slice(open + 1, close));
    // Keep the FIRST declaration; a re-declared name is an overload or a
    // different scope, and guessing between them would produce noise.
    if (!map.has(m[1])) map.set(m[1], { params, index: m.index });
  }
  return map;
}

const findings = [];
for (const root of SCAN_ROOTS) {
  for (const file of walk(root)) {
    const raw = readFileSync(file, "utf8");
    if (OK_RE.test(raw)) continue;
    const src = strip(raw);
    const decls = declarations(src);
    if (decls.size === 0) continue;

    /** A body that is exactly `{ return this.target(args); }` or `{ return target(args); }`. */
    const DELEGATE_RE =
      /\{\s*return\s+(?:this\s*\.\s*)?([A-Za-z_$][\w$]*)\s*\(([^;]*?)\)\s*;?\s*\}/g;

    for (const d of src.matchAll(DELEGATE_RE)) {
      const targetName = d[1];
      const target = decls.get(targetName);
      if (!target) continue;

      const passed = splitParams(d[2]).length;
      if (passed >= target.params.length) continue;

      const dropped = target.params.slice(passed);
      const optionsDropped = dropped.filter((p) => OPTIONS_PARAM_RE.test(p));
      if (optionsDropped.length === 0) continue;

      // Which wrapper is this? The nearest declaration above the body.
      let owner = "(anonymous)";
      let ownerIdx = -1;
      for (const [name, info] of decls) {
        if (info.index < d.index && info.index > ownerIdx) {
          ownerIdx = info.index;
          owner = name;
        }
      }
      if (owner === targetName) continue;

      findings.push({
        rel: relative(ROOT, file).replace(/\\/g, "/"),
        line: src.slice(0, d.index).split(/\r?\n/).length,
        owner,
        targetName,
        dropped: optionsDropped.map((p) => p.trim().split(/[:=]/)[0].trim()),
      });
    }
  }
}

if (findings.length > 0) {
  console.error(
    `[audit-delegation-drops-options] ${findings.length} wrapper(s) that hide part of their delegate:\n`,
  );
  for (const f of findings) {
    console.error(`  ${f.rel}:${f.line}`);
    console.error(
      `    \`${f.owner}\` forwards to \`${f.targetName}\` but drops: ${f.dropped.join(", ")}`,
    );
    console.error(
      `    Nothing can reach that capability through this wrapper. Forward it, or say in a`,
    );
    console.error(`    suppression why this caller must not have it.\n`);
  }
  process.exit(1);
}

console.log(
  "[audit-delegation-drops-options] OK — no wrapper silently drops its delegate's options.",
);
process.exit(0);
