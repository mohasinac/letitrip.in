#!/usr/bin/env node
/**
 * audit-lister-opts-forwarding — a `LISTERS` entry must forward its opts.
 *
 * ## The bug this blocks, which only ever reproduced in production
 *
 * `listingProcessor`'s `LISTERS` registry maps a collection key to a lister
 * `(model, baseOpts) => repository.list(...)`. `baseOpts.search` is how token
 * search reaches a repository at all — Sieve cannot express `array-contains`,
 * so a search term can never ride inside `filters`.
 *
 * A lister written `(m) => repo.list(m)` DROPS it. The Function then returns an
 * UNFILTERED page with a 200, while the same route's local fallback filters
 * correctly — so the divergence appears only when the Function is reachable,
 * which is production and nowhere else. `listingProcessor.ts`'s own comment
 * records that it survived that way for orders, reviews, blogPosts, events and
 * stores *after* their routes and repositories were both wired, and separately
 * for faqs, which "made FAQ token search structurally unreachable through the
 * Function even though the repository has implemented it all along".
 *
 * ## Why this audit rather than a live executor diff
 *
 * `audit-listing-delegation` stages 59 routes and argues — correctly — against
 * bulk conversion, because "each conversion moves the query to a different
 * executor whose only failure mode is SILENT SEMANTIC DIVERGENCE". The obvious
 * answer is a harness that runs both executors and diffs the rows. But that
 * needs Firestore, needs the Function deployed to be meaningful, and proves
 * only the cases it happens to sample.
 *
 * This is the same guarantee, statically: the divergence has ONE mechanism —
 * the lister discarding what the route would have passed — and that is visible
 * in the source. It runs in `npm run check`, needs no credentials, and covers
 * every lister rather than the ones a test remembered.
 *
 * ## The rule
 *
 * For each `LISTERS` entry: if the repository method it calls accepts a SECOND
 * parameter (an opts object), the lister must both declare its own second
 * parameter and pass something built from it. A lister that takes `(m)` while
 * its target accepts `(model, opts)` is a silent opt drop.
 *
 * Suppression: `// audit-lister-opts-ok: <reason>` on the entry's line or the
 * one above — for a repository whose second parameter is genuinely irrelevant
 * to a list request.
 *
 * Exit 0 — clean.  Exit 1 — a lister that can drop its opts.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { stripComments } from "./lib/strip-comments.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PROCESSOR = join(
  ROOT, "appkit", "src", "_internal", "server", "jobs", "core", "listingProcessor.ts",
);
const APPKIT_SRC = join(ROOT, "appkit", "src");
const OK_RE = /\/\/\s*audit-lister-opts-ok\s*:/;

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (["node_modules", "dist", ".next", "__tests__"].includes(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.ts$/.test(e.name)) out.push(p);
  }
  return out;
}

/**
 * Top-level parameter count.
 *
 * 🛑 Splits on top-level commas and drops EMPTY segments. Counting commas
 * instead reported `list(\n model: SieveModel,\n opts?: {…},\n)` as THREE
 * parameters, because the trailing comma this codebase's formatter adds opens a
 * third, empty one. The violations were still real, but a rule that misreports
 * the number it is reasoning about is one nobody will trust the next time.
 */
function countParams(params) {
  const parts = [];
  let depth = 0;
  let current = "";
  for (const ch of params) {
    if ("([{<".includes(ch)) depth++;
    else if (")]}>".includes(ch)) depth--;
    if (ch === "," && depth === 0) { parts.push(current); current = ""; continue; }
    current += ch;
  }
  parts.push(current);
  return parts.filter((p) => p.trim().length > 0).length;
}

/** Read the balanced parameter list that starts at the `(` on/after `from`. */
function paramsAt(src, from) {
  const start = src.indexOf("(", from);
  if (start < 0) return null;
  let depth = 0;
  for (let i = start; i < src.length; i++) {
    if (src[i] === "(") depth++;
    else if (src[i] === ")") {
      depth--;
      if (depth === 0) return src.slice(start + 1, i);
    }
  }
  return null;
}

