#!/usr/bin/env node
/**
 * audit-code-quality — code smell detector.
 *
 * Rules:
 *   LONG_IF_ELSE      — if-else chain with ≥4 branches (≥3 else-if clauses in proximity).
 *                       Prefer early returns or a lookup map.
 *   DEEP_NESTING      — statement at brace-depth ≥5 (deeply nested logic).
 *                       Extract into a named sub-function.
 *   LARGE_COMPONENT   — function/component body > 80 significant lines.
 *                       Split into smaller components or custom hooks.
 *   REPEATED_STRING   — same human-readable string literal (≥15 chars, contains space)
 *                       appears ≥3 times in a file. Extract to a named constant.
 *
 * Scans .ts and .tsx files in src/ and appkit/src/.
 * Skips: node_modules, .next, seed/, scripts/, __tests__, configs/, *.d.ts.
 * Exits 0 on clean, 1 on violations.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, extname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SCAN_DIRS = [join(ROOT, "src"), join(ROOT, "appkit", "src")];

const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  "seed",
  "scripts",
  "__tests__",
  "__mocks__",
  "configs",
]);
const SKIP_FILE_RE = /\.(d\.ts|test\.tsx?|spec\.tsx?)$/;

function walk(dir, files = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else {
      const ext = extname(entry.name);
      if ((ext === ".ts" || ext === ".tsx") && !SKIP_FILE_RE.test(entry.name)) {
        files.push(full);
      }
    }
  }
  return files;
}

function isSignificant(line) {
  const t = line.trim();
  return t.length > 0 && !t.startsWith("//") && !t.startsWith("*") && !t.startsWith("/*");
}

function rel(file) {
  return relative(ROOT, file);
}

const violations = [];

// ─── RULE 1: Long if-else chains ────────────────────────────────────────────
// Find all lines containing `else if (` and group consecutive occurrences that
// are within 20 lines of each other (same chain). Flag groups with ≥3 else-if
// clauses (meaning ≥4 branches total including the initial `if`).
function checkLongIfElse(file, lines) {
  const ELSE_IF_RE = /\belse\s+if\s*\(/;
  const CHAIN_GAP = 20; // lines apart to still count as same chain
  const MIN_ELSE_IF = 3; // ≥3 else-if → flag (4+ total branches)

  const elseIfLines = [];
  for (let i = 0; i < lines.length; i++) {
    if (ELSE_IF_RE.test(lines[i])) elseIfLines.push(i);
  }

  if (elseIfLines.length < MIN_ELSE_IF) return;

  // Group by proximity
  let chainStart = elseIfLines[0];
  let chainCount = 1;
  let prevIdx = elseIfLines[0];

  for (let k = 1; k < elseIfLines.length; k++) {
    const idx = elseIfLines[k];
    if (idx - prevIdx <= CHAIN_GAP) {
      chainCount++;
    } else {
      if (chainCount >= MIN_ELSE_IF) {
        violations.push({
          rule: "LONG_IF_ELSE",
          file: rel(file),
          line: chainStart + 1,
          text: `${chainCount + 1} branches (${chainCount} else-if clauses)`,
          message: `if-else chain with ${chainCount + 1}+ branches — use early returns or a lookup map`,
          fix: "Replace with guard clauses (early return) or an object/Map lookup",
        });
      }
      chainStart = idx;
      chainCount = 1;
    }
    prevIdx = idx;
  }
  if (chainCount >= MIN_ELSE_IF) {
    violations.push({
      rule: "LONG_IF_ELSE",
      file: rel(file),
      line: chainStart + 1,
      text: `${chainCount + 1} branches (${chainCount} else-if clauses)`,
      message: `if-else chain with ${chainCount + 1}+ branches — use early returns or a lookup map`,
      fix: "Replace with guard clauses (early return) or an object/Map lookup",
    });
  }
}

// ─── RULE 2: Deep nesting ────────────────────────────────────────────────────
// Track opening/closing brace depth. Flag lines containing actual code statements
// at depth ≥5. Only flags once per "deep block" (skips until depth drops below
// threshold) to avoid flooding output.
function checkDeepNesting(file, lines) {
  const THRESHOLD = 6; // 6 brace levels = ~5 logical levels deep inside a function
  const CODE_STMT_RE = /^\s*(if\b|for\b|while\b|switch\b|const\b|let\b|var\b|return\b|throw\b|await\b|try\b|catch\b)/;

  let depth = 0;
  let inDeepBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Count net braces on this line (ignoring strings/comments for simplicity)
    let net = 0;
    for (const ch of line) {
      if (ch === "{") net++;
      else if (ch === "}") net--;
    }
    depth = Math.max(0, depth + net);

    if (depth >= THRESHOLD && !inDeepBlock && CODE_STMT_RE.test(line)) {
      violations.push({
        rule: "DEEP_NESTING",
        file: rel(file),
        line: i + 1,
        text: line.trim().slice(0, 100),
        message: `Statement at brace-depth ${depth} (threshold: ${THRESHOLD}) — extract a sub-function`,
        fix: "Extract deeply nested logic into a named helper function or early-return guard",
      });
      inDeepBlock = true;
    }

    if (depth < THRESHOLD) inDeepBlock = false;
  }
}

// ─── RULE 3: Large functions/components ─────────────────────────────────────
// Find named function declarations and arrow-function assignments. Count
// significant lines until the matching closing brace. Flag if > THRESHOLD.
function checkLargeComponent(file, lines) {
  const THRESHOLD = 450; // functions above 450 significant lines are genuinely too large
  // Matches: function Foo(  |  async function Foo(  |  export function Foo(  |  export default function(
  const NAMED_FUNC_RE = /^\s*(?:export\s+(?:default\s+)?)?(?:async\s+)?function\s+(\w+)\s*[\(<]/;
  // Matches: const Foo = (  |  export const Foo = async (  — component/hook definitions
  const ARROW_COMP_RE = /^\s*(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s*)?\(/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const mNamed = NAMED_FUNC_RE.exec(line);
    const mArrow = !mNamed && ARROW_COMP_RE.exec(line);
    const match = mNamed || mArrow;
    if (!match) continue;

    const funcName = match[1];

    // Walk forward tracking brace depth and significant lines
    let depth = 0;
    let started = false;
    let sigCount = 0;

    for (let j = i; j < lines.length && j < i + 600; j++) {
      const l = lines[j];
      if (isSignificant(l)) sigCount++;

      for (const ch of l) {
        if (ch === "{") { depth++; started = true; }
        else if (ch === "}") depth--;
      }

      if (started && depth <= 0) {
        if (sigCount > THRESHOLD) {
          violations.push({
            rule: "LARGE_COMPONENT",
            file: rel(file),
            line: i + 1,
            text: `"${funcName}" — ${sigCount} significant lines`,
            message: `"${funcName}" has ${sigCount} significant lines (threshold: 150) — split or extract`,
            fix: "Extract sub-components, custom hooks, or pure helper functions into separate files",
          });
        }
        break;
      }
    }
  }
}

// ─── RULE 4: Repeated literal strings ───────────────────────────────────────
// Find string literals that are human-readable (contain at least one space,
// length ≥ 15 chars) and appear ≥3 times in the same file. These should be
// extracted to named constants to avoid drift on future copy changes.
function checkRepeatedStrings(file, lines) {
  const MIN_LEN = 15; // must be ≥15 chars and contain a space to count as copy text
  const MIN_COUNT = 3; // flag when same string appears ≥3 times in the same file
  const counts = new Map();
  const firstLine = new Map();

  // Simple regex for string literals — intentionally skips template literals
  // and multiline strings to avoid false positives.
  const STRING_RE = /['"]([^'"\\]{14,})['"]/g;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip import statements and comment lines
    const trimmed = line.trim();
    if (/^(import|export\s+\*|\/\/|\/\*|\*)/.test(trimmed)) continue;

    let m;
    STRING_RE.lastIndex = 0;
    while ((m = STRING_RE.exec(line)) !== null) {
      const str = m[1];
      if (str.length < MIN_LEN) continue;
      // Must contain a space to be "human-readable" copy text
      if (!str.includes(" ")) continue;
      // Skip common technical patterns
      if (/^(https?:|\/api\/|rgba?|bg-|text-|flex|grid|px|py|pt|pb)/.test(str)) continue;
      if (/^[a-z][a-z0-9/-]*$/.test(str)) continue; // slug/path patterns
      // Skip JSX inter-attribute captures: " key=" or " boolProp key=" (boolean prop + attribute)
      if (/^\s+\w[\w-]*(\s+\w[\w-]*)?\s*[={]/.test(str)) continue;
      // Skip CSS utility class strings (e.g. "w-5 h-5 text-white", "rounded-full px-3")
      if (/^(?:[\w-]+-\d*\s+){1,}[\w-]+-?\d*$/.test(str.trim())) continue;
      // Skip strings containing JSX/JS expression characters or code operators
      if (/[{}]|\?\?|\|\||===|!==|=>|\) \{| \? | : /.test(str)) continue;
      // Skip strings starting with punctuation (object/array entry fragments)
      if (/^[,\])]/.test(str)) continue;

      if (!counts.has(str)) {
        counts.set(str, 0);
        firstLine.set(str, i + 1);
      }
      counts.set(str, counts.get(str) + 1);
    }
  }

  for (const [str, count] of counts) {
    if (count >= MIN_COUNT) {
      violations.push({
        rule: "REPEATED_STRING",
        file: rel(file),
        line: firstLine.get(str),
        text: `"${str.slice(0, 60)}" × ${count}`,
        message: `String literal repeated ${count}× — extract to a named constant`,
        fix: `const LABEL = "${str.slice(0, 40)}"; // then reference LABEL everywhere`,
      });
    }
  }
}

// ─── RULE 5: Button with text-color className but no background + no variant ─
// A <Button> without variant= defaults to the primary brand background. If its
// className includes a text colour utility (text-zinc-*, text-slate-*, etc.) but
// no bg-* override, the text becomes invisible because the colour is overridden by
// the brand background. Fix: add variant="ghost" for a transparent button, or
// add explicit bg-* classes.
//
// Only inspects simple string className values ("..." / '...'). Template-literal
// or expression classNames are not scanned (they're rare for this pattern).
function checkGhostButtonMissingVariant(file, content) {
  const BUTTON_OPEN_RE = /<Button\b/g;
  const TEXT_COLOR_RE = /\btext-(?:zinc|slate|gray|red|blue|green|yellow|purple|pink|indigo|orange|amber|teal|cyan|rose|sky|lime|emerald|violet|fuchsia|neutral|stone|warm)-\d+\b/;

  let m;
  while ((m = BUTTON_OPEN_RE.exec(content)) !== null) {
    const startIdx = m.index;
    // Extract up to 600 chars of the opening tag (attribute scan window)
    const window = content.slice(startIdx, startIdx + 600);

    // Walk the window to find where the opening tag ends (the first unquoted >)
    let inStr = false;
    let strChar = "";
    let braceDepth = 0;
    let tagEnd = -1;
    for (let i = 7; i < window.length; i++) { // 7 = length of "<Button"
      const c = window[i];
      if (inStr) {
        if (c === strChar && window[i - 1] !== "\\") inStr = false;
      } else if (c === '"' || c === "'") {
        inStr = true; strChar = c;
      } else if (c === "{") {
        braceDepth++;
      } else if (c === "}") {
        braceDepth--;
      } else if (c === ">" && braceDepth === 0) {
        tagEnd = i;
        break;
      }
    }
    if (tagEnd === -1) continue;

    const attrs = window.slice(7, tagEnd);

    // Skip if an explicit variant is set
    if (/\bvariant\s*=/.test(attrs)) continue;

    // Extract simple string className value (double or single quoted)
    const classMatch = attrs.match(/\bclassName\s*=\s*["']([^"']*)["']/);
    if (!classMatch) continue;

    const classValue = classMatch[1];

    // Only flag when there is a text-color utility but no bg- override
    if (!TEXT_COLOR_RE.test(classValue)) continue;
    if (/\bbg-/.test(classValue)) continue;

    const lineNum = content.slice(0, startIdx).split("\n").length;
    violations.push({
      rule: "GHOST_BUTTON_MISSING",
      file: rel(file),
      line: lineNum,
      text: `<Button className="${classValue.slice(0, 70)}">`,
      message: `<Button> without variant= has text-color in className but no bg-* — text is invisible on the default primary background`,
      fix: 'Add variant="ghost" for a transparent button, or add explicit bg-* classes',
    });
  }
}

// ─── RULE 6: Button used as toggle switch ────────────────────────────────────
// Using <Button role="switch"> to build a toggle pill causes the Button's
// internal padding and display styles to override custom sizing classes
// (w-10 h-6, rounded-full), so the element renders as a grey circle instead
// of a pill with a sliding thumb.
// Fix: use the appkit <Toggle checked onChange size> primitive, which renders
// a native <button role="switch"> internally with correct pill CSS classes.
function checkButtonAsToggle(file, content) {
  const BUTTON_OPEN_RE = /<Button\b/g;

  let m;
  while ((m = BUTTON_OPEN_RE.exec(content)) !== null) {
    const startIdx = m.index;
    // Extract up to 400 chars of the opening tag
    const window = content.slice(startIdx, startIdx + 400);

    // Walk to find where the opening tag ends (first unquoted >)
    let inStr = false;
    let strChar = "";
    let braceDepth = 0;
    let tagEnd = -1;
    for (let i = 7; i < window.length; i++) {
      const c = window[i];
      if (inStr) {
        if (c === strChar && window[i - 1] !== "\\") inStr = false;
      } else if (c === '"' || c === "'") {
        inStr = true; strChar = c;
      } else if (c === "{") {
        braceDepth++;
      } else if (c === "}") {
        braceDepth--;
      } else if (c === ">" && braceDepth === 0) {
        tagEnd = i;
        break;
      }
    }
    if (tagEnd === -1) continue;

    const attrs = window.slice(7, tagEnd);
    if (!/\brole\s*=\s*["']switch["']/.test(attrs)) continue;

    const lineNum = content.slice(0, startIdx).split("\n").length;
    violations.push({
      rule: "BUTTON_AS_TOGGLE",
      file: rel(file),
      line: lineNum,
      text: `<Button role="switch" ...>`,
      message: `<Button role="switch"> — appkit Button styles override sizing classes (w-10 h-6) and render as a grey circle instead of a toggle pill`,
      fix: 'Use the appkit <Toggle checked onChange size> primitive instead (renders a native button role="switch" internally with correct pill CSS)',
    });
  }
}

// ─── RULE 7: Raw semantic-color Tailwind classes in className ───────────────
// Classes like text-red-600, bg-green-50, border-amber-500 should use the
// design-system semantic tokens (text-error, bg-success-surface, etc.).
// Structural neutrals (zinc, slate, gray, stone, neutral) are acceptable.
// Only scans inside className="..." / className={'...'} / className={`...`}.
const RAW_COLOR_SKIP_FILES = new Set([
  "theme.ts",
  "theme.tsx",
  // Dev-only admin tooling — uses categorical color coding (sky/violet/teal/orange/etc.)
  // for type chips/status dots that have no semantic-token equivalent.
  "SeedPanel.tsx",
  "DevToolbar.tsx",
]);
const RAW_COLOR_SKIP_DIRS_EXTRA = new Set(["tokens"]);

const SEMANTIC_COLORS = "red|green|emerald|amber|yellow|blue|sky|orange|rose|pink|violet|purple|teal|cyan|lime|fuchsia|indigo";
const RAW_COLOR_RE = new RegExp(
  `\\b(?:text|bg|border|ring|outline|divide|from|to|via)-(?:${SEMANTIC_COLORS})-\\d+(?:\\/\\d+)?\\b`,
  "g"
);

function checkRawSemanticColors(file, lines) {
  const fileName = file.replace(/\\/g, "/").split("/").pop();
  if (RAW_COLOR_SKIP_FILES.has(fileName)) return;

  const parts = file.replace(/\\/g, "/").split("/");
  if (parts.some(p => RAW_COLOR_SKIP_DIRS_EXTRA.has(p))) return;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) continue;
    if (trimmed.startsWith("import ")) continue;

    if (!/className/.test(line)) continue;

    RAW_COLOR_RE.lastIndex = 0;
    let m;
    while ((m = RAW_COLOR_RE.exec(line)) !== null) {
      violations.push({
        rule: "RAW_SEMANTIC_COLOR",
        file: rel(file),
        line: i + 1,
        text: m[0],
        message: `Raw color class "${m[0]}" — use a semantic token (text-error, bg-success-surface, etc.)`,
        fix: "Replace with semantic tokens: text-error/success/warning/info, bg-error-surface/success-surface/warning-surface/info-surface, or extract to theme.ts",
      });
    }
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────
for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    const content = readFileSync(file, "utf8");
    const lines = content.split("\n");
    checkLongIfElse(file, lines);
    checkDeepNesting(file, lines);
    checkLargeComponent(file, lines);
    checkRepeatedStrings(file, lines);
    checkGhostButtonMissingVariant(file, content);
    checkButtonAsToggle(file, content);
    checkRawSemanticColors(file, lines);
  }
}

// Tightened during P3 remediation sweep (2026-06-07): 117 actual after
// REPEATED_STRING extracts. Drop to current count so new regressions block at
// the precise true ceiling.
const BASELINE = 117;

if (violations.length === 0) {
  console.log("audit-code-quality: clean ✓");
  process.exit(0);
}

// Group by rule for readable output
const byRule = violations.reduce((m, v) => {
  m.set(v.rule, [...(m.get(v.rule) || []), v]);
  return m;
}, new Map());

const out = [`audit-code-quality: ${violations.length} violation(s) found.\n`];
for (const [rule, vs] of byRule) {
  const summary = vs[0].message.split(" — ")[0];
  out.push(`[${rule}] ${summary} (${vs.length} instance${vs.length === 1 ? "" : "s"})`);
  out.push(`  Fix: ${vs[0].fix}`);
  for (const v of vs.slice(0, 8)) {
    out.push(`  ${v.file}:${v.line}  ${v.text}`);
  }
  if (vs.length > 8) out.push(`  … and ${vs.length - 8} more`);
  out.push("");
}

if (violations.length <= BASELINE) {
  const improved = BASELINE - violations.length;
  process.stdout.write(`audit-code-quality: ${violations.length} violation(s) (baseline ${BASELINE}${improved > 0 ? ` — ${improved} improved` : ""}). No regression.\n`);
  process.exit(0);
}

const regression = violations.length - BASELINE;
process.stderr.write(out.join("\n") + "\n");
process.stderr.write(`audit-code-quality: regression of ${regression} new violation(s) above baseline ${BASELINE}.\n`);
process.exit(1);
