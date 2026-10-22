#!/usr/bin/env node
/**
 * audit-component-barrel-import.mjs — nothing imports the `@/components` or
 * `@/constants` barrel.
 *
 * ## The defect
 *
 * `src/components/index.ts` re-exports 31 modules, and **25 of them import
 * `@mohasinac/appkit/client`** — whose first line is `"use client"`. So a
 * Server Component importing from `"@/components"` pulls the client entry into
 * a SERVER graph, which instantiates appkit a second time under the client
 * condition. That second instance has its own **empty provider registry**:
 * `initProviders()` registers the session provider into one copy and
 * `createRouteHandler` reads the other, so the route answers **401
 * UNAUTHENTICATED to every valid session**.
 *
 * CLAUDE.md records the measurement for the sibling `@/constants` barrel:
 * `/api/payment/create-order` 401'd ten times out of ten while
 * `/preorder`, `/otp/request`, `/event/init` and `/verify` — same gate, same
 * cookie, same batch — all passed. Auth runs before body parsing, so those
 * were real passes. The entire cost was one import string.
 *
 * Measured 2026-10-22 on this repo: **42 files imported `@/components`**, and
 * all but two were `page.tsx` server entries — the homepage, both auth flows,
 * cart, checkout, both FAQ pages, every seller listing editor, every user
 * settings page. All 42 were repointed at their defining modules.
 *
 * ## 🛑 Why this is not already covered
 *
 * `audit-client-entry-in-server` scopes to DIRECT imports of
 * `@mohasinac/appkit/client` in route entries and `async function`
 * components, and that scope is load-bearing — widening it once broke
 * `audit-client-server-only-leak`, which pulls in the opposite direction
 * (Root Cause #6 vs #76). A re-export two hops away is outside it by design.
 *
 * So the property has to be asserted at the BARREL instead: a barrel whose
 * transitive graph reaches the client entry may have no importers at all.
 * That is checkable with certainty, needs no graph walk at the call site, and
 * does not care which of the 31 symbols was wanted.
 *
 * ## What it does NOT flag
 *
 * A DEEP import — `@/components/faq/FAQPageClient` — is the correct form and
 * is never flagged. Importing the defining module is the rule (Root Cause
 * #18); only the barrel is the hazard, because only the barrel drags in the
 * other 30 modules' import chains.
 *
 * Strict zero. No suppression marker: there is always a deep import that does
 * the same job, so there is no irreducible case to waive.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

/**
 * The barrels whose transitive graph reaches `@mohasinac/appkit/client`.
 *
 * 🛑 Each entry is VERIFIED at runtime below rather than trusted: a barrel
 * that stopped reaching the client entry should stop being policed, and a
 * barrel named here that no longer exists must FAIL rather than be skipped —
 * a stale registration silently stops checking the thing it names while the
 * audit keeps printing OK (Root Cause #56/#84).
 */
const BARRELS = [
  { spec: "@/components", file: "src/components/index.ts", dir: "src/components" },
];

/*
 * 🛑 `@/constants` IS THE SAME HAZARD AND IS DELIBERATELY NOT POLICED HERE.
 *
 * It belongs in this list on the merits — it re-exports `navigation.tsx`,
 * which imports `@mohasinac/appkit/client`, and CLAUDE.md's measurement of
 * the 401 on `/api/payment/create-order` is about THAT barrel, not this one.
 *
 * It is excluded because of the SIZE, measured by registering it and running
 * this audit once: **395 violations across 382 files, 267 of them API
 * routes.** Switching it on would fail `npm run check` for every session in
 * this tree until a 382-file migration landed, and an audit that fails on
 * work nobody has been asked to do is one people disable — along with its
 * true findings (Root Cause #22's lesson, and the nine-false-positives
 * argument in `lister-opts-forwarding`'s header).
 *
 * Recording the number is the useful half: the governing plan described this
 * as "the live `@/constants` barrel hazard in several existing API routes",
 * and it is 267 API routes plus 115 other files. "Several" would have set
 * someone up to fix a handful and believe it closed.
 *
 * To take it on: add the entry back, run once to regenerate the list from the
 * RULE rather than from a grep (Root Cause #84), and migrate per directory.
 * The symbol→module map is derivable from `src/constants/index.ts` exactly as
 * the one for this barrel was.
 */