/**
 * `singletonName.method` -> arity, resolved on the OWNING CLASS.
 *
 * 🛑 An earlier version keyed arity on the BARE method name across all of
 * appkit, taking the max. Dozens of classes declare a `list`, so one 3-param
 * `list` somewhere made every `list` look 3-param — and the audit reported 11
 * violations of which NINE were false (`bidRepository.list(model)` and
 * `userRepository.list(model)` take one parameter and cannot drop anything).
 *
 * That is Root Cause #84 committed by this very file: a measurement broader
 * than the rule it feeds. An audit with nine false positives out of eleven is
 * worse than no audit, because the two real ones get dismissed with the rest.
 */
function buildRepoMethodArity() {
  const files = walk(APPKIT_SRC);
  const singletonToClass = new Map(); // repositoryName -> ClassName
  const classMethods = new Map(); // ClassName -> Map(method -> arity)
  const classParent = new Map(); // ClassName -> ParentName

  for (const file of files) {
    const src = stripComments(readFileSync(file, "utf8"));

    /*
     * `export` is OPTIONAL here. Six repositories declare
     * `const orderRepository = new OrderRepository();` and export the name on a
     * later line, so requiring `export const` left those six "unresolved" — a
     * silent coverage hole in the rule, which the unresolved list below is what
     * surfaced. Match the declaration, not the export.
     */
    for (const m of src.matchAll(/(?:export\s+)?const\s+(\w+)\s*(?::[^=]+)?=\s*new\s+(\w+)\s*\(/g)) {
      singletonToClass.set(m[1], m[2]);
    }

    for (const cm of src.matchAll(/(?:export\s+)?(?:abstract\s+)?class\s+(\w+)(?:<[^>]*>)?(?:\s+extends\s+(\w+))?/g)) {
      const cls = cm[1];
      if (cm[2]) classParent.set(cls, cm[2]);
      // Body of the class, by balanced braces.
      const open = src.indexOf("{", cm.index + cm[0].length);
      if (open < 0) continue;
      let depth = 0;
      let close = open;
      for (let i = open; i < src.length; i++) {
        if (src[i] === "{") depth++;
        else if (src[i] === "}") { depth--; if (depth === 0) { close = i; break; } }
      }
      const body = src.slice(open + 1, close);
      const methods = classMethods.get(cls) ?? new Map();
      const re = /(?:^|\n)\s*(?:public\s+|private\s+|protected\s+|override\s+|static\s+|async\s+){0,4}(\w+)\s*(?:<[^>]*>)?\s*\(/g;
      let mm;
      while ((mm = re.exec(body)) !== null) {
        const name = mm[1];
        if (["if", "for", "while", "switch", "catch", "return", "constructor", "get", "set"].includes(name)) continue;
        const params = paramsAt(body, mm.index + mm[0].length - 1);
        if (params === null) continue;
        methods.set(name, Math.max(methods.get(name) ?? 0, countParams(params)));
      }
      classMethods.set(cls, methods);
    }
  }

  /** Walk the prototype chain so an inherited `list` still resolves. */
  function lookup(cls, method, seen = new Set()) {
    if (!cls || seen.has(cls)) return undefined;
    seen.add(cls);
    const own = classMethods.get(cls)?.get(method);
    if (own !== undefined) return own;
    return lookup(classParent.get(cls), method, seen);
  }

  return { singletonToClass, lookup };
}

function main() {
  let raw;
  try { raw = readFileSync(PROCESSOR, "utf8"); } catch {
    console.log("audit-lister-opts-forwarding: listingProcessor.ts not found — skipped");
    process.exit(0);
  }
  const rawLines = raw.split(/\r?\n/);
  const src = stripComments(raw);

  const start = src.indexOf("const LISTERS");
  if (start < 0) {
    console.error("audit-lister-opts-forwarding: no LISTERS registry found — the rule cannot run.");
    process.exit(2);
  }
  // Balance braces from the opening `{` so a nested object cannot end it early.
  const open = src.indexOf("{", start);
  let depth = 0, end = open;
  for (let i = open; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") { depth--; if (depth === 0) { end = i; break; } }
  }
  const body = src.slice(open + 1, end);
  const bodyLineOffset = src.slice(0, open).split(/\r?\n/).length;

  const { singletonToClass, lookup } = buildRepoMethodArity();
  const violations = [];
  const unresolved = [];
  let checked = 0;

  /*
   * One entry per `key: (params) => expr`. `expr` runs to the next top-level
   * comma, so a multi-line arrow body is one entry.
   */
  const entryRe = /(\w+)\s*:\s*\(([^)]*)\)\s*=>/g;
  let m;
  while ((m = entryRe.exec(body)) !== null) {
    const [, key, params] = m;
    // The arrow body: from here to the matching top-level comma.
    let d = 0, i = m.index + m[0].length, stop = body.length;
    for (; i < body.length; i++) {
      const ch = body[i];
      if ("([{".includes(ch)) d++;
      else if (")]}".includes(ch)) { if (d === 0) { stop = i; break; } d--; }
      else if (ch === "," && d === 0) { stop = i; break; }
    }
    const expr = body.slice(m.index + m[0].length, stop);
    const line = bodyLineOffset + body.slice(0, m.index).split(/\r?\n/).length - 1;

    if (OK_RE.test(rawLines[line - 1] ?? "") || OK_RE.test(rawLines[line - 2] ?? "")) continue;

    /*
     * Resolve the RECEIVER as well as the method — `xRepository.list(` — so
     * arity comes from the owning class rather than from any class that
     * happens to declare a method of that name.
     */
    const call = expr.match(/\b(\w*[Rr]epository)\s*\.\s*(\w+)\s*\(/);
    if (!call) continue;
    const [, receiver, method] = call;
    const cls = singletonToClass.get(receiver);
    const targetArity = cls ? lookup(cls, method) : undefined;
    if (targetArity === undefined) {
      // Reported, never silently skipped: an unresolvable target is a hole in
      // the rule's coverage, and a count nobody can interpret is how a staged
      // audit stops meaning anything.
      unresolved.push(`${key} :: could not resolve \`${receiver}.${method}\``);
      continue;
    }
    checked++;

    const declaredParams = params.split(",").map((s) => s.trim()).filter(Boolean);
    const takesOpts = declaredParams.length >= 2;
    if (targetArity < 2) continue; // the target has no opts to drop

    if (!takesOpts) {
      violations.push(
        `${key} :: calls \`.${method}(\` which accepts ${targetArity} parameter(s), ` +
          `but the lister declares only \`(${params.trim()})\` — baseOpts is DROPPED. ` +
          `The Function then returns an unfiltered page with a 200 while the ` +
          `route's local fallback filters correctly, so it diverges only in production.`,
      );
      continue;
    }
    // It declares an opts parameter — does the call actually use it?
    const optsName = declaredParams[1].replace(/[:?].*$/, "").trim();
    if (optsName && !new RegExp(`\\b${optsName}\\b`).test(expr)) {
      violations.push(
        `${key} :: declares \`${optsName}\` but never references it in the call to ` +
          `\`.${method}(\` — the parameter is decoration and the opts are still dropped.`,
      );
    }
  }

  if (unresolved.length > 0) {
    console.log("[audit-lister-opts-forwarding] unresolved target(s) — not checked:");
    for (const u of unresolved) console.log(`  · ${u}`);
    console.log("");
  }

  if (violations.length === 0) {
    console.log(
      `audit-lister-opts-forwarding: clean ✓ (${checked} lister(s) resolved` +
        `${unresolved.length > 0 ? `, ${unresolved.length} unresolved` : ""})`,
    );
    process.exit(0);
  }

  console.error("\n[audit-lister-opts-forwarding] STRICT-ZERO violation(s):\n");
  for (const v of violations) console.error(`  - ${v}`);
  console.error(
    "\n`baseOpts.search` is the ONLY way token search reaches a repository —\n" +
      "Sieve cannot express array-contains, so it can never ride in `filters`.\n" +
      "Forward the opts:  key: (m, o) => repo.list(m, { search: getStringOpt(o, \"search\") })\n",
  );
  console.error(`Total: ${violations.length}\n`);
  process.exit(1);
}

main();
