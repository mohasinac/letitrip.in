#!/usr/bin/env node
/**
 * audit-section-config-links — a `/categories/…` or `/brands/…` href inside a
 * homepage SECTION CONFIG must resolve to a real seeded id.
 *
 * 🛑 WHY THIS IS NOT COVERED BY ANYTHING ELSE. `audit-nav-page-wiring` checks
 * nav hrefs against `page.tsx` files and never reads section configs;
 * `audit-tester-checklist-hrefs` checks tester cases. A section config is
 * data, so a dead link there is invisible to both — and it 404s for every
 * visitor on the homepage, which is the most-crawled page on the site.
 *
 * It earned its keep immediately: the systems matrix was written from the
 * generation structure and TWO of its 29 links were wrong
 * (`category-x-unique` / `category-x-custom`, where the real ids carry the
 * line suffix — `category-x-unique-ux` / `category-x-custom-cx`). Caught
 * before the section was ever loaded.
 *
 * Same family as Root Cause #33 on the routing axis: an id that is not a
 * stored id fails silently, and here the failure is a 404 rather than an empty
 * list.
 *
 * Strict zero. No suppression marker — a link either resolves or it does not.
 */
import { pathToFileURL } from "node:url";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const DIST = resolve(process.cwd(), "appkit/dist");
if (!existsSync(DIST)) {
  console.log("audit-section-config-links: appkit/dist absent — run `npm --prefix appkit run build` first.");
  process.exit(0);
}

const { categoriesSeedData } = await import(pathToFileURL(resolve(DIST, "seed/categories-seed-data.js")).href);
const { homepageSectionsSeedData } = await import(pathToFileURL(resolve(DIST, "seed/homepage-sections-seed-data.js")).href);

const ids = new Set(categoriesSeedData.map((c) => String(c.id)));

/*
 * Walk the whole config rather than a known shape. A section type that grows a
 * new link-bearing field is covered for free, which is the point — a per-type
 * extractor is a hand-written enumeration and would go stale exactly like the
 * tab list this audit was written alongside.
 */
const HREF_RE = /^\/(categories|brands)\/([A-Za-z0-9-]+)$/;
const violations = [];
let checked = 0;

function walk(node, path, sectionId) {
  if (typeof node === "string") {
    const m = HREF_RE.exec(node);
    if (!m) return;
    checked++;
    // Brands are category rows too, so one id set covers both routes.
    if (!ids.has(m[2])) violations.push({ sectionId, path, href: node, id: m[2] });
    return;
  }
  if (Array.isArray(node)) { node.forEach((v, i) => walk(v, `${path}[${i}]`, sectionId)); return; }
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) walk(v, path ? `${path}.${k}` : k, sectionId);
  }
}

for (const section of homepageSectionsSeedData) {
  walk(section.config, "config", String(section.id));
}

if (violations.length) {
  console.log(`\n✗ audit-section-config-links — ${violations.length} dead link(s) of ${checked} checked:\n`);
  for (const v of violations) {
    console.log(`  ${v.sectionId}  ${v.path}`);
    console.log(`    ${v.href}  ->  "${v.id}" is not a seeded category id`);
  }
  console.log("\nA section config is DATA, so nothing else checks it: audit-nav-page-wiring");
  console.log("reads page.tsx files and audit-tester-checklist-hrefs reads tester cases.");
  console.log("A dead link here 404s on the most-crawled page on the site.\n");
  process.exit(1);
}

console.log(`audit-section-config-links: clean ✓ (${checked} link(s) across ${homepageSectionsSeedData.length} section(s))`);
