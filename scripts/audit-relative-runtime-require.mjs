#!/usr/bin/env node
/**
 * audit-relative-runtime-require.mjs
 *
 * A runtime `require()` that is deliberately hidden from bundler static
 * analysis MUST use a **bare specifier**. A **relative** one is a production
 * failure that no local check can catch.
 *
 * WHY
 *   `(module as any).require(...)` is a legitimate, load-bearing idiom in this
 *   codebase: webpack/Turbopack do not trace `module.require`, which is exactly
 *   how `providers/db-firebase/admin.ts` keeps `firebase-admin` out of client
 *   bundles (CLAUDE.md Root Cause #24). Those calls pass BARE specifiers —
 *   "firebase-admin/app", "process", "@google-cloud/logging" — which Node
 *   resolves from node_modules regardless of where the bundler moved the code.
 *
 *   A RELATIVE specifier has no such guarantee. Nothing rewrites it, so at
 *   runtime it resolves against the EMITTED CHUNK rather than the source file.
 *   `appkit/src/core/unit-of-work.ts` did this:
 *
 *     (module as any).require("../providers/db-firebase")
 *
 *   which in the Lambda became `.next/server/chunks/providers/db-firebase`
 *   -> MODULE_NOT_FOUND. Every `unitOfWork.runBatch` / `runTransaction` threw
 *   before touching Firestore: bid placement and Razorpay checkout
 *   finalization were both dead in production. It also fails a second,
 *   independent way — appkit is `"type": "module"` and the target is a
 *   DIRECTORY, and ESM has no index.js directory-resolution fallback.
 *
 *   `tsc` copies the string through verbatim (it is not a module reference to
 *   the compiler), `npm run check` passes, and a full `next build` passes. Only
 *   running the code in a Lambda reveals it.
 *
 * THE RULE
 *   A **property-access** require — `module.require(...)`,
 *   `(module as any).require(...)` — must not take a relative specifier.
 *
 * SCOPE — deliberately narrow, so the audit stays signal. Three things are
 * NOT flagged, each for a specific reason:
 *
 *   - **Bare `require("../x")`.** webpack and Turbopack DO statically analyse a
 *     literal-string `require()` and bundle the target, so the specifier is
 *     resolved at build time and the relative path is safe. That is precisely
 *     what `module.require` exists to evade, and precisely why only the
 *     property-access form is dangerous. `src/lib/appkit-config.ts`'s
 *     `require("../../appkit.config.js")` is correct and must stay unflagged.
 *   - **`await import("../x")`.** Real dynamic imports are traced and
 *     rewritten; `appkit/src/security/rbac/server.ts` relies on this.
 *   - **Bare specifiers** ("firebase-admin/app", "process"). The working
 *     pattern — Node resolves them from node_modules wherever the code lands.
 *
 *   `.mjs`/`.cjs` are also out of scope — not bundled, so `__dirname`-relative
 *   resolution there is stable.
 *
 * THE FIX
 *   Use a static `import` (almost always correct — check whether the module is
 *   already in the graph before assuming the lazy form buys anything; in the
 *   unit-of-work case it was already imported statically by 19 sibling
 *   repositories), or `await import()`, or a bare package specifier.
 *
 * Strict-zero. Suppression:
 *   `// audit-relative-runtime-require-ok: <reason>`
 * on the offending line or in the contiguous comment block directly above it.
 *
 * NOTE ON PARSING: the scan runs over a comment- and string-stripped copy of
 * the source, so a `require("../x")` written inside a docstring or an example
 * string cannot produce a false positive. The specifier is then recovered from
 * the raw line.
 *
 * Exits 0 when violations === 0, 1 on any regression.
 */

const BASELINE = 0;

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SCAN_DIRS = [join(ROOT, "src"), join(ROOT, "appkit", "src")];

const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  "dist",
  "build",
  "coverage",
  "__tests__",
  "__mocks__",
  ".claude",
  ".git",
]);

const SUPPRESSION = "audit-relative-runtime-require-ok";

