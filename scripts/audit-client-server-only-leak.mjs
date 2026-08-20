#!/usr/bin/env node
/**
 * audit-client-server-only-leak — catches the exact bug class that broke
 * the webpack production build on 2026-08-20: a module reachable from a
 * "use client" component transitively importing "server-only" (directly,
 * or via the bare "@mohasinac/appkit" package specifier, which resolves to
 * appkit's server-entry.js — index.ts plus a large additional server-action
 * surface, safe for genuine Server Components but not guaranteed safe for a
 * client bundle).
 *
 * `server-only` is a hard tripwire — Next.js's bundler refuses to compile
 * the moment a module guarded by it is included in ANY client-reachable
 * chunk, independent of whether the guarded exports are actually used
 * (static graph inclusion, not usage — see CLAUDE.md Root Cause #24, the
 * same underlying mechanism). Turbopack tolerated this codebase's existing
 * leaks (via more aggressive/different graph handling); webpack did not.
 * Six real instances were found and fixed in one session, three shapes:
 *   1. appkit/src/index.ts directly re-exporting a server-only sender
 *      (contact/email.tsx's sendContactEmail, etc.).
 *   2. appkit/src/index.ts re-exporting a "*.server.ts" module that itself
 *      does `export * from "./actions"`, transitively reaching a
 *      server-only sender several hops down (features/checkout/server.ts →
 *      checkout-value-otp-actions.ts → contact/email.tsx).
 *   3. A CONSUMER-side general barrel (src/constants/index.ts) re-exporting
 *      a "*.server.ts" module (seo.server.ts, which calls into
 *      @mohasinac/appkit/server), reachable from any "use client" file that
 *      imports anything else from the same barrel — the barrel re-export
 *      itself is the violation, not the importing file (CLAUDE.md Root
 *      Cause #18: import from the defining module, never a general barrel).
 * All three are the same root pattern: a *.server.ts-style module (or one
 * of its transitive dependencies) is statically reachable from a module
 * that a "use client" file's import graph also reaches.
 *
 * Rule CLIENT_REACHES_SERVER_ONLY (hard-fail, strict zero) — for every file
 * carrying a `"use client"` directive (in appkit/src/** or the consumer's
 * src/**), walks its full import graph — relative specifiers (./ ../),
 * "@/" aliases (-> consumer src/), and "@mohasinac/appkit"/"@mohasinac/appkit/client"
 * (-> appkit's client-safe entries) — and flags it if the walk ever reaches:
 *   (a) a module with a top-level `import "server-only"`, or
 *   (b) an import of the BARE "@mohasinac/appkit" package (no subpath) —
 *       resolving through server-entry.js is inherently unbounded (its
 *       surface changes over time), so any reachability into it from a
 *       client boundary is treated as a violation regardless of whether
 *       that specific build currently has a server-only leak in it.
 * Memoized per-file (each module is walked at most once per run) so this
 * stays fast despite walking from every client entry point.
 *
 * Suppression: none provided on purpose, matching audit-nav-page-wiring's
 * precedent — there is no legitimate reason for either violation. Move the
 * offending export to appkit/src/server.ts (reachable only via the explicit
 * "@mohasinac/appkit/server" subpath), or — for a consumer-side barrel like
 * src/constants/index.ts — stop re-exporting the *.server.ts module from
 * the general barrel and import it directly from its defining file instead.
 *
 * Exits 1 on any violation.
 */

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative, resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const APPKIT_SRC = join(ROOT, "appkit", "src");
const CONSUMER_SRC = join(ROOT, "src");

