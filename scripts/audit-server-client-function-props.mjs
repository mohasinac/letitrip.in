#!/usr/bin/env node
/**
 * audit-server-client-function-props.mjs
 *
 * Flags Server Component page.tsx files (no "use client") that pass a JSX
 * prop whose value is an inline function to a component imported from
 * @mohasinac/appkit or @mohasinac/appkit/client. React Server Components
 * cannot serialize function values across the server→client boundary — this
 * crashes at runtime ("Functions cannot be passed directly to Client
 * Components"), invisible to `tsc` since the violation is only enforced by
 * the RSC runtime serializer. Confirmed live on /admin/categories via
 * `getRowHref={(row) => ...}` (2026-08-18) — the fix there was to retype
 * DataTable's row-href prop to a serializable `rowHrefTemplate` string
 * rather than adding "use client" to the page (that has caused endless-loop
 * regressions in this codebase before).
 *
 * Per-line escape hatch: // audit-server-client-function-props-ok: <reason>
 *
 * Scope: src/app/**\/page.tsx
 * Strict-zero.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PAGES_DIR = join(ROOT, "src", "app");
const APPKIT_SRC_DIR = join(ROOT, "appkit", "src");

const NAMED_IMPORT_RE =
  /import\s+(?:type\s+)?(?:\w+\s*,\s*)?\{([^}]+)\}\s*from\s*["']@mohasinac\/appkit(?:\/client)?["']/g;

// Matches an inline function value assigned to a JSX prop: propName={(x) => ...},
// propName={x => ...}, or propName={function(...) {...}}.
const FN_PROP_RE =
  /(\w+)=\{\s*(?:\([^()]*\)|\w+)\s*=>|(\w+)=\{\s*function\b/g;

const EXPORT_DECL_RE = /export\s+(?:default\s+)?(?:function|const|class)\s+([A-Z]\w*)/g;

function walk(dir, files = [], filter = () => true) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files, filter);
    else if (filter(entry.name)) files.push(full);
  }
  return files;
}

// Builds a set of component names whose *defining* file (anywhere in
// appkit/src, not the barrel it's re-exported through) starts with
// "use client". A component with no resolvable definition, or one whose
// definition is a Server Component, is never flagged — only positively-
// confirmed client components are reported, to avoid false positives like
// ProductDetailPageView (itself a Server Component receiving render-prop
// functions from another Server Component, which is perfectly legal RSC).
function buildClientComponentRegistry() {
  const clientNames = new Set();
  const sourceFiles = walk(APPKIT_SRC_DIR, [], (name) => /\.(ts|tsx)$/.test(name));
  for (const file of sourceFiles) {
    const content = readFileSync(file, "utf8");
    const firstLine = content.trimStart().slice(0, 50);
    const isClientFile =
      firstLine.startsWith('"use client"') || firstLine.startsWith("'use client'");
    if (!isClientFile) continue;
    EXPORT_DECL_RE.lastIndex = 0;
    let m;
    while ((m = EXPORT_DECL_RE.exec(content)) !== null) clientNames.add(m[1]);
  }
  return clientNames;
}

function getAppkitComponentNames(content) {
  const names = new Set();
  let m;
  NAMED_IMPORT_RE.lastIndex = 0;
  while ((m = NAMED_IMPORT_RE.exec(content)) !== null) {
    for (const raw of m[1].split(",")) {
      const spec = raw.trim().split(/\s+as\s+/).pop().trim();
      // Only PascalCase identifiers are components; skip constants/functions/types.
      if (/^[A-Z]/.test(spec)) names.add(spec);
    }
  }
  return names;
}

// Scans forward from a JSX opening tag's "<" to find the end of that opening
// tag — the first ">" encountered at brace-depth 0. Arrow functions ("=>")
// inside prop expressions are always nested inside a "{ }", so by the time
// depth returns to 0 any ">" seen is genuinely the tag's own close (self-
// closing "/>" or plain ">"), never part of an arrow.
function findOpenTagEnd(content, tagStart) {
  let depth = 0;
  for (let i = tagStart; i < content.length; i++) {
    const ch = content[i];
    if (ch === "{") depth++;
    else if (ch === "}") depth--;
    else if (ch === ">" && depth === 0) return i;
  }
  return content.length - 1;
}

function lineOf(content, index) {
  return content.slice(0, index).split("\n").length;
}

function check(filePath, clientComponentNames) {
  const content = readFileSync(filePath, "utf8");

  // Client pages are exempt — function props are safe client-to-client.
  const firstLine = content.trimStart().slice(0, 50);
  if (firstLine.startsWith('"use client"') || firstLine.startsWith("'use client'")) return [];

  const componentNames = [...getAppkitComponentNames(content)].filter((n) =>
    clientComponentNames.has(n),
  );
  if (componentNames.length === 0) return [];

  const violations = [];
  for (const name of componentNames) {
    const tagRe = new RegExp(`<${name}\\b`, "g");
    let tagMatch;
    while ((tagMatch = tagRe.exec(content)) !== null) {
      const tagStart = tagMatch.index;
      const tagEnd = findOpenTagEnd(content, tagStart);
      const tagText = content.slice(tagStart, tagEnd + 1);

      FN_PROP_RE.lastIndex = 0;
      let fnMatch;
      while ((fnMatch = FN_PROP_RE.exec(tagText)) !== null) {
        const absoluteIndex = tagStart + fnMatch.index;
        const lineStart = content.lastIndexOf("\n", absoluteIndex) + 1;
        const lineEnd = content.indexOf("\n", absoluteIndex);
        const line = content.slice(lineStart, lineEnd === -1 ? content.length : lineEnd);
        if (/audit-server-client-function-props-ok:/.test(line)) continue;

        violations.push({
          file: relative(ROOT, filePath),
          line: lineOf(content, absoluteIndex),
          component: name,
          prop: fnMatch[1] ?? fnMatch[3],
        });
      }
    }
  }
  return violations;
}

const clientComponentNames = buildClientComponentRegistry();
const pageFiles = walk(PAGES_DIR, [], (name) => name === "page.tsx");
const allViolations = pageFiles.flatMap((f) => check(f, clientComponentNames));

if (allViolations.length === 0) {
  console.log(
    "audit-server-client-function-props: no Server Component page.tsx passes an inline function prop to an appkit component ✓",
  );
  process.exit(0);
}

const lines = [
  `audit-server-client-function-props: ${allViolations.length} violation(s) found.\n`,
  "[SERVER_CLIENT_FUNCTION_PROP] A page.tsx without \"use client\" passes an inline function",
  "  as a JSX prop to a component imported from @mohasinac/appkit — React Server Components",
  "  cannot serialize function values across the server→client boundary. This crashes at",
  "  runtime (\"Functions cannot be passed directly to Client Components\"), invisible to tsc.",
  "",
  "  Fix: pass serializable data (a string, a route template with an {id} placeholder, etc.)",
  "  and let the client component build the callback internally — see DataTable's",
  "  `rowHrefTemplate` prop for the canonical pattern. Never add \"use client\" to the page",
  "  as a workaround — that has caused endless-loop regressions in this codebase before.",
  "",
  ...allViolations.map((v) => `  ${v.file}:${v.line} — <${v.component} ${v.prop}={...}>`),
  "",
];

process.stderr.write(lines.join("\n") + "\n");
process.exit(1);
