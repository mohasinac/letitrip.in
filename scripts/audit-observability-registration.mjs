#!/usr/bin/env node
/**
 * audit-observability-registration.mjs
 *
 * An observability hook that nothing calls is indistinguishable from one that
 * works — until you need it.
 *
 * WHY
 *   appkit exposes registration seams whose absence is SILENT by design: with
 *   no reporter installed, `getTracker()` falls back to `console.error` and
 *   `reportActionError()` returns immediately. Nothing throws, nothing warns,
 *   and `tsc` cannot help, because the failure mode is an ORPHANED MODULE — a
 *   file that still compiles, still exports, and is imported by nobody.
 *
 *   That is exactly what happened. `setErrorTracker` was called from
 *   `src/app/[locale]/ClientProviderBootstrap.tsx`; a refactor moved the mount
 *   to `ClientProviderInitializer` -> `src/lib/client-providers-init.ts` and
 *   left the registration behind. A repo-wide grep for the component's own name
 *   returned only its `export default function` declaration. Every error
 *   boundary lost its digest for months (CLAUDE.md Root Cause #78), and the
 *   fix for #78 had itself been the thing that regressed.
 *
 * THE RULE
 *   Every hook below must be CALLED from a module that is transitively
 *   reachable from a real entry point. Being merely present in the repo is not
 *   enough; that is the bug.
 *
 * REACHABILITY
 *   Entry points are Next.js route/instrumentation files. From each, imports
 *   are followed through relative specifiers and the `@/` alias. A call site in
 *   a module nobody imports fails the audit even though it reads correctly.
 *
 * Strict-zero. No suppression marker: a hook is either wired up or it is not,
 * and "wired up but unreachable" is the precise defect being blocked.
 *
 * Exits 0 when every hook is reachable, 1 otherwise.
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "src");

/** Hooks that must have a reachable call site. */
const REQUIRED_HOOKS = [
  {
    name: "setErrorTracker",
    why: "routes trackError() -> the client-error beacon; without it every ErrorBoundary/ErrorView/GlobalError digest dies in the browser console",
  },
  {
    name: "setActionErrorReporter",
    why: "records server-action failures; without it all 222 wrapAction call sites fail with no serverErrors row and no log line",
  },
  {
    name: "installDegradedReadReporter",
    why: "records safeRead() failures as DEGRADED_READ; without it a failed optional read returns its fallback and is indistinguishable from a legitimately empty result",
  },
];

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

/**
 * Files Next.js loads on its own. Everything reachable must hang off one of
 * these — `instrumentation.ts` included, since that is where the server-side
 * reporter is registered.
 */
const ENTRY_RE =
  /[\\/]src[\\/]instrumentation\.ts$|[\\/]src[\\/]app[\\/].*[\\/](?:page|layout|template|default|error|global-error|not-found)\.tsx$|[\\/]src[\\/]app[\\/].*[\\/]route\.ts$/;

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
    else if (/\.(ts|tsx)$/.test(entry)) files.push(full);
  }
  return files;
}

const allFiles = walk(SRC, []);

/** Resolve an import specifier to a real file on disk, or null. */
function resolveSpecifier(fromFile, spec) {
  let base;
  if (spec.startsWith("@/")) base = join(SRC, spec.slice(2));
  else if (spec.startsWith(".")) base = resolve(dirname(fromFile), spec);
  else return null; // bare package — outside the repo graph

  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    join(base, "index.ts"),
    join(base, "index.tsx"),
  ];
  for (const c of candidates) {
    try {
      if (existsSync(c) && statSync(c).isFile()) return c;
    } catch {
      /* ignore */
    }
  }
  return null;
}

/**
 * Strip line comments, block comments and string/template literals.
 *
 * Load-bearing: without it a COMMENTED-OUT `setErrorTracker(...)` counts as a
 * live call site, and the audit reports OK for precisely the state it exists to
 * catch. Verified by commenting the real call out and watching this fail.
 */
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

const IMPORT_RE = /(?:from|import)\s*\(?\s*["']([^"']+)["']/g;

function importsOf(file) {
  let src;
  try {
    src = readFileSync(file, "utf8");
  } catch {
    return [];
  }
  const out = [];
  let m;
  IMPORT_RE.lastIndex = 0;
  while ((m = IMPORT_RE.exec(src)) !== null) {
    const resolved = resolveSpecifier(file, m[1]);
    if (resolved) out.push(resolved);
  }
  return out;
}

// -- BFS from every entry point ------------------------------------------
const reachable = new Set();
const queue = allFiles.filter((f) => ENTRY_RE.test(f));
for (const f of queue) reachable.add(f);

while (queue.length > 0) {
  const file = queue.shift();
  for (const dep of importsOf(file)) {
    if (reachable.has(dep)) continue;
    reachable.add(dep);
    queue.push(dep);
  }
}

// -- Locate each hook's call sites ---------------------------------------
const failures = [];

for (const hook of REQUIRED_HOOKS) {
  // A CALL, not an import or a re-export: `setErrorTracker(`
  const callRe = new RegExp(String.raw`(?<![.\w$])${hook.name}\s*\(`);
  const callSites = [];
  for (const file of allFiles) {
    let src;
    try {
      src = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    if (callRe.test(stripNoise(src))) callSites.push(file);
  }

  const reachableSites = callSites.filter((f) => reachable.has(f));
  if (reachableSites.length === 0) {
    failures.push({
      hook,
      callSites: callSites.map((f) => relative(ROOT, f).replace(/\\/g, "/")),
    });
  }
}

if (failures.length > 0) {
  console.error(
    `\n[audit-observability-registration] ${failures.length} hook(s) never registered from a reachable module:\n`,
  );
  for (const f of failures) {
    console.error(`  ${f.hook.name}()`);
    console.error(`     ${f.hook.why}`);
    if (f.callSites.length === 0) {
      console.error(`     No call site anywhere in src/.`);
    } else {
      console.error(
        `     Called only from ORPHANED module(s) — nothing imports these:`,
      );
      for (const s of f.callSites) console.error(`       ${s}`);
    }
    console.error("");
  }
  console.error(
    `  A registration hook that no entry point can reach is silent: the default\n` +
      `  fallback swallows everything and tsc cannot see an orphaned module. This is\n` +
      `  how CLAUDE.md Root Cause #78 regressed after it had already been fixed once.\n\n` +
      `  Fix: call the hook from a module the app actually loads —\n` +
      `    client -> src/lib/client-providers-init.ts (mounted via ClientProviderInitializer)\n` +
      `    server -> src/instrumentation.ts (register(), called by Next.js itself)\n`,
  );
  process.exit(1);
}

console.log(
  `[audit-observability-registration] OK — ${REQUIRED_HOOKS.length} hook(s) reachable`,
);
process.exit(0);