const SERVER_ONLY_RE = /(?:^|\n)\s*import\s+["']server-only["'];?/;
const CLIENT_DIRECTIVE_RE = /^\s*["']use client["'];?\s*$/m;
// A file-level `"use server"` directive is a REAL safety boundary, unlike
// plain module reachability — Next.js's compiler strips everything except
// the exported async function signatures from the client bundle and
// replaces calls with RPC stubs, so the file's own imports (however
// server-only) never actually reach the client. Treat such a file as a
// safe terminal — don't walk into it, never flag it.
const SERVER_DIRECTIVE_RE = /^\s*["']use server["'];?\s*$/m;

// Matches import/export statements and extracts (typeKeyword, braceBody,
// otherClause, fromSpec) OR (sideEffectSpec) for a bare `import "spec";`.
// Type-only statements (`import type {...}`, `export type {...}`, or a
// braced list where every entry has an individual `type` prefix) are
// erased at compile time — zero bundler/runtime footprint — and must NOT
// be treated as reachability. A mixed brace (`{ type A, B }`) still counts
// because `B` is a real value import.
const STMT_RE =
  /(?:import|export)\s+(type\s+)?(?:(\*(?:\s+as\s+[\w$]+)?)|\{([^}]*)\}|([\w$]+))\s+from\s+["']([^"']+)["']|import\s+["']([^"']+)["']/g;

/** Returns the real (non-type-only) `from` specifier for a statement match, or null. */
function realSpecFromMatch(m) {
  const [, typeKw, star, braceBody, ident, fromSpec, sideEffectSpec] = m;
  if (sideEffectSpec) return sideEffectSpec; // bare `import "spec";` — always real
  if (typeKw) return null; // `import type {...} from "spec"` / `export type {...} from` — fully erased
  if (star !== undefined) return fromSpec; // `export * from` / `import * as X from` — always real
  if (ident !== undefined) return fromSpec; // default/namespace-style identifier — always real
  if (braceBody !== undefined) {
    const entries = braceBody.split(",").map((e) => e.trim()).filter(Boolean);
    const allTypeOnly = entries.length > 0 && entries.every((e) => /^type\s+/.test(e));
    return allTypeOnly ? null : fromSpec;
  }
  return null;
}

/**
 * Strips `//` line comments and `/* ... *\/` block comments before regex
 * scanning, so example code or migration notes inside a comment (e.g.
 * `// import { X } from "@mohasinac/appkit"`) never registers as a real
 * import statement. Deliberately naive (doesn't understand strings that
 * contain `//` or `/*`) — acceptable here since real import/export
 * specifiers never contain comment-like sequences.
 */
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

function resolveFile(base) {
  const candidates = [base, `${base}.ts`, `${base}.tsx`, join(base, "index.ts"), join(base, "index.tsx")];
  for (const c of candidates) {
    if (existsSync(c) && statSync(c).isFile()) return c;
  }
  return null;
}

/**
 * Resolves an import specifier found inside `fromFile` to an absolute file
 * path this audit should walk into, or `null` to stop (package boundary
 * that isn't one of the two entry points we care about), or the special
 * string "BARE_APPKIT" to signal a direct violation.
 */
function resolveSpec(fromFile, spec) {
  if (spec === "@mohasinac/appkit") return "BARE_APPKIT";
  if (spec === "@mohasinac/appkit/client") return resolveFile(join(APPKIT_SRC, "client"));
  if (spec.startsWith(".")) return resolveFile(resolvePath(dirname(fromFile), spec));
  if (spec.startsWith("@/")) return resolveFile(join(CONSUMER_SRC, spec.slice(2)));
  return null; // any other package boundary — not followed
}

// memo: file path -> { hit: false } | { hit: true, kind, path }
const memo = new Map();

function walk(file, seen) {
  if (memo.has(file)) return memo.get(file);
  if (seen.has(file)) return { hit: false, hits: [] }; // cycle guard
  seen.add(file);

  let src;
  try {
    src = stripComments(readFileSync(file, "utf8"));
  } catch {
    const result = { hit: false, hits: [] };
    memo.set(file, result);
    return result;
  }

  if (SERVER_ONLY_RE.test(src)) {
    const result = { hit: true, hits: [{ kind: "server-only", path: [file] }] };
    memo.set(file, result);
    return result;
  }

  if (SERVER_DIRECTIVE_RE.test(src)) {
    const result = { hit: false, hits: [] }; // genuine "use server" — safe terminal
    memo.set(file, result);
    return result;
  }

  // Collect ALL distinct hits reachable from this file (not just the
  // first), so a single run surfaces every problem in a large barrel like
  // client.ts at once instead of one-at-a-time across repeated runs.
  // Deduped by terminal (final) file — the same terminal reached via
  // multiple specs/paths would otherwise multiply combinatorially up a
  // deep barrel tree (index.ts alone has ~9000 export lines).
  const byTerminal = new Map();
  let m;
  STMT_RE.lastIndex = 0;
  while ((m = STMT_RE.exec(src)) !== null) {
    const spec = realSpecFromMatch(m);
    if (!spec) continue;
    const resolved = resolveSpec(file, spec);
    if (resolved === "BARE_APPKIT") {
      if (!byTerminal.has(file)) byTerminal.set(file, { kind: "bare-appkit-import", path: [file] });
      continue;
    }
    if (resolved) {
      const sub = walk(resolved, seen);
      if (sub.hit) {
        for (const h of sub.hits) {
          const terminal = h.path[h.path.length - 1];
          if (!byTerminal.has(terminal)) {
            byTerminal.set(terminal, { kind: h.kind, path: [file, ...h.path] });
          }
        }
      }
    }
  }

  const allHits = [...byTerminal.values()];
  const result = allHits.length > 0 ? { hit: true, hits: allHits } : { hit: false, hits: [] };
  memo.set(file, result);
  return result;
}

function walkFiles(dir, out) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full, out);
    } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
      out.push(full);
    }
  }
}

