#!/usr/bin/env node
/*
 * Find tester steps that send the tester to a NAMED SURFACE instead of a URL,
 * and suggest the route each one probably means.
 *
 * 🛑 WHY THIS IS A REAL DEFECT AND NOT A STYLE NOTE. The whole argument for the
 * six-part contract is that "the steps exist because two testers otherwise
 * invent two different procedures and their results cannot be compared".
 * "Open the reports surface" is exactly that: one tester finds /admin/reports,
 * another finds the reports tab inside moderation, and a third records `null`.
 *
 * It is also how a DEAD page hides. `roles-crud` said "open the roles or
 * permissions surface" while starting at /admin/team — the wrong page entirely —
 * and nothing could notice, because there was no URL for the hrefs audit to
 * check. A named URL is checkable; a named surface is not.
 *
 * Measured 2026-09-29 on the full catalogue: 173 such steps across 48 pages.
 *
 * Usage:  node scripts/test-run-check-vague-destinations.mjs [group/page]
 *   no argument  sweep every page, ranked by count
 *
 * This is a LEAD GENERATOR, not a gate. An in-page noun ("open the Shipping
 * tab", "open a cluster") is fine and is deliberately not flagged — the tester
 * is already on the page that owns it.
 *
 * @tag domain:tester
 * @tag layer:script
 * @tag access:node-only
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, basename, join } from "node:path";
import { REPO } from "./lib/test-run.mjs";

const SEED = resolve(REPO, "appkit/src/features/tester/seed-data");
const APP = resolve(REPO, "src/app/[locale]");

/* Every page route in the app, as a flat list of URL paths. */
function routes(dir = APP, prefix = "") {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) {
      if (e.name === "page.tsx" && prefix) out.push(prefix);
      continue;
    }
    if (e.name.startsWith("_") || e.name.startsWith("(")) continue;
    out.push(...routes(join(dir, e.name), `${prefix}/${e.name}`));
  }
  return out;
}
const ROUTES = existsSync(APP) ? routes() : [];

/*
 * Nouns that name something INSIDE the page the tester is already on. Flagging
 * these would bury the real findings under "open the Shipping tab", which is a
 * perfectly good instruction — and an audit whose output is mostly noise is one
 * people learn to skip.
 */
const IN_PAGE = /\b(tab|panel|drawer|modal|dialog|dropdown|picker|menu|row|card|accordion|step|field|toggle|sheet|banner|column|filter|chip)\b/i;

const VAGUE =
  /"(?:Open|Go to|Navigate to|Visit) the ([a-z][a-z0-9 '\-]{3,45}?) (surface|page|editor|queue|list|screen|section|settings|form|view)\b[^"]*"/g;

function suggest(phrase) {
  const words = phrase.toLowerCase().split(/[\s'-]+/).filter((w) => w.length > 3);
  if (!words.length) return [];
  return ROUTES.map((r) => ({ r, hits: words.filter((w) => r.toLowerCase().includes(w)).length }))
    .filter((x) => x.hits > 0)
    .sort((a, b) => b.hits - a.hits || a.r.length - b.r.length)
    .slice(0, 3)
    .map((x) => x.r);
}

const files = [
  ...readdirSync(join(SEED, "authored"))
    .filter((f) => f.endsWith(".ts") && !["index.ts", "_types.ts"].includes(f))
    .map((f) => join(SEED, "authored", f)),
  join(SEED, "_happy-path.ts"),
  join(SEED, "_money-flows.ts"),
].filter(existsSync);

const target = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : null;
const byPage = new Map();

for (const f of files) {
  const page = basename(f, ".ts").replace("__", "/");
  if (target && page !== target) continue;
  const text = readFileSync(f, "utf8");
  for (const m of text.matchAll(VAGUE)) {
    if (m[0].includes("/")) continue; // already names a path somewhere in the step
    if (IN_PAGE.test(m[2])) continue;
    const phrase = `${m[1]} ${m[2]}`;
    if (!byPage.has(page)) byPage.set(page, new Map());
    byPage.get(page).set(phrase, suggest(m[1]));
  }
}

const total = [...byPage.values()].reduce((n, m) => n + m.size, 0);
if (total === 0) {
  console.log(`${target ?? "all pages"}: no vague destinations`);
  process.exit(0);
}
console.log(`${total} vague destination(s) across ${byPage.size} page(s):\n`);
for (const [page, phrases] of [...byPage.entries()].sort((a, b) => b[1].size - a[1].size)) {
  console.log(`  ${page}  (${phrases.size})`);
  for (const [phrase, hits] of phrases) {
    console.log(`     "${phrase}"${hits.length ? `  ->  ${hits.join("  |  ")}` : "  ->  (no route matched — read the source)"}`);
  }
}
console.log("");
console.log("  A suggestion is a LEAD. Confirm the route before using it: the one");
console.log("  case this sweep was written for pointed at /admin/team while doing");
console.log("  roles CRUD, and the nearest-name match would not have caught that.");