/** Strip line comments, block comments and string/template literals. */
function stripNoise(src) {
  let out = "";
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    const next = src[i + 1];
    if (c === "/" && next === "/") {
      while (i < n && src[i] !== "\n") {
        out += src[i] === "\n" ? "\n" : " ";
        i++;
      }
      continue;
    }
    if (c === "/" && next === "*") {
      i += 2;
      while (i < n && !(src[i] === "*" && src[i + 1] === "/")) {
        out += src[i] === "\n" ? "\n" : " ";
        i++;
      }
      i += 2;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      const quote = c;
      // Preserve the literal so the specifier stays readable, but neutralise
      // any comment/quote characters inside it.
      out += c;
      i++;
      while (i < n && src[i] !== quote) {
        if (src[i] === "\\") {
          out += " ";
          i++;
        }
        out += src[i] === "\n" ? "\n" : src[i];
        i++;
      }
      out += quote;
      i++;
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

/**
 * A property-access require whose specifier is relative:
 *   module.require("./x") | (module as any).require("../x")
 *
 * `\s*` around the parts absorbs the line breaks Prettier inserts when the call
 * wraps — which is exactly how the unit-of-work instance was formatted, and
 * a single-line-only regex would have missed it entirely.
 *
 * A bare `require("../x")` is deliberately NOT matched (see SCOPE above).
 */
const RE = new RegExp(
  String.raw`\.\s*require\s*\(\s*(["'])(\.{1,2}\/[^"']*)\1`,
  "g",
);

function isSuppressed(lines, lineNo) {
  const self = lines[lineNo - 1] ?? "";
  if (self.includes(SUPPRESSION)) return true;
  for (let i = lineNo - 2; i >= 0; i--) {
    const t = (lines[i] ?? "").trim();
    if (t === "") continue;
    if (!t.startsWith("//") && !t.startsWith("*") && !t.startsWith("/*")) break;
    if (t.includes(SUPPRESSION)) return true;
  }
  return false;
}

function walk(dir, files) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return files;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) walk(full, files);
    else if (/\.(ts|tsx)$/.test(entry) && !/\.(test|spec)\.tsx?$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

const violations = [];

for (const dir of SCAN_DIRS) {
  for (const file of walk(dir, [])) {
    let src;
    try {
      src = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    if (!src.includes("require")) continue;

    const clean = stripNoise(src);
    const lines = src.split("\n");

    RE.lastIndex = 0;
    let m;
    while ((m = RE.exec(clean)) !== null) {
      const line = clean.slice(0, m.index).split("\n").length;
      if (isSuppressed(lines, line)) continue;
      violations.push({
        file: relative(ROOT, file).replace(/\\/g, "/"),
        line,
        specifier: m[2],
      });
    }
  }
}

if (violations.length > 0) {
  console.error(
    `\n[audit-relative-runtime-require] ${violations.length} violation(s) — runtime require() with a RELATIVE specifier:\n`,
  );
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  require("${v.specifier}")`);
  }
  console.error(
    `\n  A runtime require() is invisible to the bundler by design, so nothing rewrites\n` +
      `  the specifier. A relative one is then resolved against the EMITTED CHUNK, not the\n` +
      `  source file — in a Lambda that is .next/server/chunks/..., so it MODULE_NOT_FOUNDs.\n` +
      `  tsc, npm run check and next build all pass; only running the code reveals it.\n\n` +
      `  Bare specifiers ("firebase-admin/app", "process") are fine and are NOT flagged —\n` +
      `  Node resolves those from node_modules wherever the code ends up.\n\n` +
      `  Fix: use a static import (check first whether the module is already in the graph —\n` +
      `  the lazy form often buys nothing), or await import(), or a bare specifier.\n\n` +
      `  Genuine exception? Add: // ${SUPPRESSION}: <reason>\n`,
  );
  console.error(`Baseline: ${BASELINE}. Found: ${violations.length}.\n`);
  process.exit(1);
}

console.log("[audit-relative-runtime-require] OK — 0 violations");
process.exit(0);
