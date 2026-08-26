#!/usr/bin/env node
/**
 * audit-client-entry-in-server.mjs
 *
 * `appkit/src/client.ts` begins with `"use client"`. When a **Server**
 * Component imports from `@mohasinac/appkit/client`, every imported binding
 * becomes a *client-reference proxy*. Rendering such a binding as JSX is fine —
 * that is the normal RSC boundary — but **calling it** or **reading a property
 * off it** during the server render throws.
 *
 * The throw surfaces in production as React error #441 ("An error occurred in
 * the Server Components render"), whose message is stripped. Three live
 * failures on 2026-08-26, all from this one mistake:
 *
 *   - PrizeDrawsSection      `sortBy(...)`  -> homepage section crashed the page
 *   - EventRafflesSection    `sieveFilter(...)` -> section silently rendered nothing
 *                            (its own try/catch swallowed the throw)
 *   - src/app/[locale]/sell  `ROUTES.USER...` -> page 200'd instead of redirecting
 *
 * THE RULE
 *   In a file that RENDERS ON THE SERVER and has no `"use client"` directive,
 *   an identifier imported from `@mohasinac/appkit/client` may appear only in
 *   JSX position. If it is called (`foo(`) or property-accessed (`foo.`), that
 *   is a violation.
 *
 * SCOPE — deliberately narrow (see SERVER_RENDERED below). Only two shapes can
 * execute during a server render:
 *   1. a Next.js route entry (`page`/`layout`/`template`/`default`.tsx, `route.ts`)
 *      that is not marked "use client";
 *   2. an `async function` component — async components are server-only.
 *
 *   A plain helper module with no "use client" (e.g. `src/lib/api/*-client.ts`)
 *   is NOT in scope: it is only ever reached from client components, so its
 *   imports never become client-reference proxies. Flagging those would be
 *   actively harmful — pointing them at the bare "@mohasinac/appkit" entry is
 *   exactly the Turbopack client-bundle leak that
 *   `audit-client-server-only-leak` (Root Cause #6) exists to block. The two
 *   audits pull in opposite directions and this scope is what keeps them
 *   compatible.
 *
 * THE FIX
 *   Import from the module that DEFINES the symbol (CLAUDE.md Root Cause #18),
 *   or from the main `@mohasinac/appkit` entry, which is not `"use client"`:
 *     sortBy, SORT_DIR                  -> appkit/src/constants/sort
 *     sieveFilter, sieveAnd, SIEVE_OP   -> appkit/src/utils/sieve-builder
 *     ROUTES                            -> appkit/src/next/routing/route-map
 *                                          (consumer: "@mohasinac/appkit")
 *
 * Type-only imports are ignored — they are erased at compile time and cannot
 * produce a runtime proxy.
 *
 * Strict-zero. Suppression: `// audit-client-entry-ok: <reason>` on the import
 * line or in the contiguous comment block directly above it.
 *
 * NOTE ON PARSING: identifier usage is detected over a comment- and
 * string-stripped copy of the source, NOT with a `<Tag[^>]*>` style regex.
 * That regex stops at the `>` inside `onClick={() => f()}` and produces exactly
 * the false negatives described in Root Cause #29.
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

const CLIENT_ENTRY = "@mohasinac/appkit/client";
const SUPPRESSION = "audit-client-entry-ok";

/** Strip line comments, block comments and string/template literals. */
function stripNoise(src) {
  let out = "";
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    const next = src[i + 1];
    if (c === "/" && next === "/") {
      while (i < n && src[i] !== "\n") i++;
      continue;
    }
    if (c === "/" && next === "*") {
      i += 2;
      while (i < n && !(src[i] === "*" && src[i + 1] === "/")) i++;
      i += 2;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      const quote = c;
      i++;
      while (i < n && src[i] !== quote) {
        if (src[i] === "\\") i++;
        i++;
      }
      i++;
      out += " ";
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

/** A Next.js route entry file — rendered on the server unless "use client". */
const ROUTE_ENTRY_RE =
  /[\\/]src[\\/]app[\\/].*[\\/](?:page|layout|template|default)\.tsx$|[\\/]src[\\/]app[\\/].*[\\/]route\.ts$/;

/**
 * Does this file run during a server render? Either it is a route entry, or it
 * declares an async function component (async components are server-only).
 */
function isServerRendered(file, src) {
  if (ROUTE_ENTRY_RE.test(file)) return true;
  return /export\s+(?:default\s+)?async\s+function\s+[A-Z]/.test(src);
}

function hasUseClient(src) {
  // Directive must be within the opening lines, before any real statement.
  const head = src.split("\n").slice(0, 5).join("\n");
  return /^\s*["']use client["']/m.test(head);
}

/** Collect `{ a, b as c, type D }` bindings imported from the client entry. */
function clientImportBindings(src) {
  const bindings = [];
  const re = new RegExp(
    `import\\s+(type\\s+)?\\{([^}]*)\\}\\s*from\\s*["']${CLIENT_ENTRY.replace("/", "\\/")}["']`,
    "g",
  );
  let m;
  while ((m = re.exec(src)) !== null) {
    if (m[1]) continue; // `import type { ... }` — erased, cannot throw
    const line = src.slice(0, m.index).split("\n").length;
    for (const raw of m[2].split(",")) {
      const spec = raw.trim();
      if (!spec) continue;
      if (/^type\s/.test(spec)) continue; // inline `type X`
      // `X as Y` -> the local binding is Y
      const local = spec.includes(" as ") ? spec.split(" as ")[1].trim() : spec;
      if (/^[A-Za-z_$][\w$]*$/.test(local)) bindings.push({ name: local, line });
    }
  }
  return bindings;
}

function isSuppressed(lines, importLine) {
  // The import line itself, or the contiguous comment block above it.
  const self = lines[importLine - 1] ?? "";
  if (self.includes(SUPPRESSION)) return true;
  for (let i = importLine - 2; i >= 0; i--) {
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
    if (!src.includes(CLIENT_ENTRY)) continue;
    if (hasUseClient(src)) continue; // client file — importing the client entry is correct
    if (!isServerRendered(file, src)) continue; // never executes on the server

    const bindings = clientImportBindings(src);
    if (bindings.length === 0) continue;

    const lines = src.split("\n");
    // Remove the import statements themselves so `X` inside `{ X }` and the
    // module specifier can't be mistaken for a usage.
    const body = stripNoise(src).replace(
      new RegExp(`import[^;]*?from\\s*["']?[^;]*?client["']?;`, "g"),
      "",
    );

    for (const { name, line } of bindings) {
      if (isSuppressed(lines, line)) continue;
      // Called: `name(` or `name<T>(` ; property-accessed: `name.`
      const called = new RegExp(`\\b${name}\\s*(?:<[^<>]*>)?\\s*\\(`).test(body);
      const accessed = new RegExp(`\\b${name}\\s*\\.`).test(body);
      if (called || accessed) {
        violations.push({
          file: relative(ROOT, file).replace(/\\/g, "/"),
          line,
          name,
          how: called ? "called" : "property-accessed",
        });
      }
    }
  }
}

if (violations.length > 0) {
  console.error(
    `\n[audit-client-entry-in-server] ${violations.length} violation(s) — a "use client" binding used at server-render time:\n`,
  );
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  '${v.name}' is ${v.how} in a file with no "use client"`);
  }
  console.error(
    `\n  '${CLIENT_ENTRY}' is a "use client" entry. In a Server Component its exports are\n` +
      `  client-reference proxies: rendering one as JSX is fine, calling it or reading a\n` +
      `  property off it throws during the server render (React error #441).\n\n` +
      `  Fix: import from the module that DEFINES the symbol, or from "@mohasinac/appkit".\n` +
      `    sortBy, SORT_DIR                -> appkit/src/constants/sort\n` +
      `    sieveFilter, sieveAnd, SIEVE_OP -> appkit/src/utils/sieve-builder\n` +
      `    ROUTES                          -> "@mohasinac/appkit"\n\n` +
      `  Genuine exception? Add: // ${SUPPRESSION}: <reason>\n`,
  );
  console.error(`Baseline: ${BASELINE}. Found: ${violations.length}.\n`);
  process.exit(1);
}

console.log("[audit-client-entry-in-server] OK — 0 violations");
process.exit(0);