const allSourceFiles = [];
walkFiles(APPKIT_SRC, allSourceFiles);
walkFiles(CONSUMER_SRC, allSourceFiles);

const violations = [];
for (const file of allSourceFiles) {
  // Entry-point files legitimately re-export the whole barrel by design —
  // they aren't "use client" components, they're what the client/server
  // conditions resolve to.
  if (file.endsWith("client-entry.ts") || file.endsWith("server-entry.ts")) continue;

  let src;
  try {
    src = stripComments(readFileSync(file, "utf8"));
  } catch {
    continue;
  }
  if (!CLIENT_DIRECTIVE_RE.test(src)) continue;

  const result = walk(file, new Set());
  if (result.hit) {
    for (const h of result.hits) {
      violations.push({
        file: relative(ROOT, file),
        kind: h.kind,
        path: h.path.map((p) => relative(ROOT, p)),
      });
    }
  }
}

// ─── Report ─────────────────────────────────────────────────────────────

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(violations));
  process.exit(violations.length > 0 ? 1 : 0);
}

if (violations.length > 0) {
  console.log(`\naudit-client-server-only-leak: ${violations.length} CLIENT_REACHES_SERVER_ONLY violation(s) — FAIL\n`);
  for (const v of violations.sort((a, b) => a.file.localeCompare(b.file))) {
    if (v.kind === "server-only") {
      console.log(`  🔴 ${v.file} transitively imports "server-only":`);
    } else {
      console.log(`  🔴 ${v.file} transitively imports the bare "@mohasinac/appkit" package:`);
    }
    console.log(`     ${v.path.join("\n     -> ")}`);
  }
  console.log(
    "\nFix: for a server-only leak, move the offending export to\n" +
    '     appkit/src/server.ts (reachable only via "@mohasinac/appkit/server"),\n' +
    "     and repoint every server-side consumer at it. For a bare-package\n" +
    '     reachability hit, change the import to "@mohasinac/appkit/client"\n' +
    "     (adding the missing symbol to appkit/src/client.ts first if needed),\n" +
    "     or — if it's via a consumer-side general barrel like\n" +
    "     src/constants/index.ts — stop re-exporting the server-only module\n" +
    "     from that barrel and import it directly from its defining file\n" +
    "     (CLAUDE.md Root Cause #18).\n"
  );
  process.exit(1);
}

console.log("audit-client-server-only-leak: clean.\n");
process.exit(0);