function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === ".next") continue;
      out.push(...walk(full));
    } else if (/\.(ts|tsx)$/.test(e.name)) {
      out.push(full);
    }
  }
  return out;
}

const violations = [];

for (const barrel of BARRELS) {
  const barrelAbs = join(ROOT, barrel.file);
  if (!existsSync(barrelAbs)) {
    violations.push({
      file: barrel.file,
      line: 0,
      rule: "STALE_BARREL_REGISTRATION",
      snippet: "(registered barrel does not exist)",
      hint:
        "This barrel is registered in BARRELS and is gone. Remove the entry, or point it\n" +
        "      at the file's new home — a stale registration stops checking the thing it\n" +
        "      names while the audit still reports clean.",
    });
    continue;
  }

  /*
   * Confirm the hazard is REAL for this barrel before policing it, by counting
   * how many of its own re-exported modules reach the client entry. A barrel
   * with none is harmless and is reported rather than enforced — the rule
   * should describe the tree, not a belief about it.
   */
  const barrelSrc = readFileSync(barrelAbs, "utf8");
  const reexported = [...barrelSrc.matchAll(/from\s*"\.\/([^"]+)"/g)].map((m) => m[1]);
  let clientReaching = 0;
  for (const mod of reexported) {
    for (const ext of [".tsx", ".ts", "/index.tsx", "/index.ts"]) {
      const cand = join(ROOT, barrel.dir, mod + ext);
      if (!existsSync(cand)) continue;
      if (/@mohasinac\/appkit\/client/.test(readFileSync(cand, "utf8"))) clientReaching++;
      break;
    }
  }
  barrel.clientReaching = clientReaching;
  barrel.reexportCount = reexported.length;
  if (clientReaching === 0) continue;

  const importRe = new RegExp(`from\\s*["']${barrel.spec.replace("/", "\\/")}["']`);
  for (const file of walk(join(ROOT, "src"))) {
    const rel = relative(ROOT, file).split(sep).join("/");
    if (rel === barrel.file) continue;
    const src = readFileSync(file, "utf8");
    if (!importRe.test(src)) continue;
    src.split(/\r?\n/).forEach((line, i) => {
      if (!importRe.test(line)) return;
      violations.push({
        file: rel,
        line: i + 1,
        rule: "CLIENT_BARREL_IMPORT",
        snippet: line.trim().slice(0, 120),
        hint:
          `${barrel.spec} re-exports ${clientReaching} module(s) that import\n` +
          "      @mohasinac/appkit/client, so this import pulls the \"use client\" entry into\n" +
          "      whatever graph it lands in and can instantiate appkit twice — the second\n" +
          "      copy has an empty provider registry and 401s every valid session.\n" +
          "      Import the DEFINING module instead, e.g.\n" +
          `      import { X } from "${barrel.spec}/path/to/X";`,
      });
    });
  }
}

violations.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);

if (violations.length > 0) {
  console.error(`[audit-component-barrel-import] FAIL: ${violations.length} violation(s).\n`);
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  [${v.rule}]`);
    console.error(`      ${v.snippet}`);
    console.error(`      ${v.hint}\n`);
  }
  process.exit(1);
}

const summary = BARRELS.filter((b) => b.clientReaching !== undefined)
  .map((b) => `${b.spec} ${b.clientReaching}/${b.reexportCount} client-reaching`)
  .join(", ");
console.log(`[audit-component-barrel-import] OK: 0 violations (${summary}).`);
