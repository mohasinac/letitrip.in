#!/usr/bin/env node
/**
 * audit-seo-sitemap-parity — strict-zero.
 *
 * The sitemap is the one file whose failures are invisible by construction: a
 * section that returns zero URLs looks exactly like a site that genuinely has
 * none of that thing.
 *
 * WHY THIS BUG CLASS IS SILENT: `fetchCategoryUrls` filtered on
 * `categoryType == "listing"`. `CategoryType` is
 * `"category" | "sublisting" | "brand" | "bundle"` — there is no `"listing"`
 * value and there never was, and a plain listing category omits the field
 * entirely. The query matched zero documents, so ~47 category pages were absent
 * from the sitemap for as long as that call existed. Nothing threw. The sibling
 * brand and bundle queries, using the same helper, worked fine — which made the
 * output look plausible.
 *
 * This is CLAUDE.md Root Cause #33 (a filter value that no document can hold)
 * applied to the sitemap, and #59 (a silent `.catch` hiding a failed query).
 *
 * RULES
 *   DISCRIMINATOR_NOT_IN_UNION  a fetcher filters on a literal absent from the
 *                               TS union it is filtering
 *   SILENT_EMPTY_SECTION        a fetcher swallows to [] without logging
 *   NO_TESTDATA_GUARD           a fetcher can emit tester-sandbox fixtures
 *   REGISTRY_STALE              a registered file/symbol no longer exists
 *
 * No suppression marker. The escape hatch is the registry below.
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { stripComments } from "./lib/strip-comments.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const SITEMAP = "appkit/src/_internal/server/features/seo/sitemap.ts";

/**
 * Every literal a sitemap fetcher filters a discriminated field on, and the TS
 * union that field can actually hold. If the literal is not a member, the query
 * returns nothing, forever, silently.
 */
