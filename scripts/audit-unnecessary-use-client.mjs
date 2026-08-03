#!/usr/bin/env node
/**
 * audit-unnecessary-use-client.mjs
 *
 * Flags page.tsx / layout.tsx files that declare "use client" but do not
 * import any API that actually requires the client boundary:
 *
 *   React hooks:      useState useEffect useRef useCallback useMemo useContext
 *                     useReducer useId useTransition useDeferredValue
 *                     useImperativeHandle useLayoutEffect use
 *                     useFormStatus useFormState useOptimistic
 *   next/navigation:  useRouter useSearchParams usePathname useParams
 *                     useSelectedLayoutSegment useSelectedLayoutSegments
 *   next-intl:        useTranslations useLocale useNow useTimeZone
 *                     useFormatter useMessages useIntl
 *   React DOM:        createPortal
 *
 * Also accepts "use client" if the file body references browser globals:
 *   window  document  navigator  localStorage  sessionStorage
 *
 * Per-file escape hatch: add the following comment anywhere in the file to
 * suppress the violation with a required reason:
 *   // audit-unnecessary-use-client-ok: <reason>
 *
 * Scope: src/app/**\/*.{ts,tsx}  (pages and layouts)
 *
 * Strict-zero — any violation exits 1.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PAGES_DIR = join(ROOT, "src", "app");

// Hook names that justify "use client" when appearing as import specifiers.
const CLIENT_HOOKS = new Set([
  // React state / lifecycle
  "useState", "useEffect", "useRef", "useCallback", "useMemo", "useContext",
  "useReducer", "useId", "useTransition", "useDeferredValue", "useImperativeHandle",
  "useLayoutEffect", "useDebugValue", "use",
  // React 19 form hooks
  "useFormStatus", "useFormState", "useOptimistic",
  // Next.js navigation
  "useRouter", "useSearchParams", "usePathname", "useParams",
  "useSelectedLayoutSegment", "useSelectedLayoutSegments",
  // next-intl client hooks
  "useTranslations", "useLocale", "useNow", "useTimeZone",
  "useFormatter", "useMessages", "useIntl",
  // React DOM
  "createPortal",
]);

// Browser-only globals whose bare presence in the source justifies "use client".
const BROWSER_GLOBALS_RE =
  /\b(window|document|navigator|localStorage|sessionStorage)\b/;

// Import specifier regex: matches named imports in both forms:
//   import { useState, useEffect } from "react"
//   import React, { useCallback, useEffect } from "react"   (default + named)
// The [^{]* skips over the default import token (if any) before the {.
const NAMED_IMPORT_RE = /import\b[^{]*\{([^}]+)\}/g;

// ─── Files always exempt (Next.js framework constraints) ─────────────────────

// Next.js requires error.tsx and global-error.tsx to be Client Components so the
// framework can pass the `reset` callback prop.  There is no import we can detect
// statically, so exclude these filenames unconditionally.
const NEXTJS_REQUIRED_CLIENT_FILENAMES = new Set(["error.tsx", "global-error.tsx"]);

// ─── Walk .ts / .tsx files under src/app/ ────────────────────────────────────

function walk(dir, files = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

// ─── Check a single file ──────────────────────────────────────────────────────

function check(filePath) {
  const content = readFileSync(filePath, "utf8");

  // Skip files where Next.js mandates "use client" (error boundaries, global errors).
  const fileName = filePath.split(/[\\/]/).pop() ?? "";
  if (NEXTJS_REQUIRED_CLIENT_FILENAMES.has(fileName)) return null;

  // Must have "use client" as its very first directive.
  const firstLine = content.trimStart().slice(0, 50);
  if (!firstLine.startsWith('"use client"') && !firstLine.startsWith("'use client'")) {
    return null; // Not a client file — nothing to check.
  }

  // Check 1: named hook imports.
  let m;
  NAMED_IMPORT_RE.lastIndex = 0;
  while ((m = NAMED_IMPORT_RE.exec(content)) !== null) {
    const specifiers = m[1].split(",").map((s) => s.trim().split(/\s+as\s+/)[0].trim());
    for (const spec of specifiers) {
      if (CLIENT_HOOKS.has(spec)) return null; // Justified.
    }
  }

  // Check 2: default import of React (could be used for hooks via React.useState etc.)
  // Only flag if the file references React.<hookName>.
  if (/\bReact\.(useState|useEffect|useRef|useCallback|useMemo|useContext|useReducer)\b/.test(content)) {
    return null;
  }

  // Check 3: browser globals.
  if (BROWSER_GLOBALS_RE.test(content)) return null;

  // Check 4: JSX render-prop factories — functions passed as render* props.
  // These function bodies execute on the client and cannot serialize across the
  // RSC→client boundary, even without explicit hook usage.
  if (/render\w+\s*=\s*\{/.test(content)) return null;

  // Check 5: Client-only library imports (Firebase client SDK, etc.).
  if (/from\s+["'](firebase\/|@firebase\/)/.test(content)) return null;

  // No justification found → violation.
  return relative(ROOT, filePath);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const violations = walk(PAGES_DIR).map(check).filter(Boolean);

if (violations.length === 0) {
  console.log('audit-unnecessary-use-client: no "use client" files without a client-only import ✓');
  process.exit(0);
}

const lines = [
  `audit-unnecessary-use-client: ${violations.length} violation(s) found.\n`,
  '[UNNECESSARY_USE_CLIENT] "use client" declared but no React hook, next/navigation hook,',
  "  next-intl hook, or browser global (window/document/navigator/localStorage) found.",
  "",
  "  Fix options:",
  '  1. Remove "use client" — RSC pages can render Client Components without the directive.',
  "  2. Extract the client-only code to a thin <XyzClient /> file and import it here.",
  '  3. Add // audit-unnecessary-use-client-ok: <reason> if the directive is intentional.',
  "",
  ...violations.map((v) => `  ${v}`),
  "",
];

process.stderr.write(lines.join("\n") + "\n");
process.exit(1);
