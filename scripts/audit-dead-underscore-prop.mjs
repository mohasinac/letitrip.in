#!/usr/bin/env node
/**
 * audit-dead-underscore-prop — strict-zero.
 *
 * Catches the exact defect class that caused two real bugs in this codebase:
 *   - `appkit/src/features/shell/FormShell.tsx`: `schema: _schema` destructured
 *     from props, then never referenced again — the schema was silently
 *     discarded instead of driving validation.
 *   - `appkit/src/features/shell/StepForm.tsx`: `const [fieldErrors, _setFieldErrors]
 *     = useState(...)` — the setter was never called, so `fieldErrors` was
 *     permanently `{}`.
 *
 * A `_`-prefixed binding is a normal, intentional convention for "I must
 * accept this but don't need it" (e.g. `catch (_err) { void normalizeError(_err); }`
 * — note `_err` IS referenced again there). This audit does NOT flag every
 * `_`-prefixed name; it flags one that is bound (via an object-destructure
 * alias `{ real: _alias }` or an array-destructure `const [a, _b] = useState(...)`)
 * and then never appears again anywhere else in the file — i.e. a binding
 * that isn't even used to satisfy a lint rule, just silently dropped.
 *
 * Deliberate carve-out: `{ omit: _omit, ...rest }` — an object-destructure
 * alias whose enclosing `{...}` also contains a rest element. This is the
 * idiomatic "strip these fields before using/spreading the remainder"
 * pattern (e.g. stripping identity fields before cloning a document, or
 * stripping motion-only props before spreading the rest onto a DOM node) —
 * a real, common, and INTENTIONALLY-unused binding, structurally distinct
 * from the two bug-class destructures this audit targets (neither of which
 * had a rest element; the alias was meant to be used directly, not omitted).
 *
 * Scope: src/ + appkit/src/.
 *
 * Per-occurrence escape hatch: `// audit-dead-underscore-prop-ok: <reason>`
 * on the same line or the line immediately before.
 *
 * Exit 0 — clean.
 * Exit 1 — dead underscore-prefixed bindings found.
 *
 * Known limitation (documented, not a defect): this is regex-based, not an
 * AST walk. Multi-line destructures, nested destructures, and re-declarations
 * of the same alias name in different scopes within one file can produce
 * false negatives or (rarely) false positives. Triaged/suppressed on first
 * real-codebase run rather than assumed clean.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SCAN = [join(ROOT, "src"), join(ROOT, "appkit", "src")];
const SKIP = new Set(["node_modules", "dist", ".next", ".git"]);
const EXTS = new Set([".ts", ".tsx"]);
const SUPPRESS_RE = /(?:\/\/|\/\*)\s*audit-dead-underscore-prop-ok\b/;

// { real: _alias }  — object destructure alias to an underscore-prefixed name.
const OBJECT_ALIAS_RE = /\b([A-Za-z_$][\w$]*)\s*:\s*(_[A-Za-z_$][\w$]*)\b/g;
// const [a, _b] = useState(...)  — array destructure, second element aliased.
const ARRAY_ALIAS_RE = /\bconst\s*\[\s*[A-Za-z_$][\w$]*\s*,\s*(_[A-Za-z_$][\w$]*)\s*\]\s*=/g;

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (SKIP.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if ([...EXTS].some((x) => e.name.endsWith(x))) out.push(full);
  }
  return out;
}

function countOccurrences(src, name) {
  const re = new RegExp(`\\b${name.replace(/\$/g, "\\$")}\\b`, "g");
  return (src.match(re) || []).length;
}

function lineOf(src, index) {
  return src.slice(0, index).split("\n").length;
}

// Finds the innermost {...} range enclosing `pos` via simple brace counting
// (not string/comment-aware — consistent with this audit's documented
// regex-heuristic limitations). Returns null if unbalanced/not found.
function findEnclosingBraceRange(src, pos) {
  let depth = 0;
  let start = -1;
  for (let i = pos; i >= 0; i--) {
    const ch = src[i];
    if (ch === "}") depth++;
    else if (ch === "{") {
      if (depth === 0) { start = i; break; }
      depth--;
    }
  }
  if (start === -1) return null;
  depth = 0;
  for (let i = start; i < src.length; i++) {
    const ch = src[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return [start, i];
    }
  }
  return null;
}

const REST_ELEMENT_RE = /\.\.\.\s*[A-Za-z_$][\w$]*/;

function isOmitAndSpreadPattern(src, matchIndex) {
  const range = findEnclosingBraceRange(src, matchIndex);
  if (!range) return false;
  return REST_ELEMENT_RE.test(src.slice(range[0], range[1]));
}

// A suppression marker can sit on the declaration line itself, or anywhere in
// a (possibly multi-line, word-wrapped) `//` comment block immediately above
// it — walk upward through contiguous `//`-only lines rather than checking
// just one line back, so a wrapped explanation doesn't defeat the marker.
const LINE_COMMENT_ONLY_RE = /^\s*\/\//;

function isSuppressed(lines, lineNo) {
  const idx = lineNo - 1;
  if (SUPPRESS_RE.test(lines[idx] ?? "")) return true;
  let i = idx - 1;
  while (i >= 0 && LINE_COMMENT_ONLY_RE.test(lines[i] ?? "")) {
    if (SUPPRESS_RE.test(lines[i])) return true;
    i--;
  }
  return false;
}

const violations = [];

for (const root of SCAN) {
  try { statSync(root); } catch { continue; }
  for (const file of walk(root)) {
    const raw = readFileSync(file, "utf8");
    // Strip comments/strings loosely for occurrence counting only where it
    // matters (the alias declaration itself is matched against raw source;
    // occurrence counting intentionally scans the FULL raw source, since a
    // real "still used" reference could legitimately appear inside a
    // template literal or elsewhere the declaration regexes wouldn't match).
    const lines = raw.split("\n");
    const seen = new Set();

    for (const re of [OBJECT_ALIAS_RE, ARRAY_ALIAS_RE]) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(raw))) {
        const alias = re === OBJECT_ALIAS_RE ? m[2] : m[1];
        const declLine = lineOf(raw, m.index);
        const key = `${alias}@${declLine}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const total = countOccurrences(raw, alias);
        if (total > 1) continue; // referenced again somewhere — not dead
        if (isSuppressed(lines, declLine)) continue;
        if (re === OBJECT_ALIAS_RE && isOmitAndSpreadPattern(raw, m.index)) continue;

        const rel = relative(ROOT, file).replace(/\\/g, "/");
        violations.push(
          `${rel}:${declLine} :: \`${alias}\` is bound and never referenced again anywhere else in the file`,
        );
      }
    }
  }
}

if (violations.length === 0) process.exit(0);
console.error("\n[audit-dead-underscore-prop] STRICT-ZERO violation(s):\n");
for (const v of violations) console.error(`  - ${v}`);
console.error(`\nTotal: ${violations.length}\n`);
process.exit(1);