const DISCRIMINATORS = [
  {
    label: "categoryType",
    // `.where(CATEGORY_FIELDS.CATEGORY_TYPE, "==", <literal>)` and the helper's
    // string args — capture any bare quoted literal passed as a category type.
    callPattern: /fetchCategoryTypeUrls\(\s*baseUrl\s*,\s*"([a-z-]+)"/g,
    unionFile: "appkit/src/features/categories/types/index.ts",
    unionPattern: /export type CategoryType\s*=\s*([^;]+);/,
  },
  {
    label: "listingType",
    callPattern: /fetchListingTypeUrls\(\s*baseUrl\s*,\s*"([a-z-]+)"/g,
    unionFile: "appkit/src/features/products/types/index.ts",
    unionPattern: /export type ListingType\s*=\s*([^;]+);/,
  },
];

/** Sections that must appear in the built sitemap's count digest. */
const REQUIRED_SECTIONS = [
  "static",
  "category",
  "brand",
  "bundle",
  "product",
  "auction",
  "blog",
  "store",
];

const rel = (f) => relative(ROOT, f).split(sep).join("/");
const read = (relPath) => {
  const full = join(ROOT, relPath);
  return existsSync(full) ? readFileSync(full, "utf8") : null;
};

function unionMembers(src, pattern) {
  const m = pattern.exec(src);
  if (!m) return null;
  return m[1]
    .split("|")
    .map((s) => s.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
}

function main() {
  const violations = [];
  let checked = 0;

  const rawSitemap = read(SITEMAP);
  if (rawSitemap === null) {
    violations.push({
      rule: "REGISTRY_STALE",
      where: SITEMAP,
      msg: `sitemap source is missing — update SITEMAP in ${rel(fileURLToPath(import.meta.url))}`,
    });
    return report(violations, checked);
  }
  const sitemap = stripComments(rawSitemap);

  // ── RULE: every discriminator literal exists in its union ────────────────
  for (const d of DISCRIMINATORS) {
    const unionSrc = read(d.unionFile);
    if (unionSrc === null) {
      violations.push({
        rule: "REGISTRY_STALE",
        where: d.unionFile,
        msg: "union source is missing — update DISCRIMINATORS in this script",
      });
      continue;
    }
    const members = unionMembers(stripComments(unionSrc), d.unionPattern);
    if (!members) {
      violations.push({
        rule: "REGISTRY_STALE",
        where: d.unionFile,
        msg: `could not parse the ${d.label} union — update DISCRIMINATORS in this script`,
      });
      continue;
    }
    d.callPattern.lastIndex = 0;
    let m;
    while ((m = d.callPattern.exec(sitemap)) !== null) {
      checked++;
      const literal = m[1];
      if (!members.includes(literal)) {
        violations.push({
          rule: "DISCRIMINATOR_NOT_IN_UNION",
          where: SITEMAP,
          msg:
            `filters ${d.label} == "${literal}", which is not a member of ` +
            `${d.label} (${members.map((x) => `"${x}"`).join(" | ")}). ` +
            `This query matches ZERO documents and fails silently.`,
        });
      }
    }
  }

  // ── RULE: no fetcher swallows to [] without logging ──────────────────────
  // Match a catch block whose body reaches `return []` with no logger call.
  const catchBlocks = sitemap.match(/catch\s*\([^)]*\)\s*\{[\s\S]{0,320}?\n\s{2}\}/g) || [];
  for (const block of catchBlocks) {
    checked++;
    const returnsEmpty = /return\s*\[\s*\]/.test(block);
    const logs = /serverLogger\.(error|warn)|sitemapSectionFailed/.test(block);
    if (returnsEmpty && !logs) {
      violations.push({
        rule: "SILENT_EMPTY_SECTION",
        where: SITEMAP,
        msg:
          "a fetcher returns [] without logging. An empty section is " +
          "indistinguishable from a site that has none of that entity — which is " +
          "precisely how the missing category pages went unnoticed. Return " +
          "sitemapSectionFailed(<section>, err) instead.",
      });
    }
  }

  // ── RULE: test fixtures cannot reach the public sitemap ──────────────────
  const selects = sitemap.match(/\.select\([^)]*\)/g) || [];
  for (const sel of selects) {
    checked++;
    if (!sel.includes("TEST_DATA_FIELD")) {
      violations.push({
        rule: "NO_TESTDATA_GUARD",
        where: SITEMAP,
        msg:
          `\`${sel.replace(/\s+/g, " ").slice(0, 72)}…\` omits TEST_DATA_FIELD, so ` +
          "isTestData comes back undefined and tester-sandbox fixtures reach the " +
          "public sitemap. They are deleted on a cycle, so Google indexes them and " +
          "then 404s. NB: filter in memory — a Firestore `!=` excludes every " +
          "document lacking the field, i.e. all real content.",
      });
    }
  }
  if (!/isTestDoc\s*\(/.test(sitemap)) {
    violations.push({
      rule: "NO_TESTDATA_GUARD",
      where: SITEMAP,
      msg: "no isTestDoc() filtering found anywhere in the sitemap builder",
    });
  }

  // ── RULE: the count digest still covers the sections we rely on ──────────
  for (const section of REQUIRED_SECTIONS) {
    if (!new RegExp(`\\b${section}:\\s`).test(sitemap)) {
      violations.push({
        rule: "REGISTRY_STALE",
        where: SITEMAP,
        msg:
          `section "${section}" is missing from the per-section count digest in ` +
          "buildSitemap. The digest is what makes a section dropping to zero visible " +
          "in production logs — and what scripts/deploy.mjs asserts against.",
      });
    }
  }
  checked += REQUIRED_SECTIONS.length;

  report(violations, checked);
}

function report(violations, checked) {
  if (violations.length === 0) {
    console.log(`audit-seo-sitemap-parity: clean ✓ (${checked} check(s) run)`);
    process.exit(0);
  }
  console.error(`audit-seo-sitemap-parity: ${violations.length} violation(s) found.\n`);
  console.error(
    "A sitemap section that returns zero URLs is indistinguishable from a site that\n" +
      "genuinely has none of that entity. Every rule here exists to make that state\n" +
      "loud instead of invisible.\n",
  );
  for (const v of violations) console.error(`  [${v.rule}] ${v.where}: ${v.msg}`);
  process.exit(1);
}

main();
